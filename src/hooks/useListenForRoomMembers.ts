import { onSnapshot, QuerySnapshot } from "firebase/firestore";
import { getRoomMembersCollection } from "../util/firebase";
import { useEffect } from "preact/hooks";

function useListenForRoomMembers(
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

export default useListenForRoomMembers;
