import "./host-controls.css";
import { roomState, roundState } from "../util/state";
import { RoundStatus } from "../util/types";
import { useAsync } from "../hooks/useAsync";
import { endCurrentRound, startNewRound } from "../util/room";
import classnames from "../util/classnames";

function HostControls() {
  const { currentRound } = roundState.value;
  const currentMembers = Object.keys(currentRound?.cards ?? {}).length;
  const maxMembers = Object.keys(roomState.value.members ?? {}).length - 1;

  const { invoke: handleStartNewRound, isFetching: isRoundStarting } =
    useAsync(startNewRound);

  const { invoke: handleEndCurrentRound, isFetching: isRoundEnding } =
    useAsync(endCurrentRound);

  return (
    <div className="nes-container is-rounded is-dark host-controls-container">
      <div className="row">
        <button
          className={classnames(
            "nes-btn is-primary",
            (currentRound?.status === RoundStatus.Started || isRoundStarting) &&
              "is-disabled",
          )}
          disabled={
            currentRound?.status === RoundStatus.Started || isRoundStarting
          }
          onClick={() => handleStartNewRound()}
        >
          Start Round
        </button>
        <button
          className={classnames(
            "nes-btn is-error",
            (currentRound?.status !== RoundStatus.Started || isRoundEnding) &&
              "is-disabled",
          )}
          disabled={
            currentRound?.status !== RoundStatus.Started || isRoundEnding
          }
          onClick={() => handleEndCurrentRound()}
        >
          End Round
        </button>
      </div>
      {/* Progress */}
      <div className="row">
        {currentRound?.status === RoundStatus.Started && (
          <progress
            class="nes-progress is-success"
            value={currentMembers}
            max={maxMembers}
          ></progress>
        )}
      </div>
    </div>
  );
}

export default HostControls;
