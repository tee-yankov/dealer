import Card, { CardRank } from "./card";
import "./hand.css";
import classnames from "../util/classnames";
import { authState, roundState } from "../util/state";
import { RoundStatus } from "../util/types";
import { useAsync } from "../hooks/useAsync";
import { selectCardForCurrentRound } from "../util/room";

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
  const { currentRound } = roundState.value;
  const selectedCard =
    currentRound?.cards?.[authState.value.user?.uid ?? ""]?.card;

  const { invoke: handleSelectCard } = useAsync((card: CardRank) =>
    selectCardForCurrentRound(card),
  );

  return (
    <div className="hand-container">
      {HAND_CARDS.map((rank) => (
        <Card
          disabled={currentRound?.status !== RoundStatus.Started}
          className={classnames(
            selectedCard === rank && "card-container-selected",
          )}
          onClick={handleSelectCard}
          key={rank}
          rank={rank}
        />
      ))}
    </div>
  );
}

export default Hand;
