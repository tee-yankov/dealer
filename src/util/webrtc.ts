import { QuerySnapshot } from "firebase/firestore";
import debounce from "./debounce";
import { publishOwnAnswer, updateMember } from "./firebase";
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
  if (webRtcState.value.peers[uid!]) {
    return webRtcState.value.peers[uid!];
  }
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
      if (uid) {
        await publishOwnAnswer(
          roomId,
          peerConnection.localDescription!.toJSON(),
          uid,
        );
      }
    };
  } else {
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
  sdp: RTCSessionDescriptionInit,
) {
  const peerConnection = selectPeerConnection(hostUid);

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
  if (!roomId) {
    throw new Error("no roomId in room member handler");
  }
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
  const message = allMembers[hostUid]?.answers[ownUid] ?? {};
  const isNewMessage =
    mode !== WebRTCMode.Server &&
    !signallingState.value.seenMessages[hostUid]?.has(JSON.stringify(message));

  updateState(signallingState, (state) => ({
    seenMessages: {
      ...state.seenMessages,
      [hostUid]: state.seenMessages[hostUid]
        ? new Set([...state.seenMessages[hostUid], JSON.stringify(message)])
        : new Set([JSON.stringify(message)]),
    },
  }));

  console.log("room members change");
  console.dir({
    members: allMembers,
    me: authState.value.user?.uid,
  });

  if (mode === WebRTCMode.Server) {
    // initialize peer for each new room member
    for (const [uid, member] of Object.entries(allMembers)) {
      if (uid === hostUid) {
        continue;
      }
      const isNewMember = !currentMembers[uid];
      if (isNewMember) {
        await initializeWebRTC(WebRTCMode.Server, {
          uid,
          roomId,
        });
      } else {
        const peer = selectPeerConnection(uid);
        const answer = member.answers[hostUid];
        if (
          answer &&
          answer.sdp &&
          answer.type === "answer" &&
          !peer.remoteDescription
        ) {
          console.log("setting client answer");
          await peer.setRemoteDescription(answer);
        }
      }
    }
  } else {
    if (isNewMessage) {
      console.log("received message", message);
      if (message.type === "offer" && message.sdp) {
        await initializeWebRTC(WebRTCMode.Client, { roomId, uid: hostUid });
        await setRemoteDescriptionAndAnswer(roomId, hostUid, message);
      }
    }
  }

  updateState(roomState, () => ({
    members: allMembers,
  }));

  // const peerConnection = selectPeerConnection(uid);
  // const iceCandidates = member.iceCandidates ?? [];
  // await addIceCandidates(iceCandidates, uid);
  // if (webRtcState.value.mode === WebRTCMode.Server) {
  //   const offer = await peerConnection.createOffer();
  //   await setLocalDescription(offer, uid);
  //   await publishLocalOffer(offer, uid);
  // }
}
