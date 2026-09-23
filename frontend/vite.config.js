import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // AgriPulse keeps a single .env at the repo root. Point Vite at the
  // parent directory so VITE_API_URL is read from that shared file.
  // (Vite only exposes VITE_-prefixed vars to the client, so the API
  // keys in the same file are never bundled.)
  envDir: '..',
})
