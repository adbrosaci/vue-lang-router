const StyleLintPlugin = require('stylelint-webpack-plugin');

module.exports = {
	configureWebpack: {
		plugins: [
			new StyleLintPlugin({
				files: [ 'src/**/*.{vue,htm,html,css,sss,less,scss,sass}' ],
				fix: true,
			}),
		],
	},
	chainWebpack: config => {
		config.module.rule('eslint').use('eslint-loader').options({
			fix: true,
		});
	},
};