export const capitalize = (str: string): string =>
  str
    .split(" ")
    .map((word) => word[0].toUpperCase().concat(word.slice(1)))
    .join("");
