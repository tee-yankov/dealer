import "./upload-avatar.css";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { ChangeEvent } from "preact/compat";

export interface UploadAvatarProps {
  onChange?: (result: string) => void;
  label: string;
  current?: string;
}

function UploadAvatar({ onChange, label, current }: UploadAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState<number>(0);
  const [result, setResult] = useState<string>();
  const [sourceFile, setSourceFile] = useState<string>();

  const handleSourceFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.currentTarget.files?.[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setSourceFile(e.target?.result?.toString() ?? "");
      };

      if (file) {
        reader.readAsDataURL(file!);
      }
    },
    [],
  );

  useEffect(() => {
    if (!imageLoaded) {
      return;
    }
    const scale = 0.35;
    const img = imageRef.current!;
    const canvas = canvasRef.current!;

    canvas.width = img.width;
    canvas.height = img.height;
    const scaledW = canvas.width * scale;
    const scaledH = canvas.height * scale;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCanvas.style.visibility = "hidden";
    tempCanvas.style.position = "fixed";
    tempCanvas.style.top = "0";
    tempCanvas.style.left = "0";
    const tempContext = tempCanvas.getContext("2d")!;

    tempContext.drawImage(img, 0, 0, scaledW, scaledH);
    document.body.appendChild(tempCanvas);

    const ctx = canvas.getContext("2d")!;

    // turn off image-smoothing
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      tempCanvas,
      0,
      0,
      scaledW,
      scaledH,
      0,
      0,
      img.width,
      img.height,
    );

    const data = canvas.toDataURL("image/webp", 0.5);
    setResult(data);
    if (onChange) {
      onChange(data);
    }
    tempCanvas.remove();
  }, [imageLoaded]);

  useEffect(() => {
    const handler = () => {
      setImageLoaded((current) => current + 1);
    };

    imageRef.current?.addEventListener("load", handler);

    return () => {
      imageRef.current?.removeEventListener("load", handler);
    };
  }, []);

  const resultSrc =
    result ?? (current?.startsWith("data") ? current : undefined);

  return (
    <div className="upload-avatar-container">
      <label className="nes-btn upload-avatar-btn">
        <span>{label}</span>
        <input type="file" accept="image/*" onChange={handleSourceFileChange} />
      </label>
      <div className="upload-avatar-offscreen">
        <h2>Original</h2>
        <img
          ref={imageRef}
          style={{ width: "auto", height: "64px", maxWidth: "164px" }}
          src={sourceFile}
        />

        <canvas ref={canvasRef} />
      </div>

      <div>{resultSrc && <img src={resultSrc} />}</div>
    </div>
  );
}

export default UploadAvatar;
