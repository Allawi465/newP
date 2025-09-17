import { defineConfig } from 'vite'
export default defineConfig(({ mode }) => ({
    base: mode === 'production' ? '/newP/' : '/',
    server: {
        host: true,  // Or specify '0.0.0.0'
    },
}))