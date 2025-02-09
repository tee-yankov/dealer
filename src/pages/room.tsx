import { Link, useParams } from "wouter-preact";
import Hand from "../components/hand";
import StatusLight, { StatusLightStates } from "../components/status-light";
import { useEffect } from "preact/hooks";
import { createRoomMember, fetchRoom } from "../util/firebase";
import { DotDotDot } from "../components/animate-text";
import { authState, roomState } from "../util/state";
import {
  handleRoomMember,
  handleRoomMemberChanges,
  initializeWebRTC,
  WebRTCMode,
} from "../util/webrtc";
import { useAsync } from "../hooks/useAsync";
import useListenForRoomMembers from "../hooks/useListenForRoomMembers";
import PlayingField from "../components/playing-field";
import { setLocalWebRTCMode } from "../util/actions";

function RoomPage() {
  const { roomId } = useParams();
  const { isResolved: isRoomResolved } = useAsync(() => fetchRoom(roomId!), {
    immediate: true,
  });
  const uid = authState.value.user?.uid;
  const { room } = roomState.value;
  const { invoke: handleRoom, isResolved: isWebRtcInitialized } = useAsync(
    async () => {
      const amITheHost = uid === room?.uid;

      if (!amITheHost) {
        await createRoomMember(roomId!, {
          name: authState.value.displayName,
          answers: {},
        });
      }

      setLocalWebRTCMode(amITheHost ? WebRTCMode.Server : WebRTCMode.Client);
    },
  );

  useEffect(() => {
    if (isRoomResolved) {
      handleRoom();
    }
  }, [isRoomResolved]);

  useListenForRoomMembers(
    roomId!,
    handleRoomMemberChanges,
    isWebRtcInitialized,
  );

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
