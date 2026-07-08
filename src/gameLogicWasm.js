import * as JSGameLogic from './gameLogic.js';

let Module = null;

export const BOARD_SIZE = JSGameLogic.BOARD_SIZE;
export const TOKENS_PER_PLAYER = JSGameLogic.TOKENS_PER_PLAYER;
export const FINISH_STEPS = JSGameLogic.FINISH_STEPS;
export const SAFE_SQUARES = JSGameLogic.SAFE_SQUARES;
export const PLAYERS = JSGameLogic.PLAYERS;

export const createInitialState = JSGameLogic.createInitialState;
export const getBoardPosition = JSGameLogic.getBoardPosition;
export const canMove = JSGameLogic.canMove;
export const getMovableTokens = JSGameLogic.getMovableTokens;
export const calculateNextState = JSGameLogic.calculateNextState;
export const syncWasmState = () => {};
