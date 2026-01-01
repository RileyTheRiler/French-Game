# LingoLift 🇫🇷

A gamified French language learning application built with React and Vite. Features multiple game modes, spaced repetition, and a virtual economy to keep you motivated.

![LingoLift](https://img.shields.io/badge/React-18-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-teal)

## ✨ Features

- **Falling Words** - Type translations before they hit the ground
- **Daily Mix** - Interleaved practice sessions for better retention
- **Flashcards** - Spaced repetition study mode
- **Sentence Builder** - Construct French sentences with drag-and-drop
- **Conversation Simulator** - Roleplay real-world scenarios
- **Pronunciation Coach** - Voice recognition feedback
- **Le Quartier (Neighborhood Hub)** - Explore an interactive map
- **Shop & Economy** - Earn coins and buy items like Streak Freeze

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Web Speech API** - Text-to-Speech & Voice Recognition
- **LocalStorage** - Data persistence

## 📁 Project Structure

```
src/
├── components/      # React components
├── context/         # React Context providers
├── data/            # Static data (vocabulary, scenarios)
├── games/           # Game-specific components
├── systems/         # Game logic systems
└── utils/           # Utility functions
```

## 🎮 Game Modes

| Mode | Description | Unlock Level |
|------|-------------|--------------|
| Le Quartier | Explore the neighborhood hub | 1 |
| Falling Words | Type fast before words hit the ground | 1 |
| Study Session | Review due flashcards | 1 |
| Sentence Builder | Build sentences block by block | 1 |
| Daily Mix | Interleaved practice | 2 |
| Roleplay | Conversation scenarios | 2 |
| Story Mode | Immersive French stories | 3 |
| Pronunciation | Master your accent | 3 |

## 📝 License

MIT
