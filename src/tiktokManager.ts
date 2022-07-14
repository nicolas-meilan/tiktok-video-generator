import qrcode from 'qrcode-terminal';

import { getQR, checkQR, obtainUserTokens, uploadVideo as uploadVideoApi } from './api/tiktok';
import { TiktokUserAuth } from './types/tiktok';
import {
  TIKTOK_QR_POLLING_TIME,
  TIKTOK_QR_CONFIRMED,
} from './constants';

export const loginWithQR = async (): Promise<TiktokUserAuth> => {
  const { scanQR, token } = await getQR();

  await checkQR(token); // Is needed to initialize the QR code
  qrcode.setErrorLevel('H');
  qrcode.generate(scanQR, { small: true, });

  return new Promise((resolve, reject) => {
    const intervalRef = setInterval(async () => {
      try {
        const qrCheck = await checkQR(token);
        if (qrCheck.status === TIKTOK_QR_CONFIRMED) {
          clearInterval(intervalRef);
          const tiktokUserAuth = await obtainUserTokens(qrCheck.clientCode!);
          resolve(tiktokUserAuth);
        };
      } catch (error) {
        reject(error);
      }
    }, TIKTOK_QR_POLLING_TIME);
  });
};

export const uploadVideo = async (
  accessToken: string,
  userId: string,
  videoPath: string,
): Promise<void> => uploadVideoApi(accessToken, userId, videoPath);
