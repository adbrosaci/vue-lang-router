/**
 * vue-lang-router v2.0.0-beta.2
 * (c) 2020 Radek Altof
 * Released under the MIT License.
 */

var LangRouter = (function (exports, vue, vueI18n, vueRouter) {
	'use strict';

	var script = {
		name: 'LocalizedLink',
		props: [ 'to' ],
		methods: {
			localizedTo: function localizedTo () {
				if (typeof this.to === 'string') {
					return this.$localizePath(this.to);
				}
				else if (typeof this.to === 'object' && typeof this.to.path === 'string') {
					var o = JSON.parse(JSON.stringify(this.to));
					o.path = this.$localizePath(o.path);
					return o;
				}
				else {
					return this.to;
				}
			},
		},
	};

	function render(_ctx, _cache, $props, $setup, $data, $options) {
	  var _component_router_link = vue.resolveComponent("router-link");
	  return (vue.openBlock(), vue.createBlock(_component_router_link, vue.mergeProps({
	    to: $options.localizedTo()
	  }, _ctx.$attrs), {
	    default: vue.withCtx(function () { return [
	      vue.renderSlot(_ctx.$slots, "default")
	    ]; }),
	    _: 3
	  }, 16 , ["to"]))
	}

	script.render = render;
	script.__file = "src/plugin/components/LocalizedLink.vue";

	var script$1 = {
		name: 'LanguageSwitcher',
		data: function data () {
			return {
				currentUrl: this.url || this.$router.currentRoute.fullPath,
				links: [],
			};
		},
		props: [ 'tag', 'active-class', 'url' ],
		computed: {
			locale: function locale () {
				return this.$i18n.locale;
			},
		},
		methods: {
			getTag: function getTag () {
				if (this.tag) { return this.tag; }
				else { return 'div'; }
			},
			generateLinks: function generateLinks () {
				var links = [];
				var activeClass = this.activeClass || 'router-active-language';
				var tr = this._langRouter.translations;
				for (var lang in tr) {
					if (tr.hasOwnProperty(lang)) {
						links.push({
							activeClass: (lang == this.locale ? activeClass : ''),
							langIndex: lang,
							langName: tr[lang].name || lang,
							url: this.$localizePath(this.currentUrl, lang),
						});
					}
				}
				this.links = links;
			},
			detectRouterLinkClick: function detectRouterLinkClick (e) {
				var this$1 = this;
				if (!e.defaultPrevented) { return; }
				var a = e.target;
				while (a.tagName.toLowerCase() != 'a') {
					if (a.classList.contains('router-language-switcher')) { return; }
					a = a.parentNode;
				}
				if (a.pathname == window.location.pathname) { return; }
				var currentRoute = this.$route.matched[this.$route.matched.length - 1];
				if (currentRoute.aliasOf) { currentRoute = currentRoute.aliasOf; }
				var resolvedRoute = this.$router.resolve(a.pathname);
				if (resolvedRoute.matched.length == 0) { return; }
				resolvedRoute = resolvedRoute.matched[resolvedRoute.matched.length - 1];
				if (resolvedRoute.aliasOf) { resolvedRoute = resolvedRoute.aliasOf; }
				if (currentRoute == resolvedRoute) {
					var newRoute = a.pathname + a.search + a.hash;
					var historyState = Object.assign({}, window.history.state, {current: newRoute});
					var newLocale = a.pathname.split('/')[1];
					this._langRouter.loadLanguage(newLocale).then(function () {
						window.history.replaceState(historyState, '', newRoute);
						this$1._langRouter.forcedNewRoute.value = newRoute;
					});
				}
			},
		},
		watch: {
			$route: function $route (to) {
				this.currentUrl = this.url || to.fullPath;
				this.generateLinks();
			},
			locale: function locale () {
				if (typeof this.currentUrl !== 'undefined') { this.generateLinks(); }
			},
		},
		mounted: function mounted () {
			var this$1 = this;
			if (typeof this.currentUrl !== 'undefined') { this.generateLinks(); }
			vue.watch(this._langRouter.forcedNewRoute, function (to) {
				this$1.currentUrl = to;
				this$1.generateLinks();
			});
		},
	};

	function render$1(_ctx, _cache, $props, $setup, $data, $options) {
	  return (vue.openBlock(), vue.createBlock(vue.resolveDynamicComponent($options.getTag()), {
	    class: "router-language-switcher",
	    onClick: $options.detectRouterLinkClick
	  }, {
	    default: vue.withCtx(function () { return [
	      vue.renderSlot(_ctx.$slots, "default", { links: $data.links })
	    ]; }),
	    _: 3
	  }, 8 , ["onClick"]))
	}

	script$1.render = render$1;
	script$1.__file = "src/plugin/components/LanguageSwitcher.vue";

	var defaultLanguage, translations, localizedURLs;
	var isInstalled = false;
	var loadedTranslations = [];
	function err (msg, error) {
		console.error('LangRouter: ' + msg);
		if (typeof error !== 'undefined') { console.error(error); }
	}
	function createLangRouter (languageOptions, routerOptions) {
		setupLanguageConfig(languageOptions);
		for (var lang in translations) {
			if (translations.hasOwnProperty(lang) && !localizedURLs[lang]) {
				localizedURLs[lang] = {};
			}
		}
		for (var lang$1 in localizedURLs) {
			if (localizedURLs.hasOwnProperty(lang$1)) {
				addAliasesToRoutes(routerOptions.routes, lang$1);
			}
		}
		var router = vueRouter.createRouter(routerOptions);
		router.beforeEach(switchLanguage);
		var installRouter = router.install;
		router.install = function (app, options) {
			installRouter.call(this, app, options);
			installLangRouter.call(this, app);
		};
		return router;
	}
	function setupLanguageConfig (options) {
		if (!options) {
			err('Options missing.');
		}
		defaultLanguage = options.defaultLanguage;
		translations = options.translations;
		localizedURLs = options.localizedURLs || {};
		var isArr;
		if ((isArr = Array.isArray(translations)) || typeof translations !== 'object') {
			err('options.translations should be an object, received ' + (isArr ? 'array' : typeof translations) + ' instead.');
		}
		if ((isArr = Array.isArray(localizedURLs)) || typeof localizedURLs !== 'object') {
			err('options.localizedURLs should be an object, received ' + (isArr ? 'array' : typeof localizedURLs) + ' instead.');
		}
		if (typeof defaultLanguage !== 'string') {
			err('options.defaultLanguage should be a string, received ' + typeof defaultLanguage + ' instead.');
		}
		var messages = {};
		for (var lang in translations) {
			if (translations.hasOwnProperty(lang)) {
				var langMessages = translations[lang].messages;
				if (typeof langMessages === 'object' && !Array.isArray(langMessages)) {
					messages[lang] = translations[lang].messages;
					loadedTranslations.push(lang);
				}
			}
		}
		exports.i18n = vueI18n.createI18n({
			legacy: true,
			locale: defaultLanguage,
			fallbackLocale: defaultLanguage,
			messages: messages,
		});
	}
	function installLangRouter (app) {
		if (isInstalled) {
			err('Already installed.');
			return;
		}
		isInstalled = true;
		app.config.globalProperties._langRouter = {
			translations: translations,
			loadLanguage: loadLanguage,
			forcedNewRoute: vue.ref(''),
		};
		app.config.globalProperties.$localizePath = localizePath;
		app.component('localized-link', script);
		app.component('language-switcher', script$1);
	}
	function setLanguage (lang) {
		exports.i18n.global.locale = lang;
		document.querySelector('html').setAttribute('lang', lang);
		localStorage.setItem('VueAppLanguage', lang);
		return lang;
	}
	function loadLanguage (lang) {
		if (loadedTranslations.includes(lang)) {
			return Promise.resolve(setLanguage(lang));
		}
		if (!translations[lang] || typeof translations[lang].load !== 'function') {
			err('Unable to load translations for "' + lang + '", "load" function is missing!');
		}
		return translations[lang].load().then(function (messages) {
			exports.i18n.global.setLocaleMessage(lang, messages.default || messages);
			loadedTranslations.push(lang);
			return setLanguage(lang);
		}).catch(function (error) {
			err('Failed to load "' + lang + '" translation.', error);
		});
	}
	function addAliasesToRoutes (routes, lang, child) {
		routes.forEach(function (route) {
			var alias = translatePath(route.path, lang);
			if (!child) { alias = '/' + lang + (alias.charAt(0) != '/' ? '/' : '') + alias; }
			if (route.alias) {
				if (!Array.isArray(route.alias)) { route.alias = [ route.alias ]; }
			}
			else { route.alias = []; }
			if (route.path != alias && route.alias.indexOf(alias) == -1) { route.alias.push(alias); }
			if (route.children) { addAliasesToRoutes(route.children, lang, true); }
		});
	}
	function switchLanguage (to, from, next) {
		var lang = to.path.split('/')[1];
		if (!translations[lang]) {
			var savedLang = localStorage.getItem('VueAppLanguage');
			if (savedLang && translations[savedLang]) { lang = savedLang; }
			else {
				var preferredLang = getPrefferedLanguage();
				if (preferredLang && translations[preferredLang]) { lang = preferredLang; }
				else { lang = defaultLanguage; }
			}
			if (lang != defaultLanguage) {
				var translatedPath = translatePath(to.path, lang);
				translatedPath = '/' + lang + (translatedPath.charAt(0) != '/' ? '/' : '') + translatedPath;
				return next({ path: translatedPath, query: to.query, hash: to.hash });
			}
		}
		loadLanguage(lang).then(function () {
			return next();
		});
	}
	function translatePath (path, langTo, langFrom, matchedPath) {
		var pathChunks = path.split('/');
		if (langFrom && localizedURLs[langFrom]) {
			if (langTo == langFrom) { return path; }
			var map = localizedURLs[langFrom];
			var reversedMap = {};
			Object.keys(map).forEach(function (key) {
				reversedMap[map[key]] = key;
			});
			var matchedPathChunks = matchedPath.split('/');
			for (var i = 0; i < pathChunks.length; i++) {
				var pathChunk = pathChunks[i];
				if (matchedPathChunks[i].charAt(0) == ':') { continue; }
				pathChunks[i] = reversedMap[pathChunk] || pathChunk;
			}
		}
		for (var i$1 = 0; i$1 < pathChunks.length; i$1++) {
			var pathChunk$1 = pathChunks[i$1];
			if (pathChunk$1.charAt(0) == ':') { continue; }
			pathChunks[i$1] = localizedURLs[langTo][pathChunk$1] || pathChunk$1;
		}
		return pathChunks.join('/');
	}
	function getPrefferedLanguage () {
		function extractLanguage (s) {
			return s.split('-')[0].toLowerCase();
		}
		if (navigator.languages && navigator.languages.length) { return extractLanguage(navigator.languages[0] || ''); }
		return extractLanguage(navigator.language || navigator.browserLanguage || navigator.userLanguage || '');
	}
	function localizePath (fullPath, lang) {
		if (!lang || !localizedURLs[lang]) { lang = exports.i18n.global.locale; }
		var path = fullPath;
		var query = '';
		if (fullPath.includes('?')) {
			path = fullPath.split('?')[0];
			query = '?' + fullPath.split('?')[1];
		}
		else if (fullPath.includes('#')) {
			path = fullPath.split('#')[0];
			query = '#' + fullPath.split('#')[1];
		}
		var pathChunks = path.split('/');
		var pathLang = (localizedURLs[pathChunks[1]] ? pathChunks[1] : false);
		var currentPathLang = this.$route.path.split('/')[1];
		if (lang == defaultLanguage && !localizedURLs[currentPathLang] && !pathLang) { return fullPath; }
		var resolvedPath = false;
		if (pathLang) {
			var resolvedRoute = this.$router.resolve(path);
			if (resolvedRoute.matched.length != 0) {
				resolvedPath = resolvedRoute.matched[resolvedRoute.matched.length - 1];
				resolvedPath = (resolvedPath.aliasOf ? resolvedPath.aliasOf.path : resolvedPath.path);
				resolvedPath = (resolvedPath.charAt(0) == '/' ? resolvedPath : '/' + resolvedPath);
			}
			else {
				err('Router could not resolve path "' + path + '". URL localization may not work as expected.');
			}
			pathChunks.splice(1, 1);
			path = pathChunks.join('/');
		}
		var translatedPath = translatePath(path, lang, pathLang, (resolvedPath || path));
		translatedPath = '/' + lang + (translatedPath.charAt(0) != '/' ? '/' : '') + translatedPath;
		return translatedPath + query;
	}
	var jestAccess = function () { return true; };

	exports.createLangRouter = createLangRouter;
	exports.default = jestAccess;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

}({}, Vue, VueI18n, VueRouter));
