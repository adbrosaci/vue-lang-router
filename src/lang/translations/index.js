export default {
	en: {
		name: 'English',
		load: () => { return import('./en.json'); },
	},
	cs: {
		name: 'Česky',
		load: () => { return import('./cs.json'); },
	},
};
