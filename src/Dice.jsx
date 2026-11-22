import React from 'react';

export default function Dice({ value, isRolling, onClick, disabled }) {
  // Dot coordinate configurations for 1 to 6 (standard dice layout)
  // 3x3 grid: [row, col] with 1-based index
  const dotPositions = {
    1: [[2, 2]],
    2: [[1, 3], [3, 1]],
    3: [[1, 3], [2, 2], [3, 1]],
    4: [[1, 1], [1, 3], [3, 1], [3, 3]],
    5: [[1, 1], [1, 3], [2, 2], [3, 1], [3, 3]],
    6: [[1, 1], [1, 3], [2, 1], [2, 3], [3, 1], [3, 3]]
  };

  const currentDots = dotPositions[value] || [];

  return (
    <div 
      className={`modern-dice ${isRolling ? 'rolling' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={!disabled ? onClick : undefined}
      title={disabled ? '' : 'Click to roll'}
    >
      <div className="dice-face">
        {value ? (
          <div className="dice-dots-grid">
            {currentDots.map(([r, c], idx) => (
              <span 
                key={idx} 
                className="dice-pip"
                style={{ gridRow: r, gridColumn: c }}
              />
            ))}
          </div>
        ) : (
          <div className="dice-placeholder">🎲</div>
        )}
      </div>
    </div>
  );
}
