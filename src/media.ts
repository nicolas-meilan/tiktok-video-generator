import fs from 'fs';

import googleTextToSpeech, { protos } from '@google-cloud/text-to-speech';
import ffmpeg from 'fluent-ffmpeg';

import {
  TMP_DIR,
  SPEECH_FILE,
  VIDEO_FILE,
  TIKTOK_RESOLUTION,
  TIKTOK_ASPECT_RATIO,
} from './constants';


const DEFAULT_LANGUAGE_CODE = 'es';

const DEFAULT_VIDEO_PATH = './assets/videoBase.mp4';

const ttsClient = new googleTextToSpeech.TextToSpeechClient();

export const generateSpeech = async (text: string, languageCode: string = DEFAULT_LANGUAGE_CODE): Promise<string> => {
  const ttsRequest = {
    input: { text },
    voice: { languageCode },
    audioConfig: { audioEncoding: protos.google.cloud.texttospeech.v1.AudioEncoding.MP3 },
  };

  const [response] = await ttsClient.synthesizeSpeech(ttsRequest);

  const audioFile = `${TMP_DIR}/${SPEECH_FILE}`;
  fs.writeFileSync(audioFile, response.audioContent! as Uint8Array, 'binary');

  return audioFile;
};

const getDurationOfMedia = (mediaPath: string): Promise<number> => new Promise((resolve, reject) => {
  ffmpeg.ffprobe(mediaPath, (err, metadata) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(metadata.format.duration || 0);
  });
});

export const generateVideo = async ({
  videoPath,
  audioPath,
}: {
  videoPath?: string;
  audioPath?: string;
} = {}): Promise<string> => {
  const videoBase = videoPath || DEFAULT_VIDEO_PATH;
  const defaultAudioPath = `${TMP_DIR}/${SPEECH_FILE}`;
  const videoAudio = audioPath || defaultAudioPath;

  const audioDuration = await getDurationOfMedia(videoAudio);

  if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR);
  }

  const outputFile = `${TMP_DIR}/${VIDEO_FILE}`;
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(videoAudio)
      .input(videoBase).inputOption(['-stream_loop -1'])
      .complexFilter({
        filter: 'amix', options: { duration: 'first', weights: '1 0' },
      }).size(TIKTOK_RESOLUTION).aspect(TIKTOK_ASPECT_RATIO).duration(audioDuration)
      .on('end', () => resolve(outputFile))
      .on('error', reject)
      .save(outputFile);
  });
};

