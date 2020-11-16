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
	runtimeCompiler: true,
	chainWebpack: config => {
		config.module.rule('eslint').use('eslint-loader').options({
			fix: true,
		});
		config.module.rule('i18n').resourceQuery(/blockType=i18n/).type('javascript/auto').use('i18n').loader('@intlify/vue-i18n-loader').end();
	},
};
