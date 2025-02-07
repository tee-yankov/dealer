import Card, { CardRank } from "./card";
import "./playing-field.css";

function PlayingField() {
  const slots = 6;

  return (
    <div className="playing-field-container">
      {new Array(slots).fill(0).map((_, i) => (
        <div key={i} className="nes-container is-rounded playing-field-slot">
          <div className="playing-field-slot-content">
            <Card
              rank={
                CardRank[
                  Object.values(CardRank)[i] as CardRank
                ] as unknown as CardRank
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default PlayingField;
