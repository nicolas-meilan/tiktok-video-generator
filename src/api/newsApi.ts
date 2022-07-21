import axios from 'axios';

const NEWS_API_KEY = process.env.NEWS_API_KEY;

const BASE_URL = 'https://newsapi.org/v2/';

type ArticleResponse = {
  articleUrl: string;
  imageUrl?: string;
  author: string;
  title: string;
};

export const getLatestNew = async (about: string): Promise<ArticleResponse> => {
  const response = await axios.get(`${BASE_URL}everything?apiKey=${NEWS_API_KEY}&q=${about}&searchIn=title,description&language=es&sortBy=publishedAt&pageSize=1`);

  const latest = response.data.articles[0];

  return {
    articleUrl: latest.url,
    imageUrl: latest.urlToImage,
    author: latest.author,
    title: latest.title,
  };
};
