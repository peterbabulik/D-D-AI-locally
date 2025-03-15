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
   cd D-D-AI-locally
   ```

2. Install dependencies:
   ```
   npm init -y
   npm install node-fetch
   ```

3. Make sure Ollama is running with the recommended model:
   ```
   ollama pull gemma3:1b
   ollama run gemma3:1b
   ```

4. Start the D&D simulation:
   ```
   node index.js
   ```

5. Watch as the AI-controlled D&D campaign unfolds in your terminal!

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

## 🔍 Advanced Usage

### Analyzing Characters

```javascript
import { analyzeCharacter } from './index.js';

// Get stats about a specific character
const characterData = await analyzeCharacter("Lyra");
console.log(characterData);
```

### Campaign Analysis

```javascript
import { analyzeCampaign } from './index.js';

// Get overall campaign statistics
const campaignData = await analyzeCampaign();
console.log(campaignData);
```

## 📜 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgements

- Inspired by AI dungeon masters and autonomous agent frameworks
- Built with [Ollama](https://ollama.ai/) for local LLM inference
- Special thanks to the D&D community and AI enthusiasts
