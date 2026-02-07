# Prompt Library

Version-controlled prompts for AI-assisted development. Each prompt is a reusable instruction set that produces consistent, high-quality output.

## How to Use

1. Open the relevant prompt file
2. Copy the prompt content
3. Paste into Claude Code, Claude Chat, or any AI tool
4. Provide the specific file/page name as context
5. Review the output against the verification steps

## Structure

```
prompts/
├── components/
│   ├── create-page.md          # Scaffold a new page with correct imports
│   └── create-edge-function.md # Supabase Edge Function template
├── migrations/
│   ├── adopt-app-ui.md         # Convert a non-compliant page to app-ui
│   └── fix-raw-imports.md      # Replace raw ui/ imports with app-ui
└── review/
    └── design-system-audit.md  # Audit a page for violations
```

## Conventions

Every prompt follows this structure:
1. **Goal** — What the end state looks like
2. **Preconditions** — When NOT to use this prompt
3. **Steps** — Concrete actions with before/after examples
4. **Verification** — How to confirm it worked

## Tracking

When a prompt produces good output, note it in CHANGELOG.md.
When it doesn't, note what went wrong and revise the prompt.
