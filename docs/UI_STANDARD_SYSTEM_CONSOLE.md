# System Console UI Standard

> **Canonical Reference** — Last updated: 2026-01-19

This document defines the mandatory UI patterns and components for all System Console (`/admin`) routes.

---

## Overview

The System Console is the **company-level governance interface** for platform administrators and external auditors. It is NOT an operational workspace. Its visual language must communicate:

- **Authority** — Institutional, not consumer-grade
- **Trust** — Dark, restrained, precise
- **Consistency** — No styling drift across pages

---

## Architectural Rules (Immutable)

1. **Console Scope Wrapper**
   - `SystemConsoleLayout` wraps all content in `.console-scope`
   - This class provides CSS variables for all console-specific theming
   - All console components inherit from these variables

2. **Component Kit Enforcement**
   - All `/admin` routes MUST import from `@/components/console`
   - PROHIBITED: Direct imports from `@/components/ui` for `Button`, `Badge`, `Card`
   - Allowed: Utility components (`Dialog`, `Table`, `Input`) that don't have console equivalents

3. **No Direct Styling Overrides**
   - Do not apply `bg-white`, `text-black`, `rounded-full` to console buttons
   - Do not use inline styles that bypass console tokens
   - All colors flow through `--console-*` CSS variables

---

## Console Component Kit

### ConsoleButton

```tsx
import { ConsoleButton } from "@/components/console";

// Primary action (institutional dark, not white)
<ConsoleButton intent="primary">Run checks</ConsoleButton>

// Secondary/subtle action
<ConsoleButton intent="secondary">Cancel</ConsoleButton>

// Ghost (minimal)
<ConsoleButton intent="ghost" icon={<ChevronLeft />} />

// Danger/destructive
<ConsoleButton intent="danger">Revoke access</ConsoleButton>

// With loading state
<ConsoleButton 
  intent="primary" 
  loading={isRunning} 
  loadingText="Running…"
  minWidth="140px"
>
  Run checks
</ConsoleButton>
```

**Props:**
- `intent`: `"primary"` | `"secondary"` | `"ghost"` | `"danger"`
- `size`: `"xs"` (28px) | `"sm"` (36px) | `"md"` (44px, default)
- `loading`: boolean
- `loadingText`: string (default: "Processing…")
- `minWidth`: string (prevents layout shift)
- `icon`: ReactNode

### ConsoleChip

```tsx
import { ConsoleChip } from "@/components/console";

// Status indicators (non-interactive)
<ConsoleChip status="pending" />
<ConsoleChip status="running" />
<ConsoleChip status="pass" />
<ConsoleChip status="warning" />
<ConsoleChip status="fail" />

// Severity indicators
<ConsoleChip severity="high" />
<ConsoleChip severity="medium" />
<ConsoleChip severity="low" />
```

**Rules:**
- NOT a button — renders as `<span>`
- No hover states, no pointer cursor
- Fixed minimum width (96px) for alignment
- Use for security checks, audit rows, exceptions

### ConsoleCard

```tsx
import { 
  ConsoleCard, 
  ConsoleCardHeader, 
  ConsoleCardBody, 
  ConsoleCardFooter 
} from "@/components/console";

<ConsoleCard>
  <ConsoleCardHeader 
    title="Live Security Checks"
    description="Automated verification of security posture"
    actions={<ConsoleButton size="sm">Run</ConsoleButton>}
  />
  <ConsoleCardBody>
    {/* Content */}
  </ConsoleCardBody>
  <ConsoleCardFooter>
    {/* Actions or meta */}
  </ConsoleCardFooter>
</ConsoleCard>

// Variants
<ConsoleCard variant="elevated">...</ConsoleCard>
<ConsoleCard variant="muted">...</ConsoleCard>
```

### ConsoleSectionHeader

```tsx
import { ConsoleSectionHeader } from "@/components/console";

<ConsoleSectionHeader
  title="Security Verification"
  subtitle="Live security posture checks and RLS coverage audit"
  showBack
  backFallback="/admin"
  actions={
    <ConsoleButton intent="primary" icon={<ShieldCheck />}>
      Run checks
    </ConsoleButton>
  }
  meta="Last run: 5 minutes ago"
/>
```

---

## CSS Variables Reference

All variables are scoped to `.console-scope`:

```css
/* Surfaces */
--console-bg              /* Page background */
--console-card-bg         /* Card/panel background */
--console-elevated-bg     /* Modals, dropdowns */

/* Text */
--console-fg              /* Primary text */
--console-fg-secondary    /* Secondary text */
--console-fg-muted        /* Muted/meta text */

/* Controls */
--console-control-height     /* 44px */
--console-control-height-sm  /* 36px */
--console-control-height-xs  /* 28px */
--console-control-radius     /* 12px */

/* Primary Button */
--console-primary-bg
--console-primary-bg-hover
--console-primary-fg
--console-primary-border

/* Status Chips */
--console-chip-pending-*
--console-chip-running-*
--console-chip-pass-*
--console-chip-warning-*
--console-chip-fail-*

/* Severity Chips */
--console-severity-high-*
--console-severity-medium-*
--console-severity-low-*
```

---

## Prohibited Patterns

| ❌ Don't | ✅ Do |
|----------|-------|
| `import { Button } from "@/components/ui/button"` | `import { ConsoleButton } from "@/components/console"` |
| `<Button className="bg-white text-black">` | `<ConsoleButton intent="primary">` |
| `<Badge variant="outline">Pending</Badge>` | `<ConsoleChip status="pending" />` |
| `rounded-full` on buttons | Use default `--console-control-radius` (12px) |
| `opacity-50` for disabled states | Use intent-specific disabled colors |

---

## Migration Checklist

When updating a `/admin` page to use the console kit:

- [ ] Replace `Button` imports with `ConsoleButton`
- [ ] Replace `Badge` with `ConsoleChip` for status indicators
- [ ] Replace `Card` with `ConsoleCard` for containers
- [ ] Use `ConsoleSectionHeader` for page headers with back navigation
- [ ] Remove any inline color overrides (`bg-white`, `text-black`, etc.)
- [ ] Verify no `rounded-full` on buttons
- [ ] Test all button states: default, hover, disabled, loading

---

## Enforcement

1. **Code Review**: Any PR touching `/admin` routes must use console components
2. **Visual QA**: Primary buttons must never appear as white pills
3. **Lint Rules** (future): Disallow `Button` imports in `src/pages/admin/**`
