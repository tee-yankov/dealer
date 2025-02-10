import "./shine.css";

function Shine({
  active = false,
  amount = 10,
}: {
  active?: boolean;
  amount?: number;
}) {
  const stars = [];
  if (active) {
    for (let i = 0; i < amount; i++) {
      stars.push({
        top: `${Math.random() * 70}%`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${(Math.random() * amount) / 4}s`,
        size: i % 2 === 0 ? "small" : i % 3 === 0 ? "medium" : "large",
      });
    }
  }

  return (
    <div className="shine-container">
      {stars.map(({ size, ...style }) => (
        <div className={`shine ${size}`} style={style} />
      ))}
    </div>
  );
}

export default Shine;
