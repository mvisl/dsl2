---
design_reference_id: mobile-app-design
version: 1.1.1
last_updated: 2026-10-20
status: draft-for-ai-prototyping
canonical_url: https://mvisl.github.io/dsl2/DESIGN.md
changelog_url: https://mvisl.github.io/dsl2/CHANGELOG.md
manifest_url: https://mvisl.github.io/dsl2/design-manifest.json
freshness_max_age_days: 30
freshness_check_policy: on_session_start_max_once_per_day
figma_mcp_recommended: true
---

# Design System. Facelifting 2

Reusable design reference for AI-assisted mobile prototyping.

This document describes the current Design System mobile visual language, component rules, token usage, and working constraints. It is intended for designers, product teams, and AI coding/design agents that need to create mobile Design System prototypes without drifting into a generic dark fintech UI.

## AI Freshness Check: Read First

Before using this file, an AI agent must check whether this copy is current.

Check frequency:

- Check on session start or before the first meaningful use of this file.
- Do not check more than once per calendar day unless the user explicitly asks to update.
- If the same AI session runs for many hours, the same daily check is enough.
- Always check again on a later day before continuing work.

Use this logic:

1. Read the metadata block at the top of this file.
2. If this file was already checked today, continue without another remote check.
3. If `manifest_url` is a real URL, fetch the manifest first and compare `latestVersion` with this file's `version`.
4. If `manifest_url` is unavailable but `canonical_url` is a real URL, fetch the canonical `DESIGN.md` from that URL.
5. Compare `version` and `last_updated`.
6. If the remote version is newer, stop and say clearly:

```text
This Design System DESIGN.md is outdated. Please update it from the canonical source before continuing:
<canonical_url>
```

7. If the file is older than `freshness_max_age_days`, warn clearly even if the remote file cannot be checked.
8. If `canonical_url` is still `TODO_ADD_GITHUB_RAW_DESIGN_MD_URL`, say clearly:

```text
Freshness could not be verified because the canonical GitHub URL is not configured. Continue only as source-unverified, or provide the latest canonical DESIGN.md.
```

9. If Figma access is available, install or enable the Figma MCP/connector and inspect the linked Figma files before generating final UI.

Simple update methods:

- If this file is in a Git repository: run `git pull` and re-open `DESIGN.md`.
- If using a raw GitHub file: download the latest `DESIGN.md` from `canonical_url` and replace the local copy.
- If neither is possible: download the latest package from the public/internal download page or the canonical URL.

Do not silently continue with an outdated file.

## Status

Version: 1.1.1 draft for AI prototyping

Last updated: 2026-10-20

Primary scope:

- Follow each existing DSL component into actual mobile usage before defining its DSL 2.0 replacement: compare jurisdiction-specific, demo and real-account contexts, retain meaningful differences, then carry the approved structure into both DSL 2.0 and the web implementation. Source inspection does not prove coverage of uninspected sessions or flows.
- Design System mobile app: new reference screen frames are 375 × 812 px.
- Internal components remain responsive through auto-layout, Fill container and Hug content; verify text/optional-content overflow at narrower and wider host sizes.
- Design System DSL / V9 direction.
- DSL 2.0 migration direction based on DSL 0.6, Facelift 1, Facelift 2 references, and real product screen research.

Use this file as a practical style guide, not as the final source of truth for legal, brand, or production release approval. When a Figma source component or token exists, the Figma source wins.

## Maintenance

This file should be treated as a living source of truth for AI prototyping.

Recommended setup:

- Store this file in a GitHub repository as `DESIGN.md`.
- Link to the GitHub file from Jira, Figma documentation pages, and AI prompts.
- Do not copy/paste the content into many places. Link to the canonical GitHub version instead.
- Update this file whenever DSL 2.0 changes the visual language, token naming, component architecture, or important component behavior.
- Keep a short changelog at the bottom of the file or in a separate `CHANGELOG.md`.
- Keep the public/internal download page synchronized with this file during active DSL work. When the reference changes, upload the updated `DESIGN.md` package to the site once per calendar day, not more often unless the user explicitly asks.

Update triggers:

- New or renamed color, typography, spacing, radius, or effect tokens.
- New component family added to DSL 2.0.
- Component architecture changes, such as a new variant/property model.
- Facelift stage decisions: Legacy, F1, F2, or future stages.
- New rules for AI-generated prototypes.
- Discovery of a repeated product pattern in real screens.
- Manual migration decisions from DSL 0.6 to DSL 2.0.

Versioning rule:

- Any substantial update to the design system or to the AI-agent working rules must update this file in the same work session.
- The update must bump `version`, update `last_updated`, add a human-readable entry to `CHANGELOG.md`, update `design-manifest.json`, regenerate the downloadable site package, and publish the GitHub/site copy.
- This is not optional housekeeping. The design reference is part of the source of truth, so it must move with the DSL rather than lag behind it.
- Minor wording fixes that do not change rules or design behavior can be grouped into the next scheduled update.

Suggested workflow:

1. Work in Figma.
2. Record decisions in the DSL ledger.
3. Update `DESIGN.md` in the same session.
4. If a substantial rule or DSL change happened, update the downloadable site copy and manifest in the same pass. For long-running work, do not publish this sync more than once per calendar day unless the user explicitly asks.
5. Commit the Figma-related notes, `DESIGN.md`, and any site-package update together.
6. Reference the commit or pull request in Jira if the change affects product teams.

The file does not need to describe every component instance. It should capture stable rules, source links, naming decisions, and enough fallback values for AI tools that cannot inspect Figma directly.

## Source Registry

Connected source files are supplied separately through authorized access. This public package contains no private source identifiers.

## Access Modes

This document must work in two modes:

1. Connected mode: the AI agent has access to Figma through a Figma MCP server, Figma connector, or another Figma-aware tool.
2. Offline fallback mode: the AI agent only has this markdown file and cannot inspect the Figma files directly.

Connected mode is preferred. Offline fallback mode is allowed for quick prototypes, but the result must be treated as source-unverified until checked against Figma.

### Connected Mode: Preferred

If the AI environment supports MCP, connectors, plugins, or external tools, the agent should first try to connect to Figma before generating UI.

Recommended instruction for the agent:

```text
Install or enable the Figma MCP/connector if available. Open the Design System source links from DESIGN.md. Verify that the files are visible. Inspect the relevant nodes, variables, text styles, and components before generating UI. Use the Figma source as the source of truth. If Figma access is unavailable, continue in offline fallback mode and clearly mark the output as source-unverified.
```

When Figma is available, use this source priority:

1. Design System DSL 2.0.
2. Design System DSL 0.6, when DSL 2.0 is incomplete or migration mapping is needed.
3. Facelift 2 reference files for new F2 geometry and behavior.
4. Product screen research files for real usage patterns.
5. This `DESIGN.md` as a compact reasoning and fallback layer.

The markdown file explains the system. The Figma files contain the exact source components, variables, text styles, vector icons, effects, and measured geometry.

### Offline Fallback Mode

If Figma access is not available, use this file as the fallback style pack.

In offline mode:

- Use the token tables, typography names, spacing scale, radius scale, and component rules below.
- Do not invent a new visual language.
- Do not introduce new colors beyond the documented tokens unless absolutely necessary.
- Do not replace Design System with generic fintech patterns.
- Mark exact component fidelity as `source-unverified`.
- Prefer simple, clean implementations over fake precision.
- When a detail is missing, leave a clear `TODO: verify against Figma source` instead of guessing silently.

Offline mode is acceptable for early AI prototypes, internal exploration, and quick flow sketches. Final design-system work must be checked in connected mode.

### Minimal Offline Style Pack

If the agent cannot read Figma, these are the safest defaults:

- App background: `#111111`.
- Main surface: `#181818`.
- Raised surface: `#242526`.
- Primary text: `#FFFFFF`.
- Secondary text: `#909294`.
- Tertiary text: `#606264`.
- Main Facelift 2 accent: `#FFA408`.
- Strong orange accent: `#FF6633`.
- Positive: `#53A642`.
- Negative: `#E64545`.
- Main spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.
- Default card radius: 16.
- Glass/card radius: 20.
- Full pill radius for badges, active tabs, and rounded controls.
- Mobile screen width: 375 px.
- Product tone: dark, dense, calm, finance-native, orange-accented, not promotional.

## Product Personality

Design System mobile should feel:

- Dark, calm, precise, and finance-native.
- Dense enough for trading and investing workflows.
- Professional rather than promotional.
- Airier in Facelift 2 than in legacy screens.
- Rounded, tactile, and layered.
- Focused on orange as the primary action and selection accent.

Avoid:

- Generic SaaS dashboards.
- Marketing landing-page composition.
- Oversized hero sections.
- Decorative gradients without product meaning.
- Random glass effects where the source component does not use glass.
- Card-heavy layouts when a compact list or row is more appropriate.

## Core Design Direction

### Facelift 2

Facelift 2 is the preferred direction for new mobile work.

Main visual moves:

- More air and breathing room.
- More rounded shapes.
- Orange replaces blue as the main accent.
- Matte glass and frosted surfaces are used intentionally for plates and overlays.
- Components should remain compact and useful, not decorative.

### Legacy Support

Legacy and Facelift 1 remain important for migration.

Do not delete or ignore legacy structures where they still exist in source files. Use explicit stage naming when a component has real generational differences:

- `Stage=Legacy`
- `Stage=F1`
- `Stage=F2`

Do not create fake Legacy variants just for symmetry. If Legacy and F1 are visually and structurally identical for a component, document that decision instead of duplicating the component.

## Non-Negotiable Rules

1. Do not invent values.

If the source has a font, size, color, radius, spacing, shadow, stroke, or layout value, copy it exactly. If the source is unclear, leave an open question or mark the layer as `DRAFT / NEEDS-REVIEW`. Do not fill gaps by eye.

2. Use DSL tokens, styles, and components.

No arbitrary colors, fonts, spacing, radii, or effects when a DSL token/style exists.

User requests must be translated through the DSL scale. If the user asks for a card, button, label, larger text, more air, stronger rounding, softer glass, or a different emphasis, first choose from existing DSL components, text styles, spacing variables, radius variables, color variables, and effect styles. Offer the closest system option and explain it in design-system terms. Do not type a new size, padding, radius, color, shadow, or font just because it looks plausible.

This applies to the product UI and to every artifact that represents the design system: documentation pages, release pages, mini-sites, Figma review boards, examples, screenshots, labels, and downloadable reference pages. If an artifact claims to be the Design System source of truth, it must be built with Design System tokens, text styles, radii, spacing, icons, and component behavior. The only allowed exceptions are explicitly documented one-off display choices, such as a larger editorial title for a cover/landing page, or a documented glass opacity experiment.

Any deviation must be recorded next to the artifact with:

- which DSL token/style/component could not be used;
- why the deviation is necessary;
- whether it is temporary or an approved exception;
- what must happen to bring it back into the DSL.

3. Preserve text style bindings.

If a text layer has a `textStyleId`, keep it. If the style is missing or broken, recover it from the source component or trusted reference. Do not replace it with manual typography.

4. Exact clone before reconstruction.

When a source node exists, clone it. Preserve vector paths, fills, strokes, effects, layer structure, and text style bindings. Rebuild manually only when the source is technically unavailable, and mark the result as draft.

5. Use components for repeated structures.

Repeated rows, cards, icons, badges, filters, buttons, and navigation items must be components or instances. Do not create repeated loose groups.

If a repeated component is broken, fix the master, atom, or molecule component. Do not patch many visible screen instances by hand.

6. Use auto-layout for structure.

Everything structural should be auto-layout. Avoid absolute-positioned piles except where the source component itself uses absolute positioning for a real reason.

7. Variants are for structure and state, not content.

Do not create separate variants only because text or icon content differs. `Gold` vs `Bitcoin` is content, not a variant. `Selected` vs `Default`, `Error` vs `Default`, or `Layout=Floating/Grouped` are valid variants.

8. Prefer variables over variants for simple toggles.

Use variables for simple show/hide, opacity, or numeric differences when the child set does not change. Use variants when the structure, interaction target, or child set changes.

9. Content assets are not UI tokens.

Flags, payment logos, brand marks, instrument artwork, and marketing/content illustrations keep their own colors. Do not rebind them to UI semantic tokens.

10. No overlap.

Do not place components, boards, masters, or review frames on top of existing screens or other masters. Verify with screenshot or metadata after moving/creating.

11. Keep source names clean.

Layer and component names should be meaningful and stable. Do not add debug suffixes or visible version prefixes such as `V9` unless that prefix already exists as part of the source system.

## Color System

The app is dark-first. Surfaces should be near-black and layered with restrained contrast. Orange is the main action and selection accent in Facelift 2.

### Core Semantic Colors

Use semantic tokens whenever possible.

| Role | Token | Typical value |
| --- | --- | --- |
| App background | `color/bg/app` | `#111111` |
| Elevated background | `color/bg/elevated` | `#181818` |
| Default surface | `color/surface/default` | `#181818` |
| Raised surface | `color/surface/raised` | `#242526` |
| Glass base | `color/surface/glass-base` | `#FFFFFF1A` |
| Primary text | `color/text/primary` | `#FFFFFF` |
| Secondary text | `color/text/secondary` | `#909294` |
| Tertiary text | `color/text/tertiary` | `#606264` |
| Inverse text | `color/text/inverse` | `#000000` |
| Brand text | `color/text/brand` | `#FFA408` |
| Positive text | `color/text/positive` | `#53A642` |
| Negative text | `color/text/negative` | `#E64545` |
| Primary icon | `color/icon/primary` | `#FFFFFF` |
| Secondary icon | `color/icon/secondary` | `#909294` |
| Brand icon | `color/icon/brand` | `#FFA408` |
| Positive icon | `color/icon/positive` | `#53A642` |
| Negative icon | `color/icon/negative` | `#E64545` |
| Brand accent | `color/accent/brand` | `#FFA408` |
| Strong brand accent | `color/accent/brand-strong` | `#FF6633` |
| Positive accent | `color/accent/positive` | `#53A642` |
| Negative accent | `color/accent/negative` | `#E64545` |

### Legacy Blue

Legacy blue remains only for legacy or Facelift 1 states where the source uses it.

Typical legacy blue values:

- `color/blue-legacy/300`: `#9AAEEB`
- `color/blue-legacy/400`: `#7E98E5`
- `color/blue-legacy/500`: `#7D8BC3`

Do not use legacy blue for new Facelift 2 active states.

### Glass

Glass is intentional, not decorative filler.

Use glass tokens only where the source/reference has a matte-glass plate, frosted surface, or overlay.

Typical glass roles:

- `glass/fill/subtle`
- `glass/fill/default`
- `glass/fill/strong`
- `glass/fill/brand`
- `glass/fill/brand-strong`
- `glass/stroke/subtle`
- `glass/stroke/default`
- `glass/overlay/scrim`
- `glass/shadow/color`

Do not add glass to a component just because glass tokens exist.

Diagonal logo-tint gradients on cards should stay subtle. Use 10% opacity as the maximum unless the source is already lower; keep lower source values lower.

## Typography

Use existing DSL text styles. Do not manually type font sizes or line heights when a style exists.

### Important Styles

| Use | Style |
| --- | --- |
| Large screen titles | Heading styles from DSL |
| Body text | `Text/Regular [17-22]` |
| Compact body and card values | `Text/Small [14-18]` |
| Supporting labels | `Text/Super Small [12-16]` |
| Captions | `Text/Captions [11-14]` |
| Micro labels | `Text / Micro [9-10]` |
| Top navigation and smart tabs | `ADDITIONAL / TABS [13-16]` |

Top Navigation tab labels use `ADDITIONAL / TABS [13-16]`. Do not substitute Inter 16 or any other invented value.

If a text looks like an existing style but needs bold weight, derive from the matching regular style with the same metrics and mark it for review.

Descriptive card text and subtitles use the DSL secondary text color. Positive values use the DSL positive text color, not an arbitrary green.

Section subtitles should normally omit trailing periods unless the surrounding source/product pattern uses them.

## Spacing

Use spacing variables for all non-zero gaps and paddings.

Core scale:

| Token | Value |
| --- | --- |
| `spacing/000` | 0 |
| `spacing/100` | 4 |
| `spacing/200` | 8 |
| `spacing/300` | 12 |
| `spacing/400` | 16 |
| `spacing/500` | 20 |
| `spacing/600` | 24 |
| `spacing/700` | 32 |
| `spacing/800` | 40 |
| `spacing/900` | 48 |
| `spacing/1000` | 64 |

Component spacing rules:

- Main gap between screen sections: 48 px.
- Gap inside a section: 12 px.
- Horizontal carousel gap: 8 px.
- Badge row gap: 4 px.
- Gap inside most cards: 12 px.
- F1/legacy tab-like rows with compact tabs: gap 6 px when source confirms that pattern.

All non-zero gaps and paddings must be bound to spacing variables. Do not type raw near-miss values such as 31 px when the system value is 32 px.

Cards with dynamic text, badges, or progress bars should hug content vertically. Avoid fixed heights that hide bottom content, progress bars, or labels.

## Radius

Facelift 2 favors softer and more rounded geometry.

Use radius variables where available:

- 0
- 4
- 8
- 12
- 16
- 20
- 24
- 32
- Full pill/capsule

Badges, selected tab pills, and rounded icon buttons should use full capsule logic when the source/reference indicates a pill.

## Layout

Default mobile frame:

- Width: 375 px.
- Height: by content.
- UI language: English.
- Density: high enough for finance/trading use.

General screen composition:

- Use one global smart-filter row near the top.
- Avoid per-section filters unless they are meaningful.
- Use reusable section headers.
- Section header structure: title + subtitle, with a compact chevron immediately after the title when tap-through is needed.
- Do not add `Show all` links unless explicitly requested.
- Horizontal carousels may end with a `Show All / Carousel Card` when useful.

## Component Architecture

Organize components by product usage, not only by old file folders.

### Core / App Shell and Navigation

Used across most screens:

- App shell
- Status bar and safe area wrappers
- Tabbar
- Top Navigation
- Toolbar
- Search
- Smart filters
- Navigation tabs

### Core / Actions

Used across flows:

- Buttons
- Icon buttons
- Segmented controls
- Toggles
- Dropdown triggers
- Chips and filter pills

### Core / Inputs and Forms

Used in login, registration, wallet, trading, and settings:

- Text fields
- Password fields
- Search fields
- Validation states
- Country/phone selectors
- Keyboard-related controls

### Core / Data and Status

Used across markets and trading:

- Badges
- Pills
- Progress indicators
- Buy/sell split indicators
- Positive/negative value labels
- Loaders and empty states

### Product / Lists and Cells

High-frequency product structures:

- Instrument rows
- Market list rows
- Wallet/payment rows
- Notification rows
- Settings rows
- Expandable list items

### Product / Trading Workspace

Specialized components:

- Chart controls
- TPSL indicators
- Trade direction controls
- Order/deal widgets
- Signal cards
- Instrument profile blocks

### Product / Wallet and Payments

Specialized components:

- Deposit/withdrawal flows
- Payment method rows
- Balance cards
- Currency selectors
- Bank wire and card-specific UI

### Overlays and System Feedback

Used across flows:

- Popups
- Bottom sheets
- Action sheets
- Toasts
- Confirmation dialogs
- Scrim overlays

### Content Assets

Do not rebind to UI semantic colors:

- Flags
- Payment logos
- Broker/brand marks
- Instrument artwork
- Category illustrations

## Navigation Rules

### Tabbar / Item

Use exact source structures for each stage/state.

F2 selected state:

- Active icon sits in a dark/neutral pill or raised circular/pill area from source.
- Icon and label use the orange brand accent.
- The dark pill/background is separate from the orange icon color.
- Do not recolor the background orange unless the source does.
- Use real labels: `Markets`, `Trades`, `Discover`, `Wallet`, `More`.

Tabbar / Bar:

- Use real icons for each item.
- Do not reuse `Markets` for all five items.
- Active item state is controlled by component properties or variants, not by manually patched copies.

Tabbar / Shell:

- Safe-area and home-indicator zones must use the same surface token as the bar unless the source explicitly differs.
- Do not clip the raised F2 selected shape.
- Shell is platform wrapper, not part of the bar atom.

### Top Navigation

Facelift 2 Top Navigation is fully rounded.

Container-level structure:

- `Layout=Floating`
- `Layout=Grouped`

Floating:

- Only the active tab has a pill.
- No shared backing plate.
- Tabs can scroll and crop at viewport edge.
- Height: 36 px.

Grouped:

- All tabs sit on one shared rounded backing plate.
- Backing acts as a mask/clip container for scrolling content.
- Edge buttons exist as part of the structure where the source uses them.
- Edge buttons have their own `State=OFF/ON` on the button component.
- Height: 40 px.

Overflow fade:

- `canScrollLeft` and `canScrollRight` are container-level boolean controls.
- Fade overlays are not part of the tab item atom.
- Fade should be a clean gradient without noisy or uneven edges.

Search and edge icons:

- Use exact existing icon/glyph/vector sources.
- Do not draw approximate placeholders.
- If a glyph depends on a missing font, flatten/outline it at the source and copy the resulting vector.

## Icon and Asset Rules

- Repeated icons must be components or instances.
- Do not use ad-hoc PNGs, SVGs, vector overlays, screenshots, or loose replacement layers to fake icons, labels, badges, or instrument artwork inside existing components.
- Do not import heavy external icon or instrument libraries wholesale. If a source is needed, copy only the required assets and preserve them as local components/instances, or place them in a clearly separated draft/reference area.
- Component content changes must use existing component properties, variants, instance swaps, or cloned trusted instances. If the needed variant or component does not exist, record the missing source instead of masking the gap with a manual overlay.
- If an icon or content asset is technically unavailable, mark the component as `DRAFT / NEEDS-REVIEW` and document exactly where the source was searched.

## Badge Rules

Badges must be:

- Full pill/capsule.
- Auto-layout.
- Text inside the pill, never spilling outside.
- Dark or subtle surface fill from DSL tokens.
- Bound to DSL text style and color tokens.
- Text layers must keep the source DSL `textStyleId` when editing badge masters or instances.
- Uppercase when the label is metadata/category.
- Reusable component instances, not loose shapes.

Badge row gap:

- 4 px from the DSL spacing variable.
- Text-only badge rows reuse the existing badge component with icons hidden, not a custom loose pill.

Important labels:

- `AI IDEA`
- `TOP PROFIT`
- `Design System IDEA`
- `MARKET FOCUS`
- `DIVIDEND`
- `1-3 DAYS`
- `MEDIUM`
- `INTRADAY`
- `TREND`
- `82% BUYING`
- `71% BUYING`

Avoid:

- Circular dark fill on the left with text outside it.
- Text without bound style/color.
- Non-auto-layout badge assembled from loose layers.

### Instrument Recommendation Labels: F1 → F2

Keep the meanings Smart choice, News trading, Lowest commission and
Commission-free. In the approved F1 reference these already share a neutral
dark surface, secondary grey text and no outline; do not preserve their old
white/orange/green outline/fill distinctions merely because an imported master
still contains them.

The approved F2 reference retains this shared treatment and adds full capsule
rounding plus horizontal padding 8 and vertical padding 2 at height 20. Use
existing semantic badge-radius, background, text and spacing bindings, with the
source 12/16 text style. Keep source sentence case for these instrument labels;
the uppercase card-metadata rule does not override the exact instrument source.

Signal and recommendation labels share this visual treatment where the source
does, but preserve their different meanings, signal glyphs and directional
content. A plain label is not a substitute for a signal component.

Check the effective resolved mode and source-instance overrides, not just the
remote master: source F2 instances may override an older master. Primitive
radius bindings do not automatically change when a generation mode changes.
Retain source/archive generations while making the supported F2 target primary.

## Card and Feed Rules

V9 mobile feed direction:

- Calm varied feed.
- Dark surfaces.
- Orange accent.
- Compact but readable density.
- Product-first, not promotional.

Core sections:

- AI Ideas
- Top Profit
- Trading Central Signals
- Upcoming Dividends
- Market Leaders
- Market Focus
- Design System Ideas
- High Score Stocks

Card label rules:

- Do not duplicate the section name inside card labels when the section header already provides context.
- Use category labels when useful: `Metals`, `Currencies`, `Stocks`, `Crypto`, `Oil and gas`, `Indices`, `ETFs`, `Bonds`.
- Use `Crypto` as the compact label for `Cryptocurrencies`.
- Category labels keep the compact source structure: 16 px height, auto-layout, 4 px variable gap, zero variable padding, and DSL text style/color.
- Category icons should come from the existing Design System Markets icon set when readable at about 12-14 px visual size. If the detailed source icon is too noisy at that size, use the established simple symbol fallback instead of inventing a new taxonomy.
- Do not force category labels where every card would repeat the same category and lose meaning.
- Preserve the rest of the card layout when testing or changing category labels.
- Upcoming Dividends cards should keep the `DIVIDEND`/`DIVIDENDS` context instead of repeating `Stocks` on every card.

AI Ideas:

- Two rich cards: Gold and EUR/USD.
- Instrument icons: 32 px by 32 px.
- If a manually corrected icon instance exists, clone that exact instance so overrides and scaling are preserved.
- Metric and explanation are one semantic text block: metric as title, explanation as subtitle. Do not leave them as unrelated children with a large gap.
- Follow the source reference pattern when building the rich-card header: header height 96, top padding 8, gap 2, subtitle reserved for three lines, card bottom padding 12.
- Card label: `AI IDEA`.
- Gold metric: `+15%`.
- EUR/USD metric: `Buy`.
- Badges: `1-3 DAYS`, `MEDIUM`, `INTRADAY`, `TREND`.
- A confidence/progress bar is acceptable.

Top Profit:

- Two cards: Gold `$730k`, US NDAQ 100 `$123k`.
- Card label: `TOP PROFIT`.
- Instrument blocks can follow the AI Ideas pattern when icons are available: exact 32 x 32 icon instance on the left, title/subtitle stack on the right, 8 px gap.
- The large amount and gray caption should be one value block: amount as title, caption as subtitle, with 8 px top and bottom padding from the DSL spacing variable.
- Use buy/sell split indicator, not confidence/progress.
- Example: `BUY 82% / SELL 18%`.
- Buy/sell badges include direction arrows: buying uses the positive up-right arrow, selling uses the negative down-right arrow.
- Dim the smaller split segment to about 20% opacity.

High Score Stocks:

- Title and inline score badge in the first line.
- Descriptor badges below.
- Score badge reuses existing badge component.

## Visual Style for Documentation Boards

Foundations and component documentation should look like a designed product artifact, not a developer dump.

Use:

- Dark editorial canvas.
- Clear hierarchy.
- Compact grids.
- Token swatches grouped by purpose.
- Example components shown in realistic context.
- 16 to 24 px gaps in review grids.
- No giant empty gaps.
- No overlapping captions.
- No raw debug layer names in visible labels.

Avoid:

- Huge unstructured swatch tables.
- Random columns with no rhythm.
- Oversized rounded cards nested inside more cards.
- Developer-only labels as the main visual system.

## UX Core Decision Heuristics (Agent Rule)

Use [UX Core](https://keepsimple.io/ru/uxcore) actively when designing Design System interfaces, flows, content hierarchy, navigation, onboarding, forms, confirmations, empty states, warnings, and other product experiences.

This is an agent decision rule, not a DSL migration rule. It does not authorize changing source component geometry, inventing tokens, or rebuilding the component library around an external framework.

Layer boundary:

- Design System DSL defines the building blocks: components, instances, variants, variables, text styles, spacing, radii, and internal component structure.
- UX Core evaluates how those intact building blocks are composed into a screen or flow: order, grouping, hierarchy, disclosure, density, primary action, feedback, and recovery.
- Never detach, unpack, flatten, redraw, or internally modify a DSL component in order to satisfy a cognitive heuristic.
- If a UX Core check exposes a problem, solve it by selecting, arranging, grouping, sequencing, or configuring existing DSL components and properties. If the DSL lacks a required pattern, record a component gap instead of faking it locally.
- Run the cognitive review after the interface has been assembled from DSL components and again before handoff. Passing component-level compliance does not mean the resulting composition is usable.

Compliance expectation:

- Treat applicable UX Core heuristics as a strong default for roughly 80% of discretionary UX decisions.
- Departures are undesirable and must be caused by a concrete product, compliance, accessibility, platform, source-reference, or user requirement.
- Do not claim compliance by mechanically naming a bias after the design is complete. Select relevant heuristics before or during design and let them affect the result.
- Do not force irrelevant heuristics into a screen merely to reach a numeric quota. The 80% rule means strong adherence where the library is applicable, not blind checklist coverage.

Priority when rules conflict:

1. Explicit user requirements, safety, legal/compliance, and accessibility.
2. Confirmed product behavior and trusted Design System source screens.
3. Design System DSL components, variables, styles, and established interaction patterns.
4. Applicable UX Core heuristics for decisions that remain open.
5. Agent preference only when none of the above resolves the question.

Required agent workflow for a new or materially changed interface:

1. State the user goal, context, primary action, major risk, and likely uncertainty.
2. Review UX Core and select a small relevant set of heuristics for this scenario.
3. Translate each selected heuristic into a concrete decision about hierarchy, wording, grouping, disclosure, feedback, ordering, or interaction.
4. Reuse familiar Design System patterns before introducing novel controls. Familiarity is the default; novelty is reserved for meaningfully exceptional or critical states.
5. Keep information easy to process: chunk long content, reduce avoidable ambiguity, preserve clear labels, and reveal complexity progressively when the product permits it.
6. Use visual isolation sparingly for the primary action, a critical status, or a required acknowledgement. Do not make every item compete for attention.
7. Check the beginning, peak/critical moment, and completion of a flow. Confirmation and recovery states are part of the experience, not afterthoughts.
8. Check for manipulative use of framing, anchoring, loss aversion, authority, social proof, defaults, or artificial urgency. UX Core may improve comprehension and decision quality; it must not justify dark patterns.
9. If the final decision intentionally conflicts with a clearly applicable heuristic, record the heuristic, the conflict, and the reason in the review notes or ledger.

Common heuristics to consider, depending on context:

- Familiarity: prefer known Design System controls, terminology, and placement; introduce novelty only when it carries meaning.
- Context and framing: show values, risks, and outcomes with enough context for an informed interpretation rather than steering the user through selective presentation.
- Picture superiority: use meaningful icons or visuals when they improve recognition, but do not replace necessary labels with ambiguous imagery.
- Isolation / Restorff effect: reserve contrast for what truly requires attention.
- Processing difficulty and ambiguity: use plain language, explicit states, predictable navigation, and progressive disclosure.
- List length, serial position, and primacy: group long sets, prioritize the first visible items, and avoid burying the critical action in the middle of an undifferentiated list.
- Peak-end rule: design the critical moment and the completion/confirmation state deliberately.
- Loss aversion and zero-risk preference: communicate downside and safeguards honestly; never create false urgency or hide trade-offs.

Before handing off the result, the agent must be able to answer:

- Which UX Core heuristics were relevant?
- What concrete decisions did they change?
- Where did the design intentionally depart from them, and why?
- Did any heuristic create manipulative pressure rather than clearer understanding?

## Designer Collaboration and Review Queue

The target is an exhaustive, F2-driven design system with real reusable
components and complete screens. F0 (no facelift) and F1 remain migration
references until the owner deliberately retires them. Do not delete source
work or manufacture generation variants merely to complete a matrix.

Research actual recent and older screens, existing masters, nested instances,
and available live products before proposing consolidation. A page name or
historical source identifier does not establish a component's current generation or
identity. Reopen the exact node and inspect its current source lineage.

Keep legal entity/product configuration independent of visual generation.
Jurisdiction differences may reflect product availability, compliance, content,
session state or jurisdiction. Never normalize those differences away as styling.

Accumulate small visual review packets while continuing independent work:

- One packet addresses one concrete question, usually with 2–4 comparable
  examples, an element detail and enough whole-screen context.
- Record stable source identifiers, observation date, supported properties,
  generation when established, uncertainty, recommendation and impact.
- Offer per-option Keep / Omit from F2 / Unify / Rework, with free comment,
  defer, reopen and reversible draft save. Omit never means source deletion.
- Separate observed, proposed, approved, implemented and verified states.
  Approval is not proof of implementation or visual acceptance.
- Reopen affected decisions when their source or meaning changes. Never silently
  reuse approval for a different component or broader scope.
- Block only changes dependent on an unresolved answer; continue other research,
  usage mapping, source inspection and clearly marked proposals.
- Save decisions durably with revisions and conflict handling; browser storage
  alone is insufficient. Distinguish a local save from remote backup.

Unknown behavior may be explored as an explicit proposal using existing system
building blocks. Proposed extensions are not source evidence or approved DSL.

## Senior Figma Architecture

- Reuse primitives → semantic aliases → component tokens with explicit scopes,
  modes and code syntax. Preserve compatible existing foundations.
- Use content properties, instance swaps, supported slots and visibility controls
  before multiplying variants. Variants express real structure or state.
- Use modes when values change; use structural component variants/adapters when
  the anatomy changes. A recolor does not implement an entire generation.
- Responsive composition uses auto-layout, fill/hug, min/max and wrapping where
  supported; absolute positioning is reserved for actual layered overlays.
- Inspect the complete source style inventory before adding typography. Preserve
  shared text/effect styles and existing master/instance relationships.
- Keep artwork/content colors distinct from UI semantic colors. Record accepted
  mask/construction geometry exceptions rather than repeatedly flagging them.
- Log token renames as old name → new name → reason → source/decision. Keep
  migration mappings recoverable after consolidation.
- Library releases need a bounded change, source/visual diff, decision record,
  version and rollback path. Do not silently publish draft variants.

## Platform Evolution and Evidence

Apple HIG is the primary platform-quality reference; Android/Material behavior
must also be understood. Apply clarity, familiar navigation, safe areas,
accessibility, adaptable typography and explicit recovery. Do not transplant
iOS interaction details into Android against platform expectations.

Read current primary guidance before applying newly introduced platform effects
or Figma capabilities. Record source, platform, checked date and applicability.
Do not attribute an unverified lecture, historical screenshot or marketing claim
to an authoritative guideline. Shared product principles travel across projects;
Design System-specific tokens and components remain mandatory for Design System work.

Matte glass has a contextual role, not a blanket requirement. Use it only where
confirmed source or approved design intent requires it. An available effect token
is not sufficient reason to add the effect.

## Developer Workspace Contract

The developer should move between real screens, components and supported
generation variants without losing source context:

1. Search by component, user task, visible label, former name, screen or source ID.
2. Click a rendered element to inspect its actual component, nested slots,
   supported properties, tokens, source, decisions and implementation readiness.
3. Prefer visual controls: variant thumbnails, size/state segments, icon previews,
   visibility toggles and editable content. Explain unavailable combinations.
4. Show related components with a reason: same task, compatible slot, shared
   anatomy or earlier generation. Color similarity alone is not interchangeability.
5. Compose screens from valid components/slots. Keep a serializable screen recipe
   with content, state, version and deterministic fixtures.
6. Switch supported F0/F1/F2 independently of jurisdiction. Use token swaps for
   appearance-only changes and source-backed adapters for structural differences.
   Missing mappings stay explicit; preserve content and product meaning.
7. Inspect complete screens at 375 px and other supported widths; exercise long
   text, loading/empty/error/disabled states, scrolling and safe areas.
8. Export code/recipe that reproduces the actual preview using the same component
   version and props. Static images and disconnected snippets do not satisfy this.

## Agent STOP Conditions and QA Gates

Do not invent source identity, measurements, icons, typography, supported
properties or behavior. Inspect sources; otherwise log a gap or explicit proposal.
Do not build dependent changes on rejected or unresolved decisions. Continue
independent work instead of repeatedly asking the owner to unblock everything.

Before handoff, inspect the actual component and complete surrounding screen
at a representative size. Check long content, relevant property combinations,
generation modes, overflow, bindings and dependent instances. For code, verify
real interaction, persistence, keyboard/focus and recovery appropriate to scope.
A successful API call or structural metadata alone is not acceptance evidence.

The public guide/download landing page and private review/developer workspace
have separate information boundaries. Keep the approved landing geometry stable.
An unlisted URL is not access control; private evidence, account data and review
decisions must not become public through a hidden page. Publish only the intended
guide/release package to the authorized publication surface.

## Sources and Review Dates

Primary reference entry points for this protocol (updated 2026-10-20).
Storybook Controls, Plasmic and Supernova documentation were reviewed in this
session. Other links are established reference entry points, not claims of a
fresh comprehensive audit; UX Core extraction exposed only its application shell.

- Apple HIG: https://developer.apple.com/design/human-interface-guidelines/
- Android design: https://developer.android.com/design/ui/mobile
- Figma component properties: https://help.figma.com/hc/en-us/articles/5579474826519-Explore-component-properties
- NN/g usability heuristics: https://www.nngroup.com/articles/ten-usability-heuristics/
- UX Core: https://keepsimple.io/ru/uxcore
- Storybook Controls: https://storybook.js.org/docs/essentials/controls
- Plasmic components/props/slots: https://docs.plasmic.app/learn/components/
- Supernova component metadata: https://learn.supernova.io/latest/design-systems/features/custom-data-properties/component-properties-rcueZ3PG

These references support workflow principles; they do not replace exact
Design System source components or establish that the current library implements
every documented tool capability. Consult the relevant current primary source
before relying on a specific API, standard or platform version.

## AI Agent Workflow

Before generating or editing Design System mobile UI:

1. Read this file.
2. Read `AGENTS.md` when working in the Design System Figma workspace.
3. Inspect the relevant Figma source node before writing.
4. Confirm the file is editable.
5. Use existing DSL variables, styles, and components.
6. Clone source nodes exactly when available.
7. Bind colors, typography, spacing, and radii to variables/styles.
8. Use variants only for real structural/state differences.
9. Use variables for simple show/hide or numeric differences.
10. Screenshot and self-check after meaningful changes.
11. After text, badge, row, card, or section edits, verify affected text layers still use design-system text styles and required `textStyleId` bindings.
12. After assembling the interface from intact DSL components, run the UX Core composition review above and record any meaningful departure from an applicable heuristic.

If something is unclear:

- Do not invent a plausible value.
- Check source files and references.
- If still unresolved, mark it as open in the ledger or `DRAFT / NEEDS-REVIEW`.
- Continue with independent work instead of blocking the whole task.

## Known Limits

This reference supports prototyping. Verify exact component fidelity against the authorized source library before implementation. Coverage and approval remain component-specific.

## Quick Do / Do Not

Do:

- Use orange as the F2 primary accent.
- Keep dark surfaces restrained and layered.
- Use glass only where source/reference uses glass.
- Keep trading screens dense and scan-friendly.
- Preserve style bindings.
- Build reusable components.
- Use exact source clone when available.

Do not:

- Invent colors, fonts, radii, shadows, or spacing.
- Replace text styles with manual values.
- Add glass because it looks modern.
- Create variants for content-only differences.
- Use placeholder icons when a real source icon exists.
- Let review boards overlap or become unreadable.
- Make the app look like a promo landing page.
