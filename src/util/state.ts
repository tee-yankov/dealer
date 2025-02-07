import { Signal, signal } from "@preact/signals";
import { User } from "firebase/auth";
import { RoomDetails, RoomMember } from "./types";
import { WebRTCMode } from "./webrtc";

export const notificationState = signal({
  needsPermission: false,
});

export const authState = signal<{
  displayName: string;
  user?: User;
}>({
  displayName: "(placeholder)",
});

export const webRtcState = signal<{
  localDescription?: RTCSessionDescription | null;
  peers: Record<string, RTCPeerConnection>;
  iceCandidates: RTCIceCandidate[];
  mode?: WebRTCMode;
}>({ peers: {}, iceCandidates: [] });

export const roomState = signal<{
  room?: RoomDetails;
  members: Record<string, RoomMember>;
  roomId?: string;
}>({
  members: {},
});

export function updateState<T>(s: Signal<T>, updater: (s: T) => Partial<T>): T {
  s.value = {
    ...s.value,
    ...updater(s.value),
  };

  return s.value;
}
