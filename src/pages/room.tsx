import { useEffect } from "preact/hooks";
import { Link, useParams } from "wouter-preact";
import {
  resolveIPNSName,
  deserializeRoomPayload,
  lsDirectory,
  getOwnPeerId,
} from "../util/ipfs";
import Hand from "../components/hand";
import StatusLight, { StatusLightStates } from "../components/status-light";

function RoomPage() {
  const { room: payload } = useParams();
  const room = deserializeRoomPayload(payload!);

  useEffect(() => {
    (async () => {
      const isMeHost = room.peerId === await getOwnPeerId();
      if (isMeHost) {
        return;
      }
      console.log(`Fetching files for ${room.keys?.pub}`)
      const name = await resolveIPNSName(room.keys?.pub!);
      console.log({ ...name })
      const files = await lsDirectory(name.cid);

      console.log({ ...files });
    })();
  }, []);

  return (
    <div className="page">
      <StatusLight
        state={StatusLightStates.Good}
        glowing
        text={<span className="nes-text is-success text-sm">Connected</span>}
      />
      <Link to="/">Back</Link>
      <h2>Room: {room.name}</h2>
      <Hand />
    </div>
  );
}

export default RoomPage;
