<template>
	<component :is="getTag()" class="router-language-switcher">
		<slot :links="getLinks()" />
	</component>
</template>

<script>
// <language-switcher> component generates links to the given/current page in all available languages

import { translations } from '@lang/translations';
import { i18n } from '../index';

export default {
	name: 'LanguageSwitcher',
	data () {
		return {
			currentUrl: this.url || this.$router.currentRoute.path,
		};
	},
	props: [ 'tag', 'active-class', 'url' ],
	methods: {
		getTag () {
			if (this.tag) { return this.tag; }
			else { return 'div'; }
		},
		getLinks () {
			let links = [];
			const activeClass = this.activeClass || 'router-active-language';

			for (let [ lang, data ] of Object.entries(translations)) {
				links.push({
					activeClass: (lang == i18n.locale ? activeClass : ''),
					langIndex: lang,
					langName: data.name,
					url: this.$localizedUrl(this.currentUrl, lang),
				});
			}

			return links;
		},
	},
	watch: {
		$route (to) {
			this.currentUrl = this.url || to.path;
		},
	},
};
</script>
