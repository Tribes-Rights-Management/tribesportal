# Prompt: Create a New Page

## Goal
Scaffold a new page that is fully compliant with the Tribes design system from the start.

## Preconditions — Do NOT use this prompt if:
- The page already exists (use `migrations/adopt-platform-ui.md` instead)
- The page belongs to the System Console context (use Console components instead of platform-ui)

## Context to provide:
- Page name and file path
- Which module it belongs to (Rights, Licensing, Tribes Admin, Help, Account)
- What the page should display (table, form, detail view, dashboard)

## Prompt

```
Read CLAUDE.md at the repo root for architecture and design system rules.

Create a new page at: [FILE_PATH]

This page belongs to the [MODULE] module and should:
- [DESCRIBE WHAT THE PAGE DOES]

Requirements:
1. Import ONLY from @/components/platform-ui — never from @/components/ui/*
2. Use PlatformPageLayout for the page wrapper and title
3. Use PlatformTable for any tabular data
4. Use PlatformButton for all buttons
5. Use PlatformCard or PlatformPanel for content sections
6. Use PlatformEmptyState when there's no data
7. Use CSS variables for all colors — no hardcoded hex values
8. Follow the institutional typography scale (text-sm = 13px, text-base = 14px)
9. Include loading and error states

The page should look like it belongs in a Bloomberg terminal or banking application — minimal, flat, professional. No decorative elements, no rounded corners on panels, no playful UI.
```

## Verification
After generation, check:
- [ ] No imports from `@/components/ui/*`
- [ ] No hardcoded colors (`bg-white`, `bg-[#...]`, `text-[#...]`)
- [ ] Uses `AppPageHeader` for the title
- [ ] Uses `AppPageContainer` as wrapper
- [ ] Has loading state
- [ ] Has empty state
- [ ] Follows the correct layout for its module
