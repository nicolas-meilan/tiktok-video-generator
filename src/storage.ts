import { LocalStorage } from 'node-localstorage';

import { TMP_DIR } from './constants';

const storage = new LocalStorage(`${TMP_DIR}/storage`);

export default storage;
