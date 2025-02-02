import { useCallback, useState } from "preact/hooks";
import Card, { CardRank } from "./card";
import "./hand.css";
import classnames from "../util/classnames";

const HAND_CARDS = [
  CardRank.Ace,
  CardRank.Two,
  CardRank.Three,
  CardRank.Five,
  CardRank.Eight,
  CardRank.Jack,
  CardRank.Queen,
  CardRank.King,
];

function Hand() {
  const [selectedCard, setSelectedCard] = useState<CardRank | null>(null);

  const handleSelectCard = useCallback((rank: CardRank) => {
    setSelectedCard((currentRank) => rank === currentRank ? null : rank)
  }, [])

  return (
    <div className="hand-container">
      {HAND_CARDS.map((rank) => (
        <Card className={classnames(selectedCard === rank && "card-container-selected")} onClick={handleSelectCard} key={rank} rank={rank} />
      ))}
    </div>
  );
}

export default Hand;
