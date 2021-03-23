export const dateTimeFormats = {
	en: {
		long: {
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
		},
	},
	cs: {
		short: {
			weekday: 'long',
			hour: 'numeric',
			minute: 'numeric',
		},
	},
};

export const pluralizationRules = {
	en: () => 1,
	cs: choice => {
		if (choice === 0) { return 0; }
		else { return 1; }
	},
	ru: () => 2,
};
