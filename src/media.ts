import googleTextToSpeech, { protos } from '@google-cloud/text-to-speech';
import fs from 'fs';
import videoshow from 'videoshow';
import getMP3Duration from 'get-mp3-duration';

const DEFAULT_LANGUAGE_CODE = 'es';

const DEFAULT_IMAGE_PATH = './assets/defaultVideoImage.png';
const TMP_DIR = './tmp';
const SPEECH_FILE = 'speech.mp3';
const VIDEO_FILE = 'video.mp4';

const S_MS_FACTOR = 1000;

const ttsClient = new googleTextToSpeech.TextToSpeechClient();

export const generateSpeech = async (text: string, languageCode: string = DEFAULT_LANGUAGE_CODE): Promise<Uint8Array> => {
  const ttsRequest = {
    input: { text },
    voice: { languageCode },
    audioConfig: { audioEncoding: protos.google.cloud.texttospeech.v1.AudioEncoding.MP3 },
  };

  const [ response ] = await ttsClient.synthesizeSpeech(ttsRequest);

  return response.audioContent! as Uint8Array;

};

export const generateVideo = ({
  image,
  audio,
} : {
  image?: string;
  audio?: string | Uint8Array;
} = {}) : Promise<void> => new Promise((res, rej) => {
  const videoImage = image || DEFAULT_IMAGE_PATH;
  const defaultAudioPath = `${TMP_DIR}/${SPEECH_FILE}`
  const videoAudio = audio || defaultAudioPath;
  const audioIsPath = typeof audio === 'string';
  const audioBuffer = audioIsPath  ? fs.readFileSync(videoAudio as string) : videoAudio;
  const audioDuration = Math.ceil(getMP3Duration(audioBuffer) / S_MS_FACTOR);

  const options = {
    loop: audioDuration,
    size: '1080x1920'
  };

  if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR);
  }

  if (audioIsPath) {
    return videoshow([videoImage], options).audio(videoAudio).save(`${TMP_DIR}/${VIDEO_FILE}`)
      .on('end', res)
      .on('error', rej);
  }

  fs.writeFileSync(`${TMP_DIR}/${SPEECH_FILE}`, audio as Uint8Array, 'binary');

  return videoshow([videoImage], options).audio(defaultAudioPath).save(`${TMP_DIR}/${VIDEO_FILE}`)
    .on('end', res)
    .on('error', rej);
});