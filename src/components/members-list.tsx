import { useCallback, useState } from "preact/hooks";
import { isRoomHost, roomState } from "../util/state";
import "./members-list.css";
import classnames from "../util/classnames";
import { handleRoomMemberKick } from "../util/room";

function MembersList() {
  const { members, room, roomId } = roomState.value;
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleMembersClick = useCallback(() => {
    setIsCollapsed((v) => !v);
  }, []);

  const handleKickMember = (uid: string) => () => {
    handleRoomMemberKick(roomId!, uid);
  };

  return (
    <div
      className={classnames(
        "nes-container with-title is-centered members-list-container",
        isCollapsed && "members-list-container-collapsed",
      )}
    >
      <p className="title nes-pointer" onClick={handleMembersClick}>
        Members
      </p>
      {Object.entries(members).map(([uid, member]) => (
        <p className="member" key={uid}>
          {uid === room?.uid && <i className="nes-icon star is-small"></i>}
          {isRoomHost.value && uid !== room?.uid && (
            <button
              onClick={handleKickMember(uid)}
              className="nes-btn button-kick-member"
            >
              <i className="nes-icon close is-small is-error"></i>
            </button>
          )}
          <span>{member.profile?.displayName || "(placeholder)"}</span>
        </p>
      ))}
    </div>
  );
}

export default MembersList;
