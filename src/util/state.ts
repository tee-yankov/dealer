import { computed, Signal, signal } from "@preact/signals";
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

export const roomState = signal<{
  room?: RoomDetails;
  members: Record<string, RoomMember>;
  roomId?: string;
}>({
  members: {},
});

export const isRoomHost = computed(
  () => roomState.value.room?.uid === authState.value.user?.uid,
);

export function updateState<T>(s: Signal<T>, updater: (s: T) => Partial<T>): T {
  s.value = {
    ...s.value,
    ...updater(s.value),
  };

  return s.value;
}
