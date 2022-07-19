export const compactString = (value: string) => {
  const valueCompacted = value.replace(/, /g, ',').replace(/\. /g, '.').replace(/[\.]$/, '').replace(/"/g, '');

  return valueCompacted;
};

export const formatStringFromRedeableHtml = (prevString: string, {
  maxLength,
  diffAllowed,
}: {
  maxLength?: number;
  diffAllowed: number;
} = { diffAllowed: 0 }): string => {
  let newString = prevString;

  if (maxLength) {
    const maxLengthWithDiff = maxLength + diffAllowed;
    const paragraphs = newString.split('\n');

    newString = paragraphs.reduce((acc, current, index) => {
      const lengthForTheMoment = acc.length;
      if (lengthForTheMoment <= maxLength) {
        const newAcc = acc + current;
        if (index && newAcc.length <= maxLengthWithDiff) return newAcc;
        if (!index) return newAcc;

        return acc;
      }

      return acc;
    }, '');
  }
  
  newString = newString.replace(/\'/g, '').replace(/\s{2,}/g, ' ').replace(/^[\s]/g, '');

  return newString;
};
