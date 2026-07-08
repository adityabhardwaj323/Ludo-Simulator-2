import React from 'react';
import { PLAYERS } from './gameLogic';
import { User, Cpu, Dices } from 'lucide-react';

export default function GameControls({ gameState, onRollDice }) {
  const currentPlayer = PLAYERS[gameState.currentPlayer];
  const isHuman = gameState.playerTypes[gameState.currentPlayer] === 'human';

  return (
    <div className="controls-container">
      <div className="dice-section">
        <h3>{currentPlayer.name}'s Turn</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
          {isHuman ? <><User size={16}/> Human</> : <><Cpu size={16}/> Bot</>}
        </p>

        <div 
          className={`dice-wrapper ${gameState.isRolling ? 'rolling' : ''}`}
          onClick={!gameState.diceRolled && isHuman && !gameState.isRolling ? onRollDice : undefined}
          style={{ cursor: (!gameState.diceRolled && isHuman && !gameState.isRolling) ? 'pointer' : 'default' }}
        >
          {gameState.diceValue ? getDiceFace(gameState.diceValue) : <Dices size={40} />}
        </div>
        
        <p style={{ minHeight: '1.5rem', marginTop: '0.5rem', fontWeight: 'bold' }}>
          {gameState.diceValue ? `Rolled: ${gameState.diceValue}` : (isHuman ? 'Click to Roll' : 'Bot is thinking...')}
        </p>

        {isHuman && gameState.diceRolled && (
          <p style={{ fontSize: '0.9rem', color: 'var(--yellow-color)', marginTop: '0.5rem' }}>
             Select a token on the board to move.
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {PLAYERS.map(player => (
          <div key={player.id} className={`player-card player-${player.id} ${gameState.currentPlayer === player.id ? 'active' : ''}`}>
            <div className={`avatar avatar-${player.id}`}>
              {player.name.charAt(0)}
            </div>
            <div className="player-info">
              <h3>{player.name}</h3>
              <p>{gameState.playerTypes[player.id] === 'human' ? 'Human' : 'Bot'} • {gameState.kills[player.id]} Kills</p>
            </div>
          </div>
        ))}
      </div>

      <div className="logs">
        {gameState.logs.slice().reverse().map((log, idx) => (
          <div key={idx} className="log-entry">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}

function getDiceFace(value) {
  const faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  return faces[value - 1] || value;
}
