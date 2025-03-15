import fetch from 'node-fetch';
import fs from 'fs/promises';
import characters from './characters.js';

const OLLAMA_API = 'http://localhost:11434/api/generate';
const DB_FILE = 'dnd_campaign.json';

// Database operations
async function loadDatabase() {
    try {
        const data = await fs.readFile(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, return initial database structure
        return {
            gameLog: [],
            campaignState: {
                location: "Tavern in Mistwood Village",
                quest: "No active quest yet",
                inventory: {},
                npcs: [],
                combatActive: false,
                currentScene: "Campaign Start"
            },
            characters: characters.map(char => ({
                ...char,
                health: char.maxHealth || 100,
                inventory: char.startingItems || []
            }))
        };
    }
}

async function saveToDatabase(data) {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Function to communicate with Ollama
async function askOllama(model, prompt) {
    try {
        const response = await fetch(OLLAMA_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model,
                prompt: prompt,
                stream: false
            })
        });
        
        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error('Ollama API Error:', error);
        return null;
    }
}

// Generate context for game master with campaign history
function generateGameMasterContext(db) {
    // Get last 10 game events
    const recentEvents = db.gameLog
        .slice(-10)
        .map(log => `${log.timestamp}: ${log.event}`)
        .join('\n');

    return `You are the Game Master for a D&D campaign. 
    Your role is to narrate the story, control NPCs, describe environments, and manage game mechanics.
    
    Current campaign state:
    - Location: ${db.campaignState.location}
    - Current quest: ${db.campaignState.quest}
    - Current scene: ${db.campaignState.currentScene}
    - Combat active: ${db.campaignState.combatActive}
    
    Recent game events:
    ${recentEvents}
    
    Characters in party:
    ${characters.filter(char => char.role !== "Game Master").map(char => 
        `- ${char.name}: Level ${char.level} ${char.race} ${char.class} (Health: ${db.characters.find(c => c.name === char.name)?.health || 'Unknown'})`
    ).join('\n')}
    
    What happens next in the campaign? Describe the scene, NPC interactions, or combat situation.
    If in combat, describe enemy actions and ask players for their actions.`;
}

// Generate context for player characters
function generatePlayerContext(player, db) {
    // Get character data from current state
    const charState = db.characters.find(c => c.name === player.name) || player;
    
    // Get last 8 game events
    const recentEvents = db.gameLog
        .slice(-8)
        .map(log => `${log.timestamp}: ${log.event}`)
        .join('\n');

    return `You are ${player.name}, a level ${player.level} ${player.race} ${player.class} in a D&D campaign.
    
    Your character details:
    - Health: ${charState.health}/${player.maxHealth}
    - Key abilities: ${player.abilities.join(', ')}
    - Personality: ${player.personality}
    
    Your inventory: ${charState.inventory.join(', ')}
    
    Current situation:
    - Location: ${db.campaignState.location}
    - Quest: ${db.campaignState.quest}
    - Combat active: ${db.campaignState.combatActive}
    - Current scene: ${db.campaignState.currentScene}
    
    Recent game events:
    ${recentEvents}
    
    What does ${player.name} do or say in this situation? 
    Act and speak as your character would, considering their personality, abilities, and the current situation.`;
}

// Main D&D game loop
async function runGame() {
    console.log('Loading D&D campaign data...');
    let db = await loadDatabase();
    
    console.log('Starting D&D campaign simulation...');
    console.log('===============================');
    console.log('WELCOME TO THE D&D SIMULATION');
    console.log('===============================');

    // Game loop
    while (true) {
        // First, the Game Master takes a turn
        const gameMaster = characters.find(char => char.role === "Game Master");
        
        if (gameMaster) {
            const gmContext = generateGameMasterContext(db);
            console.log(`\n[Game Master is narrating the scene...]`);
            const gmResponse = await askOllama('llama3.2:latest', gmContext);
            
            if (gmResponse) {
                console.log(`\n🎲 GAME MASTER: ${gmResponse}\n`);
                
                // Log GM's narration
                const gmEvent = {
                    actor: "Game Master",
                    event: gmResponse,
                    timestamp: new Date().toISOString()
                };
                
                db.gameLog.push(gmEvent);
                
                // Update campaign state based on keywords in GM's response
                if (gmResponse.toLowerCase().includes("combat") || 
                    gmResponse.toLowerCase().includes("fight") || 
                    gmResponse.toLowerCase().includes("battle")) {
                    db.campaignState.combatActive = true;
                }
                
                if (gmResponse.toLowerCase().includes("quest")) {
                    // Simple quest detection - extract sentence with "quest" keyword
                    const questSentences = gmResponse.split(/[.!?]/).filter(s => 
                        s.toLowerCase().includes("quest"));
                    if (questSentences.length > 0) {
                        db.campaignState.quest = questSentences[0].trim();
                    }
                }
                
                if (gmResponse.toLowerCase().includes("arrive") || 
                    gmResponse.toLowerCase().includes("enter") ||
                    gmResponse.toLowerCase().includes("location")) {
                    // Update location based on context clues - just a guess
                    const locationKeywords = ["inn", "tavern", "dungeon", "forest", "castle", 
                                             "cave", "mountain", "village", "city", "temple"];
                    for (const keyword of locationKeywords) {
                        if (gmResponse.toLowerCase().includes(keyword)) {
                            // Extract a phrase around the keyword
                            const regex = new RegExp(`.{0,15}${keyword}.{0,15}`, 'i');
                            const match = gmResponse.match(regex);
                            if (match) {
                                db.campaignState.location = match[0].trim();
                                break;
                            }
                        }
                    }
                }
                
                // Save after GM narration
                await saveToDatabase(db);
            }
        }
        
        // Then each player takes a turn
        const players = characters.filter(char => char.role === "Player");
        
        for (const player of players) {
            const playerContext = generatePlayerContext(player, db);
            
            console.log(`\n[${player.name} (${player.race} ${player.class}) is thinking...]`);
            const playerResponse = await askOllama('llama3.2:latest', playerContext);
            
            if (playerResponse) {
                console.log(`\n🧙‍♂️ ${player.name.toUpperCase()}: ${playerResponse}\n`);
                
                // Log player's action/dialogue
                const playerEvent = {
                    actor: player.name,
                    event: playerResponse,
                    timestamp: new Date().toISOString()
                };
                
                db.gameLog.push(playerEvent);
                
                // Update character state based on player's action
                // Check if player uses items from inventory
                const charIndex = db.characters.findIndex(c => c.name === player.name);
                if (charIndex !== -1) {
                    const inventoryItems = db.characters[charIndex].inventory;
                    for (const item of inventoryItems) {
                        if (playerResponse.toLowerCase().includes(item.toLowerCase() + " on ") ||
                            playerResponse.toLowerCase().includes("use " + item.toLowerCase()) ||
                            playerResponse.toLowerCase().includes("drink " + item.toLowerCase())) {
                            // Item might be used, remove consumables like potions
                            if (item.toLowerCase().includes("potion")) {
                                db.characters[charIndex].inventory = inventoryItems.filter(i => i !== item);
                                
                                // Healing potions restore health
                                if (item.toLowerCase().includes("healing")) {
                                    db.characters[charIndex].health = Math.min(
                                        player.maxHealth, 
                                        db.characters[charIndex].health + 20
                                    );
                                    console.log(`[System: ${player.name} used ${item} and recovered 20 health]`);
                                }
                            }
                        }
                    }
                }
                
                // Save after each player's action
                await saveToDatabase(db);
            }
        }

        // Add a small delay between cycles to make the output readable
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Basic log management - keep last 500 entries
        if (db.gameLog.length > 500) {
            db.gameLog = db.gameLog.slice(-500);
            await saveToDatabase(db);
        }
    }
}

// Campaign analysis functions
export async function analyzeCharacter(characterName) {
    const db = await loadDatabase();
    const characterEvents = db.gameLog.filter(log => log.actor === characterName);
    const characterInfo = db.characters.find(c => c.name === characterName);
    
    return {
        characterInfo,
        totalActions: characterEvents.length,
        recentActions: characterEvents.slice(-10)
    };
}

export async function analyzeCampaign() {
    const db = await loadDatabase();
    return {
        totalEvents: db.gameLog.length,
        campaignState: db.campaignState,
        characterStats: db.characters.map(char => ({
            name: char.name,
            health: char.health,
            inventory: char.inventory
        }))
    };
}

// Error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the D&D game
console.log('Initializing D&D Game Simulation...');
runGame().catch(console.error);
