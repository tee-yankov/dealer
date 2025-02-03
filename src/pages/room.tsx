import { Link, useParams } from "wouter-preact";
import Hand from "../components/hand";
import StatusLight, { StatusLightStates } from "../components/status-light";
import { useEffect } from "preact/hooks";
import { fetchRoom } from "../util/firebase";
import { DotDotDot } from "../components/animate-text";
import { authState, roomState, updateState } from "../util/state";
import {
  initializeWebRTC,
  setRemoteDescription,
  WebRTCMode,
} from "../util/webrtc";
import { useAsync } from "../hooks/useAsync";
import useListenForRoomMembers from "../hooks/useListenForRoomMembers";
import { RoomMember } from "../util/types";

function RoomPage() {
  const { roomId } = useParams();
  const { isResolved: isRoomResolved } = useAsync(() => fetchRoom(roomId!), {
    immediate: true,
  });
  const { room } = roomState.value;
  const uid = authState.value.user?.uid;
  const amITheHost = uid === room?.uid;
  const { invoke: handleRoom } = useAsync(async () => {
    if (!isRoomResolved) {
      return;
    }

    if (!amITheHost) {
      await initializeWebRTC(WebRTCMode.Client, { uid: room!.uid, roomId });
      await setRemoteDescription(roomId!, room!.uid);
    } else {
      await initializeWebRTC(WebRTCMode.Server, { roomId });
    }
  });

  useEffect(() => {
    if (isRoomResolved) {
      handleRoom();
    }
  }, [isRoomResolved]);

  useListenForRoomMembers(roomId!, (snapshot) => {
    updateState(roomState, () => ({
      members: snapshot.docs.map((v) => v.data() as RoomMember),
    }));
  });

  console.log(roomState.value.members);

  return (
    <div className="page">
      <StatusLight
        state={StatusLightStates.Good}
        glowing
        text={<span className="nes-text is-success text-sm">Connected</span>}
      />
      <Link to="/">Back</Link>
      <h2>Room: {room?.name || <DotDotDot reverse />}</h2>
      <Hand />
    </div>
  );
}

export default RoomPage;
