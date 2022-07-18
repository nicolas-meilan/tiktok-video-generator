import { wikipediaPage } from '../__mocks__/wikipedia.mock';
import { getRandomDefinition } from '../wikipedia';


jest.mock('axios', () => ({
  get: async () => wikipediaPage,
}));

describe('wikipedia api tests', () => {
  it('getRandomDefinition', async () => {
    const page = await getRandomDefinition();

    const mockedResponse = {
      title: wikipediaPage.data.title,
      extract: wikipediaPage.data.extract,
      imageUrl: wikipediaPage.data.originalimage.source,
    };

    expect(page).toMatchObject(mockedResponse);
  });
});
