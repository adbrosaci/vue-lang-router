<template>
	<component :is="getTag()" class="router-language-switcher">
		<slot :links="links" />
	</component>
</template>

<script>
// <language-switcher> component generates links to the given/current page in all available languages

export default {
	name: 'LanguageSwitcher',
	data () {
		return {
			currentUrl: this.url || this.$router.currentRoute.fullPath || this.$router.currentRoute.value.fullPath,
			links: [],
		};
	},
	props: [ 'tag', 'active-class', 'url' ],
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
		$route (to) {
			this.currentUrl = this.url || to.fullPath;
			this.generateLinks();
		},
	},
	mounted () {
		this.generateLinks();
	},
};
</script>
