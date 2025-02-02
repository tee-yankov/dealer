import { Link } from "wouter-preact";
import Hand from "../components/hand";
import StatusLight, { StatusLightStates } from "../components/status-light";

function RoomPage() {
  /* const { room: payload } = useParams(); */

  return (
    <div className="page">
      <StatusLight
        state={StatusLightStates.Good}
        glowing
        text={<span className="nes-text is-success text-sm">Connected</span>}
      />
      <Link to="/">Back</Link>
      <h2>Room: XXX</h2>
      <Hand />
    </div>
  );
}

export default RoomPage;
