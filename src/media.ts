import fs from 'fs';

import googleTextToSpeech, { protos } from '@google-cloud/text-to-speech';
import getMP3Duration from 'get-mp3-duration';
import videoshow from 'videoshow';

import {
  TMP_DIR,
  SPEECH_FILE,
  VIDEO_FILE,
} from './constants';

const DEFAULT_LANGUAGE_CODE = 'es';

const DEFAULT_IMAGE_PATH = './assets/defaultVideoImage.png';

const S_MS_FACTOR = 1000;

const ttsClient = new googleTextToSpeech.TextToSpeechClient();

export const generateSpeech = async (text: string, languageCode: string = DEFAULT_LANGUAGE_CODE): Promise<Uint8Array> => {
  const ttsRequest = {
    input: { text },
    voice: { languageCode },
    audioConfig: { audioEncoding: protos.google.cloud.texttospeech.v1.AudioEncoding.MP3 },
  };

  const [response] = await ttsClient.synthesizeSpeech(ttsRequest);

  return response.audioContent! as Uint8Array;

};

export const generateVideo = ({
  image,
  audio,
}: {
  image?: string;
  audio?: string | Uint8Array;
} = {}): Promise<string> => new Promise((res, rej) => {
  const videoImage = image || DEFAULT_IMAGE_PATH;
  const defaultAudioPath = `${TMP_DIR}/${SPEECH_FILE}`;
  const videoAudio = audio || defaultAudioPath;
  const audioIsPath = typeof videoAudio === 'string';
  const audioBuffer = audioIsPath ? fs.readFileSync(videoAudio as string) : videoAudio;
  const audioDuration = Math.ceil(getMP3Duration(audioBuffer) / S_MS_FACTOR);

  const options = {
    loop: audioDuration,
    size: '1080x1920',
  };

  if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR);
  }

  if (audioIsPath) {
    videoshow([videoImage], options).audio(videoAudio).save(`${TMP_DIR}/${VIDEO_FILE}`)
      .on('end', res)
      .on('error', rej);

    return;
  }

  fs.writeFileSync(`${TMP_DIR}/${SPEECH_FILE}`, audio as Uint8Array, 'binary');

  videoshow([videoImage], options).audio(defaultAudioPath).save(`${TMP_DIR}/${VIDEO_FILE}`)
    .on('end', res)
    .on('error', rej);
});
