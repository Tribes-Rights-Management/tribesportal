# Prompt: Create a New Page

## Goal
Scaffold a new page that is fully compliant with the Tribes design system from the start.

## Preconditions — Do NOT use this prompt if:
- The page already exists (use `migrations/adopt-app-ui.md` instead)
- The page belongs to the System Console context (use Console components instead of app-ui)

## Context to provide:
- Page name and file path
- Which module it belongs to (Rights, Licensing, Admin, Help, Client Portal, Account)
- What the page should display (table, form, detail view, dashboard)

## Prompt

```
Read CLAUDE.md at the repo root for architecture and design system rules.

Create a new page at: [FILE_PATH]

This page belongs to the [MODULE] module and should:
- [DESCRIBE WHAT THE PAGE DOES]

Requirements:
1. Import ONLY from @/components/app-ui — never from @/components/ui/*
2. Use AppPageHeader for the page title
3. Use AppPageContainer as the outer wrapper
4. Use AppTable for any tabular data
5. Use AppButton for all buttons
6. Use AppCard or AppPanel for content sections
7. Use AppEmptyState when there's no data
8. Use CSS variables for all colors — no hardcoded hex values
9. Follow the institutional typography scale (text-sm = 13px, text-base = 14px)
10. Include loading and error states

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
