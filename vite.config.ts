import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from "path";
import dns from "dns";
dns.setDefaultResultOrder("verbatim")

// https://vitejs.dev/config/
export default defineConfig({
  resolve:{
    alias:{
      'src' : path.resolve(__dirname, './src')
    },
  },
  build:{
    chunkSizeWarningLimit: 4000,
    commonjsOptions: {
      ignore: ["protvista-uniprot"],
  },

  },

  plugins: [react()],
})
