import { webRtcState } from "./state";

export const selectPeerConnection = (uid: string): RTCPeerConnection => {
  const peer = webRtcState.value.peers[uid];
  if (!peer) {
    throw new Error(
      `no such peer connection to ${uid}, it must be initialized first`,
    );
  }

  return peer;
};
