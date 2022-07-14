export type TiktokUserAuth = {
  userId: string;
  accessToken: string;
  refreshToken: string;
};

export type TiktokQR = {
  scanQR: string;
  token: string;
};

export type TiktokStatusQR = {
  clientTicket?: string;
  clientCode?: string;
  status: string;
};
