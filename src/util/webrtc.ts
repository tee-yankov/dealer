import { QuerySnapshot } from "firebase/firestore";
import debounce from "./debounce";
import {
  createRoomMember,
  fetchRoomMember,
  publishOwnAnswer,
  updateMember,
} from "./firebase";
import { iceServers } from "./ice";
import {
  authState,
  roomState,
  signallingState,
  updateState,
  webRtcState,
} from "./state";
import { RoomMember } from "./types";
import { selectPeerConnection } from "./selectors";

export enum WebRTCMode {
  Server = "server",
  Client = "client",
}

export async function initializeWebRTC(
  mode: WebRTCMode,
  { roomId, uid }: { roomId: string; uid?: string },
) {
  console.log(`Starting WebRTC in ${mode} mode`);
  const peerConnection = new RTCPeerConnection({ iceServers });

  if (mode === WebRTCMode.Server) {
    const sendChannel = peerConnection.createDataChannel("sendChannel");

    sendChannel.onopen = () => {
      console.log("send channel open");
    };
    sendChannel.onclose = () => {
      console.log("send channel closed");
    };

    peerConnection.onnegotiationneeded = async () => {
      console.log("negotiation needed");
      await peerConnection.setLocalDescription(
        await peerConnection.createOffer(),
      );
      await publishOwnAnswer(
        roomId,
        peerConnection.localDescription!.toJSON(),
        uid!,
      );
    };
  } else {
    await createRoomMember(roomId, {
      name: authState.value.displayName,
      answers: {},
    });

    peerConnection.ondatachannel = () => {
      console.log("data channel received");
    };
  }

  const iceCandidates: RTCIceCandidate[] = [];
  const flushIceCandidates = debounce(async () => {
    if (roomId && iceCandidates.length) {
      console.log("flushing ice candidates");
      console.log(iceCandidates);
      await updateMember(roomId, authState.value.user?.uid!, {
        iceCandidates: iceCandidates.map((v) => v.toJSON()),
      });
    }
  }, 1000);

  peerConnection.onicecandidate = (e) => {
    console.log("ice candidate");
    if (e.candidate?.candidate) {
      iceCandidates.push(e.candidate);
      flushIceCandidates();
    }
  };

  updateState(webRtcState, (state) => ({
    mode,
    localDescription: peerConnection.localDescription,
    peers: uid
      ? {
          ...state.peers,
          [uid]: peerConnection,
        }
      : state.peers,
  }));

  return peerConnection;
}

export async function setRemoteDescriptionAndAnswer(
  roomId: string,
  hostUid: string,
  remotePeerUid: string,
) {
  const peerConnection = selectPeerConnection(remotePeerUid);

  const hostMember = (await fetchRoomMember(roomId, hostUid))!;

  const sdp = hostMember.answers[authState.value.user!.uid];
  await peerConnection.setRemoteDescription(sdp);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  await publishOwnAnswer(roomId, answer, hostUid);

  return answer;
}

export async function setRemoteDescription(
  sdp: RTCSessionDescriptionInit,
  remotePeerUid: string,
) {
  const peerConnection = selectPeerConnection(remotePeerUid);
  await peerConnection.setRemoteDescription(sdp);
}

export async function addIceCandidates(
  candidates: RTCIceCandidate[],
  remotePeerUid: string,
) {
  const peerConnection = selectPeerConnection(remotePeerUid);
  for (const candidate of candidates) {
    const existingCandidate = !webRtcState.value.iceCandidates.find(
      (c) => candidate.candidate === c.candidate,
    );
    if (!existingCandidate && candidate.candidate) {
      console.log("adding local ICE candidate", candidate);
      await peerConnection.addIceCandidate(candidate);
    }
  }
  updateState(webRtcState, (state) => ({
    iceCandidates: [...state.iceCandidates, ...candidates],
  }));
}

export async function handleRoomMember(snapshot: QuerySnapshot) {
  const { room, members: currentMembers, roomId } = roomState.value;
  const { mode } = webRtcState.value;
  const allMembers = snapshot.docs.reduce<Record<string, RoomMember>>(
    (acc, v) => {
      acc[v.id] = v.data() as RoomMember;
      return acc;
    },
    {},
  );
  console.log("all members", allMembers);
  const ownUid = authState.value.user!.uid;
  const hostUid = room!.uid;
  const messages = currentMembers[hostUid]?.answers[ownUid] ?? [];
  // check which messages are new
  const newMessages = messages.filter(
    (message) =>
      !signallingState.value.seenMessages[hostUid].has(JSON.stringify(message)),
  );

  for (const message of newMessages) {
    console.log("received message", message);
  }

  const newRoomMembers = Object.fromEntries(
    Object.entries(allMembers).filter(
      ([uid]) => uid !== ownUid && !currentMembers[uid],
    ),
  );
  console.log("room members change");
  console.dir({
    members: allMembers,
    newRoomMembers,
    me: authState.value.user?.uid,
  });

  updateState(roomState, (state) => ({
    members: {
      ...state.members,
      ...newRoomMembers,
    },
  }));

  if (mode === WebRTCMode.Server) {
    for (const [uid, member] of Object.entries(newRoomMembers)) {
      const peerConnection = await initializeWebRTC(WebRTCMode.Server, {
        uid,
        roomId: roomId!,
      });
    }
  }
  // const peerConnection = selectPeerConnection(uid);
  // const iceCandidates = member.iceCandidates ?? [];
  // await addIceCandidates(iceCandidates, uid);
  // if (webRtcState.value.mode === WebRTCMode.Server) {
  //   const offer = await peerConnection.createOffer();
  //   await setLocalDescription(offer, uid);
  //   await publishLocalOffer(offer, uid);
  // }
}

async function setLocalDescription(
  description: RTCSessionDescriptionInit,
  remotePeerUid: string,
) {
  const peerConnection = selectPeerConnection(remotePeerUid);
  await peerConnection.setLocalDescription(description);
}

async function publishLocalOffer(
  description: RTCSessionDescriptionInit,
  memberUid: string,
) {
  await publishOwnAnswer(roomState.value.roomId!, description, memberUid);
}
