import fs from 'fs';

import {
  TMP_DIR,
} from '../constants';
import {
  generateVideo,
  generateSpeech,
  getDurationOfMedia,
} from '../media';

const mocksConfigBase = {
  mockFsExistsSync: false,
};

const mocksConfig = { ...mocksConfigBase };

jest.mock('fs', () => {
  const originalFs = jest.requireActual('fs');

  return {
    ...originalFs,
    mkdirSync: jest.fn(),
    existsSync: jest.fn((path) => (mocksConfig.mockFsExistsSync
      ? false
      : originalFs.existsSync(path))),
  };
});

jest.mock('../constants', () => ({
  ...jest.requireActual('../constants'),
  TMP_DIR: './assets/__mocks__',
}));

jest.mock('../api/common', () => ({
  downloadImage: jest.fn(),
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
  beforeEach(() => {
    mocksConfig.mockFsExistsSync = mocksConfigBase.mockFsExistsSync;
  });

  afterEach(() => {
    mocksConfig.mockFsExistsSync = mocksConfigBase.mockFsExistsSync;
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
      imagePath: `${TMP_DIR}/image.jpeg`,
    });

    const mockedStream = fs.readFileSync(`${TMP_DIR}/videoWithImage.mp4`);
    const resultStream = fs.readFileSync(videoPath);
    expect(mockedStream.toString()).toMatch(resultStream.toString());
  });

  it('generateVideo with image url', async () => {
    const videoPath = await generateVideo({
      audioPath: `${TMP_DIR}/mockSpeech.mp3`,
      videoPath: './assets/videoBase.mp4',
      imagePath: '',
      imageIsUrl: true,
    });

    const mockedStream = fs.readFileSync(`${TMP_DIR}/videoWithoutImage.mp4`);
    const resultStream = fs.readFileSync(videoPath);
    expect(mockedStream.toString()).toMatch(resultStream.toString());
  });

  it('generateVideo without tmp folder', async () => {
    mocksConfig.mockFsExistsSync = true;
    const videoPath = await generateVideo({
      audioPath: `${TMP_DIR}/mockSpeech.mp3`,
      videoPath: './assets/videoBase.mp4',
      imagePath: `${TMP_DIR}/image.jpeg`,
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

  it('getDurationOfMedia catch error', (done) => {
    getDurationOfMedia('unavailableFile')
      .catch(() => {
        done();
      });
  });

  it('generateSpeech', async () => {
    const audioPath = await generateSpeech('1234');

    const mockedStream = fs.readFileSync(`${TMP_DIR}/mockSpeech.mp3`);
    const resultStream = fs.readFileSync(audioPath);
    expect(mockedStream.toString()).toMatch(resultStream.toString());
  });

});
