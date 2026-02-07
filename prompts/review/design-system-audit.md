# Prompt: Design System Audit

## Goal
Audit a page file and produce a violation report with specific line numbers and fixes.

## Context to provide:
- The file path to audit

## Prompt

```
Read CLAUDE.md for the design system rules.

Audit this file for design system violations: [FILE_PATH]

Check for:
1. IMPORT VIOLATIONS: Any imports from @/components/ui/* in a page file (should be @/components/app-ui)
2. COLOR VIOLATIONS: Hardcoded hex colors (bg-[#...], text-[#...]), bg-white, bg-card used as panel/card backgrounds
3. COMPONENT VIOLATIONS: Raw <table>, raw <input>, raw <select> where app-ui equivalents exist
4. PATTERN VIOLATIONS: One-off card/section/panel components that should use AppCard, AppSection, AppPanel
5. KIT MIXING: Importing from both @/components/console and @/components/app-ui in the same file

For each violation found, report:
- Line number
- What's wrong
- The exact fix

If the file is clean, say "PASS — no violations found."
```

## Output Format
```
VIOLATION REPORT: [filename]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Line 3:  IMPORT — Button from @/components/ui/button → AppButton from @/components/app-ui
Line 45: COLOR  — bg-[#1A1A1A] → remove, use AppPanel component
Line 67: PATTERN — <div className="bg-card border rounded-lg p-4"> → <AppCard>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: 3 violations
```
