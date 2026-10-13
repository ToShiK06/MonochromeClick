import React from 'react';
import './PetBubble.css';

function PetBubble({ text }) {
  if (!text) return null;
  return (
    <div className="pet-bubble" key={text}>
      <div className="pet-bubble-text">{text}</div>
      <div className="pet-bubble-tail"></div>
    </div>
  );
}

export default PetBubble;