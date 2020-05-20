import commonjs from '@rollup/plugin-commonjs'; // Convert CommonJS modules to ES6
import vue from 'rollup-plugin-vue'; // Handle .vue SFC files
import buble from '@rollup/plugin-buble'; // Transpile/polyfill with reasonable browser support
import banner from 'rollup-plugin-banner'; // Add header to compiled JS files

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
	],
	plugins: [
		commonjs(),
		vue({
			css: true, // Dynamically inject css as a <style> tag
			compileTemplate: true, // Explicitly convert template to render function
		}),
		buble(), // Transpile to ES5
		banner({
			file: path.join(__dirname, 'rollup.banner.txt'),
		}),
	],
};
