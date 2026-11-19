# Google sign-up button study

Published at https://mvisl.github.io/dsl2/examples/google-sign-up/

Owner-requested neutral button comparison, observed 19 November 2026. No private
Figma link, source screen export, credentials, OAuth client ID or account data.
This is a visual example, not an authentication implementation.

Default: actual Google branding-page HTML configurator pattern: Light,
Rectangular, Sign up with Google, Center logo group, width343px. Its CSS specifies
Roboto Medium14px, height40px, logo20px and gap10px. The configurator emits an
invalid unitless width; the preview sets width343px through its class. Keyboard
focus is made visible outside the button. Discrete Google SVG paths are copied
from that configurator, not traced or recolored.

Custom comparison: width343/height44, Google Sans Medium14/20, unchanged official
logo20/gap10/padding12/radius4/colors. Height44 is an interpretation of the guide's
custom size allowance; this is not a claim of separate Google certification.
The reference17px button is explicitly comparison-only, not branded compliant.

The guide prose specifies Google Sans while its live generator still emits
Roboto. Both routes are shown separately; neither SDK font-size override nor
iframe repainting is used. In the SDK there is no separate font-size parameter.

Sources:
- https://developers.google.com/identity/branding-guidelines#render-html-button
- https://developers.google.com/identity/branding-guidelines#custom-button
- https://developers.google.com/identity/gsi/web/reference/js-reference#GsiButtonConfiguration
- Fonts downloaded unmodified from Google Fonts CSS endpoints for Roboto400/500
  and Google Sans500; exact font hashes/metadata in fonts/provenance.json. OFL
  notices accompany them. Browser served them locally to avoid a failed external
  stylesheet response; all three font URLs returned HTTP200.

Run locally: python3 -m http.server 8918 --directory examples/google-sign-up

QA: actual browser inspected at1280x720; switch generated -> custom -> reference
-> generated. Measured generated343x40 and custom343x44, source17/22 vs14/20;
no login/signup submission. Hosted verification is recorded in private handoff.
