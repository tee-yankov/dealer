import "./app.css";
import Router from "./components/router";
import { initializeFirebase } from "./util/firebase";
import { useAsync } from "./hooks/useAsync";
import Help from "./components/help";
import useWindowDimensions from "./hooks/useWindowDimensions";

export function App() {
  const { width, height } = useWindowDimensions();
  const { isResolved } = useAsync(() => initializeFirebase(), {
    immediate: true,
  });

  return (
    <>
      <Help />
      <canvas
        width={width}
        height={height}
        className="global-effect-canvas"
      ></canvas>
      {isResolved ? <Router /> : null}
    </>
  );
}
