import React, { useState, useEffect, useRef } from 'react';
import { createInitialState, getMovableTokens, calculateNextState, PLAYERS, syncWasmState } from './gameLogicWasm';
import LudoBoard from './LudoBoard';
import GameControls from './GameControls';
import { Trophy } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState(null);
  const [highlightedTokens, setHighlightedTokens] = useState([]);
  const [setupVisible, setSetupVisible] = useState(true);
  
  const [playerConfig, setPlayerConfig] = useState({
    0: 'human',
    1: 'human',
    2: 'bot',
    3: 'bot'
  });

  const [advancedRules, setAdvancedRules] = useState({
    threeSixes: true,
    killToEnterHome: false
  });

  const rollTimeoutRef = useRef(null);
  const autoMoveTimeoutRef = useRef(null);

  const startGame = () => {
    const initialState = createInitialState(playerConfig);
    initialState.advancedRules = advancedRules;
    setGameState(initialState);
    syncWasmState(initialState);
    setSetupVisible(false);
  };

  const handleRollDice = () => {
    if (gameState.diceRolled || gameState.winner !== null || gameState.isRolling) return;
    
    setGameState(prev => ({ ...prev, isRolling: true }));
    
    // Simulate roll animation delay (extended slightly for smooth 3D tumble)
    rollTimeoutRef.current = setTimeout(() => {
      const value = Math.floor(Math.random() * 6) + 1;
      
      setGameState(prev => {
        const next = { ...prev, diceValue: value, diceRolled: true, isRolling: false };
        const movable = getMovableTokens(next, value);
        
        if (movable.length === 0) {
          next.logs = [...next.logs, `${PLAYERS[next.currentPlayer].name} rolled ${value} but cannot move.`];
          next.diceRolled = false;
          next.diceValue = null;
          next.consecutiveSixes = 0;
          next.currentPlayer = (next.currentPlayer + 1) % 4;
          next.logs = [...next.logs, `${PLAYERS[next.currentPlayer].name}'s turn.`];
          setHighlightedTokens([]);
        } else {
          setHighlightedTokens(movable.map(t => t.id));
        }
        
        return next;
      });
    }, 500);
  };

  const handleTokenClick = (tokenId) => {
    if (!highlightedTokens.includes(tokenId) || gameState.winner !== null) return;
    
    const nextState = calculateNextState(gameState, tokenId);
    setGameState(nextState);
    setHighlightedTokens([]);
  };

  // Auto-move for Human if only 1 movable token is available
  useEffect(() => {
    if (!gameState || gameState.winner !== null) return;

    const currentPlayerType = gameState.playerTypes[gameState.currentPlayer];
    if (currentPlayerType === 'human' && gameState.diceRolled && highlightedTokens.length === 1) {
      // Auto move after a brief natural delay so user sees the dice roll
      autoMoveTimeoutRef.current = setTimeout(() => {
        handleTokenClick(highlightedTokens[0]);
      }, 600);
    }

    return () => {
      clearTimeout(autoMoveTimeoutRef.current);
    };
  }, [gameState, highlightedTokens]);

  // Bot Logic
  useEffect(() => {
    if (!gameState || gameState.winner !== null) return;

    const currentPlayerType = gameState.playerTypes[gameState.currentPlayer];
    
    if (currentPlayerType === 'bot') {
      if (!gameState.diceRolled && !gameState.isRolling) {
        autoMoveTimeoutRef.current = setTimeout(() => {
          handleRollDice();
        }, 1000);
      } else if (gameState.diceRolled && highlightedTokens.length > 0) {
        // Bot logic to choose a token
        autoMoveTimeoutRef.current = setTimeout(() => {
          // Simple strategy: prefer tokens that are already on board, then prefer tokens closest to home
          const movableTokens = gameState.tokens.filter(t => highlightedTokens.includes(t.id));
          
          let chosen = movableTokens[0];
          
          // Try to capture if possible (advanced)
          // For now, simple greedy: max steps
          for (let t of movableTokens) {
             if (t.steps > chosen.steps) chosen = t;
          }

          // If a token is at start and we rolled 6, and we have tokens on board, maybe prefer bringing it out
          const atHome = movableTokens.find(t => t.steps === -1);
          if (atHome && Math.random() > 0.5) {
             chosen = atHome;
          }

          handleTokenClick(chosen.id);
        }, 1200);
      }
    }

    return () => {
      clearTimeout(autoMoveTimeoutRef.current);
    };
  }, [gameState, highlightedTokens]);

  return (
    <div className="app-container">
      <div className="header" style={{ display: 'none' }}>
        <h1>Aura Ludo</h1>
        <p>The Ultimate Modern Simulator</p>
      </div>

      {/* Setup Overlay */}
      {setupVisible && (
        <div className="setup-overlay">
          <div className="setup-card">
            <h2>Game Setup</h2>
            <div style={{ marginBottom: '2rem' }}>
              {PLAYERS.map(p => (
                <div key={p.id} className="player-config">
                  <div className="player-config-left">
                    <div className={`avatar avatar-${p.id}`} style={{ width: '32px', height: '32px', fontSize: '1rem' }}>
                      {p.name.charAt(0)}
                    </div>
                    <span>{p.name} Player</span>
                  </div>
                  <select 
                    value={playerConfig[p.id]}
                    onChange={(e) => setPlayerConfig({...playerConfig, [p.id]: e.target.value})}
                  >
                    <option value="human">Human</option>
                    <option value="bot">Bot</option>
                  </select>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem' }}>Advanced Rules</h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={advancedRules.threeSixes} 
                  onChange={(e) => setAdvancedRules({...advancedRules, threeSixes: e.target.checked})}
                />
                Cancel turn on three 6s
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={advancedRules.killToEnterHome} 
                  onChange={(e) => setAdvancedRules({...advancedRules, killToEnterHome: e.target.checked})}
                />
                Must capture to enter Home Path
              </label>
            </div>

            <button className="btn btn-primary" onClick={startGame}>Start Game</button>
          </div>
        </div>
      )}

      {/* Winner Overlay */}
      <div className={`winner-overlay ${gameState && gameState.winner !== null && !setupVisible ? 'show' : ''}`}>
        <div className="winner-card">
          <div className="winner-avatar" style={{ background: gameState && gameState.winner !== null ? PLAYERS[gameState.winner].color : '#ccc' }}>
             <Trophy size={48} color="white" />
          </div>
          <h2>{gameState && gameState.winner !== null ? PLAYERS[gameState.winner].name : ''} Wins!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Congratulations on winning the match.</p>
          <button className="btn btn-primary" onClick={() => setSetupVisible(true)}>Play Again</button>
        </div>
      </div>

      {!setupVisible && gameState && (
        <>
          <LudoBoard 
            gameState={gameState} 
            onTokenClick={handleTokenClick}
            highlightedTokens={highlightedTokens}
          />
          <GameControls 
            gameState={gameState} 
            onRollDice={handleRollDice}
          />
        </>
      )}
    </div>
  );
}
