import { useCallback, useState } from "preact/hooks";
import { roomState } from "../util/state";
import "./members-list.css";
import classnames from "../util/classnames";

function MembersList() {
  const { members, room } = roomState.value;
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleMembersClick = useCallback(() => {
    setIsCollapsed((v) => !v);
  }, []);

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
          <span>{member.profile?.displayName || "(placeholder)"}</span>
        </p>
      ))}
    </div>
  );
}

export default MembersList;
