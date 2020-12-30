import { ref } from 'vue';
import { createI18n } from 'vue-i18n';
import { createRouter } from 'vue-router';

import LocalizedLink from './components/LocalizedLink.vue';
import LanguageSwitcher from './components/LanguageSwitcher.vue';


// Define vars
let defaultLanguage, translations, localizedURLs, i18n;
let isInstalled = false;


// Array of loaded translations
const loadedTranslations = [];


// Error logging
function err (msg, error) {
	console.error('LangRouter: ' + msg);
	if (typeof error !== 'undefined') { console.error(error); }
}


// LangRouter adds localized URL functionality to Vue Router
function createLangRouter (languageOptions, routerOptions) {

	// Setup language configuration
	setupLanguageConfig(languageOptions);

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
			addAliasesToRoutes(routerOptions.routes, lang);
		}
	}

	// Create Vue Router
	const router = createRouter(routerOptions);

	// Add language switching logic
	router.beforeEach(switchLanguage);

	// Append Lang Router install method to Vue Router install method
	const installRouter = router.install;
	router.install = function (app, options) {
		installRouter.call(this, app, options);
		installLangRouter.call(this, app);
	};

	// Return Vue Router
	return router;
}


function setupLanguageConfig (options) {

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

	// Check if any translations are already present, if yes, pass them to VueI18n
	let messages = {};

	for (let lang in translations) {
		if (translations.hasOwnProperty(lang)) {
			let langMessages = translations[lang].messages;

			if (typeof langMessages === 'object' && !Array.isArray(langMessages)) {
				messages[lang] = translations[lang].messages;
				loadedTranslations.push(lang);
			}
		}
	}

	// Init internalization plugin
	i18n = createI18n({
		legacy: true,
		locale: defaultLanguage,
		fallbackLocale: defaultLanguage,
		messages,
	});
}


// Install method of the LangRouter plugin
function installLangRouter (app) {

	// Check if plugin is installed already
	if (isInstalled) {
		err('Already installed.');
		return;
	}
	isInstalled = true;

	// Add properties and methods for access in <language-switcher>
	app.config.globalProperties._langRouter = {
		translations,
		loadLanguage,
		forcedNewRoute: ref(''),
	};

	// Add $localizePath method to return localized path
	app.config.globalProperties.$localizePath = localizePath;

	// Register components
	app.component('localized-link', LocalizedLink);
	app.component('language-switcher', LanguageSwitcher);
}


// Switching to a loaded language
function setLanguage (lang) {
	i18n.global.locale = lang;
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
		i18n.global.setLocaleMessage(lang, messages.default || messages);
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

			return next({ path: translatedPath, query: to.query, hash: to.hash });
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
function localizePath (fullPath, lang) {
	// If the desired language is not defined or it doesn't exist, use current one
	if (!lang || !localizedURLs[lang]) { lang = i18n.global.locale; }

	// Separate path & query
	let path = fullPath;
	let query = '';

	if (fullPath.includes('?')) {
		path = fullPath.split('?')[0];
		query = '?' + fullPath.split('?')[1];
	}
	else if (fullPath.includes('#')) {
		path = fullPath.split('#')[0];
		query = '#' + fullPath.split('#')[1];
	}

	// Split path into chunks
	const pathChunks = path.split('/');

	// Get the path language, if there is any
	let pathLang = (localizedURLs[pathChunks[1]] ? pathChunks[1] : false);

	// If the language is default language
	// & current path doesn't contain a language
	// & path to translate doesn't contain a language
	// = no need to localize
	const currentPathLang = this.$route.path.split('/')[1];
	if (lang == defaultLanguage && !localizedURLs[currentPathLang] && !pathLang) { return fullPath; }

	// If the path is in some language already
	let resolvedPath = false;
	if (pathLang) {
		// Get the original path
		const resolvedRoute = this.$router.resolve(path);

		if (resolvedRoute.matched.length != 0) {
			resolvedPath = resolvedRoute.matched[resolvedRoute.matched.length - 1];
			resolvedPath = (resolvedPath.aliasOf ? resolvedPath.aliasOf.path : resolvedPath.path);
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

	return translatedPath + query;
}


// Export what's needed
export { createLangRouter, i18n };

let jestAccess = () => true;
export default jestAccess;
