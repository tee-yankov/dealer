import "./room.css";
import { useParams } from "wouter-preact";
import Hand from "../components/hand";
import StatusLight, { StatusLightStates } from "../components/status-light";
import { useEffect } from "preact/hooks";
import { createRoomMember, fetchRoom } from "../util/firebase";
import { authState, isRoomHost } from "../util/state";
import { useAsync } from "../hooks/useAsync";
import PlayingField from "../components/playing-field";
import {
  useListenForRoomMembers,
  useListenForRounds,
} from "../hooks/firebaseListeners";
import MembersList from "../components/members-list";
import HostControls from "../components/host-controls";
import { handleRoomMembersChange, handleRoomRoundsChange } from "../util/room";
import UserSettings from "../components/user-settings";
import { Layout, LayoutSlot } from "../components/layout";
import { CardColor } from "../components/card";
import RoomSummary from "../components/room-summary";

function RoomPage() {
  const { roomId } = useParams();
  const { isResolved: isRoomResolved } = useAsync(() => fetchRoom(roomId!), {
    immediate: true,
  });
  const { invoke: handleRoom } = useAsync(async () => {
    if (!isRoomHost.value) {
      const { user, cardColor } = authState.value;
      await createRoomMember(roomId!, {
        profile: {
          displayName: user?.displayName ?? "",
          character: user?.photoURL ?? "",
          cardColor: (cardColor ?? CardColor.Red) as CardColor,
        },
      });
    }
  });

  useEffect(() => {
    if (isRoomResolved) {
      handleRoom();
    }
  }, [isRoomResolved]);

  useListenForRoomMembers(roomId!, handleRoomMembersChange, isRoomResolved);

  useListenForRounds(roomId!, handleRoomRoundsChange, isRoomResolved);

  return (
    <>
      <div className="status-light-container">
        <StatusLight
          state={StatusLightStates.Good}
          glowing
          text={<span className="nes-text is-success text-sm">Connected</span>}
        />
      </div>
      <div className="room-top-right-container">
        <UserSettings />
        <MembersList />
      </div>
      <Layout className="page">
        <LayoutSlot>
          <RoomSummary />
        </LayoutSlot>
        <LayoutSlot>
          <PlayingField />
        </LayoutSlot>
        <LayoutSlot className="layout-slot-reversed">
          {isRoomHost.value ? <HostControls /> : <Hand />}
        </LayoutSlot>
      </Layout>
    </>
  );
}

export default RoomPage;
