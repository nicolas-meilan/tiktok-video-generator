import keytar from 'keytar';

import {
  getQR,
  checkQR,
  obtainUserTokens,
  uploadVideo as uploadVideoApi,
  revokeTokens,
} from '../api/tiktok';
import {
  TIKTOK_QR_CONFIRMED,
  TIKTOK_QR_POLLING_TIME,
  ACCESS_TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  USER_ID_STORAGE_KEY,
} from '../constants';
import {
  loginWithQR,
  getUserTokens,
  logout,
  uploadVideo,
} from '../tiktokManager';

const mocksConfigBase = {
  checkQRStatusSuccess: true,
  errorOnCheckQR: false,
  keytarVoid: false,
};

const mocksConfig = { ...mocksConfigBase };

const mockTiktokUserAuth = {
  userId: 'userId',
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
};

const mockKeytar = {
  [ACCESS_TOKEN_STORAGE_KEY]: mockTiktokUserAuth.accessToken,
  [REFRESH_TOKEN_STORAGE_KEY]: mockTiktokUserAuth.refreshToken,
  [USER_ID_STORAGE_KEY]: mockTiktokUserAuth.userId,
};

jest.mock('../constants', () => ({
  ...jest.requireActual('../constants'),
  TIKTOK_QR_POLLING_TIME: 0,
}));

jest.mock('keytar', () => ({
  getPassword: jest.fn((key: keyof typeof mockKeytar) => (mocksConfig.keytarVoid
    ? undefined
    : mockKeytar[key])),
  setPassword: jest.fn(),
  deletePassword: jest.fn(),
}));

jest.mock('../api/tiktok', () => ({
  getQR: jest.fn(async () => ({
    scanQR: 'scanQR',
    token: 'token',
  })),
  checkQR: jest.fn(async () => {
    if (mocksConfig.errorOnCheckQR) throw new Error('error');

    return {
      clientCode: 'clientCode',
      clientTicket: 'clientTicket',
      status: mocksConfig.checkQRStatusSuccess ? TIKTOK_QR_CONFIRMED : 'pending',
    };
  }),
  obtainUserTokens: jest.fn(async () => mockTiktokUserAuth),
  uploadVideo: jest.fn(async () => { }),
  revokeTokens: jest.fn(async () => { }),
}));

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

describe('tiktok manager tests', () => {
  beforeEach(() => {
    mocksConfig.checkQRStatusSuccess = mocksConfigBase.checkQRStatusSuccess;
    mocksConfig.errorOnCheckQR = mocksConfigBase.errorOnCheckQR;
    mocksConfig.keytarVoid = mocksConfigBase.keytarVoid;
    jest.clearAllMocks();
  });

  it('loginWithQR test qr login ok', async () => {
    const result = await loginWithQR();
    expect(getQR).toBeCalledTimes(1);
    expect(checkQR).toBeCalledTimes(2);
    expect(obtainUserTokens).toBeCalledTimes(1);
    expect(result).toMatchObject(mockTiktokUserAuth);
  });

  it('loginWithQR test qr login pending', async () => {
    mocksConfig.checkQRStatusSuccess = false;
    loginWithQR();
    await sleep(1000);
    expect(getQR).toBeCalledTimes(1);
    expect(checkQR).toHaveBeenCalled();
    expect(obtainUserTokens).not.toHaveBeenCalled();
    mocksConfig.checkQRStatusSuccess = true;
    await sleep(TIKTOK_QR_POLLING_TIME); // wait until loginWithQR finish the loop
    expect(obtainUserTokens).toHaveBeenCalled();
  });

  it('loginWithQR error checking qr', (done) => {
    mocksConfig.checkQRStatusSuccess = false;
    loginWithQR().catch((error) => {
      expect(getQR).toBeCalledTimes(1);
      expect(checkQR).toHaveBeenCalled();
      expect(obtainUserTokens).not.toHaveBeenCalled();
      expect(error.message).toMatch('error');
      done();
    });
    sleep(100).then(() => {
      mocksConfig.errorOnCheckQR = true;
    });
  });

  it('logout', async () => {
    await logout();
    expect(revokeTokens).toBeCalledTimes(1);
    expect(keytar.deletePassword).toBeCalledTimes(3);
  });

  it('logout fail (no tokens availables)', async () => {
    mocksConfig.keytarVoid = true;
    await logout();
    expect(revokeTokens).not.toHaveBeenCalled();
    expect(keytar.deletePassword).not.toHaveBeenCalled();
  });

  it('getUserTokens', async () => {
    const tokens = await getUserTokens();

    expect(tokens).toMatchObject(mockTiktokUserAuth);
  });

  it('getUserTokens void', async () => {
    mocksConfig.keytarVoid = true;
    const tokens = await getUserTokens();

    expect(tokens).toBeNull();
  });

  it('upload video', async () => {
    await uploadVideo(mockTiktokUserAuth.accessToken, mockTiktokUserAuth.userId, 'videoPath');

    expect(uploadVideoApi).toBeCalledTimes(1);
  });

});
