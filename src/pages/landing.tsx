import { ChangeEvent } from "preact/compat";
import { useCallback, useEffect, useState } from "preact/hooks";
import { useLocation } from "wouter-preact";
import { initializeWebRTC } from "../util/webrtc";
import Card, { CardRank } from "../components/card";
import "./landing.css";
import AnimateText from "../components/animate-text";
import classnames from "../util/classnames";

function LandingPage() {
  const [roomName, setRoomName] = useState("");
  const [localDescription, setLocalDescription] =
    useState<RTCSessionDescription | null>();
  const [_, navigate] = useLocation();
  const [isRoomCreating, setIsRoomCreating] = useState(false);

  const handleRoomNameChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setRoomName(e.currentTarget.value);
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: SubmitEvent) => {
      e.preventDefault();
      if (isRoomCreating) {
        return;
      }

      setIsRoomCreating(true);

      setIsRoomCreating(false);

      navigate(`/room/placeholder`);
    },
    [roomName, localDescription, navigate, isRoomCreating],
  );

  useEffect(() => {
    initializeWebRTC().then(async (peerConnection) => {
      await peerConnection.setLocalDescription();

      setLocalDescription(peerConnection.localDescription);
    });
  }, [setLocalDescription]);

  const disabled = !roomName || !localDescription || isRoomCreating;

  return (
    <div className="page page-landing">
      <h1 className="title-text">Dealer</h1>
      <div className="page-content">
        <div className="card-logo-container">
          <Card rank={CardRank.Ace} animate />
        </div>
        <form onSubmit={handleSubmit}>
          <h2>New Room</h2>
          <input
            className="room-name-input nes-input"
            name="roomName"
            type="text"
            value={roomName}
            onChange={handleRoomNameChange}
          />
          {isRoomCreating && (
            <p className="room-creating-text">
              Creating Room
              <AnimateText states={["", ".", "..", "..."]} />
            </p>
          )}
          <button
            className={classnames(
              "room-create-button nes-btn",
              disabled && "is-disabled",
            )}
            disabled={disabled}
            type="submit"
          >
            Create
          </button>
        </form>
      </div>
    </div>
  );
}

export default LandingPage;
