import { onSnapshot, orderBy, query, QuerySnapshot } from "firebase/firestore";
import {
  getRoomMembersCollection,
  getRoomRoundsCollection,
} from "../util/firebase";
import { useEffect } from "preact/hooks";

export function useListenForRoomMembers(
  roomId: string,
  callback: (q: QuerySnapshot) => void,
  shouldListen = true,
) {
  useEffect(() => {
    let unsub = () => {};
    if (shouldListen) {
      unsub = onSnapshot(getRoomMembersCollection(roomId), (snapshot) => {
        callback(snapshot);
      });
    } else {
      unsub();
    }

    return () => {
      unsub();
    };
  }, [roomId, shouldListen]);
}

export function useListenForRounds(
  roomId: string,
  callback: (q: QuerySnapshot) => void,
  shouldListen = true,
) {
  useEffect(() => {
    let unsub = () => {};
    if (shouldListen) {
      const sortedRoundsQuery = query(
        getRoomRoundsCollection(roomId),
        orderBy("createdAt"),
      );
      unsub = onSnapshot(sortedRoundsQuery, (snapshot) => {
        callback(snapshot);
      });
    } else {
      unsub();
    }

    return () => {
      unsub();
    };
  }, [roomId, shouldListen]);
}
