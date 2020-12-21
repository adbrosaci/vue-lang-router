import { createWebHistory } from 'vue-router';
import { createLangRouter } from '@/plugin';
import { default as internal } from '@/plugin';

import routes from '../setup/routes';
import translations from '../setup/translations';
import localizedURLs from '../setup/localized-urls';


// Setup
const defaultLanguage = 'en';

const langRouterOptions = {
	defaultLanguage,
	translations,
	localizedURLs,
};
const routerOptions = {
	routes,
	history: createWebHistory(process.env.BASE_URL),
};

const router = createLangRouter(langRouterOptions, routerOptions);

const vueMock = {
	$router: router,
	$route: {
		get path () {
			return router.currentRoute._value.path;
		},
	},
};

const localizePath = (path, lang) => {
	return internal.__get__('localizePath').call(vueMock, path, lang);
};


// Tests
describe('General', () => {

	test('translations are passed in correctly', () => {
		expect(internal.__get__('translations')).toEqual(translations);
	});

	test('localizedURLs are passed in correctly', () => {
		expect(internal.__get__('localizedURLs')).toEqual(localizedURLs);
	});

	test('defaultLanguage is passed in correctly', () => {
		expect(internal.__get__('defaultLanguage')).toEqual(defaultLanguage);
	});

});


describe('LangRouter', () => {

	test('passes in router options correctly', () => {
		expect(router.options).toEqual(routerOptions);
	});

	test('generates correct router aliases', () => {
		expect(routes[0].alias).toEqual([
			'/en/about-replaced',
			'/cs/o-nas',
			'/ru/about',
		]);
		expect(routes[1].alias).toEqual([
			'/en/user/:slug',
			'/cs/uzivatel/:slug',
			'/ru/user/:slug',
		]);
		expect(routes[1].children[0].alias).toEqual([
			'detail',
			'informatsiya',
		]);
	});

	test('gets preffered language from browser', () => {
		Object.defineProperties(window.navigator, {
			browserLanguage: {
				value: 'ru',
			},
			language: {
				value: undefined,
			},
			languages: {
				value: null,
				configurable: true,
			},
		});
		expect(internal.__get__('getPrefferedLanguage')()).toBe('ru');

		Object.defineProperty(window.navigator, 'languages', {
			value: [
				'cs-CZ',
				'en-US',
			],
			configurable: true,
		});
		expect(internal.__get__('getPrefferedLanguage')()).toBe('cs');
	});

	test('localizes path correctly', () => {
		expect(localizePath('/about', 'ru')).toBe('/ru/about');
		expect(localizePath('/cs/o-nas', 'en')).toBe('/en/about-replaced');
		expect(localizePath('/cs/o-nas', 'cs')).toBe('/cs/o-nas');
		expect(localizePath('/en/about-replaced', 'en')).toBe('/en/about-replaced');

		expect(localizePath('/user/2/info', 'ru')).toBe('/ru/user/2/informatsiya');
		expect(localizePath('/user/john-smith', 'en')).toBe('/user/john-smith');
		expect(localizePath('/user/john-smith', 'cs')).toBe('/cs/uzivatel/john-smith');
		expect(localizePath('/ru/user/6/informatsiya', 'cs')).toBe('/cs/uzivatel/6/detail');

		expect(localizePath('/ru/user/should-not-be-replaced/informatsiya', 'cs')).toBe('/cs/uzivatel/should-not-be-replaced/detail');
	});

	test('localizes path with query correctly', () => {
		expect(localizePath('/about/?q=test', 'ru')).toBe('/ru/about/?q=test');
		expect(localizePath('/cs/o-nas?q=test', 'en')).toBe('/en/about-replaced?q=test');

		expect(localizePath('/about/#hash', 'ru')).toBe('/ru/about/#hash');
		expect(localizePath('/cs/o-nas#hash', 'en')).toBe('/en/about-replaced#hash');

		expect(localizePath('/about/?q=test#hash', 'ru')).toBe('/ru/about/?q=test#hash');
		expect(localizePath('/cs/o-nas?q=test#hash', 'en')).toBe('/en/about-replaced?q=test#hash');
	});

	test('provides error message when unable to match route', () => {
		const originalConsoleError = console.error; // Detect error messages
		console.error = jest.fn();

		const originalConsoleWarning = console.warn; // Get rid of Vue Router warning in tests
		console.warn = jest.fn();

		expect(localizePath('/cs/undefined-path/detail', 'en')).toBe('/en/undefined-path/info');
		expect(localizePath('/cs/undefined-path/detail', 'ru')).toBe('/ru/undefined-path/informatsiya');
		expect(console.error).toHaveBeenCalledTimes(2);

		console.error = originalConsoleError;
		console.warn = originalConsoleWarning;
	});
});
