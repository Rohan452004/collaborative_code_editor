import react from "@vitejs/plugin-react"
import { fileURLToPath, URL } from "url"
import { defineConfig } from "vite"
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        nodePolyfills({
            protocolImports: true,
        }),
    ],
    build: {
        chunkSizeWarningLimit: 1600,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes("node_modules")) {
                        return id
                            .toString()
                            .split("node_modules/")[1]
                            .split("/")[0]
                            .toString()
                    }
                },
            },
        },
    },
    resolve: {
        alias: [
            {
                find: "@",
                replacement: fileURLToPath(new URL("./src", import.meta.url)),
            },
            {
                // Polyfill crypto module for compatibility
                find: 'crypto',
                replacement: 'crypto-browserify'
            }
        ],
    },
    preview: {
        port: 5173
    },
    server: {
        open: true,
    },
    define: {
        'process.env': {}, // sometimes required by dependencies using process.env
    },
})
