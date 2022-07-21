import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

import { openWeb } from './api/common';
import { getLatestNew } from './api/newsApi';
import { PREVIOUS_ARTICLE_URL_STORAGE_KEY } from './constants';
import storage from './storage';
import {
  compactString,
  formatStringFromRedeableHtml,
} from './utils/formatter';

const NEWS_ABOUT = 'ethereum%20OR%20crypto%20OR%20bitcoin%20OR%20ETH%20OR%20BTC%20OR%20coin';
const MAX_CHARS = 800;
const MAX_DIFF_ALLOWED = 100;

type Article = {
  imageUrl?: string;
  article: string;
  author: string;
};

export const getLatestArticle = async (): Promise<Article> => {
  const response = await getLatestNew(NEWS_ABOUT);

  const prevArticleUrl = storage.getItem(PREVIOUS_ARTICLE_URL_STORAGE_KEY);

  if (prevArticleUrl === response.articleUrl) throw new Error('Duplicated Article');

  const articleHtml = await openWeb(response.articleUrl);

  const dom = new JSDOM(articleHtml, {
    url: response.articleUrl,
  });

  const article = new Readability(dom.window.document).parse()?.textContent || '';

  const articleFormatted = compactString(formatStringFromRedeableHtml(article, {
    maxLength: MAX_CHARS,
    diffAllowed: MAX_DIFF_ALLOWED,
  }));

  const articleWithTitle = `${response.title}.${articleFormatted}`;

  storage.setItem(PREVIOUS_ARTICLE_URL_STORAGE_KEY, response.articleUrl);

  return {
    imageUrl: response.imageUrl,
    article: articleWithTitle,
    author: response.author,
  };
};
