import "./room.css";
import { useParams } from "wouter-preact";
import Hand from "../components/hand";
import StatusLight, { StatusLightStates } from "../components/status-light";
import { useEffect } from "preact/hooks";
import { createRoomMember, fetchRoom } from "../util/firebase";
import {
  authState,
  hasJoinedRoom,
  isConnected,
  isRoomHost,
  updateState,
} from "../util/state";
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
import { DotDotDot } from "../components/animate-text";
import classnames from "../util/classnames";

function RoomPage() {
  const { roomId } = useParams();
  const { isResolved: isRoomResolved } = useAsync(() => fetchRoom(roomId!), {
    immediate: true,
  });
  const { invoke: handleRoom } = useAsync(async () => {
    if (!isRoomHost.value) {
      const { user, cardColor } = authState.value;
      if (!user?.displayName) {
        await new Promise((resolve, reject) => {
          updateState(authState, () => ({
            requireUserSetting: {
              onConfirm: () => resolve(null),
              onCancel: () =>
                reject(new Error("user declined to provide name")),
            },
          }));
        });
        updateState(authState, () => ({
          requireUserSetting: undefined,
        }));
      }
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
          state={
            isRoomResolved && isConnected.value
              ? hasJoinedRoom.value
                ? StatusLightStates.Good
                : StatusLightStates.Bad
              : StatusLightStates.Warning
          }
          glowing
          flashing={!isRoomResolved || !isConnected.value}
          text={
            <span
              className={classnames(
                "nes-text text-sm",
                isRoomResolved && isConnected.value
                  ? hasJoinedRoom.value
                    ? "is-success"
                    : "is-error"
                  : "is-warning",
              )}
            >
              {isRoomResolved && isConnected.value
                ? hasJoinedRoom.value
                  ? "Connected"
                  : "Disconnected"
                : "Connecting"}
              {(!isRoomResolved || !isConnected.value) && <DotDotDot />}
            </span>
          }
        />
      </div>
      <div className="room-top-right-container">
        <UserSettings />
        {isRoomResolved && <MembersList />}
      </div>
      {isRoomResolved && hasJoinedRoom.value && (
        <Layout className="page">
          <LayoutSlot overflow>
            <RoomSummary />
          </LayoutSlot>
          <LayoutSlot>
            <PlayingField />
          </LayoutSlot>
          <LayoutSlot className="layout-slot-reversed" raised>
            {isRoomHost.value ? <HostControls /> : <Hand />}
          </LayoutSlot>
        </Layout>
      )}
    </>
  );
}

export default RoomPage;
