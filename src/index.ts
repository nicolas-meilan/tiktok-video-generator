import 'dotenv/config'

import { getRandomDefinition } from './api/wikipedia';
import { generateSpeech, generateVideo } from './media';
import { loginWithQR, uploadVideo} from './tiktokManager';
import { compactString } from './utils/formatter';


loginWithQR()
  .then(async ({
    accessToken,
    userId,
    // refreshToken TODO
  }) => {
    console.log('Logged in\nSearching random definition from wikipedia...');
    const wikiPage = await getRandomDefinition();
    console.log('Generating audio...');
    const audio = await generateSpeech(compactString(wikiPage.extract));
    console.log('Generating video...');
    const videoPath = await generateVideo({ audio });
    console.log('Uploading video...');
    await uploadVideo(accessToken, userId, videoPath);
    console.log('Video uploaded');
  })
  .catch((error) => console.error(error));
