# UI Modal Standard (LOCKED)

## Primitive Selection Rules

The application uses exactly **two** modal primitives. Choose based on the interaction pattern:

### AppDialog (Primary)
**Use for:** Create/edit forms, confirmations, short structured interactions

```tsx
import { AppDialog, AppDialogBody, AppDialogFooter, AppDialogAction, AppDialogCancel } from "@/components/ui/app-modal";
```

| Criteria | AppDialog |
|----------|-----------|
| Content type | Forms, confirmations, alerts |
| Scroll behavior | Internal scroll if needed |
| Desktop rendering | Centered modal |
| Mobile rendering | Bottom sheet (iOS-style) |
| Max content height | 85vh (desktop), 90vh (mobile) |
| Examples | Add Organization, Confirm Change, Sign-in Help |

### AppSheet (Secondary)
**Use for:** Long settings/details, multi-section content, heavy scrolling

```tsx
import { AppSheet, AppSheetBody, AppSheetHeader, AppSheetFooter } from "@/components/ui/app-sheet";
```

| Criteria | AppSheet |
|----------|----------|
| Content type | Settings panels, detail views, long lists |
| Scroll behavior | Full-height internal scroll |
| Desktop rendering | Side panel (right edge) |
| Mobile rendering | Bottom sheet (full height) |
| Max content height | 100vh with safe-area |
| Examples | Settings, Audit Details, Export History |

---

## Visual Requirements (Both Primitives)

| Property | Value |
|----------|-------|
| Background | Fully opaque `#18181B` |
| Border | 1px `rgba(255,255,255,0.08)` |
| Backdrop | `bg-black/92` (mobile), `bg-black/88` (desktop) |
| Blur | **NONE** — pure opacity dimming only |
| Border Radius | 12px |

---

## Prohibited Patterns

```tsx
// ❌ NEVER use Dialog/Sheet directly in pages
import { Dialog } from "@/components/ui/dialog";
import { Sheet } from "@/components/ui/sheet";

// ❌ NEVER use Popover for forms
import { Popover } from "@/components/ui/popover";
<Popover><FormContent /></Popover>

// ✅ ALWAYS use AppDialog or AppSheet
import { AppDialog } from "@/components/ui/app-modal";
import { AppSheet } from "@/components/ui/app-sheet";
```

---

## Mobile Behavior

### AppDialog on Mobile
- Renders as bottom sheet with drag handle
- Sticky footer with safe-area padding
- Content scrolls internally
- 90vh max height

### AppSheet on Mobile
- Renders as full-height bottom sheet
- Sticky header and footer
- Full viewport scroll
- 100vh with safe-area insets

---

## Implementation Checklist

When adding a new modal:

1. ✅ Determine if it's a form/confirmation (AppDialog) or settings/detail (AppSheet)
2. ✅ Import from the correct module
3. ✅ Use provided body/footer/action subcomponents
4. ✅ Test on mobile (bottom sheet behavior)
5. ✅ Test on desktop (centered dialog or side panel)
6. ✅ Verify no glass/blur effects
7. ✅ Verify opaque surface and dim backdrop

---

## Current Usage Map

### AppDialog Instances
- `OrganizationFormModal` — Add/Edit organization
- `PermissionConfirmDialog` — Authority change confirmations  
- `WorkspaceSelectorModal` — Workspace entry point
- `SignInHelpDialog` — Access assistance
- `DisclosuresPage` — Export detail modal

### AppSheet Instances
- `Sidebar` mobile navigation (internal)
- Future: Settings panels, audit detail views

---

## Deviation Policy

Modal styling changes must be made in ONE of these files only:

1. `src/components/ui/dialog.tsx` — Dialog primitives
2. `src/components/ui/drawer.tsx` — Drawer primitives
3. `src/components/ui/sheet.tsx` — Sheet primitives
4. `src/components/ui/app-modal.tsx` — AppDialog wrapper
5. `src/components/ui/app-sheet.tsx` — AppSheet wrapper

Changes propagate to ALL modals automatically. No page-level overrides.
