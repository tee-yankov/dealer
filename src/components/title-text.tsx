import { useEffect, useState } from "preact/hooks";
import "./title-text.css";
import classnames from "../util/classnames";

const TITLE = "Dealer".split("");

function TitleText() {
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCharIndex((current) => (current + 1) % (TITLE.length + 6));
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <h1 className="title-text">
      {TITLE.map((char, i) => (
        <span
          className={classnames(
            (charIndex === i ||
              charIndex === TITLE.length ||
              charIndex === TITLE.length + 2 ||
              charIndex === TITLE.length + 4) &&
              "title-text-highlighted",
          )}
        >
          {char}
        </span>
      ))}
    </h1>
  );
}

export default TitleText;
