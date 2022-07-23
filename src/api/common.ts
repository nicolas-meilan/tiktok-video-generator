import { Readable } from 'stream';

import axios from 'axios';

export const openWeb = async (url: string): Promise<string> => {
  const { data } = await axios.get(url);

  return data;
};

export const downloadImage = async (url: string): Promise<Readable> => {
  const imageUrl = url.replace(/(\.webp)$/, '');

  const { data }: { data: ArrayBuffer } = await axios.get(imageUrl, {
    responseType: 'arraybuffer',
  });

  return Readable.from(Buffer.from(data));
};
