import fs from 'fs';

import {
  TMP_DIR,
} from '../constants';
import {
  generateVideo,
  generateSpeech,
  getDurationOfMedia,
} from '../media';

jest.mock('../constants', () => ({
  ...jest.requireActual('../constants'),
  TMP_DIR: './assets/__mocks__',
}));

jest.mock('@google-cloud/text-to-speech', () => {
  class TextToSpeechClient {
    synthesizeSpeech = async () => [{
      audioContent: Uint8Array.from(fs.readFileSync('./assets/__mocks__/mockSpeech.mp3')),
    }];
  }

  return {
    __esModule: true,
    default: {
      TextToSpeechClient,
    },
    protos: { google: { cloud: { texttospeech: { v1: { AudioEncoding: { MP3: ' MP3' } } } } } },
  };
});

describe('media tests', () => {
  afterEach(() => {
    const videoPath = `${TMP_DIR}/video.mp4`;
    const speechPath = `${TMP_DIR}/speech.mp3`;
    if (fs.existsSync(videoPath)) fs.rmSync(videoPath);
    if (fs.existsSync(speechPath)) fs.rmSync(speechPath);
  });

  it('generateVideo without image', async () => {
    const videoPath = await generateVideo({
      audioPath: `${TMP_DIR}/mockSpeech.mp3`,
      videoPath: './assets/videoBase.mp4',
    });
    const mockedStream = fs.readFileSync(`${TMP_DIR}/videoWithoutImage.mp4`);
    const resultStream = fs.readFileSync(videoPath);
    expect(mockedStream.toString()).toMatch(resultStream.toString());
  });

  it('generateVideo with image', async () => {
    const videoPath = await generateVideo({
      audioPath: `${TMP_DIR}/mockSpeech.mp3`,
      videoPath: './assets/videoBase.mp4',
      imagePath: `${TMP_DIR}/wikipediaImage.jpeg`,
    });

    const mockedStream = fs.readFileSync(`${TMP_DIR}/videoWithImage.mp4`);
    const resultStream = fs.readFileSync(videoPath);
    expect(mockedStream.toString()).toMatch(resultStream.toString());
  });

  it('getDurationOfMedia', async () => {
    const mediaDuration = 0.12;
    const duration = await getDurationOfMedia(`${TMP_DIR}/mockSpeech.mp3`);

    expect(duration).toEqual(mediaDuration);
  });

  it('generateSpeech', async () => {
    const audioPath = await generateSpeech('1234');

    const mockedStream = fs.readFileSync(`${TMP_DIR}/mockSpeech.mp3`);
    const resultStream = fs.readFileSync(audioPath);
    expect(mockedStream.toString()).toMatch(resultStream.toString());
  });

});
