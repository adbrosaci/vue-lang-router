<template>
	<div id="app">
		<div id="nav">
			<language-switcher v-slot="{ links }">
				<router-link :to="link.url" v-for="link in links" :key="link.langIndex">
					<img :src="require(`@/assets/${link.langIndex}.png`)" alt="" />
					<span>{{ link.langName }}</span>
				</router-link>
			</language-switcher>

			<language-switcher v-slot="{ links }" tag="ul" active-class="dotted-border">
				<li :class="link.activeClass" v-for="link in links" :key="link.langIndex">
					<a :href="link.url">{{ link.langIndex }}</a>
				</li>
			</language-switcher>

			<localized-link to="/" exact-active-class="red-color">{{ $t('nav.home') }}</localized-link> |
			<localized-link :to="{ path: '/about' }">{{ $t('nav.about') }}</localized-link> |
			<localized-link to="/user/radek-altof">{{ $t('nav.user') }}</localized-link> |
			<localized-link to="/pos/12/info">{{ $t('pos.info') }}</localized-link> |
			<localized-link to="/pos/12/manager/bad-motherfucker">{{ $t('pos.manager') }}</localized-link>
		</div>
		<router-view/>
	</div>
</template>

<style lang="scss">
html {
	font-family: sans-serif;
}

#app {
	text-align: center;
	font-size: 16px;
}

h1 {
	font-size: 30px;
	margin: 20px;
}

#nav {
	padding: 30px;

	a {
		color: #2c3e50;
		text-decoration: none;

		&:hover, &:focus {
			text-decoration: underline;
		}
		&.router-link-exact-active {
			color: #42b983;
		}
		&.red-color {
			color: red;
		}
	}
}

.router-language-switcher {
	margin-bottom: 20px;

	a {
		margin: 0 10px;
	}
	img {
		width: 24px;
		height: 24px;
		vertical-align: middle;
		margin-right: 5px;
	}
	span {
		vertical-align: middle;
	}
	li {
		width: 40px;
		line-height: 16px;
		margin: 0 auto 10px;

		&.dotted-border {
			outline: 1px dotted #42b983;
		}
	}
}
</style>
