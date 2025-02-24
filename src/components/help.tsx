import { useCallback, useState } from "preact/hooks";
import Dialog from "./dialog";
import "./help.css";
import Card from "./card";
import { HAND_CARDS } from "./hand";
import { cardRankToCardValueMap } from "../util/math";

function Help() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleToggleHelp = useCallback(() => {
    setIsHelpOpen((current) => !current);
  }, [setIsHelpOpen]);

  return (
    <div className="help-container">
      <div
        onClick={handleToggleHelp}
        className="help-inner-container nes-container is-rounded nes-pointer"
      >
        <span className="nes-text help-button-text">?</span>
      </div>

      <Dialog
        title="Cards"
        isOpen={isHelpOpen}
        onCancel={handleToggleHelp}
        cancelText="Close"
      >
        <div className="help-card-values-container">
          {HAND_CARDS.map((rank) => (
            <div key={rank} className="help-card-item">
              <span className="help-card-label help-card-label">
                {cardRankToCardValueMap[rank]}
              </span>
              <Card rank={rank} scaled />
            </div>
          ))}
        </div>
      </Dialog>
    </div>
  );
}

export default Help;
