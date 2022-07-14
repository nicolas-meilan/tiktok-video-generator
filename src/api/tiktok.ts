import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import {
  TiktokUserAuth,
  TiktokStatusQR,
  TiktokQR
} from '../types/tiktok';

const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const APP_URL = process.env.APP_URL;

const BASE_URL = 'https://open-api.tiktok.com/';

const O_AUTH_URL = 'oauth/';
const QR_URL = 'v0/oauth/';

const VIDEO_URL = 'share/video/';

// Auth endpoints

export const obtainUserTokens = async (userCode: string): Promise<TiktokUserAuth> => {
  const response = await axios.post(
    `${BASE_URL}${O_AUTH_URL}access_token?client_key=${TIKTOK_CLIENT_KEY}&client_secret=${TIKTOK_CLIENT_SECRET}&code=${userCode}&grant_type=authorization_code`
  );

  return {
    accessToken: response.data.data.access_token,
    refreshToken: response.data.data.refresh_token,
    userId: response.data.data.open_id,
  };
};

export const refreshUserToken = async (refreshToken: string): Promise<TiktokUserAuth> => {
  const response = await axios.post(
    `${BASE_URL}${O_AUTH_URL}refresh_token?client_key=${TIKTOK_CLIENT_KEY}&refresh_token==${refreshToken}&grant_type=refresh_token`
  );

  return {
    accessToken: response.data.data.access_token,
    refreshToken: response.data.data.refresh_token,
    userId: response.data.data.open_id,
  };
};

export const getQR = async (): Promise<TiktokQR> => {
  const response = await axios.get(
    `${BASE_URL}${QR_URL}get_qrcode?client_key=${TIKTOK_CLIENT_KEY}&scope=video.upload&next=${APP_URL}`,
  );

    return {
      scanQR: response.data.data.scan_qrcode_url,
      token: response.data.data.token,
    }

};

export const checkQR = async (token: string): Promise<TiktokStatusQR> => {
  const response = await axios.get(
    `${BASE_URL}${QR_URL}check_qrcode?client_key=${TIKTOK_CLIENT_KEY}&scope=video.upload&next=${APP_URL}&token=${token}`
  );
  
  const redirectUrl = response.data.data.redirect_url || '';

  const clientCode = redirectUrl.replace(`${APP_URL}?code=`, '').split('&')[0]; // obtain code from url

  return {
    clientCode,
    clientTicket: response.data.data.client_ticket,
    status: response.data.data.status,
  };
}

// Video endpoint

export const uploadVideo = async (accessToken: string, userId: string, videoPath: string): Promise<void> => {
  const uploadVideoUrl = `${BASE_URL}${VIDEO_URL}upload/?access_token=${accessToken}&open_id=${userId}`;

  const body = new FormData();
  body.append('video', fs.createReadStream(videoPath));

  await axios.post(
    uploadVideoUrl, body, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
  );
};
