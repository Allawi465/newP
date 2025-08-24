import { defineConfig } from 'vite'
export default defineConfig(({ mode }) => ({
    base: mode === 'production' ? '/newP/' : '/',
    server: {
        host: true,
        port: 5500,
        hmr: { host: '192.168.0.33', protocol: 'ws' } // or add clientPort if behind proxy
    }
}))