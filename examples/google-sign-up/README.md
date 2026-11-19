# Registration button comparison

Owner-authorized update 19 November2026: corrected registration reference replaces
start-screen study. Original upper form/background and risk/footer are displayed
as clipped source image at375px; risk figures are historical source copy, not
updated claims. User explicitly requested upper source image publication.
Google/PayPal/Apple are independent clickable visual controls; no authentication,
account creation, credentials or OAuth client IDs. No private Figma URL published.

Default button height44px. Toggle40px remains available. LayoutAuto uses available
browser height (viewport minus96px): three full rows at868px available, two rows
at812px, and a compact single row otherwise. Manual layout selectors expose all
three arrangements for comparison. At44px compact controls are44x44 and Google
uses remaining231px. Gaps12px, full width343px. All providers keep accessible names.

Apple temporarily uses the source logo crop and labelApple, as owner explicitly
requested; it is a visual review label, not an approved production Apple CTA.
Compact hides provider captions and retainsApple/PayPal accessible labels. Noauth.
Google44 is this page's HTML adaptation. Official downloaded Google assets also
include iOS188x44 and Android/Web180x40;40is not a universal branding maximum.
Reference creation form and footer are source-image regions, not live forms.

Sources:
https://developers.google.com/identity/branding-guidelines
https://developers.google.com/identity/gsi/web/reference/js-reference#logo_alignment
https://developer.apple.com/documentation/signinwithapple/incorporating-sign-in-with-apple-into-other-platforms

Fonts are unmodified GoogleFonts files with OFL notices and metadata in fonts/.
Google guide prose says GoogleSans, liveHTMLgenerator Roboto: routes separate.

Run: python3 -m http.server 8918 --directory examples/google-sign-up
