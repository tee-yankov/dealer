import { useEffect, useState } from "preact/hooks";
import debounce from "../util/debounce";

function useWindowDimensions(): { width: number; height: number } {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handler = debounce((_e) => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, 300);

    window.addEventListener("resize", handler);

    return () => {
      window.removeEventListener("resize", handler);
    };
  }, []);

  return dimensions;
}

export default useWindowDimensions;
