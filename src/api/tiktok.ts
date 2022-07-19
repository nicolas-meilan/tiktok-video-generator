import fs from 'fs';

import axios, { AxiosError } from 'axios';
import FormData from 'form-data';
import keytar from 'keytar';

import {
  TiktokUserAuth,
  TiktokStatusQR,
  TiktokQR,
} from '../types/tiktok';

import {
  ACCOUNT_STORAGE,
  ACCESS_TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
} from './../constants';

const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const APP_URL = process.env.APP_URL;

const BASE_URL = 'https://open-api.tiktok.com/';

const O_AUTH_URL = 'oauth/';
const QR_URL = 'v0/oauth/';

const VIDEO_URL = 'share/video/';

const tiktokAuthHttp = axios.create();

const FORM_DATA_CONTENT_TYPE = 'multipart/form-data';

const changeAccessTokenFromUrl = (url: string, accessToken: string): string => {
  const accessTokenParamRegex = /access_token=.+/;
  const accessTokenParamRegexWithAnd = /access_token=.+&/;
  const hasAccessTokenOnFinal = !url.match(accessTokenParamRegexWithAnd);

  const newAccessTokenParam = `access_token=${accessToken}${hasAccessTokenOnFinal ? '' : '&'}`;

  return url.replace(hasAccessTokenOnFinal
    ? accessTokenParamRegex
    : accessTokenParamRegexWithAnd,
  newAccessTokenParam);
};

const refreshAccessToken = async (refreshToken: string): Promise<TiktokUserAuth> => {
  const response = await axios.post(
    `${BASE_URL}${O_AUTH_URL}refresh_token/?client_key=${TIKTOK_CLIENT_KEY}&refresh_token=${refreshToken}&grant_type=refresh_token`,
  );

  const { data } = response.data;

  const errorCode = data.error_code;
  const errorDescription = data.description;

  if (errorCode) throw new Error(errorDescription);

  return {
    accessToken: response.data.data.access_token,
    refreshToken: response.data.data.refresh_token,
    userId: response.data.data.open_id,
  };
};

const onTiktokRequestError = async (error: AxiosError) => {
  const UnauthorizedErrorCode = error.response?.status === 401;

  if (!UnauthorizedErrorCode) throw error;

  const refreshToken = await keytar.getPassword(REFRESH_TOKEN_STORAGE_KEY, ACCOUNT_STORAGE);

  if (!refreshToken) throw error;

  const { accessToken } = await refreshAccessToken(refreshToken);

  await keytar.setPassword(ACCESS_TOKEN_STORAGE_KEY, ACCOUNT_STORAGE, accessToken);

  const originalRequest = error.config;
  originalRequest.url = changeAccessTokenFromUrl(originalRequest.url!, accessToken);

  if (originalRequest.headers?.['Content-Type'] === FORM_DATA_CONTENT_TYPE) {
    const { videoPath } = originalRequest.params;
    const data = new FormData();
    data.append('video', fs.createReadStream(videoPath));
    originalRequest.data = data;
  }

  return axios(originalRequest);
};

tiktokAuthHttp.interceptors.response.use((response) => response, onTiktokRequestError);

// Auth endpoints

export const obtainUserTokens = async (userCode: string): Promise<TiktokUserAuth> => {
  const response = await axios.post(
    `${BASE_URL}${O_AUTH_URL}access_token?client_key=${TIKTOK_CLIENT_KEY}&client_secret=${TIKTOK_CLIENT_SECRET}&code=${userCode}&grant_type=authorization_code`,
  );

  return {
    accessToken: response.data.data.access_token,
    refreshToken: response.data.data.refresh_token,
    userId: response.data.data.open_id,
  };
};

export const revokeTokens = async (accessToken: string, userId: string) => {
  const revokeTokensUrl = `${BASE_URL}${O_AUTH_URL}revoke/?access_token=${accessToken}&open_id=${userId}`;
  await axios.post(revokeTokensUrl);
};

export const getQR = async (): Promise<TiktokQR> => {
  const response = await axios.get(
    `${BASE_URL}${QR_URL}get_qrcode?client_key=${TIKTOK_CLIENT_KEY}&scope=video.upload&next=${APP_URL}`,
  );

  return {
    scanQR: response.data.data.scan_qrcode_url,
    token: response.data.data.token,
  };

};

export const checkQR = async (token: string): Promise<TiktokStatusQR> => {
  const response = await axios.get(
    `${BASE_URL}${QR_URL}check_qrcode?client_key=${TIKTOK_CLIENT_KEY}&scope=video.upload&next=${APP_URL}&token=${token}`,
  );

  const redirectUrl = response.data.data.redirect_url || '';

  const clientCode = redirectUrl.replace(`${APP_URL}?code=`, '').split('&')[0]; // obtain code from url

  return {
    clientCode,
    clientTicket: response.data.data.client_ticket,
    status: response.data.data.status,
  };
};

// Video endpoint

export const uploadVideo = async (accessToken: string, userId: string, videoPath: string): Promise<void> => {
  const uploadVideoUrl = `${BASE_URL}${VIDEO_URL}upload/?access_token=${accessToken}&open_id=${userId}`;

  const body = new FormData();
  body.append('video', fs.createReadStream(videoPath));

  await tiktokAuthHttp.post(
    uploadVideoUrl, body, {
      params: { videoPath }, // send a param to the interceptor
      headers: { 'Content-Type': FORM_DATA_CONTENT_TYPE },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
};
