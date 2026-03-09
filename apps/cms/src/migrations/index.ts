import * as migration_20260309_232427_init from './20260309_232427_init';

export const migrations = [
  {
    up: migration_20260309_232427_init.up,
    down: migration_20260309_232427_init.down,
    name: '20260309_232427_init'
  },
];
