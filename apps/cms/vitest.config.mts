import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    // Payload and wrangler's esbuild need real Node globals; jsdom's TextEncoder breaks them
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/int/**/*.int.spec.ts'],
    // Files share one database; in parallel each would push the schema and race on CREATE TYPE
    fileParallelism: false,
  },
})
