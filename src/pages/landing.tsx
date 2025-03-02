import { ChangeEvent } from "preact/compat";
import { useCallback, useState } from "preact/hooks";
import { useLocation } from "wouter-preact";
import Card, { CardRank } from "../components/card";
import "./landing.css";
import { DotDotDot } from "../components/animate-text";
import classnames from "../util/classnames";
import { createRoom } from "../util/firebase";
import { authState } from "../util/state";
import TitleText from "../components/title-text";

function LandingPage() {
  const [roomName, setRoomName] = useState(
    localStorage.getItem("lastRoomName") ?? "",
  );
  const [_, navigate] = useLocation();
  const [isRoomCreating, setIsRoomCreating] = useState(false);
  const disabled = !roomName || isRoomCreating;

  const handleRoomNameChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setRoomName(e.currentTarget.value);
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: SubmitEvent) => {
      e.preventDefault();
      if (disabled) {
        return;
      }

      setIsRoomCreating(true);

      // create room
      const roomId = await createRoom({
        name: roomName,
        uid: authState.value.user?.uid!,
      });

      localStorage.setItem("lastRoomName", roomName);

      setIsRoomCreating(false);

      navigate(`/room/${roomId}`);
    },
    [roomName, navigate, isRoomCreating],
  );

  return (
    <div className="page page-landing">
      <TitleText />
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
              <DotDotDot />
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
