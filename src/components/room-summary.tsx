import "./room-summary.css";
import { Link } from "wouter-preact";
import { roomState, roundState } from "../util/state";
import { DotDotDot } from "./animate-text";
import classnames from "../util/classnames";
import { RoundStatus } from "../util/types";
import { capitalize } from "../util/capitalize";
import { getRoundStats } from "../util/math";
import ElapsedTime from "./elapsed-time";
import { convertFirebaseDate } from "../util/firebase";

function RoomSummary() {
  const { room } = roomState.value;
  const { currentRound, previousRounds } = roundState.value;

  const roundStats =
    currentRound?.status === RoundStatus.Ended
      ? getRoundStats(currentRound)
      : null;
  const roundStartedAt =
    currentRound?.createdAt && convertFirebaseDate(currentRound?.createdAt);

  return (
    <div className="nes-container is-rounded is-dark room-summary-container">
      <Link to="/">Back</Link>
      <h2>Room: {room?.name || <DotDotDot reverse />}</h2>
      <p>
        <span>Round {currentRound ? previousRounds.length + 1 : 1}</span>
        <span
          className={classnames(
            "nes-text",
            !previousRounds[previousRounds.length - 1]?.status &&
              !currentRound?.status &&
              "is-warning",
            currentRound?.status === RoundStatus.Started && "is-success",
            currentRound?.status === RoundStatus.Ended && "is-error",
          )}
        >
          {" "}
          {currentRound?.status ? capitalize(currentRound.status) : "Pending"}
        </span>
      </p>
      {roundStats ? (
        <div>
          <p>
            Avg: {roundStats.avg.toFixed(2)} Median:{" "}
            {roundStats.median.toFixed(2)}
          </p>
        </div>
      ) : (
        <div>
          <p>
            {roundStartedAt ? (
              <ElapsedTime since={roundStartedAt} />
            ) : (
              <span>&nbsp;</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

export default RoomSummary;
