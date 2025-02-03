import debounce from "./debounce";
import {
  fetchRoomMember,
  publishOwnAnswer,
  updateMember,
} from "./firebase";
import { iceServers } from "./ice";
import { authState, webRtcState } from "./state";

let peerConnection: RTCPeerConnection;
let sendChannel: RTCDataChannel;

export enum WebRTCMode {
  Server = "server",
  Client = "client",
}

export async function initializeWebRTC(
  mode: WebRTCMode,
  { roomId, uid }: { roomId?: string; uid?: string } = {},
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

    peerConnection.onnegotiationneeded = async () => {
      console.log("negotiation needed");
      await peerConnection.setLocalDescription();
      if (roomId) {
        await updateMember(roomId, authState.value.user?.uid!, {
          sdp: peerConnection.localDescription!.toJSON(),
        });
      }
    };
  } else {
    peerConnection.ondatachannel = () => {
      console.log("data channel received");
    };
  }

  const iceCandidates: RTCIceCandidate[] = [];
  const flushIceCandidates = debounce(async () => {
    if (roomId) {
      console.log('flushing ice candidates');
      console.log(iceCandidates);
      await updateMember(roomId, authState.value.user?.uid!, {
        iceCandidates: iceCandidates.map((v) => v.toJSON()),
      });
    }
  }, 1000);

  peerConnection.onicecandidate = (e) => {
    console.log("ice candidate");
    // TODO: Transmit to remote peer
    if (e.candidate) {
      iceCandidates.push(e.candidate);
      flushIceCandidates();
    }
  };

  webRtcState.value = {
    ...webRtcState.value,
    localDescription: peerConnection.localDescription,
    peers: uid
      ? {
          ...webRtcState.value.peers,
          [uid]: peerConnection,
        }
      : webRtcState.value.peers,
  };

  return peerConnection;
}

export async function setRemoteDescription(roomId: string, hostUid: string) {
  const hostMember = (await fetchRoomMember(roomId, hostUid))!;
  console.log("Set remote description", hostMember.sdp);

  await peerConnection.setRemoteDescription(hostMember.sdp);

  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  await publishOwnAnswer(roomId, answer);
}
