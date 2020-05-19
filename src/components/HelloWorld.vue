<template>
	<div>
		<h1>{{ greeting }}</h1>
		<p>{{ $t('content') }}</p>
	</div>
</template>

<script>
export default {
	name: 'HelloWorld',
	props: {
		greeting: String,
	},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h1 {
	color: red;
}
</style>
