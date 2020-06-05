import Vue from 'vue';
import VueRouter from 'vue-router';
import LangRouter from '@/plugin';

import translations from '@/lang/translations';
import localizedURLs from '@/lang/localized-urls';


// Setup

const defaultLanguage = 'cs';

Vue.use(LangRouter, {
	defaultLanguage,
	translations,
	localizedURLs,
});

const routes = [
	{
		path: '/about',
		name: 'About page',
		component: () => import(/* webpackChunkName: "about" */ '@/views/About.vue'),
	},
];

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

});
