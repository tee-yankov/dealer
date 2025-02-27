import { useEffect, useRef } from "preact/hooks";
import DeckImage from "../assets/8BitDeck.webp";
import { xOffset, yOffset } from "../components/card";

function useExplodeAnimation(
  exploded: boolean = false,
  cardOffset: { backgroundPositionX: number; backgroundPositionY: number },
  cardContainer: HTMLDivElement | null,
  explosionDelayMs: number,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!exploded || !cardContainer) {
      return;
    }

    if (!canvasRef.current) {
      canvasRef.current = document.querySelector<HTMLCanvasElement>(
        ".global-effect-canvas",
      );
    }
    const canvas = canvasRef.current!;
    const context = canvas.getContext("2d")!;
    context.imageSmoothingEnabled = false;
    const sourceRect = cardContainer.getBoundingClientRect();

    let sx = Math.floor(Math.random() * 6 - 3) * 2;
    if (sx === 0) {
      sx = 2;
    }
    let sy = -Math.random() * 16;
    let x = sourceRect.x;
    let y = sourceRect.y;

    const image = new Image();
    let timeout: NodeJS.Timeout;
    let animationFrame: number;

    image.onload = async () => {
      const imageBitmap = await window.createImageBitmap(
        image,
        Math.abs(cardOffset.backgroundPositionX),
        Math.abs(cardOffset.backgroundPositionY),
        xOffset,
        yOffset,
      );
      const tick = () => {
        x += sx;
        y += sy;

        if (y > canvas.height - yOffset) {
          y = canvas.height - yOffset;
          sy = -sy * 0.85;
        }

        sy += 0.98;
      };

      const render = () => {
        if (
          x > window.innerWidth ||
          y > window.innerHeight ||
          x + xOffset < 0
        ) {
          console.debug("stop explosion");
          return;
        }

        context.save();
        context.beginPath();

        context.moveTo(x, y);

        const pixelatedPolygonPoints = [
          [0, yOffset - 8],
          [4, yOffset - 8],
          [4, yOffset - 4],
          [8, yOffset - 4],
          //
          [8, yOffset],
          [xOffset - 8, yOffset],
          [xOffset - 8, yOffset - 4],
          [xOffset - 4, yOffset - 4],
          [xOffset - 4, yOffset - 8],
          //
          [xOffset, yOffset - 8],
          [xOffset, 8],
          [xOffset - 4, 8],
          [xOffset - 4, 4],
          [xOffset - 8, 4],
          [xOffset - 8, 0],
          //
          [8, 0],
          [8, 4],
          [4, 4],
          [4, 8],
          [0, 8],
        ];

        for (const [xPoint, yPoint] of pixelatedPolygonPoints) {
          context.lineTo(x + xPoint, y + yPoint);
        }

        context.closePath();

        context.clip();

        context.fillStyle = "#FFFFFF";
        context.fillRect(x, y, xOffset, yOffset);
        context.strokeStyle = "#000000";
        context.strokeRect(x, y, xOffset, yOffset);

        context.drawImage(
          imageBitmap,
          0,
          0,
          xOffset,
          yOffset,
          x,
          y,
          xOffset,
          yOffset,
        );

        context.restore();

        tick();
        animationFrame = requestAnimationFrame(render);
      };

      if (explosionDelayMs) {
        timeout = setTimeout(() => {
          tick();
          animationFrame = requestAnimationFrame(render);
        }, explosionDelayMs);
      } else {
        tick();
        animationFrame = requestAnimationFrame(render);
      }
    };

    image.src = DeckImage;

    const cleanup = () => {
      clearTimeout(timeout);
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      cancelAnimationFrame(animationFrame);
    };

    return cleanup;
  }, [exploded, cardContainer]);
}

export default useExplodeAnimation;
