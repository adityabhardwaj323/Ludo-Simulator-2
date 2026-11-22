import React from 'react';
import { PLAYERS } from './gameLogic';
import { User, Cpu } from 'lucide-react';
import Dice from './Dice';

export default function GameControls({ gameState, onRollDice }) {
  const currentPlayer = PLAYERS[gameState.currentPlayer];
  const isHuman = gameState.playerTypes[gameState.currentPlayer] === 'human';
  const canClickRoll = !gameState.diceRolled && isHuman && !gameState.isRolling;

  return (
    <div className="controls-container">
      {/* Current Turn Header & Dice */}
      <div className={`dice-section player-border-${currentPlayer.id}`}>
        <div className="turn-badge" style={{ backgroundColor: `${currentPlayer.color}22`, color: currentPlayer.color, borderColor: currentPlayer.color }}>
          {isHuman ? <User size={14}/> : <Cpu size={14}/>}
          <span>{currentPlayer.name}'s Turn ({isHuman ? 'Human' : 'Bot'})</span>
        </div>

        {/* 3D Modern Dice Component */}
        <div className="dice-container-outer">
          <Dice 
            value={gameState.diceValue} 
            isRolling={gameState.isRolling}
            onClick={canClickRoll ? onRollDice : undefined}
            disabled={!canClickRoll}
          />
        </div>
        
        <div className="dice-feedback">
          {gameState.isRolling ? (
            <span className="rolling-text">Rolling...</span>
          ) : gameState.diceValue ? (
            <span className="rolled-value">Rolled: <strong>{gameState.diceValue}</strong></span>
          ) : (
            <span className="prompt-text">{isHuman ? '👉 Click dice to roll' : 'Bot is calculating...'}</span>
          )}
        </div>

        {isHuman && gameState.diceRolled && (
          <p className="pick-token-hint">
             Choose a glowing token on the board to move
          </p>
        )}
      </div>

      {/* Players List with Progress */}
      <div className="players-list">
        {PLAYERS.map(player => {
          const finishedCount = gameState.tokens.filter(t => t.player === player.id && t.steps === 57).length;
          const activeCount = gameState.tokens.filter(t => t.player === player.id && t.steps >= 0 && t.steps < 57).length;
          const homeCount = gameState.tokens.filter(t => t.player === player.id && t.steps === -1).length;

          return (
            <div 
              key={player.id} 
              className={`player-card player-${player.id} ${gameState.currentPlayer === player.id ? 'active' : ''}`}
            >
              <div className={`avatar avatar-${player.id}`}>
                {player.name.charAt(0)}
              </div>
              <div className="player-info">
                <div className="player-info-top">
                  <h3>{player.name}</h3>
                  <span className="player-type-tag">
                    {gameState.playerTypes[player.id] === 'human' ? 'Human' : 'Bot'}
                  </span>
                </div>
                <div className="player-stats-mini">
                  <span>🏁 {finishedCount}/4 Home</span>
                  <span>⚔️ {gameState.kills[player.id]} Kills</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Logs */}
      <div className="logs-wrapper">
        <span className="logs-title">Game History</span>
        <div className="logs">
          {gameState.logs.slice().reverse().map((log, idx) => (
            <div key={idx} className="log-entry">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
