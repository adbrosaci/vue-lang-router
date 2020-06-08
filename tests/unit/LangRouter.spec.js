import Vue from 'vue';
import VueRouter from 'vue-router';
import LangRouter from '@/plugin';

import routes from '../setup/routes';
import translations from '../setup/translations';
import localizedURLs from '../setup/localized-urls';


// Setup

const defaultLanguage = 'cs';

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

	test('translates path correctly', () => {
		expect(LangRouter.__get__('translatePath')('/user/:slug/info', 'cs')).toBe('/uzivatel/:slug/detail');
		expect(LangRouter.__get__('translatePath')('/user/:slug/info', 'ru')).toBe('/user/:slug/informatsiya');
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
});
