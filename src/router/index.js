import { createWebHistory } from 'vue-router';
import { createLangRouter } from '../plugin';
import Home from '../views/Home.vue';

import translations from '../lang/translations';
import localizedURLs from '../lang/localized-urls';
import datetimeFormats from '../lang/datetimeFormats';


const routes = [
	{
		path: '/',
		name: 'Home page',
		component: Home,
		alias: '/home',
	},
	{
		path: '/about',
		name: 'About page',
		// route level code-splitting
		// this generates a separate chunk (about.[hash].js) for this route
		// which is lazy-loaded when the route is visited.
		component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
	},
	{
		path: '/user/:slug',
		name: 'User page',
		component: () => import('../views/User.vue'),
	},
	{
		path: '/pos/:id',
		name: 'Pos page',
		component: {
			template: '<router-view/>',
		},
		children: [
			{
				path: 'info',
				name: 'Pos info',
				component: () => import('../views/PosInfo.vue'),
			},
			{
				path: 'manager/:name',
				name: 'Pos manager',
				component: () => import('../views/PosManager.vue'),
			},
		],
	},
];


// Initiate router
const langRouterOptions = {
	defaultLanguage: 'en',
	translations,
	localizedURLs,
	i18nOptions: {
		datetimeFormats,
	},
};
const routerOptions = {
	routes,
	history: createWebHistory(process.env.BASE_URL),
};

const router = createLangRouter(langRouterOptions, routerOptions);

export default router;
