<template>
	<div>
		<h1>{{ $t('user-slug') + $route.params.slug }}</h1>

		<language-switcher v-slot="{ links }" url="/about">
			<a :href="link.url" v-for="link in links" :key="link.langIndex">
				<span><b>/about</b> {{ link.langName }}</span>
			</a>
		</language-switcher>
	</div>
</template>
