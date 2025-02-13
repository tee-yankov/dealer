import { useEffect, useState } from "preact/hooks";

function ElapsedTime({ since }: { since: Date }) {
  const [_refreshCounter, setRefreshCounter] = useState(0);
  const now = new Date();
  const diff = now.getTime() - since.getTime();
  const [minutes, seconds] = [
    Math.floor(diff / 1000 / 60),
    Math.round(diff / 1000) % 60,
  ];

  useEffect(() => {
    const handler = () => setRefreshCounter((current) => current + 1);

    const intervalId = setInterval(handler, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <span>
      {minutes.toString().padStart(2, "0")}:
      {seconds.toString().padStart(2, "0")}
    </span>
  );
}

export default ElapsedTime;
