import Test from './Test.vue';

export default [
	{
		path: '/about',
		name: 'About page',
		component: () => import('./Test.vue'),
	},
	{
		path: '/user/:slug',
		name: 'User page',
		component: {
			template: '<router-view/>',
		},
		children: [
			{
				path: 'info',
				name: 'User info',
				component: Test,
			},
		],
	},
];
