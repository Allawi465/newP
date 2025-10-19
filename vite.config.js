import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
    base: mode === 'production' ? '/newP/' : '/',
    server: {
        host: '0.0.0.0', // equivalent to `host: true`
        port: 5173,       // optional, default is 5173
    }
}))