import React from 'react';
import { BOARD_SIZE, PLAYERS, SAFE_SQUARES, getBoardPosition, FINISH_STEPS } from './gameLogic';
import { Star } from 'lucide-react';

export default function LudoBoard({ gameState, onTokenClick, highlightedTokens }) {
  // Track coordinate mapping (15x15 grid)
  const trackCoords = [
    // Red Start to Top Right
    {r: 7, c: 2}, {r: 7, c: 3}, {r: 7, c: 4}, {r: 7, c: 5}, {r: 7, c: 6}, // 0-4
    {r: 6, c: 7}, {r: 5, c: 7}, {r: 4, c: 7}, {r: 3, c: 7}, {r: 2, c: 7}, {r: 1, c: 7}, // 5-10
    {r: 1, c: 8}, {r: 1, c: 9}, // 11-12
    // Blue Start to Bottom Right
    {r: 2, c: 9}, {r: 3, c: 9}, {r: 4, c: 9}, {r: 5, c: 9}, {r: 6, c: 9}, // 13-17
    {r: 7, c: 10}, {r: 7, c: 11}, {r: 7, c: 12}, {r: 7, c: 13}, {r: 7, c: 14}, {r: 7, c: 15}, // 18-23
    {r: 8, c: 15}, {r: 9, c: 15}, // 24-25
    // Green Start to Bottom Left
    {r: 9, c: 14}, {r: 9, c: 13}, {r: 9, c: 12}, {r: 9, c: 11}, {r: 9, c: 10}, // 26-30
    {r: 10, c: 9}, {r: 11, c: 9}, {r: 12, c: 9}, {r: 13, c: 9}, {r: 14, c: 9}, {r: 15, c: 9}, // 31-36
    {r: 15, c: 8}, {r: 15, c: 7}, // 37-38
    // Yellow Start to Top Left
    {r: 14, c: 7}, {r: 13, c: 7}, {r: 12, c: 7}, {r: 11, c: 7}, {r: 10, c: 7}, // 39-43
    {r: 9, c: 6}, {r: 9, c: 5}, {r: 9, c: 4}, {r: 9, c: 3}, {r: 9, c: 2}, {r: 9, c: 1}, // 44-49
    {r: 8, c: 1}, {r: 7, c: 1} // 50-51
  ];

  const homePaths = {
    0: [{r: 8, c: 2}, {r: 8, c: 3}, {r: 8, c: 4}, {r: 8, c: 5}, {r: 8, c: 6}], // Red
    1: [{r: 2, c: 8}, {r: 3, c: 8}, {r: 4, c: 8}, {r: 5, c: 8}, {r: 6, c: 8}], // Blue
    2: [{r: 8, c: 14}, {r: 8, c: 13}, {r: 8, c: 12}, {r: 8, c: 11}, {r: 8, c: 10}], // Green
    3: [{r: 14, c: 8}, {r: 13, c: 8}, {r: 12, c: 8}, {r: 11, c: 8}, {r: 10, c: 8}] // Yellow
  };

  // Group tokens on the board by their grid coordinate for clean stacking
  const groupedTokens = {};
  gameState.tokens.forEach(token => {
    if (token.steps === -1) return; // In home yard

    const pos = getBoardPosition(token.player, token.steps);
    let key = '';
    let coords = null;

    if (pos.type === 'finish') {
      key = 'finish';
      coords = { r: 8, c: 8 };
    } else if (pos.type === 'track') {
      key = `track-${pos.position}`;
      coords = trackCoords[pos.position];
    } else if (pos.type === 'homePath') {
      key = `hp-${pos.player}-${pos.position}`;
      coords = homePaths[pos.player][pos.position - 1];
    }

    if (coords) {
      if (!groupedTokens[key]) {
        groupedTokens[key] = { coords, tokens: [] };
      }
      groupedTokens[key].tokens.push(token);
    }
  });

  // Pre-calculate track cells
  const cells = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    const coords = trackCoords[i];
    const isSafe = SAFE_SQUARES.has(i);
    let className = "cell";
    if (isSafe) className += " safe";
    
    // Color start cells
    if (i === 0) className += " cell-start-0";
    if (i === 13) className += " cell-start-1";
    if (i === 26) className += " cell-start-2";
    if (i === 39) className += " cell-start-3";

    if (coords) {
      cells.push(
        <div key={`track-${i}`} className={className} style={{ gridRow: coords.r, gridColumn: coords.c }}>
          {isSafe && <Star className="safe-star-icon" size={12} fill="#fbbf24" stroke="#d97706" />}
        </div>
      );
    }
  }

  // Home paths cells
  for (let p = 0; p < 4; p++) {
    for (let i = 0; i < 5; i++) {
      const coords = homePaths[p][i];
      cells.push(
        <div key={`hp-${p}-${i}`} className={`cell cell-home-path cell-hp-${p}`} style={{ gridRow: coords.r, gridColumn: coords.c }}>
          <span className="home-path-pip" />
        </div>
      );
    }
  }

  // Separate home tokens per player
  const homeTokens = { 0: [], 1: [], 2: [], 3: [] };
  gameState.tokens.forEach(t => {
    if (t.steps === -1) homeTokens[t.player].push(t);
  });

  return (
    <div className="board-container">
      <div className="board-grid">
        {/* Render Track Cells */}
        {cells}

        {/* 4 Corner Home Yards with Active Player Glow */}
        {[0, 1, 2, 3].map(p => {
          const isActive = gameState.currentPlayer === p;
          return (
            <div 
              key={`home-area-${p}`} 
              className={`home-area home-area-${p} ${isActive ? 'active-turn-yard' : ''}`}
            >
              <div className="home-yard-inner">
                {homeTokens[p].map((t) => {
                  const isHighlighted = highlightedTokens.includes(t.id);
                  return (
                    <div key={`home-spot-${t.id}`} className="home-spot">
                      <div 
                        className={`token token-${t.player} ${isHighlighted ? 'highlight' : ''}`}
                        onClick={() => isHighlighted && onTokenClick(t.id)}
                        title={`${PLAYERS[t.player].name} Token (Click to bring out on 6)`}
                      >
                        <span className="token-inner-dot" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Center Triangular Finish Area */}
        <div className="center-area" style={{ gridColumn: '7/10', gridRow: '7/10' }}>
          <div className="center-triangles">
            <div className="tri tri-red" />
            <div className="tri tri-blue" />
            <div className="tri tri-green" />
            <div className="tri tri-yellow" />
          </div>
          <div className="center-crown">👑</div>
        </div>

        {/* Render Clustered & Stacked Tokens on Board */}
        {Object.entries(groupedTokens).map(([key, group]) => {
          const count = group.tokens.length;
          const { r, c } = group.coords;

          return (
            <div 
              key={`cell-tokens-${key}`} 
              className={`token-cell-cluster count-${count}`}
              style={{ gridRow: r, gridColumn: c }}
            >
              {group.tokens.map((t, idx) => {
                const isHighlighted = highlightedTokens.includes(t.id);
                return (
                  <div
                    key={`board-token-${t.id}`}
                    className={`token token-${t.player} ${isHighlighted ? 'highlight' : ''} ${count > 1 ? 'stacked-token' : ''}`}
                    onClick={() => isHighlighted && onTokenClick(t.id)}
                    title={`${PLAYERS[t.player].name} Token`}
                    style={{
                      zIndex: isHighlighted ? 25 : 10 + idx,
                    }}
                  >
                    <span className="token-inner-dot" />
                  </div>
                );
              })}
              {count > 1 && (
                <span className="cluster-badge">×{count}</span>
              )}
            </div>
          );
        })}

      </div>
    </div>
  );
}
