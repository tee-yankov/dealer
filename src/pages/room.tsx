import { Link, useParams } from "wouter-preact";
import Hand from "../components/hand";
import StatusLight, { StatusLightStates } from "../components/status-light";
import { useEffect } from "preact/hooks";
import { fetchRoom } from "../util/firebase";
import { DotDotDot } from "../components/animate-text";
import { authState, roomState, updateState } from "../util/state";
import {
  addIceCandidates,
  initializeWebRTC,
  setRemoteDescription,
  setRemoteDescriptionAndAnswer,
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
  const uid = authState.value.user?.uid;
  const { room } = roomState.value;
  const amITheHost = uid === room?.uid;
  const { invoke: handleRoom, isFetching: isWebRtcInitialized } = useAsync(
    async () => {
      if (!isRoomResolved) {
        return;
      }

      if (!amITheHost) {
        await initializeWebRTC(WebRTCMode.Client, { uid: room!.uid, roomId: roomId! });
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

  useListenForRoomMembers(roomId!, (snapshot) => {
    const { room } = roomState.value;
    const members = snapshot.docs.reduce<Record<string, RoomMember>>(
      (acc, v) => {
        acc[v.id] = v.data() as RoomMember;
        return acc;
      },
      {},
    );
    updateState(roomState, () => ({
      members,
    }));

    for (const member of Object.entries(members)
      .filter(([uid]) => uid !== authState.value.user?.uid)
      .map(([, m]) => m)) {
      console.log("Foreign member", member);
      if (isWebRtcInitialized) {
        setRemoteDescription(member.sdp);
      }
    }
    console.log({ room, members });
    if (room) {
      const iceCandidates = Object.entries(members).flatMap(
        ([id, candidate]) =>
          authState.value.user?.uid === id ? [] : candidate.iceCandidates ?? [],
      );
      addIceCandidates(iceCandidates);
    }
  });

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
