import en from './en.json';

export default {
	en: {
		name: 'English',
		messages: en,
	},
	cs: {
		name: 'Česky',
		load: () => { return import('./cs.json'); },
	},
};
