import Vue from 'vue';
import VueI18n from 'vue-i18n';
import VueRouter from 'vue-router';

import LocalizedLink from './components/LocalizedLink.vue';
import LanguageSwitcher from './components/LanguageSwitcher.vue';


// Register plugins
Vue.use(VueI18n);
Vue.use(VueRouter);


// Define vars
let defaultLanguage, translations, localizedURLs, i18n;


// Array of loaded translations
const loadedTranslations = [];


// Error logging
function err (msg, error) {
	console.error('LangRouter: ' + msg);
	if (typeof error !== 'undefined') { console.error(error); }
}


// Function for switching to a loaded language
function setLanguage (lang) {
	i18n.locale = lang;
	document.querySelector('html').setAttribute('lang', lang);
	localStorage.setItem('VueAppLanguage', lang);
	return lang;
}


// Function for loading translations asynchronously
// Returns promise
function loadLanguage (lang) {

	// If the translation is already loaded
	if (loadedTranslations.includes(lang)) {
		return Promise.resolve(setLanguage(lang));
	}

	// If the translation hasn't been loaded
	// Check if the load function exists
	if (typeof translations[lang].load !== 'function') {
		err('Unable to load translations for "' + lang + '", "load" function is missing!');
	}

	// Load the translation
	return translations[lang].load().then(function (messages) {
		i18n.setLocaleMessage(lang, messages.default || messages);
		loadedTranslations.push(lang);
		return setLanguage(lang);
	}).catch(function (error) {
		err('Failed to load "' + lang + '" translation.', error);
	});
}





// LangRouter class adds localized URL functionality to Vue Router
export default class LangRouter {

	// Called when instantiated
	constructor (options) {

		// If any language is missing from localized URLs, add it as an empty object
		// All aliases need to be created for language switching purposes
		for (let lang in translations) {
			if (translations.hasOwnProperty(lang) && !localizedURLs[lang]) {
				localizedURLs[lang] = {};
			}
		}

		// Cycle through all the available languages and add aliases to routes
		for (let lang in localizedURLs) {
			if (localizedURLs.hasOwnProperty(lang)) { this.addAliasesToRoutes(options.routes, lang); }
		}

		// Create Vue Router instance
		const router = new VueRouter(options);

		// Language switching logic
		router.beforeEach((to, from, next) => {
			let lang = to.path.split('/')[1];

			// If language isn't available in the URL
			if (!translations[lang]) {

				// Set the language to saved one if available
				const savedLang = localStorage.getItem('VueAppLanguage');
				if (savedLang && translations[savedLang]) { lang = savedLang; }
				else {

					// Set the language to preferred one if available
					const preferredLang = getPrefferedLanguage();
					if (preferredLang && translations[preferredLang]) { lang = preferredLang; }

					// Otherwise set default language
					else { lang = defaultLanguage; }
				}

				// If the language isn't default one, translate path and redirect to it
				if (lang != defaultLanguage) {

					// Translate path
					let translatedPath = translatePath(to.path, lang);

					// Add language prefix to the path
					translatedPath = '/' + lang + (translatedPath.charAt(0) != '/' ? '/' : '') + translatedPath;

					return next(translatedPath);
				}
			}

			// Load requested language
			loadLanguage(lang).then(function () {
				return next();
			});
		});

		// Return Vue Router instance
		return router;
	}

	addAliasesToRoutes (routes, lang, child) {

		// Iterate over each route
		routes.forEach(function (route) {

			// Translate the path
			let alias = translatePath(route.path, lang);

			// Add language prefix to alias (only if route is at the top level)
			if (!child) { alias = '/' + lang + (alias.charAt(0) != '/' ? '/' : '') + alias; }

			// Make sure alias array exists & add any pre-existing value to it
			if (route.alias) {
				if (!Array.isArray(route.alias)) { route.alias = [ route.alias ]; }
			}
			else { route.alias = []; }

			// Push alias into alias array
			if (route.path != alias && route.alias.indexOf(alias) == -1) { route.alias.push(alias); }

			// If the route has children, iterate over those too
			if (route.children) { this.addAliasesToRoutes(route.children, lang, true); }

		}, this);
	}
}


// Path translation
function translatePath (path, langTo, langFrom) {

	// Split the path into chunks
	let pathChunks = path.split('/');

	// If the path is in some language already
	if (langFrom && localizedURLs[langFrom]) {

		// Create reversed map of localized URLs in given language
		const map = localizedURLs[langFrom];
		const reversedMap = {};
		Object.keys(map).forEach(function (key) {
			reversedMap[map[key]] = key;
		});

		// Translate the path back to original path names
		for (let i = 0; i < pathChunks.length; i++) {
			let pathChunk = pathChunks[i];

			// If there is an alias, use it, otherwise use given path
			pathChunks[i] = reversedMap[pathChunk] || pathChunk;
		}
	}

	// Translate all the non-variable chunks of the path
	for (let i = 0; i < pathChunks.length; i++) {
		let pathChunk = pathChunks[i];

		// If the path chunk is a variable, do not translate it
		if (pathChunk.charAt(0) == ':') { continue; }

		// If there is an alias, use it, otherwise use given path
		pathChunks[i] = localizedURLs[langTo][pathChunk] || pathChunk;
	}

	// Join path chunks and return
	return pathChunks.join('/');
}


// Retrieving preferred language from browser
function getPrefferedLanguage () {

	// Extraction of language shortcut from language string
	function extractLanguage (s) {
		return s.split('-')[0].toLowerCase();
	}

	// Use navigator.languages if available
	if (navigator.languages && navigator.languages.length) { return extractLanguage(navigator.languages[0] || ''); }

	// Otherwise use whatever is available
	return extractLanguage(navigator.language || navigator.browserLanguage || navigator.userLanguage || '');
}


// Install method of the LangRouter plugin
LangRouter.install = function (V, options) {

	// Get the options
	defaultLanguage = options.defaultLanguage;
	translations = options.translations;
	localizedURLs = options.localizedURLs;

	// Check if variables look okay
	if (typeof translations !== 'object' || translations === null) {
		err('"translations" should be an object, received ' + typeof translations + ' instead.');
	}
	if (Array.isArray(translations)) {
		err('"translations" should be an object, not an array.');
	}

	if (typeof localizedURLs !== 'object' || localizedURLs === null) {
		err('"localizedURLs" should be an object, received ' + typeof localizedURLs + ' instead.');
	}
	if (Array.isArray(localizedURLs)) {
		err('"localizedURLs" should be an object, not an array.');
	}

	if (typeof defaultLanguage !== 'string') {
		err('"defaultLanguage" should be a string, received ' + typeof defaultLanguage + ' instead.');
	}
	if (!translations[defaultLanguage]) {
		err('"' + defaultLanguage + '" not found in "translations".');
	}

	// Init internalization plugin
	i18n = new VueI18n({
		locale: defaultLanguage,
		fallbackLocale: defaultLanguage,
		messages: {},
	});

	// Add $localizedURL method to return localized path
	V.prototype.$localizedUrl = function (path, lang) {

		// If the desired language is not defined or it doesn't exist, use current one
		if (!lang || !localizedURLs[lang]) { lang = i18n.locale; }

		// Split path into chunks
		let pathLang = false;
		const pathChunks = path.split('/');

		// If the path is in some language, remove it from path and indicate it for translation
		if (localizedURLs[pathChunks[1]]) {
			pathLang = pathChunks[1];
			pathChunks.splice(1, 1);
			path = pathChunks.join('/');
		}

		// If the language is default language
		// & current path doesn't contain a language
		// & path to translate doesn't contain a language
		// = no need to localize
		const currentPathLang = this.$router.currentRoute.path.split('/')[1];
		if (lang == defaultLanguage && !localizedURLs[currentPathLang] && !pathLang) { return path; }

		// Translate path
		let translatedPath = translatePath(path, lang, pathLang);

		// Add language prefix to the path
		translatedPath = '/' + lang + (translatedPath.charAt(0) != '/' ? '/' : '') + translatedPath;

		return translatedPath;
	};
};


// Register components
Vue.component('localized-link', LocalizedLink);
Vue.component('language-switcher', LanguageSwitcher);


// Export what's needed
export { i18n, translations };
