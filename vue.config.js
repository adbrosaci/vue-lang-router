const StyleLintPlugin = require('stylelint-webpack-plugin');
const path = require('path');

module.exports = {
	configureWebpack: {
		plugins: [
			new StyleLintPlugin({
				files: [ 'src/**/*.{vue,htm,html,css,sss,less,scss,sass}' ],
				fix: true,
			}),
		],
		resolve: {
			alias: {
				'@lang': path.resolve(__dirname, './src/lang'),
			},
			extensions: [ '.js', '.json' ],
		},
	},
	runtimeCompiler: true,
	chainWebpack: config => {
		config.module.rule('eslint').use('eslint-loader').options({
			fix: true,
		});
	},
};
