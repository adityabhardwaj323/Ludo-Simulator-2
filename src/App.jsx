import React, { useState, useEffect, useRef } from 'react';
import { createInitialState, getMovableTokens, calculateNextState, PLAYERS, syncWasmState } from './gameLogicWasm';
import LudoBoard from './LudoBoard';
import GameControls from './GameControls';
import { Trophy, Volume2, VolumeX, RotateCcw, Settings, Zap } from 'lucide-react';
import { sounds } from './sounds';

export default function App() {
  const [gameState, setGameState] = useState(null);
  const [highlightedTokens, setHighlightedTokens] = useState([]);
  const [setupVisible, setSetupVisible] = useState(true);
  
  // Game settings
  const [gameSpeed, setGameSpeed] = useState('1x'); // '1x', '2x', 'instant'
  const [isMuted, setIsMuted] = useState(false);

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

  // Sync mute state with sounds manager
  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sounds.setMuted(nextMuted);
  };

  const startGame = () => {
    const initialState = createInitialState(playerConfig);
    initialState.advancedRules = advancedRules;
    setGameState(initialState);
    syncWasmState(initialState);
    setSetupVisible(false);
  };

  const restartCurrentGame = () => {
    if (!gameState) return;
    const initialState = createInitialState(gameState.playerTypes);
    initialState.advancedRules = gameState.advancedRules;
    setGameState(initialState);
    syncWasmState(initialState);
    setHighlightedTokens([]);
  };

  // Speed factor helper
  const getSpeedDelay = (baseDelay) => {
    if (gameSpeed === 'instant') return 60;
    if (gameSpeed === '2x') return Math.max(80, Math.floor(baseDelay / 2.2));
    return baseDelay;
  };

  const handleRollDice = () => {
    if (gameState.diceRolled || gameState.winner !== null || gameState.isRolling) return;
    
    setGameState(prev => ({ ...prev, isRolling: true }));
    sounds.playDiceRoll();
    
    const rollDuration = getSpeedDelay(500);

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
    }, rollDuration);
  };

  const handleTokenClick = (tokenId) => {
    if (!highlightedTokens.includes(tokenId) || gameState.winner !== null) return;
    
    const prevKills = gameState.kills[gameState.currentPlayer];
    const nextState = calculateNextState(gameState, tokenId);
    
    // Check if a capture happened
    if (nextState.kills[nextState.currentPlayer] > prevKills || nextState.logs[nextState.logs.length - 1]?.includes('captured')) {
      sounds.playCapture();
    } else {
      sounds.playTokenMove();
    }

    // Check winner
    if (nextState.winner !== null) {
      sounds.playVictory();
    }

    setGameState(nextState);
    setHighlightedTokens([]);
  };

  // Auto-move for Human if only 1 movable token is available
  useEffect(() => {
    if (!gameState || gameState.winner !== null) return;

    const currentPlayerType = gameState.playerTypes[gameState.currentPlayer];
    if (currentPlayerType === 'human' && gameState.diceRolled && highlightedTokens.length === 1) {
      const delay = getSpeedDelay(600);
      autoMoveTimeoutRef.current = setTimeout(() => {
        handleTokenClick(highlightedTokens[0]);
      }, delay);
    }

    return () => {
      clearTimeout(autoMoveTimeoutRef.current);
    };
  }, [gameState, highlightedTokens, gameSpeed]);

  // Bot Logic
  useEffect(() => {
    if (!gameState || gameState.winner !== null) return;

    const currentPlayerType = gameState.playerTypes[gameState.currentPlayer];
    
    if (currentPlayerType === 'bot') {
      if (!gameState.diceRolled && !gameState.isRolling) {
        const rollDelay = getSpeedDelay(850);
        autoMoveTimeoutRef.current = setTimeout(() => {
          handleRollDice();
        }, rollDelay);
      } else if (gameState.diceRolled && highlightedTokens.length > 0) {
        const moveDelay = getSpeedDelay(1000);
        autoMoveTimeoutRef.current = setTimeout(() => {
          const movableTokens = gameState.tokens.filter(t => highlightedTokens.includes(t.id));
          
          let chosen = movableTokens[0];
          for (let t of movableTokens) {
             if (t.steps > chosen.steps) chosen = t;
          }

          const atHome = movableTokens.find(t => t.steps === -1);
          if (atHome && Math.random() > 0.5) {
             chosen = atHome;
          }

          handleTokenClick(chosen.id);
        }, moveDelay);
      }
    }

    return () => {
      clearTimeout(autoMoveTimeoutRef.current);
    };
  }, [gameState, highlightedTokens, gameSpeed]);

  return (
    <div className="app-container-outer">
      {/* Top Navigation HUD Bar */}
      <header className="top-hud-bar">
        <div className="brand-logo">
          <div className="logo-icon">🎲</div>
          <div className="logo-text">
            <h1>AURA LUDO</h1>
            <span className="logo-badge">PRO SIMULATOR</span>
          </div>
        </div>

        {!setupVisible && gameState && (
          <div className="hud-actions">
            {/* Speed Selector */}
            <div className="hud-speed-toggle" title="Game / Bot Speed">
              <Zap size={14} className="speed-icon" />
              {(['1x', '2x', 'instant']).map((speed) => (
                <button
                  key={speed}
                  className={`btn-speed ${gameSpeed === speed ? 'active' : ''}`}
                  onClick={() => setGameSpeed(speed)}
                >
                  {speed}
                </button>
              ))}
            </div>

            {/* Sound Toggle */}
            <button 
              className={`hud-icon-btn ${isMuted ? 'muted' : ''}`} 
              onClick={toggleSound}
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            {/* Restart Match */}
            <button 
              className="hud-icon-btn" 
              onClick={restartCurrentGame}
              title="Restart Current Match"
            >
              <RotateCcw size={18} />
            </button>

            {/* Settings / New Setup */}
            <button 
              className="hud-icon-btn btn-settings" 
              onClick={() => setSetupVisible(true)}
              title="Setup & Rules"
            >
              <Settings size={18} />
              <span className="btn-label-desktop">Rules</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Game Screen */}
      <div className="app-container">
        {/* Setup Overlay */}
        {setupVisible && (
          <div className="setup-overlay">
            <div className="setup-card">
              <h2>Game Setup</h2>
              <div style={{ marginBottom: '1.5rem' }}>
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

              <div style={{ marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#94a3b8' }}>Advanced Rules</h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                  <input 
                    type="checkbox" 
                    checked={advancedRules.threeSixes} 
                    onChange={(e) => setAdvancedRules({...advancedRules, threeSixes: e.target.checked})}
                  />
                  Cancel turn on three 6s
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.95rem' }}>
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
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Congratulations on winning the match!</p>
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
    </div>
  );
}
