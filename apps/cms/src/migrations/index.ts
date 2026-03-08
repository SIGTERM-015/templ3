import * as migration_20260308_061623_initial from './20260308_061623_initial';

export const migrations = [
  {
    up: migration_20260308_061623_initial.up,
    down: migration_20260308_061623_initial.down,
    name: '20260308_061623_initial'
  },
];
