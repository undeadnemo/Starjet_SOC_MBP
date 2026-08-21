# Starjet SOC repository guidance

## UI work

- Before creating or changing UI under `apps/web-ele`, read
  `docs/design-system/starjet-mission-control-dark.md` and
  `apps/web-ele/src/styles/starjet-mission-control-dark.css`.
- New OCC/SOC operational screens use the **Mission Control Dark** system by
  default. Apply `.sj-mission-control` or
  `data-starjet-theme="mission-control-dark"` at the workspace root.
- Use `--sj-*` tokens instead of raw colors, spacing, radii, or shadows.
- Blue means selected/informational; lime means ready/confirmed/primary
  operational action; amber means pending; red means critical/blocked; purple
  means maintenance; teal means ferry/supporting movement.
- Preserve dense operational context: aircraft, route, date, UTC time,
  readiness, exceptions, and next safe action.
- Reuse existing components and icons. Do not add glassmorphism, gradients,
  decorative neon, oversized radii, or large navigation shadows.
- Verify 1440px, 1280px, and 1024px widths plus keyboard focus and overflow.

