import { compactString } from '../formatter';

describe('formatter tests', () => {
  it('compactString', () => {
    const strToCompact = 'Hola, coma y espacio. punto y espacio, punto final "hola" -guion-.';
    const strResult = 'Hola,coma y espacio.punto y espacio,punto final hola guion';
    expect(compactString(strToCompact)).toMatch(strResult);
  });

  it('compactString void', () => {
    const strToCompact = '';
    expect(compactString(strToCompact)).toMatch(strToCompact);
  });
});
