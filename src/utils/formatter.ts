export const compactString = (value: string) => {
  const finalCharIndex = value.length - 1;
  const valueWithoutFinalDot = value[finalCharIndex] === '.' ? value.slice(0, finalCharIndex) : value;
  const valueCompacted = valueWithoutFinalDot.replace(/, /g, ',').replace(/\. /, '.');

  return valueCompacted;
};
