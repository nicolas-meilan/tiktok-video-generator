import { getRandomDefinition } from './api/wikipedia';
import { generateSpeech, generateVideo } from './media';
import { compactString } from './utils/formatter';

getRandomDefinition().then(async (res) => {
  const audio = await generateSpeech(compactString(res.extract));
  generateVideo({ audio });
});
