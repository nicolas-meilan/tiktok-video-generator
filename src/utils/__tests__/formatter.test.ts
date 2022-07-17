import { compactString } from '../formatter';

describe('formatter tests', () => {
  it('compactString', () => {
    const strToCompact = 'Hola, coma y espacio. punto y espacio, punto final.';
    const strResult = 'Hola,coma y espacio.punto y espacio,punto final';
    expect(compactString(strToCompact)).toMatch(strResult);
  });

  it('compactString void', () => {
    const strToCompact = '';
    expect(compactString(strToCompact)).toMatch(strToCompact);
  });
});
