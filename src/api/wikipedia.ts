import axios from 'axios';

const WIKIPEDIA_API_URL = 'https://es.wikipedia.org/api/rest_v1/';

const RANDOM_CONTENT = 'page/random/summary';

type WikiPage = {
  title: string;
  extract: string;
  imageUrl: string;
};

export const getRandomDefinition : () => Promise<WikiPage> = async () => {
  const response = await axios.get(`${WIKIPEDIA_API_URL}${RANDOM_CONTENT}`);

  return {
    title: response.data.title,
    extract: response.data.extract,
    imageUrl: response.data.originalimage.source,
  };
};
