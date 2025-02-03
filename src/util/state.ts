import { Signal, signal } from "@preact/signals";
import { User } from "firebase/auth";
import { RoomDetails, RoomMember } from "./types";

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
}>({ peers: {} });

export const roomState = signal<{
  room?: RoomDetails;
  members: RoomMember[];
}>({
  members: [],
});

export function updateState<T>(s: Signal<T>, updater: (s: T) => Partial<T>): T {
  s.value = {
    ...s.value,
    ...updater(s.value),
  }

  return s.value;
}
