# Prompt: Migrate a Page to app-ui Compliance

## Goal
Convert a non-compliant page to use the app-ui design system exclusively, without changing any business logic.

## Preconditions — Do NOT use this prompt if:
- The page is in the System Console (`/console/*`) — those use `@/components/admin` and `@/components/console`
- The page is a stub (< 2KB) — triage it first before migrating

## Context to provide:
- The specific file path of the page to migrate

## Prompt

```
Read CLAUDE.md at the repo root for design system rules.

Migrate this page to full app-ui compliance: [FILE_PATH]

Rules:
1. DO NOT change any business logic, data fetching, or state management
2. ONLY change imports and JSX to use app-ui components
3. Replace these patterns:

   IMPORTS:
   - import { Button } from "@/components/ui/button"  →  import { AppButton } from "@/components/app-ui"
   - import { Card } from "@/components/ui/card"  →  import { AppCard } from "@/components/app-ui"
   - import { Input } from "@/components/ui/input"  →  import { AppInput } from "@/components/app-ui"
   - import { Table } from "@/components/ui/table"  →  import { AppTable, ... } from "@/components/app-ui"
   - import { Badge } from "@/components/ui/badge"  →  import { AppChip } from "@/components/app-ui"
   - import { Select } from "@/components/ui/select"  →  import { AppSelect } from "@/components/app-ui"

   JSX PATTERNS:
   - <Button>  →  <AppButton>
   - <Card>/<CardHeader>/<CardContent>  →  <AppCard>/<AppCardHeader>/<AppCardBody>
   - <div className="bg-white border rounded-lg p-...">  →  <AppPanel> or <AppCard>
   - <div className="bg-card border rounded-lg p-...">  →  <AppPanel> or <AppCard>
   - Raw <table>  →  <AppTable> with AppTableHeader, AppTableBody, AppTableRow, AppTableCell
   - <Badge>  →  <AppChip>
   - <Input>  →  <AppInput>

   COLORS:
   - Remove all hardcoded hex colors (bg-[#...], text-[#...])
   - Remove bg-white, bg-card where used as panel backgrounds
   - Let app-ui components handle their own theming

4. Keep the exact same page structure and layout
5. Preserve all event handlers, data fetching, conditional rendering
6. If a pattern doesn't have an app-ui equivalent, leave it and add a comment: // TODO: needs app-ui component

Show me the complete updated file.
```

## Verification
After migration, check:
- [ ] `grep -c "from.*@/components/ui/" [FILE]` returns 0
- [ ] No `bg-white` or `bg-card` with `border` and `rounded` in className
- [ ] No hardcoded hex colors
- [ ] Page renders identically (visual check)
- [ ] All interactive elements still work (click handlers, forms)
- [ ] Run `bash scripts/lint-design-system.sh` — page should pass
