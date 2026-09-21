# Design QA — 航班计划甘特图固定卡片与自动避让

## Evidence

- Reference image: `/var/folders/nd/zbqv0pkx4j16vv4_6q4zmc_c0000gn/T/codex-clipboard-db7e05e7-35a7-4d47-89ef-048ba3d6bffb.png` (2266 × 1338)
- Implementation source: `/Users/nemo/Documents/Starjet_SOC/starjet_soc_admin/apps/web-ele/src/views/operations/flight-plan/content.vue`
- Runtime preview: `http://127.0.0.1:5778/preview/flight-plan`
- Rendered evidence: Codex in-app browser capture at 862 × 904, August 28 Gantt state, 5 visible days, dark theme.

## Source / implementation comparison

- The reference exposed severe card occlusion and redundant endpoint / connection marks.
- The implementation retains exact horizontal time positioning but separates it from the readable information card.
- All cards now use one neutral Mission Control surface; aircraft identity remains encoded by the registration text and the compact time rectangle.
- Fixed-width cards are assigned to the first collision-free vertical lane within each aircraft row. Row height expands only as much as required.

## Automated checks

- [x] 40 rendered Gantt cards inspected in the dense August data set.
- [x] Every rendered card width is exactly 184 px.
- [x] Pairwise rectangle intersection check returned zero overlapping card pairs within aircraft rows.
- [x] Departure / arrival endpoint circles and connection labels are absent.
- [x] Exact duration is shown as one rectangular bar at the top edge of the card and uses `--aircraft-color`.
- [x] Card click opens the flight inspector and its close control works.
- [x] No runtime console errors; only an existing local-storage warning was present.
- [x] TypeScript typecheck passed.
- [x] Production build passed.
- [x] `git diff --check` passed.

## Final result

Passed. The dense 3–4-leg-per-day cases remain readable without card occlusion, while exact flight duration is preserved as a compact aligned indicator.

---

# Design QA — 航班详情单屏看板与第二屏模块导航

## Evidence

- Source visual truth: `/var/folders/nd/zbqv0pkx4j16vv4_6q4zmc_c0000gn/T/codex-clipboard-92085389-27d1-4eb4-b9a1-ba2c569c5592.png` and `/var/folders/nd/zbqv0pkx4j16vv4_6q4zmc_c0000gn/T/codex-clipboard-3045f6c0-3f4c-4392-9e29-ee32a607c38a.png` (top and bottom states of the overflowing implementation).
- Implementation: `/Users/nemo/Documents/Starjet_SOC/starjet_soc_admin/apps/web-ele/public/flight-detail/index.html`, `styles.css`, and `app.js`.
- Runtime preview / implementation evidence: `http://127.0.0.1:5778/preview/flight-detail`, visually captured in Codex in-app browser tab 1.
- Implementation evidence: Codex in-app browser capture of `http://127.0.0.1:5778/flight-detail/index.html?theme=dark` at a 1280 × 720 CSS viewport, plus the embedded preview at `http://127.0.0.1:5778/preview/flight-detail`.
- Density normalization: browser capture and implementation metrics were evaluated in CSS pixels; the user screenshots are HiDPI app-shell captures and were used as overflow evidence rather than pixel-for-pixel typography references.

## Source / implementation comparison

- The first screen now contains the complete FP-210 trip strip, hero, continuous 82% readiness ring, eight resource cards, flight phases, compact exception rail, and footer.
- The detail tabs begin below the first viewport. Clicking a resource card changes the active tab and scrolls its detail module below the sticky tab bar.
- English helper titles are removed, the next-action block is removed, and the resource icons use solid treatment.

## Verification findings

- [x] Resource cards are keyboard-focusable and link to the matching detail modules.
- [x] At 1280 × 720, the footer ends at y=716 and the detail tabs begin at y=746; the command board is fully visible in screen one and the tab system begins in screen two.
- [x] The readiness ring is one continuous arc rather than segmented blocks.
- [x] `FLIGHT READINESS`, `MISSION READY`, `Aircraft`, `Crew`, `Passenger`, `Handling`, `Fuel`, `Permit`, `Slot`, and `Documents` are absent from the first screen.
- [x] The “下一步行动” module is absent.
- [x] Resource icons use filled shapes while state colors remain semantic.
- [x] Clicking 机组 activates the `crew` tab and places the section at y=77; clicking 旅客 activates `passengers` and places it at y=88.
- [x] Central readiness visualization is rendered from the page's semantic theme tokens and resizes with its container.
- [x] The existing MEL, flight data, billing, passenger, fuel, document, and post-flight sections remain present.
- [x] No P0/P1/P2 visual blockers, clipping, card overlap, or document-level horizontal overflow were found in the checked states.
- [x] Production build, JavaScript syntax check, and `git diff --check` passed.

## Comparison history

1. Initial evidence showed that the top and bottom of the command board required separate scroll positions. The board was compressed and the next-action module removed.
2. The first compact pass still ended four pixels below the 720 px viewport. Exception spacing was reduced; the footer now ends at y=716.
3. The final pass confirmed a continuous ring, filled icons, removed English helper titles, a complete first screen, second-screen tabs, and functional card-to-module navigation.

## Final result

passed

---

# Design QA — 物料导出层级与文件预览

## Evidence

- Source visual truth: `/var/folders/nd/zbqv0pkx4j16vv4_6q4zmc_c0000gn/T/codex-clipboard-b6e7c0de-b3e0-4b20-a910-6192c88b8e17.png` (2498 × 1260 px).
- Implementation: `/Users/nemo/Documents/Starjet_SOC/starjet_soc_admin/apps/web-ele/public/flight-detail/index.html`, `styles.css`, and `app.js`.
- Runtime preview: `http://127.0.0.1:5777/preview/flight-detail`.
- Implementation screenshot: Codex in-app browser capture inspected inline on 2026-09-21; the browser capture API did not expose a persistent filesystem path.
- Viewport: 866 × 905 CSS px app shell with an embedded narrow detail frame; browser density normalization applied automatically.
- State: dark theme, 文件 Tab, all 19 file items selected; file-preview dialog also checked with 航段提取 and 飞行任务书 states.

## Full-view comparison evidence

- The module follows the source hierarchy: compact selection toolbar, top-level document packages, expandable grouped contents, and right-aligned group counts/actions.
- The requested helper copy under “物料导出” is absent.
- Child rows are inset beyond their parent checkbox/code column, remaining visually subordinate at both desktop and narrow embedded widths.
- The implementation intentionally keeps the repository’s Mission Control Dark spacing and token system instead of copying screenshot pixel values that conflict with the narrower embedded workspace.

## Focused interaction evidence

- “预览已选” opens a full file-preview dialog rather than a toast.
- The preview lists all selected files, exposes route/date/aircraft/task metadata, and shows a content summary for the active file.
- Selecting “飞行任务书” updates the preview title, file code, and content sections without closing the dialog.
- Parent/child selection, indeterminate group state, format switching, expand/collapse, all-select, and clear-selection remain functional.

## Required fidelity surfaces

- Fonts and typography: existing UI/data font stacks and weights are preserved; preview hierarchy remains readable without truncating primary titles.
- Spacing and layout rhythm: parent rows remain dense; child rows use a consistent additional inset; the modal reflows from sidebar/document to stacked layout at the narrow breakpoint.
- Colors and visual tokens: all surfaces, borders, selection states, and actions use `--sj-*` tokens; blue remains informational/selected and lime remains the primary export action.
- Image quality and asset fidelity: the reference contains no required raster artwork or non-standard icons; no placeholder image or custom decorative asset was introduced.
- Copy and content: the unwanted helper sentence is removed; all 19 requested export items remain present and previewable.

## Comparison history

1. Initial implementation used a toast for preview and child padding was too close to parent rows at the narrow embedded width.
2. Added a selectable file-preview dialog and increased child indentation with responsive token-based spacing.
3. Final browser check confirmed file switching, responsive layout, accessible button semantics, and no console errors.

## Findings

- No actionable P0/P1/P2 mismatch remains for the requested scope.
- P3: the static prototype previews representative file sections rather than final backend-rendered PDF/Excel pagination.

## Final result

passed

---

# Design QA — 详情模块顺序与故障保留单

## Evidence

- Source visual truth: `/var/folders/nd/zbqv0pkx4j16vv4_6q4zmc_c0000gn/T/codex-clipboard-78894ac6-0fb5-48ef-aa2d-24b37212b677.png` (921 × 770 px).
- Implementation: `/Users/nemo/Documents/Starjet_SOC/starjet_soc_admin/apps/web-ele/public/flight-detail/index.html`, `styles.css`, and `app.js`.
- Runtime preview: `http://127.0.0.1:5777/preview/flight-detail`.
- Implementation screenshot: Codex in-app browser capture on 2026-09-21; the tool capture was inspected inline but does not expose a persistent filesystem path.
- Viewport: 866 × 905 CSS px app shell with an embedded 610 px-wide detail frame; DPR handled by the browser capture.
- State: dark theme, 飞机详情, populated MEL attachment dialog.

## Full-view and focused comparison

- The source document is a wide paper form. The implementation intentionally preserves its bilingual field hierarchy while adapting it to the Mission Control Dark system rather than copying the light paper styling.
- The compact flight-detail list exposes only high-priority dispatch fields: deferral reference, MEL/ATA, fault report, defer reason/required part, repair category/due date, release status, and attachment.
- The attachment opens a populated, flight-specific deferral form. At the embedded preview width, metadata and approval fields reflow into two columns instead of requiring page-level horizontal scrolling.

## Required fidelity surfaces

- Typography: bilingual labels remain subordinate to monospace operational values; no clipping is present in the checked viewport.
- Spacing and layout: the list is one dense operational row; the preview retains the source form's bordered sections and adapts to narrow widths.
- Colors and tokens: all new surfaces and states use `--sj-*` Mission Control tokens; amber is reserved for the repair deadline.
- Image quality: no raster document surrogate or placeholder is used; the form is native, selectable UI text.
- Copy and content: key field names and relationships from the supplied deferred defect form are represented with realistic flight-specific data.

## Comparison history

1. Initial attachment preview preserved the wide source grid but required horizontal scrolling in the embedded detail frame (P2).
2. The responsive pass reflowed header, metadata, action, and approval grids. The final browser capture shows readable fields and fixed footer actions without document-level clipping.

## Verification

- [x] Top tabs and detail modules resolve in the same order: 飞机、批复/许可、报文、燃油、乘客、保障、文件、账单、航后日志.
- [x] “存在 MEL” label is absent.
- [x] Attachment button opens the populated DR-2026-0198 deferral form.
- [x] Dialog close and print controls are present and keyboard accessible.
- [x] JavaScript syntax check and `git diff --check` passed.
- [x] Browser console contains no runtime errors; only the pre-existing local-storage prefix warning remains.

## Findings

- No actionable P0/P1/P2 issue remains in the checked state.

## Final result

passed

---

# Design QA — 航班动态与待办任务固定高度

## Evidence

- Source visual truth: `/var/folders/nd/zbqv0pkx4j16vv4_6q4zmc_c0000gn/T/codex-clipboard-651fe360-d249-43d0-8c17-213c534292a5.png`.
- Implementation: `/Users/nemo/Documents/Starjet_SOC/starjet_soc_admin/apps/web-ele/public/flight-detail/index.html` and `styles.css`.
- Runtime preview: `http://127.0.0.1:5777/preview/flight-detail`.
- Browser-rendered evidence: Codex in-app browser captures of the embedded preview and direct flight-detail page after the final CSS reload.

## Focused comparison

- The wide dashboard now consumes exactly the available viewport below the 58 px module navigation; its measured client height and scroll height both equal 662 px at 1280 × 720.
- 航班动态 keeps the countdown fixed and gives the node list the remaining height. The list uses internal vertical scrolling, a centered node/guide axis, a flexible description column, and a right-aligned fixed-width time column.
- 航班公告 and 待办任务 are stacked in one right rail instead of being squeezed side by side. Both sections have fixed row allocation; the announcement list and task list scroll internally when their content exceeds the available height.
- At narrower widths the command board returns to natural document flow so resource content is never clipped merely to preserve the desktop one-screen composition.

## Interaction and responsive checks

- [x] 1440 × 900: dashboard height and scroll height both 842 px; no document-level horizontal overflow.
- [x] 1280 × 720: dashboard height and scroll height both 662 px; 航班动态 list has `overflow-y: auto` and 84 px of scrollable overflow.
- [x] 1024 × 768: responsive layout has no document-level horizontal overflow and no resource-panel clipping.
- [x] 航班动态与待办任务容器均可键盘聚焦，并保留可见焦点样式。
- [x] JavaScript syntax check, TypeScript typecheck, production build, and `git diff --check` passed.

## Findings

- No actionable P0/P1/P2 visual, overflow, or interaction issue remains in the checked states.

## Final result

passed

---

# Design QA — 航班详情三栏看板密度更新

## Evidence

- Source visual truth: `/var/folders/nd/zbqv0pkx4j16vv4_6q4zmc_c0000gn/T/codex-clipboard-1b5e0944-f17f-48c5-b8af-32d96bb29bbb.png` (2936 × 1312 px; normalized display 2048 × 915).
- Implementation: `/Users/nemo/Documents/Starjet_SOC/starjet_soc_admin/apps/web-ele/public/flight-detail/index.html`, `styles.css`, and `app.js`.
- Runtime preview and implementation evidence: `http://127.0.0.1:5777/preview/flight-detail`, captured in the Codex in-app browser at 2048 × 915 and 1440 × 900 CSS px.

## Full-view comparison

- The full-width module navigation now leads directly into a three-column command board: route and flight dynamics on the left, readiness plus exceptions in the center, and announcements plus todo tasks on the right.
- The readiness panel removes the prior vertical dead space. All eight resource cards stretch evenly through the available panel height, while their guide lines stay centered on the readiness ring.
- Announcements and todo tasks use compact rows and title-level `新增` actions, matching the reference scanning density while retaining Starjet Mission Control tokens and existing business-state colors.

## Interaction and responsive checks

- [x] 2048 px: first screen has matching client and scroll height/width; the full three-column command board is visible without document scrolling.
- [x] 1440 px: no document-level horizontal or vertical overflow; the three-column hierarchy remains intact.
- [x] 1280 px: no horizontal overflow; the collaboration rail moves below the board.
- [x] 1024 px: the dashboard becomes a single-column flow and document-level horizontal overflow is eliminated; detail modules continue below the first screen as designed.
- [x] `新增` opens the announcement form; cancel closes it.
- [x] Clicking the 机组 resource card activates and locates the 机组 detail module; 看板 returns to the command board.
- [x] Browser console contains no runtime errors; only the existing local-storage prefix warning remains.
- [x] JavaScript syntax check, production build, and `git diff --check` passed.

## Final result

passed

---

# Design QA — 资源区域空白移除与异常区上移

## Evidence

- Source visual truth: `/var/folders/nd/zbqv0pkx4j16vv4_6q4zmc_c0000gn/T/codex-clipboard-40aa1820-0980-4ea8-9ed6-731aa1a0ca2e.png`.
- Runtime preview: `http://127.0.0.1:5778/preview/flight-detail`.
- Direct browser evidence: 1280 × 720 CSS px, DPR 2, dark theme.

## Findings and resolution

- P2: The resource panel inherited the full height of the left flight-dynamics column, leaving large blank bands above and below its actual content. The dashboard was changed to four explicit grid rows so the resource panel uses only its measured content height.
- P2: The exception panel started after the former stretched resource region. It now begins immediately after the compact resource panel with the standard 12 px section gap.

## Verification

- Resource panel height reduced from 512 px to 375 px.
- Resource card stack and readiness core are vertically aligned at 312 px.
- The exception panel begins 12 px after the resource panel.
- Left flight-dynamics height remains 478 px and retains all seven nodes.
- All eight resource cards report zero content overflow.
- No document-level horizontal overflow.
- Production build, JavaScript syntax check, and `git diff --check` passed.

## Required fidelity surfaces

- Typography, colors, icons, and operational copy are unchanged.
- Layout rhythm now follows the visible content rather than the tallest neighboring column.
- Existing local SVG assets remain unchanged and sharp.

## Final result

passed

---

# Design QA — 资源卡片密度与准备度圆环几何修正

## Evidence

- Source visual truth: `/var/folders/nd/zbqv0pkx4j16vv4_6q4zmc_c0000gn/T/codex-clipboard-47fa58eb-fd71-4a68-bc53-a23cea639ac5.png` (3448 × 1478 px; normalized display 2048 × 878).
- Implementation: `/Users/nemo/Documents/Starjet_SOC/starjet_soc_admin/apps/web-ele/public/flight-detail/styles.css` and `app.js`.
- Runtime preview: `http://127.0.0.1:5778/preview/flight-detail`.
- Browser-rendered evidence: direct dark-theme preview at 1280 × 720 CSS px, DPR 2.

## Findings and fixes

1. P2 — Resource cards inherited the full height of the two-row readiness panel, producing 107 px cards with unused internal vertical space. Fixed by using four 72 px rows with an 8 px rhythm and centering the compact card stack in the operational canvas.
2. P2 — The two readiness-stat rectangles extended into the circular arc's inner edge at their corners. Fixed by reducing the internal content envelope to 92 × 92 px, reducing the stats row to 84 px, and adjusting the ring radius and stroke width.
3. P2 — Connector geometry no longer matched the compacted card centers after the density change. Fixed by constraining the connector layer to the same centered 320 px geometry as the card stack and readiness core.

## Required fidelity surfaces

- Typography: operational data hierarchy and monospace percentages are unchanged; tighter line heights fit without truncation.
- Spacing and layout: every resource card is 72 px high; all eight cards report zero content overflow; the centered card stack is 312 px high.
- Colors and tokens: Mission Control semantic colors and existing `--sj-*` surfaces remain unchanged.
- Image and icon quality: the existing local filled SVG icon set remains sharp and unchanged.
- Copy and content: all operational labels and demo values are preserved.

## Post-fix verification

- [x] Readiness canvas center and content center differ by only 2 px vertically and are identical horizontally.
- [x] At the narrow 180 px ring size, the 92 px content envelope stays within the ring's inner radius; the statistics do not intersect the arc.
- [x] All eight resource cards have matching client and scroll heights, with zero internal overflow.
- [x] The readiness core has matching client and scroll heights.
- [x] No document-level horizontal overflow.
- [x] No browser console errors or warnings.
- [x] JavaScript syntax check, production build, and `git diff --check` passed.

## Comparison history

1. Initial evidence showed stretched resource cards and statistical blocks touching the readiness arc.
2. The first compact pass revealed an unresolved local control-height token in the standalone prototype; the browser continued distributing flexible rows.
3. The final pass replaced that unresolved value with an explicit component geometry, confirmed 72 px cards, aligned connectors, and a non-intersecting centered ring composition.

## Final result

passed

---

# Design QA — 航班详情三栏协同看板布局

## Evidence

- Source visual truth: `/var/folders/nd/zbqv0pkx4j16vv4_6q4zmc_c0000gn/T/codex-clipboard-ccc8db3d-1627-4b4f-a715-2de25712bc8e.png` (3448 × 1478 px; displayed at 2048 × 878 after normalization).
- Implementation: `/Users/nemo/Documents/Starjet_SOC/starjet_soc_admin/apps/web-ele/public/flight-detail/index.html`, `styles.css`, `app.js`, and `icons/*.svg`.
- Runtime preview: `http://127.0.0.1:5778/preview/flight-detail`.
- Direct implementation preview: `http://127.0.0.1:5778/flight-detail/index.html?theme=dark`.
- Viewport checks: 2048 × 878, 1440 × 900, 1280 × 900, and 1024 × 900 CSS px.

## Full-view comparison

- The command board now follows the reference's scanning model: route and flight dynamics form a compact left rail, resource readiness occupies the visual center, and announcements / todo tasks form a persistent collaboration rail on desktop.
- The source was treated as a layout reference rather than a pixel specification. Starjet Mission Control tokens, semantic status colors, existing copy, and existing interactions were preserved.
- The center readiness ring is enlarged at wide desktop widths, while resource cards and guide lines stay aligned to the established eight-resource hierarchy.
- At narrower widths the collaboration rail moves below the primary content instead of forcing horizontal scrolling.

## Required surface review

- Typography: compact operational hierarchy retained; route times were intentionally split into date and time lines to prevent clipping.
- Spacing and layout: three-column desktop composition verified; exception cards, route card, resource canvas, flight dynamics, announcements, and tasks do not overlap.
- Color and tokens: layout uses the existing `--sj-*` Mission Control palette; blue remains informational, lime ready, amber pending, red blocked, and purple maintenance.
- Assets and icons: all eight resource icons use the local filled SVG set and remain visually independent from semantic card-state colors.
- Copy: existing FP-210 demo data and Chinese operational labels remain unchanged.

## Interaction and responsive checks

- [x] LT / UTC / BJ switching works; UTC updates the departure time to `05:30 UTC`.
- [x] Clicking the 机组 resource card activates the `crew` detail module and scrolls to it.
- [x] 新增公告 opens the form and focuses its content field; 取消 hides and resets it.
- [x] No document-level horizontal overflow at 2048, 1440, 1280, or 1024 px.
- [x] At 1024 px, the dashboard has matching client and scroll widths; the flight-dynamics panel has matching client and scroll heights.
- [x] JavaScript syntax check, production build, and `git diff --check` passed.

## Comparison history

1. The first pass restored the right collaboration rail and exposed route-time clipping plus a small exception-panel overflow.
2. Route time markup was normalized to two lines, exception sizing was corrected, and desktop column proportions were tightened.
3. The final pass enlarged the readiness focal point on wide screens, verified interaction behavior, and confirmed responsive overflow safety.

## Findings

- No actionable P0/P1/P2 visual or interaction issue remains in the checked states.

## Final result

passed

---

# Design QA — 航班详情参考布局与运行资源图标重绘

## Evidence

- Source visual truth: `/var/folders/nd/zbqv0pkx4j16vv4_6q4zmc_c0000gn/T/codex-clipboard-1664ecd9-b8b9-4160-b061-c31f27b8d183.png` (3392 × 1482 px, HiDPI app-shell capture).
- Implementation: `/Users/nemo/Documents/Starjet_SOC/starjet_soc_admin/apps/web-ele/public/flight-detail/index.html`, `styles.css`, `app.js`, and `icons/*.svg`.
- Runtime preview: `http://127.0.0.1:5778/preview/flight-detail`.
- Browser-rendered evidence: Codex in-app browser direct-page capture of `http://127.0.0.1:5778/flight-detail/index.html?theme=dark`, dark theme, plus embedded app-shell capture at the preview URL.
- Viewport checks: 1440 × 900, 1280 × 800, and 1024 × 768 CSS px; browser density was normalized in CSS pixels.

## Full-view comparison

- The first-screen information architecture now matches the reference: compact route strip and module tabs, then a three-column command board with route, exceptions, and flight dynamics above the resource readiness and phase areas.
- The continuous 82% readiness ring remains the visual anchor; the eight resource cards retain semantic green/amber/red status colors.
- Resource icons were rebuilt from the Material Symbols solid set and loaded as local SVG assets through CSS masks. Aircraft, crew, passenger, handling, fuel, permit, slot, and document icons now share one filled visual grammar.
- Existing flight data and all detailed modules remain below the command board rather than being removed.

## Focused comparison

- Icon cards were inspected at the direct-page viewport: all eight icons are centered, use consistent 24 px geometry, and remain independent from the card border/status state.
- Route, exception, countdown, resource, and phase panel boundaries were checked against the source proportions. No card overlap or clipped first-screen content was found at 1280 px and 1440 px.

## Interaction and accessibility checks

- [x] Clicking the 机组 resource card activates the 机组 tab and positions the detail section at y=75 below the sticky navigation.
- [x] Clicking 看板 returns to the first-screen dashboard and restores the active tab.
- [x] LT / UTC / BJ switching works; BJ produces `21 AUG 2026 13:30 BJ`.
- [x] Resource cards remain native buttons and keyboard-focusable.
- [x] No runtime console errors were reported.
- [x] Document scroll width equals viewport width at 1440, 1280, and 1024 px.
- [x] Production build, JavaScript syntax check, and `git diff --check` passed.

## Comparison history

1. First pass reproduced the reference hierarchy but the compact route's arrival block was clipped at the default browser width.
2. The route grid was tightened and the 1024–1180 px rules adjusted; the arrival airport and time are now visible without horizontal document overflow.
3. Final pass confirmed the solid icon system, continuous readiness ring, one-screen command board, module navigation, and three time bases.

## Findings

- No actionable P0/P1/P2 mismatch remains. Data values intentionally stay aligned with the existing FP-210 demo rather than replacing them with the reference screenshot's FP-205 sample data.

## Final result

passed
