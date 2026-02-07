# Deployment Workflow — Tribes Portal

> **Rule**: GitHub is the source of truth. Lovable is for deployment only.

---

## Standard Deployment

```
1. Make changes locally (IDE, Claude Code, etc.)
2. Test locally: npm run dev
3. Commit: git add . && git commit -m "description"
4. Push: git push origin main
5. In Lovable: Click "Sync from GitHub" → wait for sync
6. In Lovable: Deploy
7. Verify: live site matches expected changes
```

## Pre-Deployment Checklist

- [ ] All changes committed to GitHub
- [ ] `bash scripts/lint-design-system.sh` passes (or violations are documented)
- [ ] No uncommitted Lovable edits (check Lovable's diff view)
- [ ] Supabase types are up to date if schema changed

## Rules

1. **Never edit code in Lovable's editor.** Any Lovable edits will conflict with GitHub syncs and may be lost.
2. **Always sync from GitHub before deploying.** This ensures Lovable has the latest code.
3. **Never force-push.** If there's a conflict, resolve it in Git first.
4. **Schema changes go through migrations.** Never modify the database directly through the Supabase UI for structural changes — create a migration file.

## Supabase Schema Changes

```
1. Write migration SQL in supabase/migrations/
2. Apply via Supabase SQL Editor (copy-paste the migration)
3. Regenerate types: supabase gen types typescript --project-id rsdjfnsbimcdrxlhognv > src/integrations/supabase/types.ts
4. Commit the new migration + updated types file
5. Push and deploy as normal
```

## Rollback

If a deployment breaks something:
1. `git revert HEAD` (or revert to a known-good commit)
2. Push to GitHub
3. Sync + Deploy in Lovable

For database rollbacks, write a reverse migration — never use the Supabase UI to undo changes manually.

## Emergency

If Lovable is down or unresponsive:
- The codebase is always safe in GitHub
- Database is always in Supabase (independent of Lovable)
- A new Lovable project can be connected to the same GitHub repo
