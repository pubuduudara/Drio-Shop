import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
            // Latin subsets only for now (§9.6). Adding Japanese means adding
            // a Noto Sans JP entry here — the `--font-display` indirection in
            // app.css already routes headings to it.
            fonts: [
                bunny('Cormorant Garamond', {
                    alias: 'cormorant',
                    weights: [500, 600],
                    subsets: ['latin', 'latin-ext'],
                }),
                bunny('Inter', {
                    alias: 'inter',
                    weights: [400, 500, 600],
                    subsets: ['latin', 'latin-ext'],
                }),
            ],
        }),
        inertia(),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
});
