import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.p12'],
  resolve: {
    alias: {
      '#minpath': path.resolve('node_modules/vfile/lib/minpath.browser.js'),
      '#minproc': path.resolve('node_modules/vfile/lib/minproc.browser.js'),
      '#minurl': path.resolve('node_modules/vfile/lib/minurl.browser.js'),
    }
  },
  css: {
    modules: {
      localsConvention: 'camelCase'
    }
  }
})
