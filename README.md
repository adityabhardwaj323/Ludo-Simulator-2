# Ludo Simulator 2

A browser based Ludo project built with React. Its game logic is written in C++ and compiled to WebAssembly with Emscripten, with a JavaScript bridge connecting the module to the web app.

## Architecture

```text
React interface <--> JavaScript bridge <--> WebAssembly module
                                            (C++ game logic)
```

The integration details are in [C_INTEGRATION.md](C_INTEGRATION.md).

## Run locally

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

Vite prints the local development URL in the terminal.

## Build and lint

```bash
npm run build
npm run lint
```

To rebuild the WebAssembly module on Windows, use `npm run build:wasm`. This invokes the repository's `build_wasm.bat` helper and requires Emscripten. See [C_INTEGRATION.md](C_INTEGRATION.md) for the integration notes.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the repository's deployment configuration and instructions.

## Technology

React, Vite, C++, Emscripten, and WebAssembly.
