import * as migration_20260309_232427_init from './20260309_232427_init';
import * as migration_20261005_150656_payload_3_90 from './20261005_150656_payload_3_90';
import * as migration_20261006_090957_posts_autosave from './20261006_090957_posts_autosave';

export const migrations = [
  {
    up: migration_20260309_232427_init.up,
    down: migration_20260309_232427_init.down,
    name: '20260309_232427_init',
  },
  {
    up: migration_20261005_150656_payload_3_90.up,
    down: migration_20261005_150656_payload_3_90.down,
    name: '20261005_150656_payload_3_90',
  },
  {
    up: migration_20261006_090957_posts_autosave.up,
    down: migration_20261006_090957_posts_autosave.down,
    name: '20261006_090957_posts_autosave'
  },
];
