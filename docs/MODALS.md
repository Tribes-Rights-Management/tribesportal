# Modal System Architecture (LOCKED)

## Single Primitive Requirement

**All modals in the Tribes application MUST use `AppModal` from `@/components/ui/app-modal`.**

No direct usage of `Dialog`, `DialogContent`, or legacy modal wrappers in pages or feature components.

## Canonical Component

```tsx
import {
  AppModal,
  AppModalBody,
  AppModalFooter,
  AppModalAction,
  AppModalCancel,
  AppModalField,
  AppModalFields,
} from "@/components/ui/app-modal";
```

## Visual Requirements (Non-Negotiable)

| Property | Value |
|----------|-------|
| Background | Fully opaque `#18181B` — NO blur, NO glass, NO translucency |
| Border | 1px neutral gray at ~8% opacity (`rgba(255,255,255,0.08)`) |
| Backdrop (Mobile) | `bg-black/92` — NO blur |
| Backdrop (Desktop) | `bg-black/88` — NO blur |
| Border Radius | `12px` (rounded-xl) |
| Max Width | 400px (sm), 520px (md), 640px (lg), 720px (xl) |
| Max Height | 85vh (desktop), 90vh (mobile) |

## Responsive Behavior

- **Desktop/Tablet (≥768px)**: Centered dialog
- **Mobile (<768px)**: Bottom sheet (iOS-style drawer)

## Usage Example

```tsx
<AppModal
  open={open}
  onOpenChange={setOpen}
  title="Modal Title"
  description="Optional description"
  maxWidth="md"
  preventClose={saving}
>
  <AppModalBody>
    <AppModalFields>
      <AppModalField label="Field" htmlFor="field-id">
        <Input id="field-id" />
      </AppModalField>
    </AppModalFields>
  </AppModalBody>
  
  <AppModalFooter>
    <AppModalAction onClick={handleSubmit} loading={saving}>
      Submit
    </AppModalAction>
    <AppModalCancel onClick={() => setOpen(false)}>
      Cancel
    </AppModalCancel>
  </AppModalFooter>
</AppModal>
```

## Migrated Components

All the following modals now use `AppModal`:

- ✅ `OrganizationFormModal` — Add/Edit organization
- ✅ `PermissionConfirmDialog` — Authority change confirmations
- ✅ `WorkspaceSelectorModal` — Workspace entry point
- ✅ `SignInHelpDialog` — Access assistance
- ✅ `DisclosuresPage` — Export detail modal

## Prohibited Patterns

```tsx
// ❌ NEVER import Dialog directly in pages
import { Dialog, DialogContent } from "@/components/ui/dialog";

// ❌ NEVER create custom modal wrappers
const CustomModal = () => <Dialog>...</Dialog>;

// ✅ ALWAYS use AppModal
import { AppModal } from "@/components/ui/app-modal";
```

## Code Review Checklist

When reviewing PRs that include modals:

1. ✅ Uses `AppModal` from `@/components/ui/app-modal`
2. ✅ No direct `Dialog` imports in feature files
3. ✅ No inline styles overriding modal surface/backdrop
4. ✅ Mobile behavior tested (bottom sheet)
5. ✅ Desktop behavior tested (centered dialog)

## Deviation Policy

Any change to modal styling must be made in ONE of these files only:

1. `src/components/ui/dialog.tsx` — Dialog primitives
2. `src/components/ui/drawer.tsx` — Drawer primitives  
3. `src/components/ui/app-modal.tsx` — Unified wrapper

Changes automatically propagate to ALL modals. No page-level overrides allowed.
