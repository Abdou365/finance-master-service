export const generateNumber = (length: number) => {
  const random = Math.random();
  const multiplier = parseInt(Array.from({ length }, () => 9).join(''), 10);
  const number = random * multiplier;

  return Math.floor(number);
};
