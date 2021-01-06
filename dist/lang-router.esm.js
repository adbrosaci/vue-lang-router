/**
 * vue-lang-router v1.2.4
 * (c) 2020 Radek Altof
 * Released under the MIT License.
 */

import VueI18n from 'vue-i18n';
import VueRouter from 'vue-router';

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

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    var options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    var hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            var originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            var existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

/* script */
var __vue_script__ = script;

/* template */
var __vue_render__ = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('router-link',_vm._b({attrs:{"to":_vm.localizedTo()}},'router-link',_vm.$attrs,false),[_vm._t("default")],2)};
var __vue_staticRenderFns__ = [];

  /* style */
  var __vue_inject_styles__ = undefined;
  /* scoped */
  var __vue_scope_id__ = undefined;
  /* module identifier */
  var __vue_module_identifier__ = undefined;
  /* functional template */
  var __vue_is_functional_template__ = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__ = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    false,
    undefined,
    undefined,
    undefined
  );

var script$1 = {
	name: 'LanguageSwitcher',
	data: function data () {
		return {
			currentUrl: this.url || this.$router.currentRoute.fullPath,
			links: [],
		};
	},
	props: [ 'tag', 'active-class', 'url' ],
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
						activeClass: (lang == this.$i18n.locale ? activeClass : ''),
						langIndex: lang,
						langName: tr[lang].name || lang,
						url: this.$localizePath(this.currentUrl, lang),
					});
				}
			}
			this.links = links;
		},
	},
	watch: {
		$route: function $route (to) {
			this.currentUrl = this.url || to.fullPath;
			this.generateLinks();
		},
	},
	mounted: function mounted () {
		this.generateLinks();
	},
};

/* script */
var __vue_script__$1 = script$1;

/* template */
var __vue_render__$1 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c(_vm.getTag(),{tag:"component",staticClass:"router-language-switcher"},[_vm._t("default",null,{"links":_vm.links})],2)};
var __vue_staticRenderFns__$1 = [];

  /* style */
  var __vue_inject_styles__$1 = undefined;
  /* scoped */
  var __vue_scope_id__$1 = undefined;
  /* module identifier */
  var __vue_module_identifier__$1 = undefined;
  /* functional template */
  var __vue_is_functional_template__$1 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__$1 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
    __vue_inject_styles__$1,
    __vue_script__$1,
    __vue_scope_id__$1,
    __vue_is_functional_template__$1,
    __vue_module_identifier__$1,
    false,
    undefined,
    undefined,
    undefined
  );

var defaultLanguage, translations, localizedURLs, i18n;
var loadedTranslations = [];
function err (msg, error) {
	console.error('LangRouter: ' + msg);
	if (typeof error !== 'undefined') { console.error(error); }
}
var LangRouter = function LangRouter (options) {
	for (var lang in translations) {
		if (translations.hasOwnProperty(lang) && !localizedURLs[lang]) {
			localizedURLs[lang] = {};
		}
	}
	for (var lang$1 in localizedURLs) {
		if (localizedURLs.hasOwnProperty(lang$1)) {
			addAliasesToRoutes(options.routes, lang$1);
		}
	}
	var router = new VueRouter(options);
	router.beforeEach(switchLanguage);
	return router;
};
LangRouter.install = function (Vue, options) {
	if (LangRouter.installed) {
		err('Already installed.');
		return;
	}
	LangRouter.installed = true;
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
	Vue.use(VueI18n);
	Vue.use(VueRouter);
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
	i18n = new VueI18n({
		locale: defaultLanguage,
		fallbackLocale: defaultLanguage,
		messages: messages,
	});
	Vue.prototype._langRouter = { translations: translations };
	Vue.prototype.$localizePath = localizePath;
	Vue.component('localized-link', __vue_component__);
	Vue.component('language-switcher', __vue_component__$1);
};
function setLanguage (lang) {
	i18n.locale = lang;
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
		i18n.setLocaleMessage(lang, messages.default || messages);
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
	if (!lang || !localizedURLs[lang]) { lang = i18n.locale; }
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
	var currentPathLang = this.$router.currentRoute.path.split('/')[1];
	if (lang == defaultLanguage && !localizedURLs[currentPathLang] && !pathLang) { return fullPath; }
	var resolvedPath = false;
	if (pathLang) {
		var resolvedRoute = this.$router.resolve(path);
		if (resolvedRoute.route.matched.length != 0) {
			resolvedPath = resolvedRoute.route.matched[resolvedRoute.route.matched.length - 1].path;
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
if (typeof window !== 'undefined' && window.Vue) {
	window.Vue.use(LangRouter);
}

export default LangRouter;
export { i18n };
