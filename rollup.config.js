import commonjs from '@rollup/plugin-commonjs'; // Convert CommonJS modules to ES6
import vue from 'rollup-plugin-vue'; // Handle .vue SFC files
import buble from '@rollup/plugin-buble'; // Transpile/polyfill with reasonable browser support
import banner from 'rollup-plugin-banner'; // Add header to compiled JS files
import { terser } from 'rollup-plugin-terser'; // Minification
import cleanup from 'rollup-plugin-cleanup'; // Code cleanup
import inject from '@rollup/plugin-inject'; // Import injection

const path = require('path');

const globals = {
	vue: 'Vue',
	'vue-i18n': 'VueI18n',
	'vue-router': 'VueRouter',
};

export default {
	input: 'src/plugin/index.js',
	external: [
		'vue',
		'vue-i18n',
		'vue-router',
	],
	output: [
		{
			file: 'dist/lang-router.umd.js',
			format: 'umd',
			name: 'LangRouter',
			exports: 'named',
			globals,
		},
		{
			file: 'dist/lang-router.esm.js',
			format: 'es',
		},
		{
			file: 'dist/lang-router.js',
			format: 'iife',
			name: 'LangRouter',
			exports: 'named',
			globals,
		},
		{
			file: 'dist/lang-router.min.js',
			format: 'iife',
			name: 'LangRouter',
			exports: 'named',
			globals,
			plugins: [ terser() ],
		},
	],
	plugins: [
		commonjs(),
		vue({
			css: true, // Dynamically inject css as a <style> tag
			template: {
				isProduction: true, // Force productiom mode
			},
		}),
		buble({
			objectAssign: '_spread', // Polyfill for spread operator
		}),
		inject({
			_spread: path.resolve('helpers/spread-polyfill.js'),
		}),
		banner({
			file: path.join(__dirname, 'rollup.banner.txt'),
		}),
		cleanup({
			comments: 'none',
			sourcemap: false,
			maxEmptyLines: 0,
		}),
	],
};
