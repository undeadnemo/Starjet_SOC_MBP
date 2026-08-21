# Starjet Mission Control Dark Design System

Version: 1.0  
Status: Approved direction for new Starjet OCC/SOC operational screens  
CSS source of truth: `apps/web-ele/src/styles/starjet-mission-control-dark.css`
Chinese edition: `docs/design-system/starjet-mission-control-dark.zh-CN.md`

## 1. Style definition

The dark reference is a **Mission Control Dark** interface: a low-glare,
data-dense operational workspace inspired by airline OCC/SOC control rooms,
avionics displays, dispatch tools, and professional market terminals.

It is not a decorative dark theme, gaming UI, glassmorphism, or cyberpunk UI.
The visual language must communicate continuous monitoring, precise timing,
clear operational status, and fast exception handling.

Use this system for flight planning, fleet status, dispatch, duty, compliance,
fuel, ground services, alerts, operational timelines, and related detail views.

## 2. Design principles

1. **Status before decoration** — color communicates state or task type. Never
   add accent color only to make a surface look more interesting.
2. **Dense but calm** — show more operational context without heavy cards,
   excessive shadows, or large empty areas.
3. **Persistent context** — dates, aircraft, time base, filters, and selected
   task remain visible while the operator works.
4. **Exception-led hierarchy** — normal information stays quiet; warnings,
   conflicts, and the current-time marker receive the strongest contrast.
5. **Scan in two seconds** — identifiers, routes, UTC times, status, and the
   next action must be recognizable without opening a detail page.
6. **Precision over softness** — use thin rules, compact controls, restrained
   radii, aligned data, and minimal elevation.

## 3. Visual signature

- Near-black canvas with a subtle cool-blue undertone.
- Surfaces differ by small luminance steps, not large color blocks.
- One-pixel dividers and grid lines organize the workspace.
- Sans-serif type for language; monospace type for times, codes, IDs, and
  numeric values.
- Blue indicates navigation, selection, and information.
- Lime indicates ready, confirmed, available, or the operational primary CTA.
- Amber indicates pending action or degraded readiness.
- Red indicates conflict, overdue, blocked, or unsafe.
- Purple indicates maintenance or engineering work, not general emphasis.
- Teal indicates ferry/repositioning or supporting movements when task-type
  differentiation is needed.
- Glows are reserved for focus, current selection, and live status markers.

## 4. Color tokens

Always use the CSS variables. Raw hex values in components are not allowed
unless a chart needs an approved series color that is not yet tokenized.

### Foundation

| Token | Value | Use |
| --- | --- | --- |
| `--sj-canvas` | `#07090e` | Page and timeline canvas |
| `--sj-surface-1` | `#0b0e14` | Main working surface |
| `--sj-surface-2` | `#0f141d` | Toolbars, rows, cards |
| `--sj-surface-3` | `#151b26` | Hover, selected controls |
| `--sj-surface-4` | `#1b2330` | Popovers and elevated panels |
| `--sj-grid` | `#182131` | Timeline and table grid |
| `--sj-border` | `#202a3a` | Default divider |
| `--sj-border-strong` | `#334155` | Selected/important divider |

### Text

| Token | Value | Use |
| --- | --- | --- |
| `--sj-text-1` | `#f4f7fb` | Primary labels and values |
| `--sj-text-2` | `#a8b2c1` | Supporting labels |
| `--sj-text-3` | `#727e90` | Timestamps and metadata |
| `--sj-text-disabled` | `#4a5565` | Disabled content only |

### Semantic color

| Token | Value | Meaning |
| --- | --- | --- |
| `--sj-blue` | `#4d9eff` | Selected, active, informational |
| `--sj-lime` | `#a8e63d` | Ready, confirmed, available |
| `--sj-amber` | `#f6b943` | Pending, attention, degraded |
| `--sj-red` | `#ff625b` | Critical, blocked, conflict |
| `--sj-purple` | `#b579ff` | Maintenance and engineering |
| `--sj-teal` | `#3dd6c1` | Ferry/supporting movement |

Use semantic color at full strength for small markers, borders, text, and
primary actions. Use its translucent form for a card fill. Do not fill large
areas with saturated color.

## 5. Typography

### Families

- UI and Chinese: `Inter`, `SF Pro Display`, `PingFang SC`, `Microsoft YaHei`,
  system sans-serif.
- Operational data: `JetBrains Mono`, `SFMono-Regular`, `Roboto Mono`, system
  monospace.

Use monospace for airport codes, aircraft registrations, flight IDs, UTC
times, durations, percentages, counters, and coordinates. Do not use it for
long Chinese labels or descriptions.

### Scale

| Role | Size / line-height | Weight |
| --- | --- | --- |
| Micro metadata | `11 / 16px` | 500 |
| Caption | `12 / 18px` | 500 |
| Body/data | `13 / 20px` | 500 |
| Control label | `14 / 20px` | 600 |
| Section heading | `16 / 24px` | 650 |
| Panel value | `20 / 28px` | 700 |
| Primary operational KPI | `24 / 32px` | 700 |

Uppercase English eyebrows may use `0.08em`–`0.12em` letter spacing. Do not
apply tracking to Chinese text or long values.

## 6. Spacing, geometry, and elevation

- Base spacing unit: `4px`.
- Standard steps: `4, 8, 12, 16, 20, 24, 32px`.
- Dense control height: `32px`; standard control height: `36px`; primary CTA:
  `40px`.
- Panel padding: `16px`; large section padding: `20px` or `24px`.
- Table/timeline row minimum height: `48px`; aircraft timeline rows normally
  use `96px`–`120px` depending on information density.
- Radius: `4px` for tags, `6px` for controls/cards, `8px` for panels, `12px`
  only for large overlays. Avoid pill shapes except compact status chips.
- Border: `1px` by default. A selected task may use `2px` blue.
- Shadow: use only on floating panels and selected tasks. Never use large soft
  shadows around navigation bars or full-width sections.

## 7. Page architecture

The preferred desktop composition is a command workspace, not a dashboard of
independent cards:

```text
Command bar: product/context | view/date controls | time base/actions
KPI strip: planned / AOG / service exceptions / conflict / readiness
Workspace:
  fleet rail | primary timeline/table canvas | contextual inspector
```

Recommended desktop dimensions:

- Command bar: `56px`–`64px` high.
- KPI strip: `64px`–`72px` high.
- Fleet rail: `240px`–`280px` wide.
- Inspector: `360px`–`420px` wide.
- Primary canvas: fills all remaining width and height.

The primary canvas should use grid lines and spatial alignment instead of
multiple nested cards. Keep outer page padding at `12px`–`20px`; avoid large
blank margins around the operational workspace.

### Responsive behavior

- `>= 1440px`: fleet rail + canvas + inspector visible.
- `1200–1439px`: fleet rail `220px`–`240px`, inspector `320px`–`360px`.
- `960–1199px`: inspector becomes an overlay drawer; fleet rail may collapse.
- `< 960px`: show a focused single-pane view. Preserve task, date, and status
  context; do not merely shrink the three-pane layout.

The operational desktop target is `1280px` and above. Horizontal scrolling is
acceptable inside a timeline, but never for the whole application shell.

## 8. Core components

### Command bar

- Single horizontal band on `--sj-surface-1`.
- Product identity is compact; operational filters take priority.
- Segmented controls use quiet borders. Active view uses `--sj-surface-3` and
  `--sj-text-1`, not a bright filled button.
- The operational primary action uses lime; ordinary navigation uses blue.

### KPI strip

- Values are larger than their labels and aligned to a shared baseline.
- Separate items with vertical `1px` dividers.
- Use a `6px`–`8px` status dot before the value or label.
- Normal metrics remain neutral; semantic color is applied only to the dot or
  exceptional value.

### Timeline/date header

- Date header remains sticky when the timeline scrolls vertically.
- Today uses a quiet tinted background plus a lime `今天` label.
- Current time uses a `1px` red vertical line and a compact red time tag.
- Time labels are monospace and secondary; grid lines stay lower contrast than
  task borders.

### Fleet/aircraft row

- Registration is the primary line; model/base is secondary.
- Readiness bar uses lime, amber, or red according to threshold.
- Put status text beside the registration. Do not encode readiness only by
  color.

### Flight task card

- Minimum useful width: `128px`; preferred width: `160px`–`240px`.
- Height follows content, normally `64px`–`84px`.
- First line: task-type chip + origin/route direction.
- Second line: UTC time range.
- Selected card: `2px` blue border and a restrained blue halo.
- Card fill uses a low-opacity task/status tint; text remains high contrast.
- Route and critical times do not truncate when space can be gained by wrapping.
  Use two lines before ellipsis.

### Context inspector

- Fixed right pane on large screens; drawer on narrower screens.
- Begin with selected-flight identity and route, followed by readiness chains,
  crew duty, and alerts.
- Section headings use small uppercase English or bilingual labels with a thin
  divider.
- Keep normal rows flat; do not wrap each row in another card.
- Place the next safe operational action at the bottom as a full-width lime
  button. Destructive or unsafe actions use red and require confirmation.

### Tables and lists

- Header uses `--sj-surface-2`; rows use canvas/surface alternation no stronger
  than one luminance step.
- Row height is `44px`–`52px`.
- Align codes/times on a monospace grid.
- Hover uses `--sj-surface-3`; selected row adds a blue left rule.

### Status chips

- Height `20px`–`24px`, radius `4px`, compact horizontal padding.
- Use semantic text + tinted background + optional icon/dot.
- Every chip must contain a readable label such as `已确认`, `待处理`, `异常`,
  or `受阻`; color alone is insufficient.

## 9. Interaction states

- Hover: raise surface luminance by one step; do not move the component.
- Active/selected: blue border or underline plus a subtle blue tint.
- Keyboard focus: `2px` blue ring with `2px` offset.
- Disabled: reduce contrast and remove glow; keep labels readable.
- Loading: prefer skeletons inside the existing layout. Do not blank the whole
  command surface after initial startup.
- Empty state: explain the active filter/date context and offer one relevant
  recovery action.
- Error: keep the surrounding operational context visible and show the exact
  failed area with retry guidance.

Motion should be functional and short: `120ms` hover, `160ms` selection, and
`200ms` drawer transitions. Respect `prefers-reduced-motion`.

## 10. Data and copy rules

- Airport codes: uppercase ICAO (`ZSPD`, `ZGGG`).
- Aircraft registration: uppercase and hyphenated (`B-9308`).
- UTC time: four digits plus `Z` (`1330Z`); local time must be explicitly
  labeled `LT`.
- Date: Chinese interface uses `8月21日`; dense metadata may use `21 AUG`.
- Route: `ZSPD → ZGGG`; use an icon from the existing icon library when a
  richer direction indicator is needed.
- Avoid vague states such as `处理中` without owner, deadline, or next action.
- Keep bilingual labels only where operational teams need them; do not repeat
  English on every ordinary control.

## 11. Accessibility requirements

- Primary text must meet WCAG AA contrast against its surface.
- Secondary/muted text may not be used for essential instructions.
- Status must always include text or an icon in addition to color.
- Focus indicators must be visible on all interactive controls.
- Minimum pointer target is `36 × 36px`; use `44 × 44px` for touch layouts.
- Timeline cards must have an accessible name containing type, registration,
  route, time, and status.
- Do not disable browser zoom. Test at 200% zoom and with reduced motion.
- Sticky headers must not cover focused content.

Screenshot review cannot prove keyboard order, screen-reader output, contrast
ratios, or zoom behavior. Those require implementation testing.

## 12. AI implementation contract

Any AI or contributor producing Starjet operational UI must follow this order:

1. Read this document and the CSS token file before editing UI.
2. Identify the operator's main decision, current context, exceptions, and next
   safe action.
3. Choose the command-workspace layout before adding components.
4. Reuse existing Starjet components and icons where possible.
5. Use only `--sj-*` tokens for this visual system.
6. Implement hover, selected, focus, loading, empty, and error states.
7. Verify at `1440px`, `1280px`, and `1024px` widths.
8. Check contrast, keyboard focus, overflow, sticky regions, and long Chinese
   text before handoff.

### Required output from AI

When proposing or implementing a screen, state:

- The operator's primary task.
- The persistent context shown on screen.
- The semantic meaning of every accent color used.
- The responsive behavior of side panels and timeline/table content.
- Which components and tokens from this system were reused.

### Do

- Use near-black layers, thin dividers, compact controls, and clear alignment.
- Reserve brightness for current, selected, ready, warning, and critical state.
- Keep aircraft, route, date, UTC time, and readiness visible.
- Prefer one continuous operational canvas over a collection of dashboard cards.

### Do not

- Do not introduce glassmorphism, gradients, decorative neon, or heavy blur.
- Do not use large rounded white cards inside the dark workspace.
- Do not use blue for both selection and every primary CTA.
- Do not use red for neutral emphasis.
- Do not hide essential route/time information behind ellipsis by default.
- Do not add large drop shadows to navigation bars or sticky headers.
- Do not create new raw colors, spacing values, or radii when a token exists.

## 13. Review checklist

- [ ] Entire operational workspace uses the dark surface hierarchy consistently.
- [ ] Primary action, selection, readiness, warning, and critical colors have
      distinct meanings.
- [ ] All codes and times use the operational monospace family.
- [ ] Grid, rows, cards, and panels align to the `4px` spacing system.
- [ ] No unnecessary nested cards, gradients, or oversized shadows.
- [ ] Current date/time and selected task remain visible during scroll.
- [ ] Long route and Chinese text wrap or reflow without hiding key data.
- [ ] Keyboard focus and non-color status labels are present.
- [ ] Layout behaves correctly at 1440, 1280, and 1024 widths.
- [ ] Loading, empty, error, disabled, hover, and selected states are covered.
