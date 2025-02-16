import "./playing-field.css";
import { playerMembers, roundState } from "../util/state";
import Card, { CardColor } from "./card";
import { RoundStatus } from "../util/types";
import ScaledText from "./scaled-text";
import classnames from "../util/classnames";

function PlayingField() {
  const { currentRound } = roundState.value;

  return (
    <>
      <div className="playing-field-container">
        {Object.entries(playerMembers.value).map(([uid, { profile }]) => {
          const card = currentRound?.cards?.[uid]?.card;
          const name = profile?.displayName || "...";
          const character = profile?.character || "mario";
          const suit = profile?.cardColor ?? CardColor.Red;

          return (
            <div key={uid} className="playing-field-slot-container">
              {character && (
                <div className="avatar-wrapper">
                  <div
                    className={classnames(
                      "avatar",
                      character.startsWith("data") && "avatar-img",
                    )}
                  >
                    {character.startsWith("data") ? (
                      <img src={character} />
                    ) : (
                      <i className={`nes-${character}`}></i>
                    )}
                  </div>
                </div>
              )}
              <ScaledText height="2rem" text={name} />
              <div className="nes-container is-rounded playing-field-slot">
                <div className="playing-field-slot-content">
                  {card !== undefined && (
                    <Card
                      rank={card}
                      flipped={currentRound?.status === RoundStatus.Started}
                      color={suit}
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
