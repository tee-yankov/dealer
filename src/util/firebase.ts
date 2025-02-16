import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  doc,
  query,
  where,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { getAuth, signInAnonymously, updateProfile } from "firebase/auth";
import { authState, roomState, updateState } from "./state";
import { MemberProfile, RoomDetails, RoomMember, Round } from "./types";
import { CardColor } from "../components/card";

export enum Collections {
  Members = "members",
  Rooms = "rooms",
  Rounds = "rounds",
}

const firebaseConfig = {
  apiKey: "AIzaSyAbx-DqBkDScQL2K2k0eloP5SFe8txaGtM",
  authDomain: "dealer-b7cfb.firebaseapp.com",
  projectId: "dealer-b7cfb",
  storageBucket: "dealer-b7cfb.firebasestorage.app",
  messagingSenderId: "90219296431",
  appId: "1:90219296431:web:5ce5ccf602bf005a68465a",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let initialized = false;
let initializing: Promise<void>;
export async function initializeFirebase() {
  if (initialized) {
    return;
  }
  if (initializing) {
    return initializing;
  }
  let resolveCb;
  initializing = new Promise((resolve) => {
    resolveCb = resolve;
  });

  await signIn();

  initialized = true;
  resolveCb!();
}

export async function requestNotificationPermission() {
  console.log("Requesting permission...");
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    console.log("Notification permission granted.");
  }
}

export async function createRoom(roomDetails: RoomDetails) {
  const roomDocRef = await addDoc(
    collection(db, Collections.Rooms),
    roomDetails,
  );

  // create host member record and provide offer
  const { user, cardColor } = authState.value;
  await createRoomMember(roomDocRef.id, {
    profile: {
      displayName: user?.displayName ?? "",
      character: user?.photoURL ?? "",
      cardColor: cardColor,
    },
  });

  return roomDocRef.id;
}

export async function fetchRoom(roomId: string) {
  const roomDocRef = await getDoc(doc(db, `/${Collections.Rooms}/${roomId}`));

  const data = roomDocRef.data() as RoomDetails;

  roomState.value = { ...roomState.value, room: data, roomId };

  return data;
}

export async function getHostSdp(hostUid: string) {
  const memberDocRef = await getDocs(
    query(collection(db, Collections.Members), where("uid", "==", hostUid)),
  );

  const results: RoomMember[] = [];
  memberDocRef.forEach((result) => {
    results.push(result.data() as RoomMember);
  });

  return results[0]!;
}

export async function signIn() {
  const { user } = await signInAnonymously(auth);

  authState.value = {
    ...authState.value,
    user: {
      ...user,
      photoURL: user.photoURL?.split(",")[0] ?? null,
    },
    cardColor: Number(
      user.photoURL?.split(",")[1] ?? CardColor.Red,
    ) as CardColor,
  };
}

export async function createRoomMember(roomId: string, roomMember: RoomMember) {
  await setDoc(
    doc(
      db,
      `/${Collections.Rooms}/${roomId}/${Collections.Members}/${authState.value.user?.uid!}`,
    ),
    roomMember,
  );

  return authState.value.user?.uid!;
}

export async function updateRoomMember(
  roomId: string,
  roomMember: Partial<RoomMember>,
) {
  const { user } = authState.value;
  if (!user?.uid) {
    throw new Error("missing uid");
  }

  await updateDoc(
    doc(db, getRoomMembersCollection(roomId).path, user.uid),
    roomMember,
  );
}

export const getRoomMembersCollection = (roomId: string) =>
  collection(db, Collections.Rooms, roomId, Collections.Members);

export const getRoomRoundsCollection = (roomId: string) =>
  collection(db, Collections.Rooms, roomId, Collections.Rounds);

export const getRoomMemberKey = (roomId: string, memberId: string) =>
  doc(db, `${getRoomMembersCollection(roomId).path}/${memberId}`);

export async function updateRoom(
  roomId: string,
  roomDetails: Partial<RoomDetails>,
) {
  return updateDoc(doc(db, Collections.Rooms, roomId), roomDetails);
}

export async function createRound(roomId: string, round: Round) {
  const roundDocRef = await addDoc(getRoomRoundsCollection(roomId), round);

  return roundDocRef.id;
}

export async function updateRound(
  roomId: string,
  roundId: string,
  round: Partial<Round>,
) {
  return updateDoc(
    doc(db, getRoomRoundsCollection(roomId).path, roundId),
    round,
  );
}

export async function updateOwnProfile(profile: MemberProfile) {
  const { room, roomId } = roomState.value;

  const newUser = {
    displayName: profile.displayName,
    photoURL: [profile.character || "mario", profile.cardColor].join(","),
  };

  await updateProfile(auth.currentUser!, newUser);

  updateState(authState, () => ({
    displayName: profile.displayName,
    cardColor: profile.cardColor,
  }));

  if (room) {
    await updateRoomMember(roomId!, { profile });
  }
}

export const convertFirebaseDate = (date: any): Date => date.toDate();

export async function removeRoomMember(roomId: string, uid: string) {
  await deleteDoc(getRoomMemberKey(roomId, uid));
}
