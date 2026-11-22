# 🎲 Aura Ludo Pro Simulator

A modern, immersive, browser-based Ludo game simulator engineered with **React 19**, **Vite**, and high-performance **WebAssembly (C++)** game logic with a pure JavaScript fallback. Features a 3D physical animated dice, step-by-step box hopping animations, native Web Audio API sound effects, and customizable match setups.

---

## 🌟 Key Features & Functionalities

### 1. 🎲 Realistic 3D Physical Animated Dice
- **Full 3D Cube Simulation**: Modeled with pure CSS 3D perspectives, subtle bevels, cast shadows, and classic red center pip for face `1`.
- **Dynamic 3D Tumble Roll**: Tumbles along `X`, `Y`, and `Z` axes on click or bot trigger.
- **Single-Face Landing & Persistence**: Automatically settles flat upright showing only the active rolled number, and keeps showing that number throughout the turn until the next roll.

### 2. 🚶 Step-by-Step Token Movement & Multi-Hop Audio
- **Tile-by-Tile Box Hopping**: Tokens do not jump or teleport directly; they traverse the board square-by-square.
- **Rhythmic Audio Steps**: If a dice rolls a 5, 5 sequential audio hop sounds play as the token progresses through each box.
- **Capture & Victory Effects**: Distinct knockout impact sounds when an opponent's piece is captured and fanfare upon winning.

### 3. 🤖 Intelligent Bot & Smart Human Auto-Move
- **Human Auto-Move**: If a human player has only 1 valid movable token on the board, the token highlights and advances automatically after a brief natural delay.
- **Multi-Option Manual Selection**: When multiple tokens can move (e.g. rolling a 6 with tokens in yard or multiple pieces on the track), valid options pulse with a glow for manual choice.
- **AI Bot Players**: Greedy strategic bot engine that balances bringing tokens out of the yard, hunting down opponents, and moving pieces safely home.

### 4. 🎛️ Top Navigation HUD & Controls
- **In-Game Rules & Setup**: Reconfigure player types (Human vs. Bot) or tweak advanced rules at any time without refreshing.
- **Speed Multiplier**: Adjust gameplay pacing on the fly between `1x` (Normal), `2x` (Fast), and `Instant`.
- **Audio Controls**: One-click Mute / Unmute toggle for all sound effects.
- **Quick Reset**: Instant match restart with a single click.

### 5. 🛡️ Advanced Board Visuals & Polish
- **Safe Square Indicators**: All traditional safe squares feature illuminated golden stars.
- **Active Turn Yard Glow**: The active player's corner quadrant pulses with their respective theme color (Red, Blue, Green, Yellow).
- **Cluster & Token Stacking**: Multiple tokens occupying the same square are automatically organized into overlapping stacks with count badges (`×2`, `×3`).
- **Live Scorecards**: Real-time tracking of tokens safely home (`X/4 Home`) and kills per player.

---

## 🚀 Live Deployment on Vercel

This application is **100% ready for Vercel deployment**:
- Single Page Application (Vite + React)
- Zero external backend server requirements
- Built-in Web Audio API (zero heavy audio asset loading)
- Production build passes with zero errors

### Deploy Steps:

#### Option A: Via Vercel Web Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **"Add New"** > **"Project"** and import `adityabhardwaj323/Ludo-Simulator-2`.
3. In the project configuration:
   - **Root Directory**: Select `Ludo-simulator-` (click Edit and select the folder).
   - **Framework Preset**: `Vite` (automatically detected).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**.

#### Option B: Deploying Root Directory with `vercel.json`
If deploying directly from the repository root, `vercel.json` is configured automatically to route and build the project.

---

## 🛠️ Local Development

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation & Run

```bash
# Navigate to the app directory
cd Ludo-simulator-

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Production Build

```bash
npm run build
```

The production output is bundled into `dist/`.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 19, Vite 8, Lucide React Icons
- **Styles**: Custom CSS3 with 3D Matrix Transformations (`transform-style: preserve-3d`), Flexbox, CSS Grid
- **Audio**: Web Audio API (Synthesizer Oscillators & Gain Nodes)
- **Game Engine**: C++ Game Engine compiled to WebAssembly (Emscripten) with pure JavaScript isomorphic fallback
