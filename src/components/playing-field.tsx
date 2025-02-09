import "./playing-field.css";
import { playerMembers, roundState } from "../util/state";
import Card from "./card";
import { RoundStatus } from "../util/types";

function PlayingField() {
  const { currentRound } = roundState.value;

  return (
    <>
      <div className="playing-field-container">
        {Object.entries(playerMembers.value).map(([uid, { profile }]) => {
          const card = currentRound?.cards?.[uid]?.card;
          const name = profile?.displayName || "(placeholder)";
          const character = profile?.character || "mario";

          return (
            <div key={uid} className="playing-field-slot-container">
              {character && (
                <div className="avatar">
                  <i className={`nes-${character}`}></i>
                </div>
              )}
              <p className="nes-text">{name}</p>
              <div className="nes-container is-rounded playing-field-slot">
                <div className="playing-field-slot-content">
                  {card !== undefined && (
                    <Card
                      rank={card}
                      flipped={currentRound?.status === RoundStatus.Started}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default PlayingField;
