<i18n>
{
	"cs": {
		"heading": "Tohle je stránka O nás."
	},
	"en": {
		"heading": "This is an About page."
	}
}
</i18n>

<template>
	<div class="about">
		<h1>{{ $t('heading') }}</h1>
		<p>{{ $t('content') }}</p>
	</div>
</template>

<script>
export default {
	name: 'About',
	i18n: {
		sharedMessages: {
			cs: {
				content: 'Zpráva načtená z i18n sharedMessages.',
			},
			en: {
				content: 'A message loaded from i18n sharedMessages.',
			},
		},
	},
};
</script>
