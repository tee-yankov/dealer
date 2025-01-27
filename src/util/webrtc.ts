import fetchSTUNServerIPs from "./fetchSTUNServerIPs";

let peerConnection: RTCPeerConnection;

export async function initializeWebRTC() {
  if (peerConnection) {
    return peerConnection;
  }

  const stunServers = await fetchSTUNServerIPs();
  const config = {
    iceServers: [{ urls: `stun:${stunServers[0]}` }],
  };

  console.log("WebRTC Peer Connection config:", config);

  peerConnection = new RTCPeerConnection(config);

  return peerConnection
}
