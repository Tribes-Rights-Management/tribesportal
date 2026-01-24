# Design System Enforcement — Tribes Portal

> **Status**: CANONICAL  
> **Scope**: All pages across the application  
> **Last Updated**: 2026-01-24

---

## Purpose

This document defines **which components to use where** across the Tribes Portal. It prevents visual drift by mandating specific component kits for each context.

**Core Principle**: No page should have independently created UI patterns. All UI flows through the design system.

---

## Component Kit Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          TRIBES PORTAL                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │
│  │   SYSTEM CONSOLE    │  │    WORKSTATIONS     │  │    CLIENT PORTAL    │ │
│  │   /admin/*          │  │   /help-workstation │  │    /portal/*        │ │
│  │                     │  │   /licensing/*      │  │    /publishing/*    │ │
│  │                     │  │   /publishing-admin │  │                     │ │
│  └─────────┬───────────┘  └─────────┬───────────┘  └─────────┬───────────┘ │
│            │                        │                        │              │
│            ▼                        ▼                        ▼              │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │
│  │ @/components/admin  │  │ @/components/app-ui │  │ @/components/app-ui │ │
│  │ @/components/console│  │                     │  │                     │ │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Context-Specific Component Requirements

### 1. System Console (`/admin/*`)

**Purpose**: Executive governance, audit, security oversight

**Required Imports**:
```tsx
// Row-based layouts (landing pages, lists)
import { AdminListRow, AdminMetricRow, AdminSection } from "@/components/admin/AdminListRow";

// Buttons, chips, cards (detail pages)
import { ConsoleButton, ConsoleChip, ConsoleCard } from "@/components/console";
```

**Visual Rules**:
- Dark theme (inherits from SystemConsoleLayout)
- Stats use `AdminMetricRow` with left accent bar
- Navigation uses `AdminListRow` (no accent)
- Sections use `AdminSection` with small caps labels
- No colorful accents except status indicators

**Landing Page Pattern** (AdminDashboard.tsx):
```tsx
<AdminSection label="Governance Overview">
  <AdminMetricRow to="/admin/tenants" label="Active workspaces" value="2" />
  <AdminMetricRow to="/admin/users" label="Active users" value="5" />
</AdminSection>

<AdminSection label="Workstations">
  <AdminListRow 
    to="/help-workstation" 
    title="Help Workstation"
    description="Manage public Help articles, categories, and messages"
  />
</AdminSection>
```

---

### 2. Help Workstation (`/help-workstation/*`)

**Purpose**: Internal knowledge management, article authoring

**Required Imports**:
```tsx
// Page structure
import { AppPageHeader, AppSection, AppSectionHeader } from "@/components/app-ui";

// Lists and cards
import { AppListCard, AppListRow, AppStatCard } from "@/components/app-ui";

// Buttons
import { AppButton } from "@/components/app-ui";

// Tables
import { AppTable, AppTableHeader, AppTableBody, AppTableRow } from "@/components/app-ui";
```

**Visual Rules**:
- Dark theme (inherits from HelpWorkstationLayout)
- Uses institutional dark aesthetic
- No bright colors except status indicators
- DM Sans typography
- Flat surfaces, minimal shadows

**Page Header Pattern**:
```tsx
<div className="flex items-start justify-between mb-8">
  <div>
    <p className="text-[10px] uppercase tracking-wider text-[#6B6B6B] font-medium mb-2">
      HELP WORKSTATION
    </p>
    <h1 className="text-[20px] font-medium text-white mb-1">Articles</h1>
    <p className="text-[13px] text-[#AAAAAA]">24 articles</p>
  </div>
  <AppButton variant="outline" size="sm">
    <Plus className="h-3.5 w-3.5" />
    New Article
  </AppButton>
</div>
```

---

### 3. Workspace Views (`/licensing/*`, `/publishing/*`)

**Purpose**: Operational work for internal team

**Required Imports**:
```tsx
import { 
  AppPageHeader, 
  AppCard, 
  AppStatCard, 
  AppButton,
  AppTable,
  AppListCard,
} from "@/components/app-ui";
```

**Visual Rules**:
- Light or dark theme (follows user preference)
- More operational density than System Console
- Uses app-ui component kit exclusively

---

### 4. Client Portal (`/portal/*`)

**Purpose**: External client-facing views

**Required Imports**:
```tsx
import { 
  AppPageHeader, 
  AppCard, 
  AppButton,
  AppTable,
} from "@/components/app-ui";
```

**Visual Rules**:
- Clean, professional
- Less dense than internal views
- Clear call-to-actions
- No governance/admin patterns

---

## Row Component Decision Matrix

| Context | Stats/Metrics | Navigation | Content Lists |
|---------|---------------|------------|---------------|
| System Console | `AdminMetricRow` | `AdminListRow` | `AdminListRow` |
| Help Workstation | `AppStatCard` | `AppListRow` | `AppListRow` or `AppTable` |
| Workspaces | `AppStatCard` | `AppListRow` | `AppListRow` or `AppTable` |
| Client Portal | `AppStatCard` | `AppListRow` | `AppTable` |

---

## Visual Differentiation Standards

### Stats vs Navigation (System Console)

Stats rows get a **left accent bar** to differentiate from navigation:

```
┌─────────────────────────────────────────────────────┐
│  GOVERNANCE OVERVIEW                                │
├─────────────────────────────────────────────────────┤
│ ▎ Active workspaces                              2 >│  ← Stats: 2px left accent
│ ▎ Active users                                   2 >│
│ ▎ Pending access requests                        0 >│
│ ▎ Open exceptions                             None >│
├─────────────────────────────────────────────────────┤
│  WORKSTATIONS                                       │
├─────────────────────────────────────────────────────┤
│   Help Workstation                                 >│  ← Navigation: no accent
│   Manage public Help articles...                   │
└─────────────────────────────────────────────────────┘
```

### Section Headers

All sections use small caps labels:
- Font: 10-11px
- Weight: 500 (medium)
- Transform: uppercase
- Tracking: 0.1em
- Color: muted (60-70% opacity)

---

## Prohibited Patterns

### ❌ Direct UI Primitive Usage in Pages

```tsx
// WRONG - Direct import from ui components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// CORRECT - Import from appropriate kit
import { AppButton, AppCard } from "@/components/app-ui";
// or
import { ConsoleButton, ConsoleCard } from "@/components/console";
```

### ❌ Inline Color Hardcoding

```tsx
// WRONG
<div className="bg-[#1A1A1A] text-white">

// CORRECT
<div style={{ 
  backgroundColor: 'var(--platform-surface)', 
  color: 'var(--platform-text)' 
}}>
```

### ❌ Custom Section Components

```tsx
// WRONG - One-off section implementation
const MySection = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-sm font-bold mb-4">{title}</h2>
    {children}
  </div>
);

// CORRECT - Use canonical component
import { AdminSection } from "@/components/admin/AdminListRow";
// or
import { AppSection, AppSectionHeader } from "@/components/app-ui";
```

### ❌ Mixed Kit Usage

```tsx
// WRONG - Mixing console and app-ui in same page
import { ConsoleButton } from "@/components/console";
import { AppCard } from "@/components/app-ui";

// CORRECT - Stick to one kit per context
import { ConsoleButton, ConsoleCard } from "@/components/console";
```

---

## CSS Variable Reference

### Platform Variables (Global)

```css
/* Text */
--platform-text           /* Primary text */
--platform-text-secondary /* Secondary text */
--platform-text-muted     /* Muted/labels */

/* Surfaces */
--platform-canvas         /* Page background */
--platform-surface        /* Card/panel background */
--platform-surface-2      /* Elevated surface */

/* Borders */
--platform-border         /* Standard border */
```

### Tribes Theme Variables

```css
/* Light Mode */
--tribes-bg: #FFFFFF;
--tribes-fg: #111111;
--tribes-surface: #FAFAFA;
--tribes-border: #E5E5E5;

/* Dark Mode (.dark) */
--tribes-bg: #181818;
--tribes-fg: #FFFFFF;
--tribes-surface: #212121;
--tribes-border: #303030;
```

---

## Migration Checklist

When creating or updating a page:

### Pre-Development
- [ ] Identify which context the page belongs to (Console, Workstation, Portal)
- [ ] Import only from the appropriate component kit
- [ ] Review this document for correct patterns

### Development
- [ ] Use `AdminSection` / `AppSection` for grouping
- [ ] Use appropriate row component (AdminMetricRow, AdminListRow, AppListRow)
- [ ] Use CSS variables, not hardcoded colors
- [ ] Follow header pattern for the context

### Code Review
- [ ] No direct imports from `@/components/ui/*` in pages
- [ ] No inline hex colors
- [ ] No one-off section or card implementations
- [ ] Consistent with existing pages in same context

---

## Enforcement

1. **Code Review**: All PRs touching UI must reference this document
2. **Visual QA**: Screenshots compared against canonical patterns
3. **Lint Rules** (future): ESLint rules to enforce import restrictions

---

## Related Documents

- [UI_STANDARD_SYSTEM_CONSOLE.md](./UI_STANDARD_SYSTEM_CONSOLE.md) — Console-specific patterns
- [UI_STANDARD_APP.md](./UI_STANDARD_APP.md) — App-wide patterns
- [GLOBAL_ADMIN_UI_STANDARD.md](./GLOBAL_ADMIN_UI_STANDARD.md) — Admin view rules

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-24 | Initial specification with component kit architecture |
