import axios from 'axios';

export const openWeb = async (url: string): Promise<string> => {
  const { data } = await axios.get(url);

  return data;
};
