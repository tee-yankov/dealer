import { useState } from "preact/hooks";
import Card from "./card";
import "./playing-field.css";

function PlayingField() {
  const slots = 6;
  const [flipped, setFlipped] = useState(true);
  const cardRanks = new Array(slots)
    .fill(0)
    .map(() => ({ rank: Math.round(Math.random() * 13) }));

  return (
    <>
      <button
        className="nes-btn playing-field-flip-btn"
        onClick={() => setFlipped(!flipped)}
      >
        Flip
      </button>
      <div className="playing-field-container">
        {cardRanks.map(({ rank }, i) => (
          <div key={i} className="nes-container is-rounded playing-field-slot">
            <div className="playing-field-slot-content">
              <Card flipped={flipped} rank={rank} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default PlayingField;
