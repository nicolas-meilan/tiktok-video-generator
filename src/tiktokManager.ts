import keytar from 'keytar';
import qrcode from 'qrcode-terminal';

import {
  getQR,
  checkQR,
  obtainUserTokens,
  uploadVideo as uploadVideoApi,
  revokeTokens,
} from './api/tiktok';
import {
  TIKTOK_QR_POLLING_TIME,
  TIKTOK_QR_CONFIRMED,
  ACCOUNT_STORAGE,
  ACCESS_TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  USER_ID_STORAGE_KEY,
} from './constants';
import { TiktokUserAuth } from './types/tiktok';

const setUserTokens = async (userAuth: TiktokUserAuth) => Promise.all([
  keytar.setPassword(ACCESS_TOKEN_STORAGE_KEY, ACCOUNT_STORAGE, userAuth.accessToken),
  keytar.setPassword(REFRESH_TOKEN_STORAGE_KEY, ACCOUNT_STORAGE, userAuth.refreshToken),
  keytar.setPassword(USER_ID_STORAGE_KEY, ACCOUNT_STORAGE, userAuth.userId),
]);

export const getUserTokens = async (): Promise<TiktokUserAuth | null> => {
  const [
    accessToken,
    refreshToken,
    userId,
  ] = await Promise.all([
    keytar.getPassword(ACCESS_TOKEN_STORAGE_KEY, ACCOUNT_STORAGE),
    keytar.getPassword(REFRESH_TOKEN_STORAGE_KEY, ACCOUNT_STORAGE),
    keytar.getPassword(USER_ID_STORAGE_KEY, ACCOUNT_STORAGE),
  ]);

  if (!accessToken || !refreshToken || !userId) return null;

  return {
    accessToken,
    refreshToken,
    userId,
  };
};

export const loginWithQR = async (): Promise<TiktokUserAuth> => {
  const { scanQR, token } = await getQR();

  await checkQR(token); // Is needed to initialize the QR code
  qrcode.setErrorLevel('H');
  qrcode.generate(scanQR, { small: true });

  return new Promise((resolve, reject) => {
    const intervalRef = setInterval(async () => {
      try {
        const qrCheck = await checkQR(token);
        if (qrCheck.status === TIKTOK_QR_CONFIRMED) {
          clearInterval(intervalRef);
          const tiktokUserAuth = await obtainUserTokens(qrCheck.clientCode!);
          await setUserTokens(tiktokUserAuth);
          resolve(tiktokUserAuth);
        }
      } catch (error) {
        reject(error);
      }
    }, TIKTOK_QR_POLLING_TIME);
  });
};

export const logout = async (): Promise<void> => {
  const userAuth = await getUserTokens();
  if (!userAuth) return;

  await revokeTokens(userAuth?.accessToken, userAuth?.refreshToken);
  
  await Promise.all([
    keytar.deletePassword(ACCESS_TOKEN_STORAGE_KEY, ACCOUNT_STORAGE),
    keytar.deletePassword(REFRESH_TOKEN_STORAGE_KEY, ACCOUNT_STORAGE),
    keytar.deletePassword(USER_ID_STORAGE_KEY, ACCOUNT_STORAGE),
  ]);

  return;
};

export const uploadVideo = async (
  accessToken: string,
  userId: string,
  videoPath: string,
): Promise<void> => uploadVideoApi(accessToken, userId, videoPath);
