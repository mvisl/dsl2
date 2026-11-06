# Interest banner · DSL 0.6

Eight editable campaign templates with native vector arrow/slash artwork. No runtime dependencies. The web component uses HTML text, inline SVG gradients/masks and the open-source Roboto variable font. The glowing crown is an original foreground bitmap; the backgrounds are entirely vector.

## Run

Unzip `interest-banner-component.zip` and serve the directory over HTTP:

```sh
python3 -m http.server 8080
```

Open `http://localhost:8080/example.html`. ES modules and local fonts require an HTTP server; do not open the example with `file://`.

```html
<script type="module" src="./interest-banner.js"></script>
<div style="width:100%;max-width:600px">
  <interest-banner template="earning" position="56.125356"></interest-banner>
</div>
```

## API

Attributes: `template`, `shape="arrow|slash"`, `position` (0–100), `height` (CSS pixels, default122), `radius` (default4), `hue` (degrees), `glow` (0–1), `background-only` (boolean). `position` always marks the split **at half the height**: the arrow apex or the midpoint of the diagonal. For the diagonal it does not mark the bottom intersection.

The percentage is multiplied by the actual `ResizeObserver` container width. Changing width moves the split proportionally. Copper geometry, rounding and glow keep their aspect ratio: they scale with height only. The shared graphite fills the container and the left illumination stays at the left. The moving geometry extends4096px left. Beyond the source artwork’s left margin, a25-stop vertical continuation matches its boundary colours, so large widths do not expose the hidden base fill. Native banner positions are unchanged.

```js
const banner = document.querySelector('interest-banner');
banner.config = {
  template: 'earning',
  shape: 'arrow',
  position: 56.125356,
  height: 122,
  radius: 4,
  hue: 0,
  glow: 1,
  backgroundOnly: false,
  fontFamily: 'InterestRoboto, Roboto, Arial, sans-serif',
  fontScale: 1,
  metricSize: 44,
  // Optional override for every44px number:
  // metricColor: '#ffa500',
  fields: {
    'field-1': {text: '$23.08', size: 44, opacity: 1, color: '#ffa500'},
    'field-2': {text: 'Gold status', hidden: false}
  },
  icons: {0: {hidden: false}}
};

banner.addEventListener('banner-render', event => {
  console.log(event.detail); // {width, height, position, edge}
});

const svg = banner.getSVG(); // Background only, current rendered width
const resolved = banner.resolvedConfig;
```

Attributes take precedence over the same `config` property. Remove an attribute before controlling that property solely through `config`. Text is assigned as escaped text, not HTML. `fields` keys, editable geometry and source style/binding metadata are listed in `templates.json` / exported `templates`. Above351px foreground text remains its native size; below351px it scales down to fit the source composition. The background split remains percentage-anchored independently of foreground text.

Template keys: `up-to`, `new-verification`, `earning`, `accrued-verification`, `next`, `get-platinum`, `rate-verification`, `keep-earning`.

## Background without the web component

```js
import {backgroundSVG} from './interest-background.js';
document.querySelector('#background').innerHTML = backgroundSVG({
  shape: 'slash', width: 600, height: 122, position: 67.236467, radius: 4
});
```

`interest-background.js` is self-contained: exported SVG artwork is embedded. It also exports `downloadBlob`. Width is clamped to1–4096px, height24–1024px, position0–100. The lab intentionally offers a narrower useful UI range. SVG exports are static snapshots at the selected size. Downloadable **adjustable HTML backgrounds** embed this renderer and controls, work offline, and can generate new SVG sizes without a server.

## DSL 0.6 provenance

The lab reports actual existing text-style and variable bindings, not a claim that every visual property is a design-system token. Source-bound text styles include:

- `Text/Small 15 [15-20]`
- `Text/Super Small [12-16]`
- `Text/Small [14-18]`
- `Text/Small Link [13-18]`

`templates.json` records every field's actual bound variable names (e.g. `font/size/md`, `Text/text-primary`). Fields without a text style are explicitly marked authored. Campaign44/32 metrics, gradient lettering, decorative glow and artwork have authored values. Font-size variable names map to CSS custom properties by replacing slashes with hyphens and adding `--dsl06-`; e.g. `font/size/md` becomes `--dsl06-font-size-md`.

```css
interest-banner {
  --dsl06-font-size-xs: 12px;
  --dsl06-font-size-sm: 13px;
  --dsl06-font-size-md: 14px;
  --dsl06-font-size-lg: 15px;
}
```

The web component uses source-resolved colours as fallbacks and allows per-field colour overrides through `config`. Colour aliases also map to lowercase CSS variables (e.g. Text/text-primary → --dsl06-text-text-primary); the source colour remains the fallback. This is not a connection to the protected DSL2 runtime. No existing constructor routes, private data, account behaviour or financial logic are imported. Rates and balances are design fixtures, not live offers.

## Integration into another constructor

Import `InterestBanner`, `templates` and `backgroundSVG`. Use the template keys for the left catalog, `config` for the property panel and the `banner-render` event for rulers. Keep this component's schema and background renderer separate from unrelated source registries. It is a self-contained public lab; it does not mutate the main DSL2 constructor.

Roboto is distributed under the SIL Open Font License; see `assets/OFL-Roboto.txt`. Original approved foreground icon vectors and background gradients are included with the component.
