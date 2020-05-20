(function (exports, Vue, VueI18n, VueRouter) {
	'use strict';

	var Vue__default = 'default' in Vue ? Vue['default'] : Vue;
	VueI18n = VueI18n && Object.prototype.hasOwnProperty.call(VueI18n, 'default') ? VueI18n['default'] : VueI18n;
	VueRouter = VueRouter && Object.prototype.hasOwnProperty.call(VueRouter, 'default') ? VueRouter['default'] : VueRouter;

	//
	//
	//
	//
	//
	//

	// <localized-link> component extends <router-link> and localizes URL

	var script = {
		name: 'LocalizedLink',
		props: [ 'to' ],
		computed: {
			localizedTo: function localizedTo () {

				// If "to" is a string, localize it
				if (typeof this.to === 'string') {
					return this.$localizedUrl(this.to);
				}

				// If "to" is an object with "path", copy it and localize "path"
				else if (typeof this.to === 'object' && typeof this.to.path === 'string') {
					var o = JSON.parse(JSON.stringify(this.to));
					o.path = this.$localizedUrl(o.path);
					return o;
				}

				// If "to" is an object without "path", just pass it on
				else {
					return this.to;
				}
			},
		},
	};

	function render(_ctx, _cache) {
	  var _component_router_link = Vue.resolveComponent("router-link");

	  return (Vue.openBlock(), Vue.createBlock(_component_router_link, Vue.mergeProps({ to: _ctx.localizedTo }, _ctx.$attrs), {
	    default: Vue.withCtx(function () { return [
	      Vue.renderSlot(_ctx.$slots, "default")
	    ]; }),
	    _: 1
	  }, 16 /* FULL_PROPS */, ["to"]))
	}

	script.render = render;
	script.__file = "src/plugin/components/LocalizedLink.vue";

	//

	var script$1 = {
		name: 'LanguageSwitcher',
		data: function data () {
			return {
				currentUrl: this.url || this.$router.currentRoute.path,
			};
		},
		props: [ 'tag', 'active-class', 'url' ],
		methods: {
			getTag: function getTag () {
				if (this.tag) { return this.tag; }
				else { return 'div'; }
			},
			getLinks: function getLinks () {
				var links = [];
				var activeClass = this.activeClass || 'router-active-language';

				for (var lang in exports.translations) {
					if (exports.translations.hasOwnProperty(lang)) {
						links.push({
							activeClass: (lang == exports.i18n.locale ? activeClass : ''),
							langIndex: lang,
							langName: exports.translations[lang].name || lang,
							url: this.$localizedUrl(this.currentUrl, lang),
						});
					}
				}

				return links;
			},
		},
		watch: {
			$route: function $route (to) {
				this.currentUrl = this.url || to.path;
			},
		},
	};

	function render$1(_ctx, _cache) {
	  return (Vue.openBlock(), Vue.createBlock(Vue.resolveDynamicComponent(_ctx.getTag()), { class: "router-language-switcher" }, {
	    default: Vue.withCtx(function () { return [
	      Vue.renderSlot(_ctx.$slots, "default", {
	        links: _ctx.getLinks()
	      })
	    ]; }),
	    _: 1
	  }))
	}

	script$1.render = render$1;
	script$1.__file = "src/plugin/components/LanguageSwitcher.vue";

	// Register plugins
	Vue__default.use(VueI18n);
	Vue__default.use(VueRouter);


	// Define vars
	var defaultLanguage, localizedURLs;


	// Array of loaded translations
	var loadedTranslations = [];


	// Error logging
	function err (msg, error) {
		console.error('LangRouter: ' + msg);
		if (typeof error !== 'undefined') { console.error(error); }
	}


	// Function for switching to a loaded language
	function setLanguage (lang) {
		exports.i18n.locale = lang;
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
		if (typeof exports.translations[lang].load !== 'function') {
			err('Unable to load translations for "' + lang + '", "load" function is missing!');
		}

		// Load the translation
		return exports.translations[lang].load().then(function (messages) {
			exports.i18n.setLocaleMessage(lang, messages.default || messages);
			loadedTranslations.push(lang);
			return setLanguage(lang);
		}).catch(function (error) {
			err('Failed to load "' + lang + '" translation.', error);
		});
	}





	// LangRouter class adds localized URL functionality to Vue Router
	var LangRouter = function LangRouter (options) {

		// If any language is missing from localized URLs, add it as an empty object
		// All aliases need to be created for language switching purposes
		for (var lang in exports.translations) {
			if (exports.translations.hasOwnProperty(lang) && !localizedURLs[lang]) {
				localizedURLs[lang] = {};
			}
		}

		// Cycle through all the available languages and add aliases to routes
		for (var lang$1 in localizedURLs) {
			if (localizedURLs.hasOwnProperty(lang$1)) { this.addAliasesToRoutes(options.routes, lang$1); }
		}

		// Create Vue Router instance
		var router = new VueRouter(options);

		// Language switching logic
		router.beforeEach(function (to, from, next) {
			var lang = to.path.split('/')[1];

			// If language isn't available in the URL
			if (!exports.translations[lang]) {

				// Set the language to saved one if available
				var savedLang = localStorage.getItem('VueAppLanguage');
				if (savedLang && exports.translations[savedLang]) { lang = savedLang; }
				else {

					// Set the language to preferred one if available
					var preferredLang = getPrefferedLanguage();
					if (preferredLang && exports.translations[preferredLang]) { lang = preferredLang; }

					// Otherwise set default language
					else { lang = defaultLanguage; }
				}

				// If the language isn't default one, translate path and redirect to it
				if (lang != defaultLanguage) {

					// Translate path
					var translatedPath = translatePath(to.path, lang);

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
	};

	LangRouter.prototype.addAliasesToRoutes = function addAliasesToRoutes (routes, lang, child) {

		// Iterate over each route
		routes.forEach(function (route) {

			// Translate the path
			var alias = translatePath(route.path, lang);

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
	};


	// Path translation
	function translatePath (path, langTo, langFrom) {

		// Split the path into chunks
		var pathChunks = path.split('/');

		// If the path is in some language already
		if (langFrom && localizedURLs[langFrom]) {

			// Create reversed map of localized URLs in given language
			var map = localizedURLs[langFrom];
			var reversedMap = {};
			Object.keys(map).forEach(function (key) {
				reversedMap[map[key]] = key;
			});

			// Translate the path back to original path names
			for (var i = 0; i < pathChunks.length; i++) {
				var pathChunk = pathChunks[i];

				// If there is an alias, use it, otherwise use given path
				pathChunks[i] = reversedMap[pathChunk] || pathChunk;
			}
		}

		// Translate all the non-variable chunks of the path
		for (var i$1 = 0; i$1 < pathChunks.length; i$1++) {
			var pathChunk$1 = pathChunks[i$1];

			// If the path chunk is a variable, do not translate it
			if (pathChunk$1.charAt(0) == ':') { continue; }

			// If there is an alias, use it, otherwise use given path
			pathChunks[i$1] = localizedURLs[langTo][pathChunk$1] || pathChunk$1;
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
		exports.translations = options.translations;
		localizedURLs = options.localizedURLs;

		// Check if variables look okay
		if (typeof exports.translations !== 'object' || exports.translations === null) {
			err('"translations" should be an object, received ' + typeof exports.translations + ' instead.');
		}
		if (Array.isArray(exports.translations)) {
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
		if (!exports.translations[defaultLanguage]) {
			err('"' + defaultLanguage + '" not found in "translations".');
		}

		// Init internalization plugin
		exports.i18n = new VueI18n({
			locale: defaultLanguage,
			fallbackLocale: defaultLanguage,
			messages: {},
		});

		// Add $localizedURL method to return localized path
		V.prototype.$localizedUrl = function (path, lang) {

			// If the desired language is not defined or it doesn't exist, use current one
			if (!lang || !localizedURLs[lang]) { lang = exports.i18n.locale; }

			// Split path into chunks
			var pathLang = false;
			var pathChunks = path.split('/');

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
			var currentPathLang = this.$router.currentRoute.path.split('/')[1];
			if (lang == defaultLanguage && !localizedURLs[currentPathLang] && !pathLang) { return path; }

			// Translate path
			var translatedPath = translatePath(path, lang, pathLang);

			// Add language prefix to the path
			translatedPath = '/' + lang + (translatedPath.charAt(0) != '/' ? '/' : '') + translatedPath;

			return translatedPath;
		};
	};


	// Register components
	Vue__default.component('localized-link', script);
	Vue__default.component('language-switcher', script$1);

	exports.default = LangRouter;

	return exports;

}({}, Vue, VueI18n, VueRouter));
