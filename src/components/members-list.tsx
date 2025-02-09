import { roomState } from "../util/state";
import "./members-list.css";

function MembersList() {
  const { members, room } = roomState.value;

  return (
    <div className="nes-container with-title is-centered members-list-container">
      <p className="title">Members</p>
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
