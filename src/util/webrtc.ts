import { QuerySnapshot } from "firebase/firestore";
import debounce from "./debounce";
import { fetchRoomMember, publishOwnAnswer, updateMember } from "./firebase";
import { iceServers } from "./ice";
import { authState, roomState, updateState, webRtcState } from "./state";
import { RoomMember } from "./types";

let peerConnection: RTCPeerConnection;
let sendChannel: RTCDataChannel;

export enum WebRTCMode {
  Server = "server",
  Client = "client",
}

export async function initializeWebRTC(
  mode: WebRTCMode,
  { roomId, uid }: { roomId: string; uid?: string },
) {
  if (peerConnection) {
    return peerConnection;
  }

  console.log(`Starting WebRTC in ${mode} mode`);
  peerConnection = new RTCPeerConnection({ iceServers });

  if (mode === WebRTCMode.Server) {
    sendChannel = peerConnection.createDataChannel("sendChannel");

    sendChannel.addEventListener("open", () => {
      console.log("send channel open");
    });

    sendChannel.addEventListener("close", () => {
      console.log("send channel closed");
    });
  } else {
    peerConnection.addEventListener("datachannel", () => {
      console.log("data channel received");
    });
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

  peerConnection.addEventListener("icecandidate", (e) => {
    console.log("ice candidate");
    if (e.candidate?.candidate) {
      iceCandidates.push(e.candidate);
      flushIceCandidates();
    }
  });

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
) {
  const hostMember = (await fetchRoomMember(roomId, hostUid))!;
  console.log("Set remote description", hostMember.sdp);

  await peerConnection.setRemoteDescription(hostMember.sdp);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  await publishOwnAnswer(roomId, answer);

  return answer;
}

export async function setRemoteDescription(sdp: RTCSessionDescriptionInit) {
  await peerConnection.setRemoteDescription(sdp);
}

export async function addIceCandidates(candidates: RTCIceCandidate[]) {
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
  const { room, members: currentMembers } = roomState.value;
  const members = snapshot.docs.reduce<Record<string, RoomMember>>((acc, v) => {
    acc[v.id] = v.data() as RoomMember;
    return acc;
  }, {});
  const newRoomMembers = Object.fromEntries(
    Object.entries(members).filter(
      ([uid]) => uid !== authState.value.user?.uid && !currentMembers[uid],
    ),
  );
  console.log("room members change", newRoomMembers);

  for (const member of Object.values(newRoomMembers)) {
    if (webRtcState.value.mode === WebRTCMode.Server) {
      const offer = await peerConnection.createOffer();
      await setLocalDescription(offer);
      await publishLocalOffer(offer);
      console.log("Setting remote description", member.sdp);
      if (member.sdp) {
        await setRemoteDescription(member.sdp);
      } else {
        throw new Error("Remote member has no SDP");
      }
    }
    if (member.sdp) {
      await setRemoteDescription(member.sdp);
    } else {
      throw new Error("Remote member has no SDP");
    }
  }

  if (room) {
    const iceCandidates = Object.entries(newRoomMembers).flatMap(
      ([id, candidate]) =>
        authState.value.user?.uid === id ? [] : (candidate.iceCandidates ?? []),
    );
    addIceCandidates(iceCandidates);
  }

  updateState(roomState, (state) => ({
    members: {
      ...state.members,
      ...newRoomMembers,
    },
  }));
}

async function setLocalDescription(description: RTCSessionDescriptionInit) {
  await peerConnection.setLocalDescription(description);
}

async function publishLocalOffer(description: RTCSessionDescriptionInit) {
  await publishOwnAnswer(roomState.value.roomId!, description);
}
