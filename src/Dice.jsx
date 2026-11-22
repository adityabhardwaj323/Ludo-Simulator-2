import React from 'react';

export default function Dice({ value, isRolling, onClick, disabled }) {
  // Map value to 3D rotation angles so that specific face lands upright facing front
  // Face mappings:
  // 1: front   -> rotateX(0deg) rotateY(0deg)
  // 6: back    -> rotateX(180deg) rotateY(0deg)
  // 2: top     -> rotateX(-90deg) rotateY(0deg)
  // 5: bottom  -> rotateX(90deg) rotateY(0deg)
  // 3: right   -> rotateX(0deg) rotateY(-90deg)
  // 4: left    -> rotateX(0deg) rotateY(90deg)
  const getFaceRotation = (val) => {
    switch (val) {
      case 1: return 'rotateX(0deg) rotateY(0deg)';
      case 2: return 'rotateX(-90deg) rotateY(0deg)';
      case 3: return 'rotateX(0deg) rotateY(-90deg)';
      case 4: return 'rotateX(0deg) rotateY(90deg)';
      case 5: return 'rotateX(90deg) rotateY(0deg)';
      case 6: return 'rotateX(180deg) rotateY(0deg)';
      default: return 'rotateX(0deg) rotateY(0deg)'; // Keep last face or default flat facing front
    }
  };

  // If value is set, use value rotation. If no value yet, display face 1 flat front
  const currentRotation = isRolling ? undefined : getFaceRotation(value || 1);

  return (
    <div 
      className={`dice-scene-wrapper ${disabled ? 'disabled' : ''}`}
      onClick={!disabled ? onClick : undefined}
      title={disabled ? '' : 'Click to roll'}
    >
      <div 
        className={`dice-cube ${isRolling ? 'cube-rolling' : ''}`}
        style={currentRotation ? { transform: currentRotation } : {}}
      >
        {/* Face 1: Front (Traditional red center dot) */}
        <div className="cube-face face-front">
          <span className="dot dot-center dot-red" />
        </div>

        {/* Face 6: Back */}
        <div className="cube-face face-back">
          <span className="dot dot-tl" />
          <span className="dot dot-tr" />
          <span className="dot dot-ml" />
          <span className="dot dot-mr" />
          <span className="dot dot-bl" />
          <span className="dot dot-br" />
        </div>

        {/* Face 2: Top */}
        <div className="cube-face face-top">
          <span className="dot dot-tr" />
          <span className="dot dot-bl" />
        </div>

        {/* Face 5: Bottom */}
        <div className="cube-face face-bottom">
          <span className="dot dot-tl" />
          <span className="dot dot-tr" />
          <span className="dot dot-center" />
          <span className="dot dot-bl" />
          <span className="dot dot-br" />
        </div>

        {/* Face 3: Right */}
        <div className="cube-face face-right">
          <span className="dot dot-tr" />
          <span className="dot dot-center" />
          <span className="dot dot-bl" />
        </div>

        {/* Face 4: Left */}
        <div className="cube-face face-left">
          <span className="dot dot-tl" />
          <span className="dot dot-tr" />
          <span className="dot dot-bl" />
          <span className="dot dot-br" />
        </div>
      </div>
    </div>
  );
}
