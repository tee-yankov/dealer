import { useEffect, useState } from "preact/hooks";

export interface AnimateTextProps {
  states: string[];
  tick?: number;
}

function AnimateText({ states, tick = 330 }: AnimateTextProps) {
  const [stateIndex, setStateIndex] = useState(0);

  useEffect(() => {
    let timeout;
    const handler = () => {
      setStateIndex((currentStateIndex) => (currentStateIndex + 1) % states.length)
      setTimeout(handler, tick)
    };

    timeout = setTimeout(handler, tick);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return <span>{states[stateIndex]}</span>;
}

export function DotDotDot({ reverse = false }: { reverse?: boolean }) {
  const states = ["", ".", "..", "..."];
  if (reverse) {
    states.reverse()
  }
  return <AnimateText states={states} / >
}

export default AnimateText;
