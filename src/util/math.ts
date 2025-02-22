import { CardRank } from "../components/card";
import { Round } from "./types";

export const cardRankToCardValueMap: Record<CardRank, number> = {
  [CardRank.Ace]: 1,
  [CardRank.Two]: 2,
  [CardRank.Three]: 3,
  [CardRank.Four]: 4,
  [CardRank.Five]: 5,
  [CardRank.Six]: 6,
  [CardRank.Seven]: 7,
  [CardRank.Eight]: 8,
  [CardRank.Nine]: 9,
  [CardRank.Ten]: 10,
  [CardRank.Jack]: 13,
  [CardRank.Queen]: 21,
  [CardRank.King]: 34,
};

export const avg = (numbers: number[]) =>
  numbers.reduce((a, b) => a + b, 0) / numbers.length;

const median = (numbers: number[]) => {
  if (!numbers.length) {
    return 0;
  }

  numbers = [...numbers].sort((a, b) => a - b);

  const half = Math.floor(numbers.length / 2);

  return numbers.length % 2
    ? numbers[half]
    : (numbers[half - 1] + numbers[half]) / 2;
};

export const getRoundStats = (round: Round) => {
  const cards = Object.values(round.cards).map(
    ({ card }) => cardRankToCardValueMap[card],
  );

  return {
    avg: avg(cards) || 0,
    median: median(cards),
  };
};
