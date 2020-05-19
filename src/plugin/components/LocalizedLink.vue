<template>
	<router-link :to="localizedTo" v-bind="$attrs">
		<slot />
	</router-link>
</template>

<script>
// <localized-link> component extends <router-link> and localizes URL

export default {
	name: 'LocalizedLink',
	props: [ 'to' ],
	computed: {
		localizedTo () {

			// If "to" is a string, localize it
			if (typeof this.to === 'string') {
				return this.$localizedUrl(this.to);
			}

			// If "to" is an object with "path", copy it and localize "path"
			else if (typeof this.to === 'object' && typeof this.to.path === 'string') {
				const o = JSON.parse(JSON.stringify(this.to));
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
</script>
