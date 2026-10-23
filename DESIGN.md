---
design_reference_id: mobile-app-design
version: 1.2.39
last_updated: 2026-10-23
status: draft-for-ai-prototyping
canonical_url: https://mvisl.github.io/dsl2/DESIGN.md
changelog_url: https://mvisl.github.io/dsl2/CHANGELOG.md
manifest_url: https://mvisl.github.io/dsl2/design-manifest.json
freshness_max_age_days: 30
freshness_check_policy: on_session_start_max_once_per_day
figma_mcp_recommended: true
---

# Design System · Facelifting 2

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

Version: 1.2.39 draft for AI prototyping

Last updated: 2026-10-23

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

An explicit owner decision can prioritize the target DSL and product-screen
reference over current live-product chrome for a particular screen. Record that
exception with its scope; do not apply it to every screen. Instrument detail
screens may omit global bottom navigation when the approved target composition
uses only the trade-action section and safe area.

Keep bottom sections tied to their actual role and supported variations: an
instrument summary, trader sentiment and option contract are different content
states. Do not borrow a Chart summary into Info merely because both share
Sell/Buy controls. Preserve the complete trusted trade-action component anatomy,
including its quote treatment, source variables and text styles; do not replace
it with generic buttons or duplicate an already displayed quote under a new label.

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

### Choosing a design stage

A request may explicitly select `Stage=F1` (Facelifting 1), `Stage=F2`, or Legacy. Keep that stage consistent across the entire screen: use its verified component variants, resolved tokens, spacing and radius roles. Do not mix F2 rounding or orange treatment into F1 unless the actual F1 source uses it. Design stage is independent of mobile/web layout and jurisdiction.

This guide primarily documents F2. F1 support is component-specific, not a complete offline F1 library. For an F1 request, use the authorized F1 source components and real screen references. If these are unavailable or a variant is missing, identify the gap and request that source; do not invent F1 by recoloring or reducing the radii of F2.

Do not create fake Legacy variants just for symmetry. If Legacy and F1 are visually and structurally identical for a component, document that decision instead of duplicating the component.

## Page composition and flow review

Valid components are necessary, but do not by themselves make a valid page.
Review the assembled page and its entry context separately from the correctness
of its atoms, artwork, bindings and container geometry.

- **Do:** show the originating application screen and the exact control used to
  enter a flow. Present a review sequence horizontally when the steps need to be
  compared. **Do not:** present only isolated internal screens in a long vertical
  catalogue and imply that this proves the journey. **Why:** reviewers need to
  understand how users arrive, act and return. **Scope:** flow handoff and review;
  this is not a requirement to change the application's actual navigation.
- **Do:** group content with the source system's sections or dividers and use the
  genuine top drag handle when the sheet pattern includes one. **Do not:** reuse
  only a modal's outer container and call the entire composition design-system
  compliant. **Why:** hierarchy, grouping and interaction cues are part of the
  pattern. **Scope:** verify each generation's actual source; do not add handles
  to every dialog or invent shared modal geometry.
  A measured radius belongs to its source family, role and resolved generation;
  one component in the target library does not establish a universal modal radius.
- **Do:** use a modal for a small amount of information and a quick decision. Put
  page-sized information on a full page, or show a concise decision summary with
  a clear Learn more route to the details. **Do not:** compress an entire page
  into a modal merely because its container is available. **Why:** the amount of
  information and the user's task determine the presentation. **Scope:** preserve
  required product/legal content and a real route back; do not hide essentials.
- **Do:** reclassify a composition as rejected when the owner rejects its design,
  while retaining useful measured source facts. **Do not:** let an earlier agent
  screenshot check, working controls or component tests override that rejection.
  **Why:** checking details is not acceptance of page composition or the journey.

## Non-Negotiable Rules

1. Do not invent values.

If the source has a font, size, color, radius, spacing, shadow, stroke, or layout value, copy it exactly. If the source is unclear, leave an open question or mark the layer as `DRAFT / NEEDS-REVIEW`. Do not fill gaps by eye.

2. Use DSL tokens, styles, and components.

No arbitrary colors, fonts, spacing, radii, or effects when a DSL token/style exists.

### Shared token hierarchy — owner requirement, 22 October 2026

All design-controlled properties must come from a named, traceable token. This
applies across Figma and the constructor: primitives → semantic roles → component
tokens → composed blocks. Define raw values once at the primitive layer with
their source and rationale. Higher layers retain typed aliases; copying the
resolved number or color into a component is not inheritance.

Changing the global brand primitive must reach its consumers. Changing a button
token must affect only buttons that inherit it. A block or specific component may
override an inherited role through another named token; expose the override,
its source, affected scope and reset-to-inherited behavior. Matching numeric
values alone do not establish a shared semantic role.

Keep typography in bound text styles and variables, effects in bound styles or
tokens, and repeated structures in components. Source-backed fractional artwork
geometry and calculated layout/zoom results are not arbitrary UI constants:
preserve their documented source or formula. Never round historical geometry to
make it look systematic, or hide a guessed value behind a newly named variable.

Viewing zoom must not change intrinsic component geometry. Measure text and layout
in native coordinates before rounding or fitting; an ancestor canvas transform
is a viewing operation, not a second component-size input. Verify both the
full-size component and its reduced or enlarged preview against the same source.

A preview should wait only for its own required source, native assets and component
families. Keep record metadata and search usable while previews load. An unrelated
source failure must not block a valid preview. Distinguish loading, empty and
failed states; retry the failed preview locally while preserving saved records
and working drafts. These implementation safeguards do not confer visual approval.

For the confirmed Notifications setting row, the gap between its title and
helper description is 4 px through the existing spacing variable. This local
row decision does not redefine every setting or text pair.

Structural rules remain explicit. For example, larger lower card corners depend
on terminal bottom actions; the rule selects radius tokens rather than embedding
a number. Design generation (Legacy/F1/F2), theme, platform and jurisdiction are
separate context dimensions; preserve their verified differences.

One versioned contract must retain stable token identities, types, aliases,
context/modes, source evidence and native mappings. CSS and Figma adapters should
consume that contract. Detect concurrent changes against an accepted base and
preserve conflicts instead of silently overwriting. Verify actual persisted bindings on both surfaces before claiming synchronized
output.


User requests must be translated through the DSL scale. If the user asks for a card, button, label, larger text, more air, stronger rounding, softer glass, or a different emphasis, first choose from existing DSL components, text styles, spacing variables, radius variables, color variables, and effect styles. Offer the closest system option and explain it in design-system terms. Do not type a new size, padding, radius, color, shadow, or font just because it looks plausible.

This applies to the product UI and to every artifact that represents the design system: documentation pages, release pages, mini-sites, Figma review boards, examples, screenshots, labels, and downloadable reference pages. If an artifact claims to be the Design System source of truth, it must be built with Design System tokens, text styles, radii, spacing, icons, and component behavior. The only allowed exceptions are explicitly documented one-off display choices, such as a larger editorial title for a cover/landing page, or a source-backed effect explicitly approved for that context. Arbitrary glass fill, blend, stroke, or fractional-opacity recipes are not an exception to DSL bindings.

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

### Selection Tints and Glass Have Different Roles

For a selected or highlighted surface, inspect the existing semantic tint token,
its active mode, alias chain and actual component usage before choosing a glass
fill. A brand-colored glass token can use a different accent and a much stronger
contribution than the established selection treatment. Do not substitute one
merely because both appear orange.

An opaque tinted primitive is not proof of a stored overlay opacity. Arithmetic
blend equivalence can explain a color, but remains an inference; preserve the
actual source variable rather than inventing a percentage token. Compare complete
states, including outline, badges and section separators, before promoting a tint.

### Preserve Paint-Level Opacity During Migration

A variable-bound color does not contain the complete appearance of a paint.
Preserve each layer's opacity, visibility, blend mode and order independently of
its color alias. Do not replace a translucent outcome overlay with an opaque
semantic color, or lower the whole component opacity: that also dims its text
and icons. Restore a lost value only from an inspected source; check the actual
component and its surrounding states afterward. Source restoration does not
approve that source's theme, contrast or platform behavior for F2.

### Resolve Variables in the Destination Context

A preserved variable binding is not proof that the destination resolves the same
appearance. Inspect the actual collection, inherited or explicit mode and alias
chain on the destination instance. In the Options migration, an inherited mode
resolved a header accent differently from the intended existing F2 mode. Select
the existing source-supported mode at the narrowest legitimate scope, preserve
component relationships and bound text styles, and verify effective paints plus
the actual full-screen result. A virtual consumer instance can retain effective
overrides that differ from the raw remote master; inspect the consumer's
resolved paint in its destination context before replacing or normalizing it. Do not compensate with raw colors, a duplicate
token, detached content or a global mode change to unrelated screens.

### Preserve Thin Native Vector Details

Compare the actual native artwork and its rendered export, not only export
success or nominal bounds. Default SVG stroke simplification can discard thin
compound-path details such as candle wicks while leaving a plausible body
rectangle. When comparison confirms that damage, re-export the same native
artwork without stroke simplification (`svgSimplifyStroke: false` where
supported), preserving its paths, masks and source geometry. Do not trace,
redraw, rasterize or thicken the missing detail by eye. Inspect the complete
render at its real viewing size after the corrected export; this is a scoped
fidelity repair, not a rule to reconstruct arbitrary chart behavior.

### Isolate Repeated SVG References

A correct sealed SVG can render incorrectly when a thumbnail and full canvas
share duplicate mask, clip-path or gradient IDs. Keep the sealed source
unchanged. Render each original vector in its own SVG document, such as an
image/data URI, or namespace every per-render ID and all references on a runtime
copy while preserving path and paint data. Verify the thumbnail and full view
together, including multiple instances and portable output; one isolated
preview is insufficient.

### Candidate Approval and Fixture Consistency

A faithful source candidate or a corrected export is not blanket approval of the
whole screen. Keep approval attached to its exact decision and scope. Preserve
source fixture provenance: instrument identity, quote, chart, currency and
contract values may come from different historical examples. Label inconsistent
or unknown combinations explicitly, keep dated static fixtures distinct from
live data, and do not silently reconcile values or invent missing transitions.
A visual comparison proves only the content, state and viewport actually checked.

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

For inherited interface accents, map the semantic role into the existing F2
orange token: this includes action-plus artwork and the Crypto Miner icon/badge
when adapting those controls. Preserve source black glyphs/text, white labels,
geometry and meaningful states. Do not recolor every blue pixel indiscriminately:
issuer identity, illustrations and external brand artwork require their own
source decision. A matching hex value does not make stroke-only and fill tokens
interchangeable. Verify the resolved active mode and full component context.

Check the current product before migrating a historical screen. Labels, grouped
items and feature availability may have changed independently of the visual
skin. Keep historical source, current observed context and F2 proposal distinct;
record account mode/residence as unknown when not actually verified.

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

### Source-mode radius roles

Preserve semantic radius bindings rather than applying one rounding value to every surface. The inspected source Components modes resolve modal corners as 8 / 8 / 16 px, modal lower corners as 8 / 8 / 32 px, modal banners as 4 / 4 / 8 px, and button and badge corners as 4 / 4 / 64 px across Current, Facelifting and Stage 2. Badge radius follows the button-corner alias. These are source-mode values, not proof that every migrated component already uses them.

The Tokens collection has Current Design and Stage 2 modes only. Facelifting component aliases use Current Design token values; do not invent a third token mode. Verify each actual consumer binding and inherited mode. A variable name alone does not establish where a larger lower corner belongs, and raw legacy corners do not change automatically.

Navigation dividers are source-specific optional properties. Preserve the actual target's visibility rather than enabling or hiding a divider globally.

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

Organize genuine component families by product usage: Actions, Inputs, Keyboards, Navigation, Data Display and Feedback. A legacy warehouse is a source inventory, not a finished family architecture or evidence of migrated coverage. Keep atoms, molecules and organisms discoverable without treating their organization as approval.

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

Text badges must be:

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

Resolve icon color from the actual component role and state, not from a word
such as Buy or Sell. The inspected ordinary Signal arrows are secondary gray;
Advice Buy/Sell arrows use positive/negative roles. Preserve that distinction.
A shared icon can have many unrelated consumers: apply Signal-only overrides
through component tokens, without recoloring the shared master. Keep the full
component → semantic → primitive alias chain and preserve each native mode.
An orange highlight is not automatically the same role as the brand accent;
they may match in one mode and differ in another.

Account entry summaries and active account details are separate contexts. Reuse
native optional-row controls when their existing auto-layout reflows correctly
and the surrounding surface anatomy remains unchanged. Preserve unobserved
active-account states separately; hidden DOM fields are not visible-feature
evidence. Do not create duplicate masters only to remove optional metrics.
An absent amount in an account entry is not a zero balance. Preserve absence
through a genuine visibility property; do not insert a zero or a manual spacer.
Keep account-entry amounts, disclosure metrics and the aggregate total as separate
content owners. Synthetic fixture values must remain internally consistent.

For Boolean artwork, bind its effective visible paint. Do not change unrendered
child paints just to make a token count look complete: this can cause native
geometry reevaluation. Keep the original source and verify rendered artwork
alongside component bindings, dimensions and text styles. A matching palette
alone does not prove geometry or pixel equality.

Check the effective resolved mode and source-instance overrides, not just the
remote master: source F2 instances may override an older master. Primitive
radius bindings do not automatically change when a generation mode changes.
Retain source/archive generations while making the supported F2 target primary.

## Context-Specific Client Status Identity

- Retain the approved client-level color palette and symbol within its product context. Status identity is not a generic brand-accent paint role.
- A client-level symbol is distinct from a text badge. Do not force an existing crown or diamond into a capsule or replace its native artwork with a generic icon.
- Keep client level, account mode, instrument metadata and trading signals as separate semantic roles. Demo/real mode is not a client level.
- Treat visual generation and jurisdiction as independent dimensions. An approved symbol can differ between product contexts even when a level name is shared.
- Reuse existing native families and only their supported context/state combinations. A union of variant labels does not imply a complete cross-product or current product availability.
- Legacy names and broker properties are not enough to establish current visual authority. If source artwork conflicts with a confirmed current rule, label it historical and keep it separate from the supported reference.
- Preserve approved colors through scoped identity tokens; do not recolor all levels with one global orange alias. Confirm actual per-level mappings before adapting a different symbol.
- Compact status text and large standalone symbols can use different source-backed shades. Keep those component roles independently adjustable, even when their level meaning matches.
- If the original text has no style binding, record that fact. A new shared style based on measured source metrics is a source-backed candidate, not a recovered style or automatic F2 approval. Bind its typography to shared foundations and component aliases, and verify actual Hug geometry when those variables change.

## Investment Row Data Roles

Choose the product context before mapping row fields. Keep unit price, quantity,
total position value, profit/loss, fund composition weight and credited cash as
separate roles with explicit units. A legacy layer named Price, Period return
or Weight does not establish what its displayed value means.

In a portfolio position row, a prominent amount can mean total position value;
retain average purchase price and current unit price separately, with quantity
and profit/loss in their source-defined positions. Cash dividends already paid
to the wallet remain separate from the market value of the held position.
Estimated future distributions are not credited cash.

A compact row can share its geometry across fund-weight and payout-history
contexts. Map its reusable fields explicitly to the correct percentage, date,
calculation or cash amount and preserve the contextual caption. Do not create
new structural variants solely because these content meanings differ. Conversely,
similar appearance does not justify replacing a position block with a quote row.

Read generation modes and overrides from the actual consumer. A Current master
can have a Facelifting consumer, while another nearby instance explicitly stays
Current. Generation, jurisdiction, observed usage, approval and implementation
are independent facts. A native resize-verified adaptation is not automatically
a working-screen match, an editable public component API or web support.

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

## Mobile-First Composition: Do Not Shrink Desktop UI

A mobile screen is a mobile product composition, not a desktop web layout scaled
or squeezed into a phone-sized frame. The default reference is 375 × 812 px;
that frame size alone does not establish a valid mobile design.

Before assembly, identify the mobile user goal, primary action, navigation,
content priority, input behavior and recovery state. Follow the authorized mobile
source screens and component anatomy. Use mobile information hierarchy, readable
text, reachable controls and explicit scrolling behavior. Resolve density by
prioritizing, grouping and progressive disclosure; do not reduce everything until
it fits. Do not carry desktop sidebars, multi-column dashboards, hover-only
controls or desktop toolbars into the phone layout merely because they fit.

Responsive behavior must preserve intent: use Auto Layout, Fill and Hug with
content-aware wrapping, truncation and optional states. Never scale the entire
screen or reduce typography/targets to disguise overflow. Jurisdiction and
F0/F1/F2 generation do not determine desktop-versus-mobile composition.

Acceptance requires viewing the full screen at its actual 375 px width, checking
navigation and the primary task, long/localized content, optional elements,
empty/loading/error states, keyboard/scroll behavior where applicable and actual
supported narrower/wider hosts. Distinguish measured target support from untested
widths. A desktop-looking screen squeezed into 375 px fails this gate even if its
components and tokens are valid. This rule applies equally to colleagues using
this Markdown, web builders and API/MCP-assisted assembly.

## Library Structure and Discoverability

Organize actual reusable masters by familiar families such as Actions, Inputs,
Keyboards, Navigation, Data Display and Feedback. Within each family, show the
progression from atoms through molecules to organisms, with readable state and
property comparisons. A single mixed Components warehouse or a new index alone
is not sufficient. Place whole families together and preserve component identity,
instance relationships, text styles, variables and real structural/state axes.

Family, structural complexity and approval status are independent dimensions.
Moving a legacy family into a clean category does not make it approved F2.
Label source-derived migration drafts clearly. Avoid inventing components just
because a category is empty; inspect genuine sources first. In the web, mirror
these family names and expose visual previews, meaningful controls, compatible
slots and related components. Complexity should aid understanding rather than
become a rigid taxonomy that hides familiar component names.

## Five Coupled Deliverables

Maintain five explicit outputs, as confirmed by the owner. Progress on one must
not stand in for completion of another:

1. An exhaustive F2-driven native Figma component library: editable reusable
   components, real variants, variables, styles and tested resizing.
2. Complete F2 application screens, separately organized in Mobile Puzzles,
   composed from the library with source/context provenance and375x812 baselines.
3. A developer/designer web workspace: screen and component discovery, visual
   inspection, reuse, composition, meaningful state/resize checks and review queue.
   Include a navigable application prototype using the same registered screens
   and components, with a direct path from a viewed screen into editing.
4. A shared design API with MCP access: colleagues and their assistants can find
   real components/screens, build working copies, validate and save separate
   variants through the same contracts as the web. Remote team access requires
   its own authenticated deployment; local transport is not proof of team access.
5. A continuously maintained Markdown reference of our shared design understanding,
   kept in the private repository root and released as a sanitized downloadable
   guide on the existing approved site. Update understanding as evidence/decisions
   change; keep public publication on the agreed daily cadence.

The API/MCP must not invent extra component support, change source originals or
bypass library approval. The living MD distinguishes observation, proposal,
approval, implementation and verification; it is more than a release log and is
not a transcript dump. Keep private source/account/review material out of public
releases. All five outputs share stable identities and traceable decisions.

## Extending the System and Navigating the Prototype

Learn composition principles, not only component appearance. For an unseen
screen, state the user task, context, information priorities and primary action;
choose structural analogues by semantic role. Explain which decisions follow
confirmed principles and which are new hypotheses. Reuse editable components and
source tokens; propose missing patterns explicitly rather than silently promoting
an invented component. Validate the understanding on different content/states,
then update the rule and its scope when feedback changes it.

The web prototype is a navigable view of the same screen registry used by the
builder. It must not become a second collection of screenshot-only screens or
independent visual implementations. Support known tab/navigation transitions,
direct screen links and a route to editing/reusing the current screen. Prototype
navigation does not imply functional trading, account or payment behavior.
Unimplemented destinations and unverified flows must be visible as such; do not
simulate completion or invent missing product behavior. Grow route coverage as
actual source-backed screens become available.

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
- Let the owner choose an option directly through its preview image. Keep zoom
  as a separate action so inspection cannot accidentally change the answer.
- Save each packet's answer/comment/attachments as an independent draft; only
  explicit Submit sends the answer. Switching packets must preserve unsent work.
  Draft save and submission are distinct states. Support free comments, defer,
  reopen and recovery. Omit from F2 never means deletion of historical sources.
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

## Editable Screens and Reuse

The target developer workflow starts from a covered application screen, not only
an empty component stack. Open a working copy, select its actual nested elements,
change supported content/state, replace compatible elements, remove or add them,
and reuse components or whole compositions from the library or another screen.

- Keep original source screens immutable. Save a new named variant with parent,
  source references, component versions and deterministic content fixtures.
- Preserve component identity when copying: create a new instance identity and
  retain the canonical component/variant and source-screen/item provenance.
- A screen thumbnail must reflect its real editable composition. A screenshot
  reference is useful evidence but is not an editable implementation.
- Expose source, candidate, draft, variant and verified status separately. A
  working component-study draft is not application-screen coverage.
- Use one screen tree for canvas selection and editing. Keep real section/slot
  anatomy and responsive Fill/Hug behavior; do not flatten every screen to a
  vertical stack to make implementation easier.
- Replacement must check compatible slots/anatomy and preview lost or changed
  properties. Do not discard unsupported content silently.
- Keep export/import, local-save state, durable-save state, Undo and recovery
  visible. Concurrent edits must produce an explicit conflict rather than a
  silent last-write-wins overwrite.
- The workbench uses the browser width; the mobile reference retains its chosen
  dimensions. Prefer visible choices for short bounded settings and actual
  component previews for meaningful variant/slot choices.
- Normal secondary information uses the confirmed alias-or-signal policy;
  independent legacy source switches remain available under advanced disclosure.
- Global navigation is one reusable configurable structure. Destination labels,
  icons and selected state are properties; do not clone complete bars merely to
  change a destination. Progressive feature relocation into discovery tiles does
  not mean that an absent former tab's functionality has been removed.

## Controls Without Available Choices

Keep a toolbar dropdown visible but disabled when it has no available choices.
Use a real disabled control, exclude it from keyboard activation, and communicate
the state visually using the existing disabled treatment. Do not open an empty
menu. The owner confirmed Date and Close all in the empty Active Trades state.
Do not infer that every filter must be disabled merely because the currently
selected period has no results: available choices determine availability.

An empty current filtered result is not evidence that the control has no
capabilities. Keep the period filter enabled while real choices remain; disable
only actions without a genuine target or controls without available options.
In the dated 2026-10-21 jurisdiction-specific real-account Closed observation, Week was empty but
Week / Month / Quarter / Year / All time remained available, and All time
revealed populated history. This does not establish behavior for every
jurisdiction or account context.

Keep adjacent trade contexts distinct. The inspected demo Pending context had
populated cards with SL / TP / AI and Cancel, while Closed history exposed
Details and Trade again. Do not transfer those actions or availability rules
between contexts merely because their card structures look related. Inspect
the actual options and targets before assigning an enabled or disabled state.


## Content-aware Button Edges

Use actual spacing-variable bindings and inspect each size and skin. Icon-side
edge spacing and text-side edge spacing are different design concerns, especially
with rounded silhouettes. Hiding an icon does not prove that the source increases
padding. Current measured source behavior and proposed spacing policy must be
recorded separately. A recollected 24px text edge is not an approved all-size rule.
If edge padding must follow icon layout automatically, use a genuine supported
structural property/slot contract rather than two unrelated manual controls that
can drift apart. Preserve source text styles, independent icon slots and existing
component relationships while prototyping the change.

Width Fill and icon/label composition are independent concerns. Distinguish and
retain these three required models, while verifying their exact spacing separately:

- Wide button with a geometrically centered label and balanced side slots when
  only one side has an icon; the absent opposite slot must be considered.
- Centered icon-plus-label group, including when the button itself fills width.
- Compact Hug-content button with content-aware outer edges.

The owner confirmed the Large content-edge policy after identifying a tight
text-only CTA in the prototype: use24px at a text edge and12px at an icon edge.
A Large text-only button therefore uses24/24; one left icon uses12/24, one right
icon24/12, and two icons12/12. Use existing spacing tokens. The balanced-slot
label-centered model retains its deliberate side-slot structure. This confirmation
does not establish24px for smaller sizes or prove native automatic conditional
padding support. Keep historical source measurements distinct from this policy;
verify single-icon sides, long labels and actual parent constraints.

The owner confirmed the long-label policy: constrain the button to the available
content width, keep one line and use ending ellipsis. Do not grow the control
vertically or let a compact Hug button become wider than its host. Preserve the
full label in content/accessibility; truncation is a visual fallback, not permission
to write unnecessarily long action copy. Icon slots and source text styles stay
intact. Apply the bound at both the button and its containing layout; a max-width
on a child does not help if its wrapper still grows to max-content. Verify the
actual screen and exported result, not only an isolated component.

## List Row: Inline Metadata and Right-side Values

Keep the left badge immediately after the title, using the source gap. A short
title takes its natural width; a long title gives up space with ending ellipsis
while the badge stays visible. Do not push the badge to the far end of a growing
title slot. Right-side content can be a secondary gray value or a counter; retain
independent source-supported optional controls without recommending that every
possible combination appear together.

A one-digit counter is circular; additional digits expand it horizontally into a
capsule at the same height. Build this as a reusable content-driven component,
with source typography and bound padding/radius. Do not scale a fixed circle or
create a separate master per count. Zero visibility, maximum counts and99+
formatting need product evidence or an explicit decision; do not invent them.

Component width follows the actual content host after screen insets, rather than
assuming that every row is375px wide. Test short/long titles, optional badges,
right values and counters together. Record web and native resizing support
separately: a passing browser implementation does not prove native Figma parity.


## Context-dependent Empty-state Toolbars

Choose empty-state controls using inspected current product behavior and an
explicit owner decision, not only the general logic that an empty list needs
fewer actions. When the owner says to retain a panel if the current terminal has
it, record the actual context and evidence before applying that condition.
For the inspected current jurisdiction-specific Active empty context, the existing Date / Total /
Close all panel satisfies that condition and is retained. This is not a blanket
rule for other jurisdictions, account contexts, Pending or Closed states.
Keep the no-toolbar exploration as historical proposal evidence. A planned
owner decision is not a claim of native implementation, promotion or full-screen
acceptance; verify those stages separately.

For related list tabs sharing one empty-state composition, keep the artwork and
message anchored consistently when an optional lower toolbar changes. Preserve
one logical footer slot across the matched states; an empty slot contains no
controls or actions. Let the remaining content region center through auto-layout.
Source its dimension from the actual toolbar role and retain the
primitive → semantic → component alias chain in Figma and web. Verify a shared
variable change on real consumers, restore the baseline, and check all matched
states visually. Keep this layout policy separate from which toolbar actions
belong to each product context.

## Migration Contracts and External Interface Boundaries

A transferred component can look correct while losing its exposed controls.
Compare actual property names, types, defaults and bindings with the trusted
source. Restore a lost source control on the reusable master, preserving IDs,
instances, styles and geometry. Verify true/false or state combinations on real
instances; a repair is not approval of a new generation. A text-visibility
Boolean is not an editable content TEXT property.

Cloning a donor and swapping it to a local dependency can silently lose existing
nested text or icon overrides even when the default result looks identical.
Preserve the exact donor's semantic content, bound text styles and native icon
relationships. Transfer content through genuine exposed TEXT properties or
verified nested text overrides, and use proper instance swaps for actual icon
dependencies. Compare the donor, migrated instance and surrounding screen
context before accepting the migration. A new local component or successful
swap does not automatically promote existing live consumers to that candidate.

When a historical screen includes a third-party verification interface, record
its provider boundary and the unresolved project ownership. Do not assume the
entire embedded interface belongs to our visual migration or infer current
country/document requirements from source fixtures. Confirm scope before
reskinning that part; continue independently with our supported entry/status
components. Keep this as an open scope question until an explicit decision.

Developer-tool disclosure is presentation state. Expand real parent/child groups
on demand and reveal the selected canvas item's ancestors. Disclosure must not
change the screen recipe, create an Undo step or imply a product transition.

## Edge-Attached Markers and Content Controls

Preserve the finished consumer's measured geometry when it differs from its nominal master. A marker attached to the top or bottom edge can have asymmetric corners; do not turn it into a capsule merely because its size is compact. Use structural variants for the real edge appearance, and one genuine TEXT property for changing the displayed value. If the source has no content property, expose it only on a proper new owned component and document that it is a new API.

A Hug-width value can grow together with its caption and native arrow. Measure that growth rather than silently truncating, inventing numeric formatting or claiming it fits every host. Content editing does not calculate a quote or establish validation rules. Keep source fixtures distinct from current market data.

Static Top/Bottom snapshots and correct native arrows do not prove sticky behavior. Verify the clipping host, anchoring, scrolling, visibility thresholds and any return-to-price action separately. Native component fidelity, owner acceptance, runtime support and full-screen behavior are distinct gates.

## Native Layout Evidence Across Optional States

Hug-content metadata alone does not prove the rendered height when optional
children disappear. Measure the actual native instance after layout settles,
including all supported Boolean combinations and the all-hidden case. Record
child visibility, row bounds, container height, sibling positions and min/max
constraints. A partial combination can reflow while an empty container retains
its prior geometry. Keep the observed behavior separate from its unresolved
cause or intended product policy; do not silently force the web to an assumed
collapsed height or change the native master without source evidence.

## Current Entry Context and Dated Legal Fixtures

Inspect the current entry context before composing a historical registration or
verification reference. Record jurisdiction, authentication state, observation
date and which account context is actually known. A current entry can differ
from historical artwork, progress steps, provider order or field labels without
making the historical source invalid. A conditional no-requests state does not
establish verification success or a universal exemption.

Keep legal disclosure wording, risk percentages, currency and provider order as
dated source fixtures until their product scope is confirmed. Preserve observed
link destinations; do not invent terms links or imply legal approval. Keep exact
source content distinct from the proposed F2 typography, OS chrome and layout.

## Verify Artwork Identity After Asset Generation

An exported asset name or generated mapping does not prove artwork identity.
Compare the actual native vector and its rendered result with the intended role,
especially for provider logos and similar icon slots. Reject a mapping that
shows one provider's artwork under another provider's name. Restore the genuine
native artwork and component relationship; do not redraw, overlay or rely on a
filename-only check. Verify both the standalone asset and its final screen.

## Cross-project Source Fidelity and Delivery

Use the following decision pairs as the quick reference. Project chronology,
rejected iterations and private source evidence belong in the decision ledger,
not among current recommended defaults.

| Topic | Do | Do not | Why / scope |
| --- | --- | --- | --- |
| Design values | Follow sourced primitive and typed semantic/component aliases | Copy resolved numbers or hide a guess behind a token name | A global or scoped change must propagate through actual inheritance |
| Platform adaptation | Assemble with the destination platform DSL | Scale a whole mobile composition into desktop UI, or the reverse | Content can transfer while platform layout and controls differ |
| Repeated defects | Fix the reusable master and verify its consumers | Shift or patch individual instances to conceal a shared defect | Local patches drift and fail other supported states |
| Identity artwork | Use the genuine source mark and inspect it at consumer size | Substitute a ticker, invented monogram, automatic inversion or approximate trace | Brand identity and optical fit are separate from container bounds |
| Delivery | Inspect actual export bytes and match each requested named asset | Treat a correct master or file count as proof of a complete export | Transparency, clipping, backgrounds and missing items can differ |
| Charts | Share visual grammar, retain instrument-specific data and honest history | Copy a source price path or fabricate missing performance periods | Reuse concerns component structure and style, not interchangeable data |
| Motion | Review the full rendered composition and its clock | Accept duration metadata or an isolated simulated widget as full proof | Parent timelines and inherited sampling can freeze real output |
| Scope | Keep a local exception tied to its named context | Promote a local dimension, fixture or demo formula into a global rule | A correct project decision can be wrong in another role |
| Acceptance | Follow the latest explicit owner decision and preserve rejected status | Call a rejected or stopped experiment approved because agent QA passed earlier | Verification and owner acceptance are distinct gates |

A **confirmed rule** is recommended only within its recorded scope. A **local
exception** carries its reason and source. A **proposal / needs review** remains
an alternative, never the default. A **rejected / superseded** result records the
reason and the replacement direction; do not reuse it as an accepted example.
An **unresolved** item stays open rather than being filled with a plausible guess.


Use the destination platform's own components, text styles, semantic roles and
layout. A mobile reference supplies content and behavior; scaling the entire
composition is not a desktop implementation. Resolve actual variable values and
active modes before choosing an alias: a token name alone does not establish
its value, color contrast or intended role.

### Artwork and complete delivery

Check instrument and issuer assets at their actual smallest consumer size,
including optical centering, visible outline extents and surrounding air.
A centered frame or padded SVG viewBox can conceal a shifted visible mark.
Preserve owner corrections. Do not turn a local optical size adjustment into a
global percentage or mechanically recolor every brand mark as UI artwork.

Verify delivered SVG/PNG bytes separately from the native master: transparency,
page/section backgrounds, clipping and original identity can differ in export.
Match the requested named assets and presentation sets, not only a file count.
Covers should explain the actual subject at the delivered aspect ratio and
remain readable behind any logo overlay.

Exact vector tracing includes visible seams, parallel edges, joints and gaps;
a recognizable silhouette is insufficient. Later owner rejection supersedes an
earlier agent QA claim. Keep rejected drafts distinct from approved components,
and do not resume work the owner explicitly stopped without a new request.

### Chart grammar and source data

Reuse chart typography, strokes, bodies, wicks and masks while preserving each
instrument's distinct data geometry. Do not reuse a price path merely because
the visual component is shared. Align a current-price marker to its actual final
close and do not append a future candle to the right. A portfolio curve can
include contributions and reinvestment; it need not have the same silhouette as
the asset price. Label examples and dated data; never invent unavailable return
history or present a static prototype as live data.

Keep chart fill color bound to its semantic role. A separate alpha mask can
preserve the variable binding while controlling a fade; do not weaken the line,
labels or whole chart to make only the fill translucent. Column-level periods
can replace repetitive row badges in a homogeneous list, but metadata badges
and promotional-card periods have distinct roles. Local data, labels, periods,
fees, eligibility and method availability require their own product evidence.

### Motion and local exceptions

Verify the rendered timeline of the actual composed screen, including its
parent duration, child tracks, transition onset, end state and hold. Timeline
metadata or a separately simulated widget is insufficient evidence of motion.
When a cadence includes animation, do not add animation duration to the cadence.
Synchronize related changes on the same clock. Explicitly illustrative progress
or counters must not become production formulas.

Keep local component dimensions, artwork ratios, presentation coordinates and
approved exceptions scoped to their source. A reversible project catalog cleanup
must preserve dependencies and whole variant sets used by active compositions;
it is not permission to delete unused library history. A source-specific inert
control is not a general pattern for new interactions. Record unsupported style
bindings, uncertain playback and unresolved owner choices as remaining debt.

## Genuine Cross-file Component Transfer

A native editable screen includes its component graph, property references,
text styles, variables and active modes. A local component key can exist while
the component is unpublished; its presence does not make it importable into
another file. Check the actual publish/import capability before claiming a
transfer. Do not publish a draft library merely to bypass a transfer limitation.

HTML capture, SVG export and screenshots do not preserve that native graph.
Use an authorized genuine native transfer path, then inspect the destination
instance-to-master relationships and maintain an explicit source-to-destination
identity map. If dependencies must be copied as local masters, state that new
identity clearly. Verify the full mobile screen and supported widths after
transfer. A serialized rebuild is a separate migration with fidelity checks,
not proof of a successful native copy. Keep a missing transfer capability as an
explicit delivery gap while continuing independent work.

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

## Developer Questions and Answers

Keep one private Developer Inbox shared by the web and MCP. A developer can ask
from a screen or component, attach an image and return to the same request for
an explanation and exact source links. Preserve its history and context across
follow-ups. A saved answer marks the request answered; only the requester confirms it
solved. A clarification or follow-up requiring attention reopens the same thread
without discarding its answer history. Clearing a request from a list should archive it without destroying
its history or removing it from necessary agent work.

Prioritize incoming developer blockers before ordinary planned research, after
safely checkpointing any in-progress mutation. Show a truthful new-request badge
in the owner review workspace. A request that needs an unapproved design change
links to an owner visual review; a developer question is not design approval.

Notify the requester about a real saved answer, with a direct link to the same
request. Keep notification previews neutral and require explicit browser opt-in.
Distinguish open-page polling from verified closed-tab push delivery, and a
persisted incoming signal from an actually running agent. Do not promise an
immediate response, automatic wakeup or uninterrupted service without checking
that integration. Retain drafts on network errors and revision conflicts.

Code in a private repository, a locally working API and authenticated colleague
access are separate delivery stages. Public static guide hosting must not expose
private questions, attachments or account/source evidence. Verify access, durable
storage, recovery and real notification delivery before calling the team service
ready.

### Context-bound collaboration and working drafts

- Use one message composer for explanatory text, ordinary links and screenshots, with a visible preview and recoverable upload state. Do not split one question into disconnected text and image submissions or send it automatically when context arrives.
- Keep a question, owner answer and later clarification in the same thread. A saved answer is an answered state, not proof that the requester has resolved the issue. Let the requester confirm resolution; a clarification requiring attention reopens the same history rather than creating a duplicate request.
- Bind a working draft to the screen, component or request where it began. Switching the selected object or thread must not silently retarget unsent text, attachments or source links. Preserve separate drafts, and make an intentional transfer or discard explicit. Restore content after network failures and revision conflicts without implying that an unsaved draft is durable.
- Use familiar workspace landmarks: discoverable hierarchy on the left, the actual canvas in the center, and selection properties or contextual discussion on the right. Keep the selected object and its exact source link synchronized. Discussion should preserve canvas state and unsaved work; adapt the layout for smaller viewports without inventing a second screen recipe.
- Distinguish an immutable source, a working copy, an unsaved edit and a successfully persisted version. A contextual question about one selected object is not authorization to change that source, save a new version or promote a candidate.
- Present notification and automation states truthfully. An incoming request, a stored event, an open-tab poll, a running agent, a browser notification acknowledgement and a visible OS banner are separate observations. Request notification permission only through an explicit user gesture, preserve undelivered pending events after failure, and do not promise immediate AI execution or closed-tab delivery without verified support.
- Validate the actual end-to-end task with isolated fixtures: context handoff without auto-submission, draft preservation across object and thread switches, an answer followed by clarification and author-confirmed resolution, and recovery from failed writes. Keep implementation evidence separate from a confirmed design principle or product-wide availability claim.

### Action edges, support spacing and semantic workspaces

- Enlarge lower modal corners when one or two large actions form the full-width bottom footer of that surface. A compact action row is a separate component pattern, not automatic evidence for enlarged lower corners. With no visible bottom action, retain the ordinary corner role. Resolve semantic top and lower-corner variables in the actual mode and clip the full-width action footer through the proper outer surface; do not enlarge every card or infer a modal role from appearance alone.
- For the verified request-card composition, use ordinary 16 px top and lower corners with no action area, and 16 px top / 32 px lower corners when the large action footer forms the bottom edge. This is a scoped composition policy, not a universal radius for all cards or a silent rewrite of the preserved source contract. Native and web implementation need independent consumer checks.
- The owner-confirmed compact trade-card direction keeps the existing 24 px action height and equal 16 px top/lower corners. Extra breathing room above the instrument summary is a separate scoped spacing choice; it does not authorize enlarging every small-action card or shrinking its controls. Keep this pattern distinct from the request-card large action footer.
- If removing an action changes the surrounding card anatomy and corners, represent that structural difference through a genuine supported variant. Hiding a child button is not equivalent to changing the card variant. Preserve the earlier source family and saved versions; never reinterpret an old Boolean as a new variant without an explicit migration.
- Give the confirmed support/help role 24 px top and bottom spacing around its actual content. A source with a 24 px content row is therefore 72 px high; a 44 px help button requires a 92 px wrapper. A previous 76 px native wrapper is not evidence that this newer spacing has been applied. Keep the help wrapper as the final flowing item after the request cards, and verify scrolling and fixed navigation separately.
- Present a semantic layer tree with meaningful header, request cards, help and navigation roles. Put technical wrappers and complete native ancestry behind progressive disclosure without deleting, flattening or inventing source nodes. Selection, editing and exact source links must still resolve to the genuine underlying graph.
- Preserve a familiar hierarchy / canvas / inspector workspace. The confirmed direction includes a floating bottom-right Constructor / Questions mode control, a dark construction surface and a light discussion surface under one shared identity. This is an interaction requirement; do not claim a mode, persistence or deployment exists before its actual implementation is verified.
- A question can concern the current element or comment, the current screen, another represented or unrepresented screen, or a general topic. Make the target optional, removable and replaceable; do not force the current selection into every question or retarget an existing draft after a selection change. Preserve the exact source context when the author chooses to include it.
- Contextual entry points such as a comment or right-click menu are confirmed possibilities for selecting a question target, not proof of a working context-menu feature. Distinguish confirmed future behavior from current implemented controls, persisted drafts and verified hosted delivery. Keep the question itself, its optional target and source-edit authority separate.

### Painted overlays, exact consumers and bounded startup loading

- A background blur needs real painted content behind the overlay. If a clipped scrolling body starts below a header as a disjoint sibling, increasing blur cannot make that content pass underneath it. Build the supported overlay/viewport relationship and preserve the initial content position with the proper inset; verify actual scroll geometry and painted results.
- Treat a header at rest and the same header over scrolled content as distinct appearance conditions. Reuse a genuine source glass pattern in its justified context, restore the supported resting appearance, and keep fixed navigation independent. Check both states in the actual app and portable output; computed blur alone does not prove a visible glass effect.
- Keep Help and its protective top/bottom bands together as the last flowing item after the final card. Measure clearance against fixed navigation at the end of real overflow. A 32 px web spacing candidate around a 44 px control produces a 108 px wrapper; a separately supported 24 px native treatment produces 92 px. These are scoped composition values, not interchangeable implementations or a universal Help spacing default. Preserve the source contract and label an unpropagated native/web difference.
- Preserve exact virtual instance provenance when mapping a selected element to its source. A master identifier alone can lose the actual consumer's path, nested overrides, style bindings or inherited variable modes. Keep complete identity and the exact source link, and validate effective appearance on that consumer rather than substituting a similarly named master.
- Load independent assets, fonts and optional source adapters concurrently within a bounded request pool. Count response-body consumption inside the concurrency budget; launching every request at once or retaining long avoidable serial loops does not establish a responsive startup. Measure actual request counts, duplicates and visible readiness separately from a theoretical optimization.
- Deduplicate only raw response bytes, status and headers within the authorized runtime load. Give each consumer an independent response/body and retain its own MIME, byte length, SHA and source-contract validation. A shared byte-cache hit must not turn a wrong consumer seal into success or reuse a previously validated component object as authority for another consumer.
- Scope loading caches to the intended startup and authentication context; do not share private responses across sessions or retain a global/browser-persistent cache by accident. Keep a failed resource failed for that startup, isolate a damaged optional source from unrelated working sources, and let a fresh authorized load retry. Test tampered seals after a cache hit, failure isolation, bounded concurrency and fresh-load recovery without modifying source recipes.
- A locally checked loader, a prepared archive, a deployed package and a visibly faster hosted session are separate delivery claims. Verify the final committed artifact and actual hosted behavior before reporting the optimization live; preserve exact source and consumer contracts throughout.

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

## Responsive media and portable source studies

- Test the actual inset content host at 320, 375 and 428 px. Resizing the outer screen alone does not prove that nested artwork, panels or footers adapt.
- Preserve the reference composition at 375 px. When source media needs proportional cover, use a native clipped viewport and aspect-locked carrier with supported Fill/minimum-size constraints. Verify the narrower crop and wider crop visually; do not stretch artwork or add per-width scale scripts to conceal a fixed source group.
- Preserve native IMAGE, VIDEO, masks, paint order and source crop relationships. A VIDEO layer and correct poster geometry do not prove playback or interactive prototype behavior.
- Treat a proposed crop policy as a review question until approved. One responsive media state does not prove the other states in its family.
- Verify identical font bytes and declared weights in the actual canvas and portable output. A shared family name alone is not evidence of the same font, weight, metrics or line breaks. Install a source-specific family through the actual rendering factory and ensure every consumer uses it rather than an ambient system or previously loaded font.
- Inspect optical title-to-badge clearance with real content, descenders and supported languages while preserving source text-style bindings. Equal auto-layout gaps do not guarantee equal visible ink clearance. A proposed spacing adjustment remains a proposal until accepted in context; no universal gap follows from one example.
- When portable HTML embeds fonts, carry the exact bundled license notice with the font bytes. Missing required license assets must cancel export, retain the current preview and allow retry after recovery.
- Verify portable documents from a fresh committed checkout or archive, including loaded fonts, embedded artwork, license text and actual top/bottom rendering. A passing generator alone is insufficient.
- Distinguish inspectable components from composable components in both web and API/MCP contracts. Reading a source-backed variant does not authorize insertion into arbitrary screen structures, new write actions or product approval.

## Content-driven components and recoverable working drafts

- Let mobile dialogs and similar content stacks hug their actual visible content. A fixed root can leave its CTA outside the declared bounds after narrower text wraps. Keep the action inside the supported viewport and verify the actual bottom edge at narrower, reference and wider widths; do not shrink fonts to conceal overflow.
- Expose content through real native properties bound to existing text layers. Keep body content and a nested action label independently editable when that mechanism exists, preserving text styles and instance relationships. A web control alone does not establish a native component capability.
- Preserve distinct state-specific title defaults unless the actual property mechanism supports them. A shared text-property default can synchronize multiple variants unexpectedly; inspect fresh instances after binding, restore unintended changes and record the capability limit rather than inventing a flat API or duplicate content variants.
- Apply confirmed text-only edge padding in its verified button size and composition. The verified Large text-only treatment uses 24 px at both text edges; this does not establish the same rule for every size. Use a proper shared master and existing spacing variables, not per-instance padding patches or an assumed dependency between icon visibility and numeric padding.
- Bound action labels to the available width, preserve the supported fixed button height and use the actual single-line ending-ellipsis mechanism. Let descriptive content wrap and grow through proper Fill/Hug structure. Verify default and long labels as well as optional controls in real component instances.
- Present source-backed studies with their actual state, width and editing scope. Inspection, native property support, web rendering, composition and portable export are separate capabilities and require their own checks.
- Keep a working draft's identity, persisted record and visible navigation state consistent. Mark a save successful only after storage accepts it. On failed writes, retain the current content and the last durable identity, show a recoverable failure and allow retry; do not silently switch to a new draft that cannot be restored after reload.
- Test save, copy, reload and storage-unavailable recovery using isolated fixtures. Confirm that a copied draft has its own stored identity and that loading it restores the same content; a successful preview is not proof of persistence.
- Keep unresolved design questions and proposed policies separate from confirmed reusable rules. Record the bounded evidence and remaining uncertainty; continue independent work without turning a pending answer into approval.

## Content-sized financial summaries and joined controls

- In a verified three-column mobile summary, let the ticker take the remaining Fill width while price and result columns Hug their actual content and align both lines to the right. Preserve the existing gaps, padding, text styles and genuine content properties; measured widths are evidence, not constants to copy into the layout.
- Never truncate a financial value, change its value or shrink its font merely to force a fit. If the combined minimum content exceeds the host, report the unsupported combination and require a deliberate layout alternative or validation boundary. Do not silently clip numeric columns or claim that Hug metadata proves fit.
- Verify default and representative longer values in real narrow, reference and wide consumers. Show extreme overflow diagnostics explicitly as failures; passing realistic examples does not establish arbitrary-length support. Keep native layout verification separate from implementation and web-fit acceptance.
- For a genuinely joined segmented control, preserve the shared outer shape and existing divider gap. Square the owned inner backgrounds and let the parent clip only the outer corners when that matches the actual component structure. Reuse existing radius and spacing variables rather than drawing replacements or patching virtual instances.
- Apply joined-control rules only to the identified group. Separate chart-filter buttons may intentionally retain their independent rounded shapes and gaps; a correction to one pair does not authorize a global restyle.

## Rounded control spacing and outlined artwork

- Rounded controls need sufficient outer horizontal breathing room within their actual row or card. Review the complete consumer at supported widths after changing the shape; use existing spacing variables and measured context rather than deriving a new padding value from the corner radius or copying a capsule into a cramped host.
- For outlined icons, inspect the visible stroke extents, especially the top edge, in the final consumer. A valid nominal icon frame does not prove the outline is unclipped. Preserve the original artwork and genuine component relationships; correct the supported clipping, carrier or spacing relationship instead of redrawing or masking the stroke.
- When a control should visually match a neighboring button surface, resolve both consumers' semantic surface roles, effective modes and paint layers. Match only the justified role in that context; do not recolor every control, card or shared master globally because one adjacent pair should agree.
- A confirmed principle or submitted visual correction is not proof that the component has been implemented, visually accepted or propagated to every consumer. Record those gates separately without inferring an exact spacing value or a universal paint policy.

### Contextual help in a scrolling request list

- Place contextual help as the last item of a scrolling request list when that is the confirmed screen behavior; do not turn it into a sticky overlay.
- Keep the help control and its vertical spacing together so both follow the final card during overflow.
- Apply text-edge and icon-edge padding independently for a button with an icon on either side; a right icon does not justify an icon-sized left text inset.
- Verify one item, multiple items and genuine overflow with fixed navigation, long content and supported viewport sizes.
- Keep example cardinalities and illustrative request copy separate from verified product requirements. A single-card source does not prove a complete request list or its behavior.

### Semantic padding and independent inner clearance

- Bind actual auto-layout cell padding through the appropriate component or badge semantic padding group, with aliases to existing foundations. A text offset, a manually shifted child or a bare numeric inset is not a substitute for genuine component padding.
- Treat outer horizontal padding and inner clearance between adjacent control content as independent requirements. Increasing the outside inset must not silently consume the inside space or crowd neighboring labels. Verify both clearances in the actual consumer, not only the stored outer-padding value.
- Let properly padded cells Hug their supported content and let the surrounding auto-layout structure allocate the remaining space. Do not compensate for missing padding semantics with fixed-width hacks, positional shifts or forced text geometry.
- When a measured rounded-control proposal needs a missing semantic padding alias, scope that alias to the justified component role and existing foundation. Preserve existing badge padding elsewhere. A measured proposal value is not a universal approved default, a production implementation claim or evidence of contrast acceptance.

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
9. Use variables for supported show/hide and numeric differences. Do not claim that independent Boolean icon visibility can automatically drive numeric edge padding; verify the actual property mechanism.
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
