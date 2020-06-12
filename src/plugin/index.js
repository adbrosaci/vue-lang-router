import VueI18n from 'vue-i18n';
import VueRouter from 'vue-router';

import LocalizedLink from './components/LocalizedLink.vue';
import LanguageSwitcher from './components/LanguageSwitcher.vue';


// Define vars
let defaultLanguage, translations, localizedURLs, i18n;


// Array of loaded translations
const loadedTranslations = [];


// Error logging
function err (msg, error) {
	console.error('LangRouter: ' + msg);
	if (typeof error !== 'undefined') { console.error(error); }
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
			if (localizedURLs.hasOwnProperty(lang)) {
				addAliasesToRoutes(options.routes, lang);
			}
		}

		// Create Vue Router instance
		const router = new VueRouter(options);

		// Add language switching logic
		router.beforeEach(switchLanguage);

		// Return Vue Router instance
		return router;
	}
}


// Install method of the LangRouter plugin
LangRouter.install = function (Vue, options) {

	// Check if plugin is installed already
	if (LangRouter.installed) {
		err('Already installed.');
		return;
	}
	LangRouter.installed = true;

	// Get the options
	if (!options) {
		err('Options missing.');
	}
	defaultLanguage = options.defaultLanguage;
	translations = options.translations;
	localizedURLs = options.localizedURLs || {};

	// Check if variables look okay
	let isArr;
	if ((isArr = Array.isArray(translations)) || typeof translations !== 'object') {
		err('options.translations should be an object, received ' + (isArr ? 'array' : typeof translations) + ' instead.');
	}
	if ((isArr = Array.isArray(localizedURLs)) || typeof localizedURLs !== 'object') {
		err('options.localizedURLs should be an object, received ' + (isArr ? 'array' : typeof localizedURLs) + ' instead.');
	}
	if (typeof defaultLanguage !== 'string') {
		err('options.defaultLanguage should be a string, received ' + typeof defaultLanguage + ' instead.');
	}

	// Register plugins
	Vue.use(VueI18n);
	Vue.use(VueRouter);

	// Init internalization plugin
	i18n = new VueI18n({
		locale: defaultLanguage,
		fallbackLocale: defaultLanguage,
		messages: {},
	});

	// Add translations to use in <language-switcher>
	Vue.prototype._langRouter = { translations };

	// Add $localizePath method to return localized path
	Vue.prototype.$localizePath = localizePath;

	// Register components
	Vue.component('localized-link', LocalizedLink);
	Vue.component('language-switcher', LanguageSwitcher);
};


// Switching to a loaded language
function setLanguage (lang) {
	i18n.locale = lang;
	document.querySelector('html').setAttribute('lang', lang);
	localStorage.setItem('VueAppLanguage', lang);
	return lang;
}


// Loading translations asynchronously
// Returns promise
function loadLanguage (lang) {

	// If the translation is already loaded
	if (loadedTranslations.includes(lang)) {
		return Promise.resolve(setLanguage(lang));
	}

	// If the translation hasn't been loaded
	// Check if the load function exists
	if (!translations[lang] || typeof translations[lang].load !== 'function') {
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


// Adding aliases to routes
function addAliasesToRoutes (routes, lang, child) {

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
		if (route.children) { addAliasesToRoutes(route.children, lang, true); }

	});
}


// Router - language switching
function switchLanguage (to, from, next) {
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
}


// Path translation
function translatePath (path, langTo, langFrom, matchedPath) {

	// Split the path into chunks
	let pathChunks = path.split('/');

	// If the path is in some language already
	if (langFrom && localizedURLs[langFrom]) {

		// If the path language & the desired language are equal, do not translate
		if (langTo == langFrom) { return path; }

		// Create reversed map of localized URLs in given language
		const map = localizedURLs[langFrom];
		const reversedMap = {};
		Object.keys(map).forEach(function (key) {
			reversedMap[map[key]] = key;
		});

		// Split the matched path into chunks
		let matchedPathChunks = matchedPath.split('/');

		// Translate the path back to original path names
		for (let i = 0; i < pathChunks.length; i++) {
			let pathChunk = pathChunks[i];

			// If the original path chunk is a variable, do not translate it
			if (matchedPathChunks[i].charAt(0) == ':') { continue; }

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


// Path localization
function localizePath (path, lang) {
	// If the desired language is not defined or it doesn't exist, use current one
	if (!lang || !localizedURLs[lang]) { lang = i18n.locale; }

	// Split path into chunks
	const pathChunks = path.split('/');

	// Get the path language, if there is any
	let pathLang = (localizedURLs[pathChunks[1]] ? pathChunks[1] : false);

	// If the language is default language
	// & current path doesn't contain a language
	// & path to translate doesn't contain a language
	// = no need to localize
	const currentPathLang = this.$router.currentRoute.path.split('/')[1];
	if (lang == defaultLanguage && !localizedURLs[currentPathLang] && !pathLang) { return path; }

	// If the path is in some language already
	let resolvedPath = false;
	if (pathLang) {
		// Get the original path
		const resolvedRoute = this.$router.resolve(path);

		if (resolvedRoute.route.matched.length != 0) {
			resolvedPath = resolvedRoute.route.matched[resolvedRoute.route.matched.length - 1].path;
			resolvedPath = (resolvedPath.charAt(0) == '/' ? resolvedPath : '/' + resolvedPath);
		}
		else {
			err('Router could not resolve path "' + path + '". URL localization may not work as expected.');
		}

		// Remove the language from path
		pathChunks.splice(1, 1);
		path = pathChunks.join('/');
	}

	// Translate path
	let translatedPath = translatePath(path, lang, pathLang, (resolvedPath || path));

	// Add language prefix to the path
	translatedPath = '/' + lang + (translatedPath.charAt(0) != '/' ? '/' : '') + translatedPath;

	return translatedPath;
}


// Automatic plugin installation if in browser
if (typeof window !== 'undefined' && window.Vue) {
	window.Vue.use(LangRouter);
}


// Export what's needed
export { i18n };
