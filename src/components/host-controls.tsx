import "./host-controls.css";
import { roundState } from "../util/state";
import { RoundStatus } from "../util/types";
import { useAsync } from "../hooks/useAsync";
import { endCurrentRound, startNewRound } from "../util/room";

function HostControls() {
  const { currentRound } = roundState.value;

  const { invoke: handleStartNewRound, isFetching: isRoundStarting } =
    useAsync(startNewRound);

  const { invoke: handleEndCurrentRound, isFetching: isRoundEnding } =
    useAsync(endCurrentRound);

  return (
    <div className="nes-container is-rounded is-dark host-controls-container">
      <div className="row">
        {currentRound?.status !== RoundStatus.Started && (
          <button
            className="nes-btn is-primary"
            disabled={isRoundStarting}
            onClick={() => handleStartNewRound()}
          >
            Start Round
          </button>
        )}
        {currentRound?.status === RoundStatus.Started && (
          <button
            className="nes-btn is-error"
            disabled={isRoundEnding}
            onClick={() => handleEndCurrentRound()}
          >
            End Round
          </button>
        )}
      </div>
    </div>
  );
}

export default HostControls;
