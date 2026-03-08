import * as migration_20260308_061623_initial from './20260308_061623_initial';
import * as migration_20260308_215219 from './20260308_215219';

export const migrations = [
  {
    up: migration_20260308_061623_initial.up,
    down: migration_20260308_061623_initial.down,
    name: '20260308_061623_initial',
  },
  {
    up: migration_20260308_215219.up,
    down: migration_20260308_215219.down,
    name: '20260308_215219'
  },
];
