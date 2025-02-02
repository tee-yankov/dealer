import { useEffect, useState } from "preact/hooks";
import classnames from "../util/classnames";
import "./status-light.css";
import { ReactNode } from "preact/compat";

export enum StatusLightStates {
  Info = "status-light-info",
  Good = "status-light-good",
  Warning = "status-light-warning",
  Bad = "status-light-bad",
}

export interface StatusLightProps {
  state: StatusLightStates;
  flashing?: boolean;
  flashingInterval?: number;
  glowing?: boolean;
  text: ReactNode;
}

function StatusLight({
  state,
  glowing = false,
  flashing = false,
  flashingInterval = 1000,
  text,
}: StatusLightProps) {
  const [isGlowing, setIsGlowing] = useState(glowing);

  useEffect(() => {
    if (!flashing) {
      return;
    }

    let timeout: NodeJS.Timeout;
    const handler = () => {
      setIsGlowing((current) => !current);
      timeout = setTimeout(handler, flashingInterval);
    };
    timeout = setTimeout(handler, flashingInterval);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className='status-light-container'>
      <div
        className={classnames(
          "status-light",
          isGlowing ? `${state}-glowing` : state,
        )}
      />
      {text}
    </div>
  );
}

export default StatusLight;
