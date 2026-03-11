# App UI Standard — Global No-Drift Foundation

> **AUTHORITATIVE** — This document defines the canonical UI component system for the entire application.

## Overview

The App UI Kit provides institutional-grade UI components that prevent styling drift across all surfaces. Every page must use these components instead of raw primitives.

## Non-Negotiable Rules

### 1. Import Discipline

**REQUIRED** — Import from the App UI Kit:
```tsx
import { AppButton, AppChip, AppCard, AppSectionHeader } from "@/components/app-ui";
```

**PROHIBITED** — Do not import raw primitives in page components:
```tsx
// ❌ WRONG
import { Button } from "@/components/ui/button";

// ✅ CORRECT
import { AppButton } from "@/components/app-ui";
```

### 2. No One-Off Styling

**PROHIBITED** patterns on buttons:
- `bg-white`, `bg-*-50` (bright fills)
- `rounded-full` (pill shapes)
- `text-black`, `text-white` (direct color overrides)
- `opacity-*` on entire elements
- Custom shadows, gradients, or glows

**ALLOWED** — Use only intent/variant props:
```tsx
<AppButton intent="primary" size="md">Submit</AppButton>
<AppButton intent="danger" loading loadingText="Deleting...">Delete</AppButton>
```

### 3. Status Chips Are Non-Interactive

- `AppChip` renders as `<span>`, never `<button>`
- No hover states, no pointer cursor
- Used for status display only
- For actionable elements, use `AppButton`

## Component Reference

### AppButton

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `intent` | `"primary" \| "secondary" \| "tertiary" \| "ghost" \| "danger"` | `"primary"` | Visual style |
| `size` | `"xs" \| "sm" \| "md" \| "lg"` | `"md"` | Button size |
| `loading` | `boolean` | `false` | Shows spinner, disables button |
| `loadingText` | `string` | — | Text during loading |
| `minWidth` | `string` | — | Prevents layout shift |
| `icon` | `ReactNode` | — | Left icon |
| `iconRight` | `ReactNode` | — | Right icon |
| `fullWidth` | `boolean` | `false` | Full-width button |

**Geometry:**
- Height: 28px (xs), 36px (sm), 44px (md), 52px (lg)
- Radius: 8px (xs/sm), 12px (md/lg)
- Primary: Dark elevated surface (#252528), NOT white

### AppChip

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `"pending" \| "running" \| "pass" \| "warning" \| "fail"` | — | Status variant |
| `severity` | `"high" \| "medium" \| "low"` | — | Severity variant |
| `label` | `string` | — | Custom label |
| `showIcon` | `boolean` | `true` | Show status icon |

**Geometry:**
- Height: 28px (status), 20px (severity)
- Radius: pill (9999px) for status, 4px for severity
- Min-width: 96px for alignment

### AppCard

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Card size |
| `transparent` | `boolean` | `false` | Transparent background |

Sub-components:
- `AppCardHeader` — Header with optional action slot
- `AppCardTitle` — Title text (h3)
- `AppCardDescription` — Description text
- `AppCardBody` — Main content area
- `AppCardFooter` — Footer with actions

### AppSectionHeader

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Main heading |
| `subtitle` | `string` | Optional description |
| `backTo` | `string` | Back navigation route |
| `backLabel` | `string` | Back button text |
| `actions` | `ReactNode` | Action buttons slot |
| `meta` | `ReactNode` | Metadata slot |

## Token Reference

All button tokens are defined in `src/index.css` under `:root`:

```css
/* Control Geometry */
--control-height-xs: 28px;
--control-height-sm: 36px;
--control-height-md: 44px;
--control-height-lg: 52px;
--control-radius: 12px;
--control-radius-sm: 8px;
--surface-radius: 16px;
--surface-radius-sm: 12px;

/* Primary Button */
--app-btn-primary-bg: 220 6% 15%;
--app-btn-primary-fg: 213 18% 92%;
--app-btn-primary-border: 0 0% 100% / 0.10;

/* Status Chips */
--app-chip-pending-bg: 0 0% 100% / 0.04;
--app-chip-pass-bg: 142 71% 45% / 0.08;
--app-chip-fail-bg: 0 72% 51% / 0.08;
```

## Exceptions

The following may still use raw primitives:
- `src/components/ui/calendar.tsx` — Uses `buttonVariants` for navigation
- `src/components/ui/pagination.tsx` — Uses `buttonVariants` for links
- `src/components/ui/alert-dialog.tsx` — Uses `buttonVariants` for actions

All other page-level components must use the App UI Kit.

## Migration Checklist

When updating existing pages:

1. Replace `import { Button } from "@/components/ui/button"` → `import { AppButton } from "@/components/app-ui"`
2. Replace `<Button variant="...">` → `<AppButton intent="...">` (map variants appropriately)
3. Remove any `bg-*`, `text-*`, `rounded-*` className overrides on buttons
4. Replace `<Badge>` status indicators → `<AppChip status="...">`
5. Replace `<Card>` containers → `<AppCard>` with sub-components

## Verification

After changes, verify:
- [ ] No bright white pills appear anywhere
- [ ] All CTAs share consistent height/radius/typography
- [ ] Status indicators look like chips, not disabled buttons
- [ ] iOS Safari label readability is correct in all states
- [ ] No layout shift during loading states
