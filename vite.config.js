import { defineConfig } from 'vite'
/* import tailwindcss from '@tailwindcss/vite' */

export default defineConfig(({ mode }) => ({
    base: mode === 'production' ? '/newP/' : '/',
    server: { host: true },
    /*   plugins: [tailwindcss()], */
}))