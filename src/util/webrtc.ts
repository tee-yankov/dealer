import debounce from "./debounce";
import { fetchRoomMember, publishOwnAnswer, updateMember } from "./firebase";
import { iceServers } from "./ice";
import { authState, updateState, webRtcState } from "./state";

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

    sendChannel.onopen = () => {
      console.log("send channel open");
    };

    sendChannel.onclose = () => {
      console.log("send channel closed");
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    console.log("set global webrtc state");
    updateState(webRtcState, () => ({
      localDescription: peerConnection.localDescription,
    }));
    // await new Promise((resolve) => {
    //   peerConnection.onnegotiationneeded = async () => {
    //     console.log("negotiation needed");
    //     if (roomId) {
    //     }

    //     resolve(null);
    //   };
    // });
  } else {
    await setRemoteDescriptionAndAnswer(roomId!, uid!);

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
}

export async function setRemoteDescription(sdp: RTCSessionDescription) {
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
