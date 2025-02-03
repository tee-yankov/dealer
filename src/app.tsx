import "./app.css";
import Router from "./components/router";
import { initializeFirebase } from "./util/firebase";
import { useAsync } from "./hooks/useAsync";

export function App() {
  const { isResolved } = useAsync(
    () => initializeFirebase(),
    { immediate: true },
  );

  return isResolved ? <Router /> : null;
}
