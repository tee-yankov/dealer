import { Link, useParams } from "wouter-preact";
import Hand from "../components/hand";
import StatusLight, { StatusLightStates } from "../components/status-light";
import { useEffect } from "preact/hooks";
import { fetchRoom } from "../util/firebase";
import { DotDotDot } from "../components/animate-text";
import { authState, roomState } from "../util/state";
import { handleRoomMember, initializeWebRTC, WebRTCMode } from "../util/webrtc";
import { useAsync } from "../hooks/useAsync";
import useListenForRoomMembers from "../hooks/useListenForRoomMembers";
import PlayingField from "../components/playing-field";

function RoomPage() {
  const { roomId } = useParams();
  const { isResolved: isRoomResolved } = useAsync(() => fetchRoom(roomId!), {
    immediate: true,
  });
  const uid = authState.value.user?.uid;
  const { room } = roomState.value;
  const amITheHost = uid === room?.uid;
  const { invoke: handleRoom, isResolved: isWebRtcInitialized } = useAsync(
    async () => {
      if (!isRoomResolved) {
        return;
      }

      if (!amITheHost) {
        await initializeWebRTC(WebRTCMode.Client, {
          uid: room!.uid,
          roomId: roomId!,
        });
      } else {
        await initializeWebRTC(WebRTCMode.Server, { roomId: roomId! });
      }
    },
  );

  useEffect(() => {
    if (isRoomResolved) {
      handleRoom();
    }
  }, [isRoomResolved]);

  useListenForRoomMembers(roomId!, handleRoomMember, isWebRtcInitialized);

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
