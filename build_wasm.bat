@echo off
echo Building WebAssembly module...

if not exist "public\wasm" mkdir public\wasm

emcc src\gameLogic.cpp -o public\wasm\gameLogic.js ^
  -s WASM=1 ^
  -s EXPORTED_RUNTIME_METHODS=['ccall','cwrap'] ^
  -s EXPORTED_FUNCTIONS=['_createInitialState','_setDiceValue','_getDiceValue','_getCurrentPlayer','_isDiceRolled','_getWinner','_getTokenCount','_getTokenId','_getTokenPlayer','_getTokenSteps','_getLogCount','_getLog','_getBoardPositionType','_getBoardPositionValue','_getMovableTokenCount','_getMovableTokenIndex','_moveToken','_cleanup'] ^
  -s MODULARIZE=1 ^
  -s EXPORT_ES6=1 ^
  -s ALLOW_MEMORY_GROWTH=1 ^
  -O2

echo Build complete!
