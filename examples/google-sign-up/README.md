# Registration button comparison

Archived visual study of Google, Apple, and PayPal sign-up buttons. The public URL is retained for reference. Authentication is disabled.


Published visual study requested by owner,19November2026. Source upper form and
historical risk/footer are clipped source images at375px. Noauthentication,
credentials,clientIDs,accountcreation or financialactions. No privateFigmaURL.

Default44px; optional40px. Auto chooses three full rows when viewport height
minus96px is at least868px, otherwise one compact row. Manual selectors expose
both arrangements. The earlier two-row bare-provider-label layout is removed.
Fullwidth343px,gap12px;compact icon controls44x44 atdefaultheight.

Google: Sign up with Google. GeneratedRobotoMedium14/20 at40px; GoogleSansMedium
14/20 per branding guide for the44px HTML adaptation. This is not an actualSDK
button. The official asset archive separately includes iOS188x44 and Android/Web
180x40. No universal40px maximum is inferred from webSDK presets.
Apple: Sign up with Apple, systemfont19px at44px and17px at40px; genuine official
logo-only endpoint artwork including its built-in padding, no source crop.
PayPal: Continue with PayPal;RobotoMedium18px (font selection is permitted by
PayPal's designer guide). Source-reference monogram remains in its source crop.
Compact mode hides Apple/PayPal visible text and retains full accessible names.

Sources:
https://developers.google.com/identity/branding-guidelines
https://developers.google.com/identity/gsi/web/reference/js-reference#theme
https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple
https://developer.apple.com/documentation/signinwithapple/incorporating-sign-in-with-apple-into-other-platforms
https://developer.paypal.com/log-in/designer-guide

Fonts remain unmodified GoogleFonts files with OFL/provenance in fonts/.
Run: python3 -m http.server 8922 --directory examples/google-sign-up
