export const BOARD_SIZE = 52;
export const TOKENS_PER_PLAYER = 4;
export const FINISH_STEPS = 57;
export const SAFE_SQUARES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
export const PLAYERS = [
  { id: 0, name: 'Red', color: '#ff4b4b', start: 0 },
  { id: 1, name: 'Blue', color: '#4b7bff', start: 13 },
  { id: 2, name: 'Green', color: '#4bff6a', start: 26 },
  { id: 3, name: 'Yellow', color: '#ffd24b', start: 39 }
];

export const createInitialState = (playerTypes) => {
  const tokens = [];
  for (let p = 0; p < 4; p++) {
    for (let t = 0; t < TOKENS_PER_PLAYER; t++) {
      tokens.push({
        id: `${p}-${t}`,
        player: p,
        tokenId: t,
        steps: -1, // -1 means home
      });
    }
  }

  return {
    tokens,
    currentPlayer: 0,
    diceValue: null,
    diceRolled: false,
    winner: null,
    turnHistory: [], // To keep track of consecutive 6s
    playerTypes: playerTypes || {0: 'human', 1: 'human', 2: 'bot', 3: 'bot'}, // 'human' or 'bot'
    logs: ['Game started. Red\'s turn.'],
    advancedRules: {
      threeSixes: true,
      killToEnterHome: false, // For simplicity in this demo, default false
    },
    kills: {0: 0, 1: 0, 2: 0, 3: 0}, // Track kills for rule
    consecutiveSixes: 0
  };
};

export const getBoardPosition = (playerIndex, steps) => {
  if (steps === -1) return { type: 'home', player: playerIndex };
  if (steps === FINISH_STEPS) return { type: 'finish', player: playerIndex };
  if (steps >= BOARD_SIZE) return { type: 'homePath', player: playerIndex, position: steps - BOARD_SIZE };
  return { type: 'track', position: (PLAYERS[playerIndex].start + steps) % BOARD_SIZE };
};

export const canMove = (token, diceValue, state) => {
  if (token.steps === FINISH_STEPS) return false;
  
  if (token.steps === -1) {
    return diceValue === 6;
  }
  
  if (token.steps + diceValue > FINISH_STEPS) return false;

  if (state.advancedRules.killToEnterHome) {
    if (token.steps + diceValue >= BOARD_SIZE && state.kills[token.player] === 0) {
      return false; // Cannot enter home path without a kill
    }
  }
  
  return true;
};

export const getMovableTokens = (state, diceValue) => {
  return state.tokens.filter(t => t.player === state.currentPlayer && canMove(t, diceValue, state));
};

export const calculateNextState = (state, tokenId) => {
  let newState = { ...state, tokens: state.tokens.map(t => ({...t})), logs: [...state.logs] };
  const tokenIndex = newState.tokens.findIndex(t => t.id === tokenId);
  const token = newState.tokens[tokenIndex];
  const diceValue = state.diceValue;

  let moveLog = `${PLAYERS[token.player].name} moved token.`;

  if (token.steps === -1) {
    token.steps = 0;
    moveLog = `${PLAYERS[token.player].name} brought a token onto the board.`;
  } else {
    token.steps += diceValue;
  }

  newState.logs.push(moveLog);

  let getsAnotherTurn = diceValue === 6;
  let killed = false;

  // Check captures
  const currentPos = getBoardPosition(token.player, token.steps);
  if (currentPos.type === 'track' && !SAFE_SQUARES.has(currentPos.position)) {
    for (let t of newState.tokens) {
      if (t.player !== token.player && t.steps >= 0 && t.steps < BOARD_SIZE) {
        const oppPos = getBoardPosition(t.player, t.steps);
        if (oppPos.type === 'track' && oppPos.position === currentPos.position) {
          // Blockade check (simple: if there are 2 of the same color, we don't kill, it's a block)
          // For now, simple capture
          t.steps = -1;
          killed = true;
          newState.kills[token.player] = (newState.kills[token.player] || 0) + 1;
          newState.logs.push(`${PLAYERS[token.player].name} captured ${PLAYERS[t.player].name}'s token!`);
          getsAnotherTurn = true; // Extra turn for capturing
        }
      }
    }
  }

  if (token.steps === FINISH_STEPS) {
    newState.logs.push(`${PLAYERS[token.player].name}'s token reached finish!`);
    getsAnotherTurn = true; // Extra turn for finishing
  }

  // Check win
  const hasWon = newState.tokens.filter(t => t.player === state.currentPlayer && t.steps === FINISH_STEPS).length === TOKENS_PER_PLAYER;
  if (hasWon) {
    newState.winner = state.currentPlayer;
    newState.logs.push(`${PLAYERS[state.currentPlayer].name} wins!`);
    return newState;
  }

  // Handle consecutive 6s rule
  if (diceValue === 6) {
    newState.consecutiveSixes += 1;
    if (newState.advancedRules.threeSixes && newState.consecutiveSixes === 3) {
      newState.logs.push(`${PLAYERS[state.currentPlayer].name} rolled three 6s! Turn cancelled and token returned.`);
      token.steps = -1; // Penalty
      getsAnotherTurn = false;
    }
  } else {
    newState.consecutiveSixes = 0;
  }

  newState.diceRolled = false;
  newState.diceValue = null;

  if (!getsAnotherTurn) {
    newState.consecutiveSixes = 0;
    newState.currentPlayer = (newState.currentPlayer + 1) % 4;
    newState.logs.push(`${PLAYERS[newState.currentPlayer].name}'s turn.`);
  } else {
    if(diceValue === 6 && newState.consecutiveSixes < 3) {
       newState.logs.push(`${PLAYERS[token.player].name} gets another turn!`);
    } else if (killed) {
       newState.logs.push(`${PLAYERS[token.player].name} gets another turn for capture!`);
    } else if (token.steps === FINISH_STEPS) {
       newState.logs.push(`${PLAYERS[token.player].name} gets another turn for reaching finish!`);
    }
  }

  return newState;
};
