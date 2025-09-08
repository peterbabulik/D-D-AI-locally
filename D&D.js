import fetch from 'node-fetch';
import fs from 'fs/promises';
import characters from './characters.js';

// Use the /api/chat endpoint for better compatibility with newer models
const OLLAMA_API = 'http://localhost:11434/api/chat'; 
const DB_FILE = 'dnd_campaign.json';
const OLLAMA_MODEL = 'gemma3:1b'; // Using the model from your screenshot

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

// Function to communicate with Ollama (updated for chat endpoint)
async function askOllama(model, prompt) {
    try {
        const response = await fetch(OLLAMA_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model,
                messages: [{ role: "user", content: prompt }], // Use the messages array for chat
                stream: false
            })
        });
        
        const data = await response.json();
        // The response structure is different for the chat endpoint
        return data.message.content;
    } catch (error) {
        console.error('Ollama API Error:', error);
        return null;
    }
}

// Generate context for game master with campaign history
function generateGameMasterContext(db) {
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
    const charState = db.characters.find(c => c.name === player.name) || player;
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
            const gmResponse = await askOllama(OLLAMA_MODEL, gmContext);
            
            if (gmResponse) {
                console.log(`\n🎲 GAME MASTER: ${gmResponse}\n`);
                db.gameLog.push({ actor: "Game Master", event: gmResponse, timestamp: new Date().toISOString() });
                
                // (Your existing GM response parsing logic...)
                
                await saveToDatabase(db);
            }
        }
        
        // ======================================================================
        // START: PARALLEL PROCESSING IMPLEMENTATION
        // ======================================================================
        
        const players = characters.filter(char => char.role === "Player");
        
        // Step 1: Create an array of promises for each player's turn without awaiting.
        // This sends all API requests to Ollama in parallel.
        const playerTurnPromises = players.map(player => {
            const playerContext = generatePlayerContext(player, db);
            console.log(`\n[${player.name} (${player.race} ${player.class}) is thinking...]`);
            // The API call is made, and the pending promise is returned to the array.
            return askOllama(OLLAMA_MODEL, playerContext);
        });

        console.log('\n[Waiting for all players to decide their actions...]');
        
        // Step 2: Use Promise.all to wait for ALL promises to resolve.
        // 'playerResponses' will be an array of the AI's text responses in the same order as the 'players' array.
        const playerResponses = await Promise.all(playerTurnPromises);

        // Step 3: Now that all responses are back, iterate through them and process them sequentially.
        // This ensures the game log remains in a logical, chronological order for the round.
        for (let i = 0; i < players.length; i++) {
            const player = players[i];
            const playerResponse = playerResponses[i];

            if (playerResponse) {
                console.log(`\n🧙‍♂️ ${player.name.toUpperCase()}: ${playerResponse}\n`);
                
                // Log player's action/dialogue
                db.gameLog.push({
                    actor: player.name,
                    event: playerResponse,
                    timestamp: new Date().toISOString()
                });
                
                // Update character state based on player's action
                const charIndex = db.characters.findIndex(c => c.name === player.name);
                if (charIndex !== -1) {
                    const inventoryItems = db.characters[charIndex].inventory;
                    for (const item of inventoryItems) {
                        if (playerResponse.toLowerCase().includes(item.toLowerCase() + " on ") ||
                            playerResponse.toLowerCase().includes("use " + item.toLowerCase()) ||
                            playerResponse.toLowerCase().includes("drink " + item.toLowerCase())) {
                            if (item.toLowerCase().includes("potion")) {
                                db.characters[charIndex].inventory = inventoryItems.filter(i => i !== item);
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
            }
        }
        
        // Step 4: Save the database ONCE after all player actions for the round have been processed.
        // This is more efficient than saving inside the loop.
        await saveToDatabase(db);

        // ======================================================================
        // END: PARALLEL PROCESSING IMPLEMENTATION
        // ======================================================================

        // Add a small delay between cycles to make the output readable
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Basic log management
        if (db.gameLog.length > 500) {
            db.gameLog = db.gameLog.slice(-500);
            await saveToDatabase(db);
        }
    }
}

// (The campaign analysis functions and error handlers remain the same)
export async function analyzeCharacter(characterName) { /* ... */ }
export async function analyzeCampaign() { /* ... */ }
process.on('uncaughtException', (error) => { /* ... */ });
process.on('unhandledRejection', (reason, promise) => { /* ... */ });

// Start the D&D game
console.log('Initializing D&D Game Simulation...');
runGame().catch(console.error);
