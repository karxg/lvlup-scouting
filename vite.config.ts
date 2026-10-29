/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Served at https://kfarrag.com/lvlup/ — every asset must resolve under this base.
export default defineConfig({
  base: '/lvlup/',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist/lvlup',
    emptyOutDir: true,
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
})
