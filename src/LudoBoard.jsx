import React from 'react';
import { BOARD_SIZE, PLAYERS, SAFE_SQUARES, getBoardPosition, FINISH_STEPS } from './gameLogic';

export default function LudoBoard({ gameState, onTokenClick, highlightedTokens }) {
  // Generate a grid map for standard 52 cell track positions to CSS grid coords
  // This is a simplified visual representation. A real Ludo board is a cross.
  // We'll map the 52 cells around the perimeter and home paths inward.
  // 15x15 grid.
  
  // Actually, a simpler way for the React implementation since we use CSS Grid 15x15:
  // We manually define coordinates for the track.
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

  const getCellPositionStyle = (token) => {
    const pos = getBoardPosition(token.player, token.steps);
    
    if (pos.type === 'home') {
       // Just position relative to its home area, which is handled by CSS flex/grid inside home-area
       return {};
    }
    
    if (pos.type === 'finish') {
      return { 
        gridRow: 8, gridColumn: 8, 
        transform: 'scale(0.5)',
        margin: 'auto'
      };
    }
    
    let coords;
    if (pos.type === 'track') {
      coords = trackCoords[pos.position];
    } else if (pos.type === 'homePath') {
      // position is 1 to 5 (steps - 52)
      coords = homePaths[pos.player][pos.position - 1];
    }

    if (!coords) return { display: 'none' };

    // To handle multiple tokens on the same cell, we could add offsets, but simple stacking is fine for now
    return {
      gridRow: coords.r,
      gridColumn: coords.c,
      margin: 'auto'
    };
  };

  // Pre-calculate cells to render
  const cells = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    const coords = trackCoords[i];
    let className = "cell";
    if (SAFE_SQUARES.has(i)) className += " safe";
    
    // Color start cells
    if (i === 0) className += " cell-0";
    if (i === 13) className += " cell-1";
    if (i === 26) className += " cell-2";
    if (i === 39) className += " cell-3";

    if (coords) {
      cells.push(
        <div key={`track-${i}`} className={className} style={{ gridRow: coords.r, gridColumn: coords.c }}>
          {/* {i} */}
        </div>
      );
    }
  }

  // Home paths
  for (let p = 0; p < 4; p++) {
    for (let i = 0; i < 5; i++) {
      const coords = homePaths[p][i];
      cells.push(
        <div key={`hp-${p}-${i}`} className={`cell cell-${p}`} style={{ gridRow: coords.r, gridColumn: coords.c }}>
        </div>
      );
    }
  }

  // Separate tokens into home and board for rendering
  const boardTokens = gameState.tokens.filter(t => t.steps !== -1);
  const homeTokens = { 0: [], 1: [], 2: [], 3: [] };
  gameState.tokens.forEach(t => {
    if (t.steps === -1) homeTokens[t.player].push(t);
  });

  return (
    <div className="board-container">
      <div className="board-grid">
        {/* Render Track Cells */}
        {cells}

        {/* Home Areas */}
        {[0, 1, 2, 3].map(p => (
          <div key={`home-area-${p}`} className={`home-area home-area-${p}`}>
             {homeTokens[p].map((t, idx) => {
               const isHighlighted = highlightedTokens.includes(t.id);
               return (
                 <div key={`home-spot-${p}-${idx}`} className="home-spot">
                   <div 
                     className={`token token-${t.player} ${isHighlighted ? 'highlight' : ''}`}
                     onClick={() => isHighlighted && onTokenClick(t.id)}
                     title={`Token ${t.tokenId}`}
                   />
                 </div>
               );
             })}
          </div>
        ))}

        {/* Center Area */}
        <div className="center-area" style={{ gridColumn: '7/10', gridRow: '7/10' }}></div>

        {/* Render Tokens on Board */}
        {boardTokens.map(t => {
          const style = getCellPositionStyle(t);
          const isHighlighted = highlightedTokens.includes(t.id);
          
          return (
             <div 
               key={`board-token-${t.id}`}
               className={`token token-${t.player} ${isHighlighted ? 'highlight' : ''}`}
               style={style}
               onClick={() => isHighlighted && onTokenClick(t.id)}
               title={`Player ${PLAYERS[t.player].name} Token ${t.tokenId}`}
             />
          );
        })}

      </div>
    </div>
  );
}
