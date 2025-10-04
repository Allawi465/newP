import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import dns from 'node:dns'  // Add this import

// Prefer IPv4 or enable Happy Eyeballs based on Node version
try {
    dns.setDefaultAutoSelectFamily(true);  // For Node 20+ (parallel IPv4/IPv6)
} catch (e) {
    dns.setDefaultResultOrder('ipv4first');  // Fallback for Node 17-19
}

export default defineConfig(({ mode }) => ({
    base: mode === 'production' ? '/newP/' : '/',
    server: { host: true },
    plugins: [tailwindcss()],
}))