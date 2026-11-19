# Registration button comparison

Owner-authorized update 19 November2026: corrected registration reference replaces
start-screen study. Original upper form/background and risk/footer are displayed
as clipped source image at375px; risk figures are historical source copy, not
updated claims. User explicitly requested upper source image publication.
Google/PayPal/Apple are independent clickable visual controls; no authentication,
account creation, credentials or OAuth client IDs. No private Figma URL published.

Google: official generated HTML default40px; optional44px custom interpretation,
not explicit Google approval. Both group G+text centrally via documented option.
Apple: image from official Apple generator, center aligned, white, radius4,
width166pt, height40/44pt, scale2, typecontinue,en_US. Its native typography is
preserved; not forcibly changed to Google14px. PayPal artwork uses source-image
crop; caption14px. Allcontrols width343/full or165.5/half, gap12, height40/44.
Reference creation form is image-only, not a working registration form.

Sources:
https://developers.google.com/identity/branding-guidelines
https://developers.google.com/identity/gsi/web/reference/js-reference#logo_alignment
https://developer.apple.com/documentation/signinwithapple/incorporating-sign-in-with-apple-into-other-platforms

Apple officially supports height30..64; unlike Google44 is an explicit allowed
range. Caption is Continue with Apple because generator documents continue and
sign-in, not sign-up. Never substitute a fake Apple logo or force its font14px.

Fonts are unmodified GoogleFonts files with OFL notices and metadata in fonts/.
Google guide prose says GoogleSans, liveHTMLgenerator Roboto: routes separate.

Run: python3 -m http.server 8918 --directory examples/google-sign-up
