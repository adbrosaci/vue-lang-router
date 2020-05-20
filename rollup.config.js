import commonjs from '@rollup/plugin-commonjs'; // Convert CommonJS modules to ES6
import vue from 'rollup-plugin-vue'; // Handle .vue SFC files
import buble from '@rollup/plugin-buble'; // Transpile/polyfill with reasonable browser support

export default {
	input: 'src/plugin/index.js',
	output: [
		{
			file: 'dist/lang-router.umd.js',
			format: 'umd',
			name: 'LangRouter',
		},
		{
			file: 'dist/lang-router.esm.js',
			format: 'es',
		},
		{
			file: 'dist/lang-router.js',
			format: 'iife',
		},
	],
	plugins: [
		commonjs(),
		vue({
			css: true, // Dynamically inject css as a <style> tag
			compileTemplate: true, // Explicitly convert template to render function
		}),
		buble(), // Transpile to ES5
	],
};
