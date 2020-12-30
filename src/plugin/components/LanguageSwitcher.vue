<template>
	<component :is="getTag()" class="router-language-switcher" @click="detectRouterLinkClick">
		<slot :links="links" />
	</component>
</template>

<script>
// <language-switcher> component generates links to the given/current page in all available languages
import { watch } from 'vue';

export default {
	name: 'LanguageSwitcher',
	data () {
		return {
			currentUrl: this.url || this.$router.currentRoute.fullPath,
			links: [],
		};
	},
	props: [ 'tag', 'active-class', 'url' ],
	computed: {
		locale () {
			return this.$i18n.locale;
		},
	},
	methods: {
		getTag () {
			if (this.tag) { return this.tag; }
			else { return 'div'; }
		},
		generateLinks () {
			let links = [];
			const activeClass = this.activeClass || 'router-active-language';
			const tr = this._langRouter.translations;

			for (let lang in tr) {
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

		// This method is a workaround for Vue Router not switching between aliased paths (when clicking on <router-link>)
		// https://github.com/vuejs/vue-router-next/issues/613
		detectRouterLinkClick (e) {

			// Only execute this function if the default navigation has been prevented (by Vue Router)
			if (!e.defaultPrevented) { return; }

			// Find <a>
			let a = e.target;

			while (a.tagName.toLowerCase() != 'a') {
				if (a.classList.contains('router-language-switcher')) { return; }
				a = a.parentNode;
			}

			// If <a>'s path already equals current path, nothing needs to be done
			if (a.pathname == window.location.pathname) { return; }

			// Get current route object
			let currentRoute = this.$route.matched[this.$route.matched.length - 1];
			if (currentRoute.aliasOf) { currentRoute = currentRoute.aliasOf; }

			// Get resolved route object, stop if nothing matches
			let resolvedRoute = this.$router.resolve(a.pathname);
			if (resolvedRoute.matched.length == 0) { return; }

			resolvedRoute = resolvedRoute.matched[resolvedRoute.matched.length - 1];
			if (resolvedRoute.aliasOf) { resolvedRoute = resolvedRoute.aliasOf; }

			// If the link is an alias of current route in a different language, switch to it
			if (currentRoute == resolvedRoute) {
				const newRoute = a.pathname + a.search + a.hash;
				const historyState = { ...window.history.state, current: newRoute };
				const newLocale = a.pathname.split('/')[1];

				this._langRouter.loadLanguage(newLocale).then(() => {
					window.history.replaceState(historyState, '', newRoute);
					this._langRouter.forcedNewRoute.value = newRoute;
				});
			}
		},
	},
	watch: {
		$route (to) {
			this.currentUrl = this.url || to.fullPath;
			this.generateLinks();
		},
		locale () {
			if (typeof this.currentUrl !== 'undefined') { this.generateLinks(); }
		},
	},
	mounted () {
		if (typeof this.currentUrl !== 'undefined') { this.generateLinks(); }

		// Watch for forced route (result of detectRouterLinkClick)
		// Using "watch" method doesn't work for some reason
		watch(this._langRouter.forcedNewRoute, to => {
			this.currentUrl = to;
			this.generateLinks();
		});
	},
};
</script>
