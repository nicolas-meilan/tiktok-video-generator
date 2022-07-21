export const compactString = (value: string) => {
  const valueCompacted = value.replace(/, /g, ',')
    .replace(/\. /g, '.')
    .replace(/[\.]$/, '')
    .replace(/\"/g, '')
    .replace(/-/g, '');

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
        const newAcc = `${acc}.${current}`;
        if (index && newAcc.length <= maxLengthWithDiff) return newAcc;
        if (!index) return newAcc;

        return acc;
      }

      return acc;
    }, '');
    
    if (newString.length > maxLength * 2) {
      const separatedText = newString.split('.');
      newString = separatedText.reduce((acc, current, index) => {
        const lengthForTheMoment = acc.length;
        if (lengthForTheMoment <= maxLength) {
          const newAcc = `${acc}.${current}`;
          if (index && newAcc.length <= maxLengthWithDiff) return newAcc;
          if (!index) return newAcc;
  
          return acc;
        }
  
        return acc;
      }, '');
    }
  }
  
  newString = newString
    .replace(/\'/g, '')
    .replace(/\.\./g, '.')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s]/g, '')
    .replace(/^\./g, '')
    .replace(/\*/g, '')
    .replace(/http(s)?:\/\/(www.)?/, '');

  return newString;
};
