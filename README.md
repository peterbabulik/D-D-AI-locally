# D&D AI Locally

Run AI-powered Dungeons & Dragons campaigns on your local machine using Ollama LLMs.

## 🧙‍♂️ Overview

D&D AI Locally transforms your computer into an autonomous D&D game simulator. By leveraging local large language models (LLM) through Ollama, this application creates immersive D&D sessions where:

- An AI Game Master sets scenes, creates challenges, and drives the narrative
- AI player characters react with unique personalities, abilities, and decision-making
- The entire campaign unfolds dynamically without requiring human input

Perfect for game masters looking for inspiration, D&D enthusiasts who want to see alternative party dynamics, or developers exploring AI-powered narrative applications.

## ✨ Features

- **Fully automated D&D campaign** - Watch as the AI GM and players interact
- **Dynamic storytelling** - Campaign reacts to player decisions and evolves naturally
- **D&D mechanics** - Tracks health, inventory, combat status, quests, and more
- **Character personalities** - Each character has unique traits that inform their actions
- **Persistent world** - Campaign state is saved between sessions
- **Analysis tools** - Examine character and campaign statistics

## 📋 Requirements

- Node.js (v14+)
- [Ollama](https://ollama.ai/) installed locally
- LLM model downloaded via Ollama (recommended: gemma3:1b)

## 🚀 Quick Start

1. Clone this repository:
   ```
   git clone https://github.com/peterbabulik/D-D-AI-locally
   ```
   ```
   cd D-D-AI-locally
   ```

2. Install dependencies:
   ```
   npm init -y
   ```
   ```
   npm install node-fetch
   ```

3. Run Ollama abd download recommended model:
   ```
   ollama serve
   ```
   in new terminal:
   ```
   ollama pull gemma3:1b
   ```

# 4. Start the D&D simulation: in 3 separate terminals run

## terminal1:
   ```
   ollama serve
   ```
   double chceck if not already running (step 3 here)
## terminal2:
   ```
   ollama run gemma3:1b
   ```
## terminal3:
   ```
   node index.js
   ```
Watch as the AI-controlled D&D campaign unfolds in your terminal!

## 📝 Customization

### Modifying Characters

Edit the `characters.js` file to change existing characters or add new ones:

```javascript
// Example of adding a new character
{
    name: "Eldon",
    role: "Player",
    race: "Dwarf",
    class: "Paladin",
    level: 5,
    maxHealth: 50,
    abilities: ["Divine Smite", "Lay on Hands", "Divine Sense"],
    startingItems: ["Warhammer", "Shield", "Plate Armor", "Holy Symbol"],
    personality: "Gruff but kind-hearted dwarf who follows his oath with unwavering conviction."
}
```

### Campaign Settings

The initial campaign state is created in the `loadDatabase()` function in `index.js`. Modify this to start with different settings:

```javascript
return {
    gameLog: [],
    campaignState: {
        location: "Ancient ruins of Dragonspire",
        quest: "Recover the lost amulet of Orcus",
        inventory: {},
        npcs: ["High Priestess Ela", "Trader Gormund"],
        combatActive: false,
        currentScene: "Campaign Start"
    },
    characters: characters.map(char => ({
        ...char,
        health: char.maxHealth || 100,
        inventory: char.startingItems || []
    }))
};
```
### Change ollama model:

now we using gemma3:1b with ollama, you can change it in line 139 in index.js for other ollama models:

```javascript
// Game loop
    while (true) {
        // First, the Game Master takes a turn
        const gameMaster = characters.find(char => char.role === "Game Master");
        
        if (gameMaster) {
            const gmContext = generateGameMasterContext(db);
            console.log(`\n[Game Master is narrating the scene...]`);
            const gmResponse = await askOllama('gemma3:1b', gmContext);
            
            if (gmResponse) {
                console.log(`\n🎲 GAME MASTER: ${gmResponse}\n`);
                
                // Log GM's narration
                const gmEvent = {
                    actor: "Game Master",
                    event: gmResponse,
                    timestamp: new Date().toISOString()
                };
```

## 🧠 How It Works

1. **Game Loop**:
   - The GM describes the current scene or situation
   - Each player character responds in turn
   - The system tracks and updates the game state
   - Repeat

2. **State Management**:
   - All game data is stored in `dnd_campaign.json`
   - Includes game log, campaign state, and character information
   - Persists between application restarts

3. **LLM Integration**:
   - Uses Ollama's API for text generation
   - Custom prompts provide context to each character
   - System analyzes responses to update game state


## 📜 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgements

- Inspired by AI dungeon masters and autonomous agent frameworks
- Built with [Ollama](https://ollama.ai/) for local LLM inference
- Special thanks to the D&D community and AI enthusiasts
## game example

~~~text
$ node 'D&D.js'
(node:226770) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///home/D-D-AI-locally/D&D.js is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /home/D-D-AI-locally/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)
Initializing D&D Game Simulation...
Loading D&D campaign data...
Starting D&D campaign simulation...
===============================
WELCOME TO THE D&D SIMULATION
===============================

[Game Master is narrating the scene...]

🎲 GAME MASTER: The fire crackles merrily in the hearth of the "Sleeping Dragon" tavern, casting dancing shadows on the rough-hewn wooden walls. The air is thick with the smell of roasted meat, stale ale, and woodsmoke. A low hum of conversation fills the room – a mix of weary travelers, local villagers, and the occasional boisterous laugh. 

You all sit around a sturdy oak table, mugs of ale in hand, having just arrived in Mistwood Village. The village itself is nestled at the edge of the vast, ancient Mistwood – a place whispered about in hushed tones, known for its dense fog, strange creatures, and forgotten ruins. 

A stout woman with rosy cheeks and a warm smile approaches your table. She wears a simple, patched-up dress and a practical apron. This is Elara, the tavern owner.

"Welcome, travelers, welcome!" she says, her voice friendly and welcoming. "You look like you've had a long journey. Anything I can get for you? Fresh bread, hearty stew... or perhaps some information about Mistwood?" She winks. "It's not always a place people *want* to talk about."

She pauses, her eyes scanning each of you briefly. "You seem like you're not from around here. Are you perhaps seeking work? Old Man Hemlock, the village elder, is always looking for capable hands. Or maybe you're interested in the history of the Mistwood? There are stories aplenty, both good and… not so good."

**What do you do?**

You can:

* **Talk to Elara:** Ask her about Mistwood, Old Man Hemlock, or any rumors she might have heard.
* **Ask around the tavern:** Try to glean information from other patrons.
* **Leave the tavern:** Explore the village or head towards the Mistwood.
* **Something else:** Describe your own action.






[Thorne (Human Fighter) is thinking...]

[Lyra (Elf Wizard) is thinking...]

[Grimble (Halfling Rogue) is thinking...]

[Aurelia (Aasimar Cleric) is thinking...]

[Waiting for all players to decide their actions...]

🧙‍♂THORNE: I take a long swig of my ale, letting the taste settle on my tongue before meeting Elara's gaze directly. My hand rests subtly on the hilt of my greatsword, not aggressively, but a familiar gesture of readiness. 

"Mistwood, you say?" I ask, my voice a low rumble, steady and direct. "I've heard whispers of it. Dangerous things dwell in those woods, they say. I'm always open to a job that requires a strong arm and a clear head. Old Man Hemlock, you mentioned? What kind of work does he typically need done?" 

I keep my eyes open and observant, taking in Elara's reaction. I'm not one for pleasantries, but I appreciate a direct answer. I want to know if this village and its elder offer a path to useful work, and if there's any indication of trouble brewing in the Mistwood. 

"And," I add, after a brief pause, "if you have any stories about the Mistwood... I'm a keen listener. A soldier learns to listen to the wind, and the wind often carries secrets."






🧙‍♂LYRA: I take a slow sip of my ale, letting the rich flavor coat my tongue before setting the mug down with a gentle clink. I regard Elara with a thoughtful expression, my keen eyes taking in the details of her face – the lines of kindness around her eyes, the slight weariness beneath the warmth.

"Mistwood, you say?" I inquire, my voice carrying a hint of intellectual curiosity. "Indeed, it has a reputation. I've read fragments of ancient texts hinting at forgotten civilizations swallowed by the wood, and tales of… unusual phenomena. Old Man Hemlock, you mention? Is he well-versed in the lore of the Mistwood? I'm particularly interested in any legends concerning pre-human settlements or perhaps… magical occurrences."

I pause, considering. "I am, admittedly, a scholar of sorts. I find the interplay of history and magic endlessly fascinating. Any whispers you might have heard, even if they are considered 'not so good,' would be most welcome." I offer a small, polite smile, hoping to encourage her to share. I subtly adjust the strap of my spellbook, a silent reminder of my own capabilities, but not in a boastful way. Just… a quiet acknowledgement of my skills.






🧙‍♂GRIMBLE: (Eyes Elara up and down with a playful smirk, taking a long swig of my ale)

"Well met, good woman! Elara, you say? A fine name for a fine tavern keeper. Mistwood, eh? It certainly *looks* like a place that holds a few secrets. And secrets... well, secrets are my specialty." I lean forward conspiratorially, lowering my voice slightly. "Old Man Hemlock, you say? Is he looking for someone with a knack for finding things? Lost trinkets, perhaps? Or... something a little more valuable?"

(I give a wink, hoping to gauge her reaction and see if she's receptive to a bit of playful deception. My fingers subtly twitch towards my belt, where my thieves' tools are safely tucked away.) 

"And while you're at it, any juicy rumors you might have heard about the Mistwood? Whispers of forgotten ruins, hidden treasures... anything that might pique a rogue's interest?" I finish with a grin, trying to appear charming and approachable, but with a hint of my underlying mischievousness.






🧙‍♂AURELIA: I offer Elara a warm smile, taking a slow sip of my ale. "Welcome to Mistwood, to you as well, Elara. Indeed, we are travelers, and new to these parts. Mistwood… it holds a certain mystique, doesn't it? We've heard whispers of its ancient ruins and… unusual inhabitants. I'm particularly interested in learning more about the history of the forest. Do you have any tales to share? Perhaps something Old Man Hemlock might be looking for?"

I lean forward slightly, my gaze earnest. "I am Aurelia, a cleric of Pelor. I seek to understand the world and help those in need. If there's a way I can assist the village, or learn something of value from its history, I am eager to do so." I gently touch my holy symbol, a small sun pendant, as I speak. 

My tone is respectful and open, hoping to build rapport with Elara and gain valuable information. I want to show my willingness to help and my genuine interest in the village and its history.






[Game Master is narrating the scene...]

🎲 GAME MASTER: Elara’s eyes twinkle as she takes in your varied approaches. She seems pleased by the interest in Mistwood, and particularly by Aurelia’s respectful demeanor. She sets down a polishing rag and leans against the bar, a thoughtful expression on her face.

"Well met to you all," she says, her voice softening slightly. "You've certainly piqued my interest. You're right, Mistwood *does* hold secrets. And Old Man Hemlock… he’s always looking for someone with a sharp mind and a strong back. He’s particularly concerned about the recent… disturbances in the woods. Things have been… restless."

She pauses, glancing around the tavern as if wary of being overheard. "He's been searching for something lost – a relic, some say. Something connected to the old civilizations that supposedly thrived here before… well, before the Mistwood swallowed them whole. He believes it could help protect the village from whatever's stirring in the deeper woods."

Elara leans closer, lowering her voice. "There are whispers of strange lights, unsettling howls, and… things moving in the fog that aren't quite right. Some say it's just the wild creatures of the Mistwood, but others… others speak of something older, something… *awakening*."

She looks at each of you in turn. "As for stories… there are plenty. Tales of forgotten temples, of powerful mages who attempted to harness the Mistwood's power, and of creatures born from the fog itself. But some of those stories are best left untold. They tend to… unsettle people."

She smiles again, a hint of mischief in her eyes. "Old Man Hemlock is in his cottage just beyond the tavern. It's the first door on the left as you leave the building. He's a bit… eccentric, but he's a good man. And he appreciates a good story, especially if it involves helping the village."

**What do you do?**

You can:

* **Go to Old Man Hemlock's cottage:** Head to the cottage and speak with him directly.
* **Ask Elara more about the disturbances:** Press her for more details about the strange occurrences in the Mistwood.
* **Ask other patrons:** Try to glean more information from the other people in the tavern.
* **Leave the tavern and explore the village:** Take a walk around Mistwood Village to get a better feel for the place.
* **Something else:** Describe your own action.






[Thorne (Human Fighter) is thinking...]

[Lyra (Elf Wizard) is thinking...]

[Grimble (Halfling Rogue) is thinking...]

[Aurelia (Aasimar Cleric) is thinking...]

[Waiting for all players to decide their actions...]

~~~
