import { Link, useParams } from "wouter-preact";
import Hand from "../components/hand";
import StatusLight, { StatusLightStates } from "../components/status-light";
import { useEffect } from "preact/hooks";
import {
  createRoomMember,
  fetchRoom,
  handleRoomMembersChange,
} from "../util/firebase";
import { DotDotDot } from "../components/animate-text";
import { authState, isRoomHost, roomState } from "../util/state";
import { useAsync } from "../hooks/useAsync";
import PlayingField from "../components/playing-field";
import useListenForRoomMembers from "../hooks/useListenForRoomMembers";

function RoomPage() {
  const { roomId } = useParams();
  const { isResolved: isRoomResolved } = useAsync(() => fetchRoom(roomId!), {
    immediate: true,
  });
  const { room } = roomState.value;
  const { invoke: handleRoom } = useAsync(async () => {
    if (!isRoomHost.value) {
      await createRoomMember(roomId!, {
        name: authState.value.displayName,
      });
    }
  });

  useEffect(() => {
    if (isRoomResolved) {
      handleRoom();
    }
  }, [isRoomResolved]);

  useListenForRoomMembers(roomId!, handleRoomMembersChange, isRoomResolved);

  return (
    <div className="page">
      <StatusLight
        state={StatusLightStates.Good}
        glowing
        text={<span className="nes-text is-success text-sm">Connected</span>}
      />
      <Link to="/">Back</Link>
      <h2>Room: {room?.name || <DotDotDot reverse />}</h2>
      <PlayingField />
      <Hand />
    </div>
  );
}

export default RoomPage;
