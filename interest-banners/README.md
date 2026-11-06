# Interest banner — copy into your project

The page is a demonstration and integration guide. Your application uses **its own local copy** of the component and assets. It never loads the public demonstration page, GitHub, a CDN or an external font.

## Choose your integration

| Project | Take | Start with |
|---|---|---|
| Web application | JS component and its local files | `example.html` |
| Vue 3 | Ready Vue wrapper + component files | `examples/vue/InterestBanner.vue` |
| Cordova / existing WebView | One self-contained local HTML file | `interest-banner.standalone.html` |
| Your own renderer | SVG assets / background renderer | `interest-background.js` |

Download `interest-banner-component.zip`. Preserve the folder structure when copying. All fonts, icons, gradients and masks are included. The artwork, typography, height122px and corner4px are the approved design, not runtime customization options.

## 1. Web

Copy this folder into your application, for example `components/interest-banner/`.

```html
<interest-banner id="interest"></interest-banner>
<script type="module">
  import './components/interest-banner/interest-banner.js';
  const banner = document.querySelector('#interest');
  banner.config = {
    template: 'earning',
    position: 56.125356,
    fields: { 'amount': { text: '$23.08' } }
  };
  banner.addEventListener('click', () => {
    // Open your application's Interest screen.
  });
</script>
```

Set the width of the parent container. The component fills it and measures changes automatically; no window-resize wiring is needed. Use a local HTTP dev server for the module example:

```sh
python3 -m http.server 8080
```

Open `http://localhost:8080/example.html`.

## 2. Vue 3

Copy the whole folder into `src/components/interest-banner/`. Import the supplied wrapper; no custom-element compiler configuration is needed because the wrapper mounts the element itself.

```vue
<script setup>
import InterestBanner from './components/interest-banner/examples/vue/InterestBanner.vue';
const fields = { 'amount': { text: '$23.08' } };
function openInterest() { /* your routing */ }
</script>
<template>
  <InterestBanner
    template="earning"
    :position="56.125356"
    :fields="fields"
    @activate="openInterest"
  />
</template>
```

Props are reactive: `template`, `position`, `fields`. The wrapper emits `activate` on click or keyboard activation. The component has static asset references suitable for a Vite production build. The runnable example is included:

```sh
cd examples/vue
npm install
npm run dev
# or npm run build
```

The supplied wrapper targets Vue3.

## 3. Cordova / local WebView

Copy **one file**, `interest-banner.standalone.html`, into your application's local resources, for example `www/components/`. It embeds its CSS, JavaScript, font, icons and both vector backgrounds. It has no imports or network requests and works without a build step.

```html
<iframe id="interest"
  src="components/interest-banner.standalone.html"
  title="Interest"
  style="border:0;width:100%;height:122px">
</iframe>
<script>
  const frame = document.querySelector('#interest');
  frame.addEventListener('load', () => {
    const bridge = frame.contentWindow.InterestBannerBridge;
    bridge.configure({
      template: 'earning',
      position: 56.125356,
      fields: { 'amount': { text: '$23.08' } }
    });
    frame.contentWindow.addEventListener('interest-banner-activate', () => {
      // Your application's routing.
    });
  });
</script>
```

`configure()` replaces the runtime configuration. Pass the data you want to retain on each update. `getState()` returns the resolved configuration and actual width. `ready` is a promise for the local font. The complete local example is `examples/cordova/index.html`.

Use the local content/CSP policy already established in your Cordova application; the font and icons are embedded as data resources. The archive does not add Cordova plugins, remote whitelists or server dependencies. Cordova-specific device builds must be run in your own target application; the supplied local example is browser-tested.

## Runtime API

Only these parameters are supported:

| Parameter | Meaning |
|---|---|
| `template` | One of the8 approved templates |
| `position` | Divider X as percent of the actual container width,0–100 |
| `shape` | `arrow` or `slash`; normally supplied by the template |
| `fields` | Text/value data, keyed by semantic field names such as `amount`, `rate` and `status` |
| `backgroundOnly` | Background-only preview / renderer |

Template keys: `up-to`, `new-verification`, `earning`, `accrued-verification`, `next`, `get-platinum`, `rate-verification`, `keep-earning`.

`templates.json` records fields, defaults and source DSL0.6 bindings. Fields use semantic keys such as `amount`, `rate`, `status`, `title`, `caption`, `nextRate`. Old `field-N` keys are accepted as aliases. Values can be strings or `{text: '…'}`. Unknown design-changing properties are ignored, including older saved settings for hue, glow, sizes, colours, opacity, fonts, icon visibility, height and radius. There are no corresponding controls in the developer page.

```js
banner.config = {
  template: 'earning',
  position: 60,
  fields: { 'amount': '$42.00' }
};
const current = banner.resolvedConfig;
const svg = banner.getSVG(); // Background at the actual rendered width
banner.addEventListener('banner-render', event => {
  console.log(event.detail); // {width, height:122, position, edge}
});
```

HTML attributes `template`, `shape`, `position`, `background-only` are also supported. Attributes take precedence over the matching config properties; choose one method instead of duplicating them. Text is escaped, not inserted as HTML. `fontReady` can be imported to await the included local Roboto font.

## Position and widths

The anchor is the split **at half the banner height**: the arrow apex or the middle of the diagonal. It is not the diagonal's bottom intersection.

```text
edgeX = actualContainerWidth × position / 100
```

Changing width moves the split proportionally. The arrow/diagonal, rounding and light are never stretched horizontally. The left illumination remains fixed. Source artwork has a matching far-left continuation for wide containers. In the demo, screen-width presets include12px padding on each side:375px screen →351px banner. Your application owns its outer layout; the component itself adds no margins.

## Background only

```js
import { backgroundSVG } from './interest-background.js';
const svg = backgroundSVG({shape:'slash', width:600, position:67.236467});
```

The renderer is self-contained and entirely vector. SVG downloads are fixed-size snapshots. The separately downloadable background HTML files let developers change **width and X position only**, offline, then export SVG. Height, radius and all visual treatment remain fixed.

## DSL 0.6 reference

The inspector is read-only source provenance. It shows the actual text styles and variable names of the approved Figma templates; it is not an editor for the design system. Source styles include `Text/Small15[15-20]`, `Text/Super Small[12-16]`, `Text/Small[14-18]`, `Text/Small Link[13-18]`. Authored display typography is explicitly distinguished from text-style-bound fields. Keep the included tokens/source values when integrating. Do not turn palette, glow or font choices into application runtime parameters.

The decorative glowing crown is the original bitmap foreground. Both backgrounds are vectors. Roboto is distributed under SIL OFL; see `assets/OFL-Roboto.txt`.

## Rebuild and test

```sh
node test-background.mjs
python3 build-standalone.py
python3 build-package.py
```

Reference documentation: [Vue and Web Components](https://vuejs.org/guide/extras/web-components), [Vite asset handling](https://vite.dev/guide/assets.html), [Cordova architecture](https://cordova.apache.org/docs/en/latest/guide/overview/). These are documentation links, not application dependencies.
