import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteEslint from 'vite-plugin-eslint';
import Pages from 'vite-plugin-pages';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src')
		}
	},
	css: {
		preprocessorOptions: {
			less: {
				math: 'parens-division'
			}
		}
	},
	plugins: [
		react(),
		viteEslint(),
		Pages({
			// dirs: 'src/pages', 默认
			exclude: ['**/components/*.tsx']
		})
	],
	server: {
		proxy: {
			// '/api': {
			// 	target: 'https://app.apifox.com/',
			// 	changeOrigin: true,
			// 	rewrite: path => path.replace(/^\/api/, '')
			// },
			'/mock': {
				target: 'http://127.0.0.1:4523',
				changeOrigin: true
				// rewrite: path => path.replace(/^\/mock/, '')
			}
		}
	}
});
