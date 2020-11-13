import Vue from 'vue';
import VueRouter from 'vue-router';
import LangRouter from '@/plugin';

import routes from '../setup/routes';
import translations from '../setup/translations';
import localizedURLs from '../setup/localized-urls';


// Setup

const defaultLanguage = 'en';

Vue.use(LangRouter, {
	defaultLanguage,
	translations,
	localizedURLs,
});

const router = new LangRouter({
	routes,
	mode: 'history',
});


// Tests

describe('General', () => {

	test('translations are passed in correctly', () => {
		expect(LangRouter.__get__('translations')).toEqual(translations);
	});

	test('localizedURLs are passed in correctly', () => {
		expect(LangRouter.__get__('localizedURLs')).toEqual(localizedURLs);
	});

	test('defaultLanguage is passed in correctly', () => {
		expect(LangRouter.__get__('defaultLanguage')).toEqual(defaultLanguage);
	});

});


describe('LangRouter', () => {

	test('is an instance of VueRouter', () => {
		expect(router).toBeInstanceOf(VueRouter);
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
		expect(LangRouter.__get__('getPrefferedLanguage')()).toBe('ru');

		Object.defineProperty(window.navigator, 'languages', {
			value: [
				'cs-CZ',
				'en-US',
			],
			configurable: true,
		});
		expect(LangRouter.__get__('getPrefferedLanguage')()).toBe('cs');
	});

	test('localizes path correctly', () => {
		const vueMock = {
			$router: router,
		};
		const localizePath = (path, lang) => {
			return LangRouter.__get__('localizePath').call(vueMock, path, lang);
		};

		expect(localizePath('/about', 'ru')).toBe('/ru/about');
		expect(localizePath('/cs/o-nas', 'en')).toBe('/en/about-replaced');
		expect(localizePath('/cs/o-nas', 'cs')).toBe('/cs/o-nas');
		expect(localizePath('/en/about-replaced', 'en')).toBe('/en/about-replaced');

		expect(localizePath('/user/2/info', 'ru')).toBe('/ru/user/2/informatsiya');
		expect(localizePath('/user/john-smith', 'en')).toBe('/user/john-smith');
		expect(localizePath('/user/john-smith', 'cs')).toBe('/cs/uzivatel/john-smith');
		expect(localizePath('/ru/user/6/informatsiya', 'cs')).toBe('/cs/uzivatel/6/detail');

		const originalConsoleError = console.error;
		console.error = jest.fn();

		expect(localizePath('/cs/undefined-path/detail', 'en')).toBe('/en/undefined-path/info');
		expect(localizePath('/cs/undefined-path/detail', 'ru')).toBe('/ru/undefined-path/informatsiya');
		expect(console.error).toHaveBeenCalledTimes(2);

		console.error = originalConsoleError;

		expect(localizePath('/ru/user/should-not-be-replaced/informatsiya', 'cs')).toBe('/cs/uzivatel/should-not-be-replaced/detail');
	});

	test('localizes path with query correctly', () => {
		const vueMock = {
			$router: router,
		};
		const localizePath = (path, lang) => {
			return LangRouter.__get__('localizePath').call(vueMock, path, lang);
		};

		expect(localizePath('/about/?q=test', 'ru')).toBe('/ru/about/?q=test');
		expect(localizePath('/cs/o-nas?q=test', 'en')).toBe('/en/about-replaced?q=test');

		expect(localizePath('/about/#hash', 'ru')).toBe('/ru/about/#hash');
		expect(localizePath('/cs/o-nas#hash', 'en')).toBe('/en/about-replaced#hash');

		expect(localizePath('/about/?q=test#hash', 'ru')).toBe('/ru/about/?q=test#hash');
		expect(localizePath('/cs/o-nas?q=test#hash', 'en')).toBe('/en/about-replaced?q=test#hash');
	});
});
