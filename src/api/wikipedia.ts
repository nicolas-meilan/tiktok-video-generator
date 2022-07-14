import axios from 'axios';
import { WikiPage } from '../types/wikipedia';

const WIKIPEDIA_API_URL = 'https://es.wikipedia.org/api/rest_v1/';
const RANDOM_CONTENT = 'page/random/summary';

export const getRandomDefinition : () => Promise<WikiPage> = async () => {
  const response = await axios.get(`${WIKIPEDIA_API_URL}${RANDOM_CONTENT}`);

  return {
    title: response.data.title,
    extract: response.data.extract,
    imageUrl: response.data.originalimage.source,
  };
};
