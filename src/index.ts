import 'dotenv/config';

import { getRandomDefinition } from './api/wikipedia';
import { generateSpeech, generateVideo } from './media';
import {
  getUserTokens,
  loginWithQR,
  uploadVideo,
  // logout,
} from './tiktokManager';
import { compactString } from './utils/formatter';

const main = async (): Promise<void> => {
  try {
    const storageUserTokens = await getUserTokens();

    const tiktokUserTokens = storageUserTokens
      ? storageUserTokens
      : await loginWithQR();
  
  
    console.log('Logged in\nSearching random definition from wikipedia...');
    const wikiPage = await getRandomDefinition();
    console.log('Generating audio...');
    const audioPath = await generateSpeech(compactString(wikiPage.extract));
    console.log('Generating video...');
    const videoPath = await generateVideo({ audioPath, imagePath: wikiPage.imageUrl });
    console.log('Uploading video...');
    await uploadVideo(tiktokUserTokens.accessToken, tiktokUserTokens.userId, videoPath);
    console.log('Video uploaded');
  } catch (error) {
    console.error(error);
    // logout(); // TODO logout only when the refresh token fails by specific error.
  }
};

main();
