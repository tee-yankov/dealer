import { QuerySnapshot } from "firebase/firestore";
import { createRound, updateRound } from "./firebase";
import { authState, roomState, roundState, updateState } from "./state";
import { RoomMember, Round, RoundStatus } from "./types";
import { CardRank } from "../components/card";

export async function startNewRound() {
  const round: Round = {
    status: RoundStatus.Started,
    cards: {},
    createdAt: new Date(),
  };

  const { roomId } = roomState.value;
  if (!roomId) {
    throw new Error("missing roomId");
  }

  await createRound(roomId, round);
}

export async function endCurrentRound() {
  const { currentRound } = roundState.value;
  const { roomId } = roomState.value;
  if (!currentRound || !roomId) {
    throw new Error("can't end round that doesn't exist");
  }

  await updateRound(roomId, currentRound.id!, {
    status: RoundStatus.Ended,
  });
}

export async function selectCardForCurrentRound(card: CardRank) {
  const { currentRound } = roundState.value;
  const { roomId } = roomState.value;
  const { user } = authState.value;
  if (!currentRound || !roomId || !user?.uid) {
    throw new Error("error selecting card for current round");
  }

  await updateRound(roomId, currentRound.id!, {
    [`cards.${user.uid}`]: {
      card,
    },
  });
}

export async function handleRoomMembersChange(snapshot: QuerySnapshot) {
  // for (const change of snapshot.docChanges()) {
  //   console.log(change.type, change.doc.id, change.doc.data());
  // }

  updateState(roomState, () => ({
    members: Object.fromEntries(
      snapshot.docs.map((v) => [v.id, v.data() as RoomMember]),
    ),
  }));
}

export async function handleRoomRoundsChange(snapshot: QuerySnapshot) {
  // for (const change of snapshot.docChanges()) {
  //   console.log(`round ${change.type}`, change.doc.id, change.doc.data());
  // }

  const rounds = snapshot.docs.map<Round>((v) => ({
    ...(v.data() as Round),
    id: v.id,
  }));
  const currentRound = rounds.length ? rounds.pop() : undefined;
  updateState(roundState, () => ({
    currentRound,
    previousRounds: rounds,
  }));
}
