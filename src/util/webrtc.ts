import { iceServers } from "./ice";

let peerConnection: RTCPeerConnection;

export async function initializeWebRTC() {
  if (peerConnection) {
    return peerConnection;
  }

  const config = {
    iceServers,
  };

  console.log("WebRTC Peer Connection config:", config);

  peerConnection = new RTCPeerConnection(config);

  return peerConnection
}
