import classnames from "../util/classnames";
import debounce from "../util/debounce";
import "./scaled-text.css";
import { useEffect, useRef, useState } from "preact/compat";

function ScaledText({
  className,
  height,
  text,
}: {
  className?: string;
  height: string;
  text: string;
}) {
  const [fontSize, setFontSize] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const containerHeight = containerRef.current?.clientHeight ?? 0;
    const contentHeight = contentRef.current?.clientHeight ?? 0;
    if (contentHeight > containerHeight) {
      setFontSize((height) => height * 0.9);
    }
  }, [fontSize, text]);

  return (
    <div
      className={classnames(className, "scaled-text-container")}
      style={{ maxHeight: height }}
      ref={containerRef}
    >
      <span
        ref={contentRef}
        className="scaled-text-content"
        style={{ fontSize: `${fontSize}em` }}
      >
        {text}
      </span>
    </div>
  );
}

export default ScaledText;
