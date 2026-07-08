# C++ Integration with WebAssembly

This project now includes C++ code for the game logic! Here's how it works:

## What's Added

### New Files:
1. **`src/gameLogic.cpp`** - C++ implementation of the Ludo game logic
2. **`src/gameLogicWasm.js`** - JavaScript bridge to WebAssembly
3. **`build_wasm.bat`** - Build script for Windows (uses Emscripten)

### How It Works:
- The game logic is implemented in C++ for better performance
- Emscripten compiles C++ to WebAssembly (.wasm) and a JavaScript wrapper
- The React app uses the same API, so no changes to UI or functionality
- Falls back to JavaScript implementation if WebAssembly fails to load

## To Use the C++ Version (Optional):

### Prerequisites:
1. Install [Emscripten SDK](https://emscripten.org/docs/getting_started/downloads.html)
2. Make sure `emcc` is in your PATH

### Build Steps:
```bash
# Build the WebAssembly module
npm run build:wasm

# Then start the dev server normally
npm run dev
```

## Without Emscripten:
The project will still work perfectly fine! It automatically falls back to the original JavaScript implementation.

## Project Structure:
- Original JavaScript logic preserved in `src/gameLogic.js`
- C++ logic in `src/gameLogic.cpp`
- Bridge in `src/gameLogicWasm.js`
- All React components unchanged - same UI and functionality!
