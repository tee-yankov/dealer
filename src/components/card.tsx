import { useCallback, useEffect, useState } from "preact/hooks";
import "./card.css";
import classnames from "../util/classnames";

const xOffset = 142;
/* const yOffset = 190; */

const getRandomDifferentCard = (old: number) => {
  const result = Math.round(Math.random() * 13);
  if (result !== old) {
    return result;
  } else {
    return getRandomDifferentCard(old);
  }
};

export enum CardRank {
  Ace = 12,
  Two = 0,
  Three = 1,
  Four = 2,
  Five = 3,
  Six = 4,
  Seven = 5,
  Eight = 6,
  Nine = 7,
  Ten = 8,
  Jack = 9,
  Queen = 10,
  King = 11,
}

export interface CardProps {
  rank: CardRank;
  animate?: boolean;
  onClick?: (rank: CardRank) => void;
  className?: string;
  flipped?: boolean;
}

function Card({
  rank,
  animate = false,
  onClick,
  className,
  flipped = false,
}: CardProps) {
  const [cardIndex, setCardIndex] = useState(rank);
  const [cardContainer, setCardContainer] = useState<HTMLDivElement | null>(
    null,
  );

  const cardRef = useCallback((ref: HTMLDivElement | null) => {
    if (ref) {
      setCardContainer(ref);
    }
  }, []);

  useEffect(() => {
    if (!cardContainer || !animate) {
      return;
    }

    const [animation] = cardContainer.getAnimations();
    let timeout: NodeJS.Timeout;
    let flipped = false;
    const duration = animation.effect?.getComputedTiming().duration as number;
    const timeoutDuration = duration / 10;
    const handler = () => {
      const progress = animation.effect?.getComputedTiming().progress as number;
      if (progress >= 0.5 && !flipped) {
        setCardIndex(getRandomDifferentCard);
        flipped = true;
      } else if (progress < 0.5 && flipped) {
        flipped = false;
      }

      timeout = setTimeout(handler, timeoutDuration);
    };

    timeout = setTimeout(handler, timeoutDuration);

    return () => {
      clearTimeout(timeout);
    };
  }, [cardContainer, setCardIndex]);

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(rank);
    }
  }, [rank, onClick]);

  return (
    <div
      onClick={handleClick}
      className={classnames("card-container", className)}
    >
      <div
        ref={cardRef}
        className={classnames(
          "card-inner-container",
          flipped && "card-inner-container-flipped",
          animate && "card-inner-container-animated",
        )}
      >
        <div
          className="card card-front card-pixel-corners"
          style={{ backgroundPositionX: -cardIndex * xOffset }}
        />
        <div className="card card-back"></div>
      </div>
    </div>
  );
}

export default Card;
