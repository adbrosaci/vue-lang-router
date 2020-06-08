export default {
	en: {
		name: 'English',
		load: () => Promise.resolve({
			test: {
				content: 'This is an about page',
			},
		}),
	},
	cs: {
		name: 'Česky',
		load: () => Promise.resolve({
			test: {
				content: 'Tohle je stránka O nás',
			},
		}),
	},
	ru: {
		name: 'русский',
		load: () => Promise.resolve({
			test: {
				content: 'Это страница О нас',
			},
		}),
	},
};
