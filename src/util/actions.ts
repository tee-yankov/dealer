import { updateState, webRtcState } from "./state";
import { WebRTCMode } from "./webrtc";

export const setLocalWebRTCMode = (mode: WebRTCMode) =>
  updateState(webRtcState, () => ({
    mode,
  }));
