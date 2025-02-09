import "./room.css";
import { Link, useParams } from "wouter-preact";
import Hand from "../components/hand";
import StatusLight, { StatusLightStates } from "../components/status-light";
import { useEffect } from "preact/hooks";
import { createRoomMember, fetchRoom } from "../util/firebase";
import { DotDotDot } from "../components/animate-text";
import { authState, isRoomHost, roomState, roundState } from "../util/state";
import { useAsync } from "../hooks/useAsync";
import PlayingField from "../components/playing-field";
import {
  useListenForRoomMembers,
  useListenForRounds,
} from "../hooks/firebaseListeners";
import MembersList from "../components/members-list";
import HostControls from "../components/host-controls";
import { handleRoomMembersChange, handleRoomRoundsChange } from "../util/room";
import { capitalize } from "../util/capitalize";
import classnames from "../util/classnames";
import { RoundStatus } from "../util/types";
import UserSettings from "../components/user-settings";

function RoomPage() {
  const { roomId } = useParams();
  const { currentRound, previousRounds } = roundState.value;
  const { isResolved: isRoomResolved } = useAsync(() => fetchRoom(roomId!), {
    immediate: true,
  });
  const { room } = roomState.value;
  const { invoke: handleRoom } = useAsync(async () => {
    if (!isRoomHost.value) {
      const { user } = authState.value;
      await createRoomMember(roomId!, {
        profile: {
          displayName: user?.displayName ?? "",
          character: user?.photoURL ?? "",
        },
      });
    }
  });

  useEffect(() => {
    if (isRoomResolved) {
      handleRoom();
    }
  }, [isRoomResolved]);

  useListenForRoomMembers(roomId!, handleRoomMembersChange, isRoomResolved);

  useListenForRounds(roomId!, handleRoomRoundsChange, isRoomResolved);

  const currentOrLastRound =
    currentRound ?? previousRounds[previousRounds.length - 1];

  return (
    <>
      <div className="status-light-container">
        <StatusLight
          state={StatusLightStates.Good}
          glowing
          text={<span className="nes-text is-success text-sm">Connected</span>}
        />
      </div>
      <div className="page">
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
              currentOrLastRound?.status === RoundStatus.Started &&
                "is-success",
              currentOrLastRound?.status === RoundStatus.Ended && "is-error",
            )}
          >
            {" "}
            {currentOrLastRound?.status
              ? capitalize(currentOrLastRound.status)
              : "Pending"}
          </span>
        </p>
        <PlayingField />
        {isRoomHost.value ? <HostControls /> : <Hand />}
      </div>
      <div className="room-top-right-container">
        <UserSettings />
        <MembersList />
      </div>
    </>
  );
}

export default RoomPage;
