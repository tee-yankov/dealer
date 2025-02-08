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
  runTransaction,
} from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";
import { authState, roomState } from "./state";
import { RoomDetails, RoomMember } from "./types";

export enum Collections {
  Members = "members",
  Rooms = "rooms",
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
    user,
  };
}

export async function createRoomMember(roomId: string, roomMember: RoomMember) {
  await setDoc(
    doc(
      db,
      `/${Collections.Rooms}/${roomId}/${Collections.Members}/${authState.value.user?.uid!}`,
    ),
    {
      ...roomMember,
      sdp:
        roomMember.sdp instanceof RTCSessionDescription
          ? roomMember.sdp.toJSON()
          : roomMember.sdp,
    },
  );

  return authState.value.user?.uid!;
}

export async function fetchRoomMember(roomId: string, uid: string) {
  console.log("Fetching room member", roomId, uid);
  const memberDoc = await getDoc(
    doc(db, `/${Collections.Rooms}/${roomId}/${Collections.Members}/${uid}`),
  );

  return memberDoc.data();
}

export async function publishOwnAnswer(
  roomId: string,
  sdp: RTCSessionDescriptionInit | null,
  to: string,
) {
  await runTransaction(db, async (transaction) => {
    const ownUid = authState.value.user!.uid;
    const ownKey = getRoomMemberKey(roomId, ownUid);
    const existingMember = await transaction.get(ownKey);
    if (!existingMember.exists()) {
      throw new Error("Own member record does not exist");
    }

    const newAnswers = {
      ...existingMember.data().answers,
      [to]: sdp,
    };

    console.log({ newAnswers });

    transaction.update(ownKey, {
      answers: newAnswers,
    });
  });
}

export const getRoomMembersCollection = (roomId: string) =>
  collection(db, Collections.Rooms, roomId, Collections.Members);

export const getRoomMemberKey = (roomId: string, memberId: string) =>
  doc(db, `${getRoomMembersCollection(roomId).path}/${memberId}`);

export async function updateRoom(
  roomId: string,
  roomDetails: Partial<RoomDetails>,
) {
  return updateDoc(doc(db, Collections.Rooms, roomId), roomDetails);
}

export async function updateMember(
  roomId: string,
  memberId: string,
  memberDetails: Partial<
    Omit<RoomMember, "iceCandidates"> & { iceCandidates: RTCIceCandidateInit[] }
  >,
) {
  return updateDoc(
    doc(db, getRoomMembersCollection(roomId).path, memberId),
    memberDetails,
  );
}
