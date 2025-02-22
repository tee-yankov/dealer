import { computed, Signal, signal } from "@preact/signals";
import { User } from "firebase/auth";
import { RoomDetails, RoomMember, Round } from "./types";
import { CardColor } from "../components/card";

export const notificationState = signal({
  needsPermission: false,
});

export const authState = signal<{
  displayName: string;
  user?: User;
  cardColor: CardColor;
  requireUserSetting?: {
    onConfirm: () => void;
    onCancel: () => void;
  };
}>({
  displayName: "(placeholder)",
  cardColor: CardColor.Red,
});

export const roomState = signal<{
  room?: RoomDetails;
  members: Record<string, RoomMember>;
  roomId?: string;
}>({
  members: {},
});

export const roundState = signal<{
  currentRound?: Round;
  previousRounds: Round[];
}>({
  previousRounds: [],
});

export const userOnlineStatus = signal<Record<string, boolean>>({});

// Derived state
export const isRoomHost = computed(
  () => roomState.value.room?.uid === authState.value.user?.uid,
);

export const playerMembers = computed(() =>
  Object.fromEntries(
    Object.entries(roomState.value.members).filter(
      ([uid]) => uid !== roomState?.value.room?.uid,
    ),
  ),
);

export const hasJoinedRoom = computed(() =>
  roomState.value.members.hasOwnProperty(authState.value.user?.uid ?? ""),
);

export const isConnected = computed(
  () => userOnlineStatus.value[authState.value.user!.uid],
);

export function updateState<T>(s: Signal<T>, updater: (s: T) => Partial<T>): T {
  s.value = {
    ...s.value,
    ...updater(s.value),
  };

  return s.value;
}
