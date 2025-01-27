import { ChangeEvent } from "preact/compat";
import { useCallback, useEffect, useState } from "preact/hooks";
import { useLocation } from "wouter-preact";
import { initializeWebRTC } from "../util/webrtc";

function LandingPage() {
  const [roomName, setRoomName] = useState("");
  const [localDescription, setLocalDescription] =
    useState<RTCSessionDescription | null>();
  const [_, navigate] = useLocation();

  const handleRoomNameChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setRoomName(e.currentTarget.value);
    },
    [],
  );

  const handleSubmit = useCallback(
    (e: SubmitEvent) => {
      e.preventDefault();
      const payload = btoa(
        JSON.stringify({
          roomName,
          localDescription,
        }),
      );

      navigate(`/room/${payload}`);
    },
    [roomName, localDescription, navigate],
  );

  useEffect(() => {
    initializeWebRTC().then(async (peerConnection) => {
      await peerConnection.setLocalDescription();

      setLocalDescription(peerConnection.localDescription);
    });
  }, [setLocalDescription]);

  const disabled = !roomName || !localDescription

  return (
    <div className="page">
      <form onSubmit={handleSubmit}>
        <h2>New Room</h2>
        <input
          name="roomName"
          type="text"
          value={roomName}
          onChange={handleRoomNameChange}
        />
        <br />
        <br />
        <button disabled={disabled} type="submit">
          Create
        </button>
      </form>
    </div>
  );
}

export default LandingPage;
