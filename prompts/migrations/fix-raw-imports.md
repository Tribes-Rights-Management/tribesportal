# Prompt: Fix Raw ui/ Imports

## Goal
Replace direct `@/components/ui/*` imports with `@/components/app-ui` equivalents. This is a lighter migration than full adopt-app-ui — only changes imports and component names, not layout patterns.

## Preconditions — Do NOT use this prompt if:
- The page needs a full layout overhaul (use `adopt-app-ui.md` instead)
- The page is in the System Console context

## Context to provide:
- The specific file path

## Prompt

```
In this file: [FILE_PATH]

Find all imports from @/components/ui/* and replace them with app-ui equivalents:

- Button → AppButton (from @/components/app-ui)
- Card, CardHeader, CardContent, CardFooter → AppCard, AppCardHeader, AppCardBody, AppCardFooter
- Input → AppInput
- Badge → AppChip
- Select → AppSelect
- Table components → AppTable components

Update all JSX references to use the new component names.
Do NOT change any props, event handlers, classNames, or business logic.
If a ui/ component has no app-ui equivalent, leave it and add a TODO comment.
```

## Verification
- [ ] `grep "from.*@/components/ui/button" [FILE]` returns nothing
- [ ] Page still renders correctly
