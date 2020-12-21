# :earth_africa: Vue Language Router

Language routing and URL localization made easy.

![](https://raw.githubusercontent.com/adbrosaci/vue-lang-router/master/lang-router.gif)

Built on top of :vertical_traffic_light: [Vue Router](https://next.router.vuejs.org) and :globe_with_meridians: [Vue I18n](https://vue-i18n-next.intlify.dev).


## Features

:hourglass_flowing_sand: Asynchronous translation loading

:performing_arts: URL localization

:classical_building: Default language (no language prefix in URL)

:baby: Supports variables and children in routes

:car: :bike: Supports both history and hash mode

:books: Sets user-preferred language on first visit

:memo: Loads last used language when visiting site again

:fast_forward: No extra router setup


## :warning: Version information

This is a pre-release version compatible with [Vue 3](https://v3.vuejs.org). Tread carefully. [Vue Router](https://github.com/vuejs/vue-router-next) has only just been released and [Vue I18n](https://github.com/intlify/vue-i18n-next) does not have a stable release yet. Hence this plugin may be unstable as well.

For [Vue 2](https://vuejs.org) compatibility, you need to use [v1](https://github.com/adbrosaci/vue-lang-router) of this project.

If you are migrating from [Vue 2](https://vuejs.org), you need to adjust your `router.js` and `main.js` files. See points 4 and 5.


## Installation


### ~~Vue CLI plugin (recommended)~~

~~The easiest way to install Language Router is using [Vue CLI plugin for Language Router](https://github.com/adbrosaci/vue-cli-plugin-lang-router#readme). The plugin will modify your router file, setup translation files and more.~~

The Vue CLI plugin is not ready for this version yet, you have to install manually.


### Manually

#### 1. Install Language Router

```sh
$ npm i vue-lang-router@next
```

#### 2. Create translations in your app.

> Note: This example uses Czech and English translations.

Example file structure:

```sh
src
└── lang
    └── translations
        ├── cs.json
        ├── en.json
        └── index.js
```

Create `JSON` files for all desired languages and reference them in `index.js`. Translations are loaded on demand. 

```javascript
/*  src/lang/translations/en.json  */

{
  "hello": "Hello!",
  "about": {
    "example": "This is an About page."
  }
}
```

```javascript
/*  src/lang/translations/cs.json  */

{
  "hello": "Ahoj!",
  "about": {
    "example": "Tohle je stránka O nás."
  }
}
```

```javascript
/*  src/lang/translations/index.js  */

export default {
  en: {
    name: 'English',
    load: () => { return import('./en.json'); },
  },
  cs: {
    name: 'Česky',
    load: () => { return import('./cs.json'); },
  },
};
```

In case you do not want to load translations asynchronously, you can provide `messages` object with translations instead of `load` function. For example:

```javascript
export default {
  en: {
    name: 'English',
    messages: {
      hello: 'Hello!',
    },
  },
};
```

#### 3. Create localized URLs in your app.

> Note: Localized URLs are optional.

Example file structure:

```sh
src
└── lang
    └── localized-urls
        ├── cs.json
        └── index.js
```

Create `JSON` files for all desired languages and `import` them in `index.js`. Localized URLs need to be imported before router instantiation.

```javascript
/*  src/lang/localized-urls/cs.json  */

{
  "about": "o-nas"
}
```

```javascript
/*  src/lang/localized-urls/index.js  */

import cs from './cs.json';

export default { cs };
```

Language router will parse any given path and attempt to localize its segments based on this configuration. If no match is found, the original path segment is retained.


#### 4. Modify your router file

- Import `createLangRouter` and use it instead of `createRouter`.
- Import translations and localized URLs.
- Create router using `createLangRouter`. Pass in the language options and router options. The router options are exactly the same as if using `createRouter`.

```javascript
/*  src/router/index.js  */

import { createWebHistory } from 'vue-router';
import { createLangRouter } from 'vue-lang-router';

import translations from '../lang/translations';
import localizedURLs from '../lang/localized-urls';

const routes = [ /* Your routes here */ ];

const langRouterOptions = {
	defaultLanguage: 'en',
	translations,
	localizedURLs,
};
const routerOptions = {
	routes,
	history: createWebHistory(process.env.BASE_URL),
};

const router = createLangRouter(langRouterOptions, routerOptions);

export default router;
```

#### 5. Modify your main file

Import `i18n` and use it in your Vue app.

```javascript
/*  src/main.js  */

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { i18n } from 'vue-lang-router';

createApp(App).use(router).use(i18n).mount('#app');
```


## How to use

### Using translations

To use any translated string, use `$t('stringName')` in your code. For more information check out [`Vue I18n`](http://kazupon.github.io/vue-i18n/).


### Using links

Use `<localized-link>` component. It localizes given router path based on current language. It's a simple, yet powerful component, which takes a hassle out of generating proper links on your site.

It accepts the same options as [`<router-link>`](https://router.vuejs.org/api/#router-link-props).

```html
<localized-link to="/user/john-smith">John Smith</localized-link>
```

The above code will generate a link with `href` value depending on various factors. Here are a few examples:

```javascript
/*
Default language: "en"
Current language: "en"
Localized URLs "en": {}
Current URL: /
*/

href="/user/john-smith"


/*
Default language: "en"
Current language: "en"
Localized URLs "en": { "user": "u" }
Current URL: /en/example
*/

href="/en/u/john-smith"


/*
Default language: "en"
Current language: "cs"
Localized URLs "cs": { "user": "uzivatel" }
Current URL: /
*/

href="/cs/uzivatel/john-smith"
```



### Switching language

Use `<language-switcher>` component for this. The component will loop over all available languages and generate `links` array with properties, which you can use to create your own menu.

The wrapper element will have `router-language-switcher` class.

#### Examples:

```html
<language-switcher v-slot="{ links }">
  <router-link :to="link.url" v-for="link in links" :key="link.langIndex">
    <img :src="require(`@/assets/${link.langIndex}.png`)" alt="" />
    <span>{{ link.langName }}</span>
  </router-link>
</language-switcher>
```

```html
<language-switcher v-slot="{ links }" tag="ul" active-class="my-custom-class">
  <li :class="link.activeClass" v-for="link in links" :key="link.langIndex">
    <a :href="link.url">{{ link.langIndex }}</a>
  </li>
</language-switcher>
```

#### Properties:

-  **url** : The localized path to the current/specified page in iterated language.
- **langIndex** : The index of the iterated language provided in `translations`.
- **langName** : The name of the iterated language provided in `translations`.
- **activeClass** : Returns the active class when iterated language equals current language, otherwise empty.


#### Accepted attributes:

- **tag** : Use this attribute to specify which tag should be used as a wrapper element. The default is `div`.
- **url** : Provides a specific path to generate translation links for. If omitted, current path is used.
- **active-class** : Defines the name of class to provide when language of the link equals current language. The default is `router-active-language`.