import "./app.css";
import Router from "./components/router";
import { initializeFirebase } from "./util/firebase";
import { useAsync } from "./hooks/useAsync";
import Help from "./components/help";

export function App() {
  const { isResolved } = useAsync(() => initializeFirebase(), {
    immediate: true,
  });

  return (
    <>
      <Help />
      <canvas
        width={window.innerWidth}
        height={window.innerHeight}
        className="global-effect-canvas"
      ></canvas>
      {isResolved ? <Router /> : null}
    </>
  );
}
