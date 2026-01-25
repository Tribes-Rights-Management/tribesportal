# Visual Design & Copy Authority — Canonical Standards v1.0

> **Status**: LOCKED (Platform-Wide Enforcement)  
> **Scope**: All visual design tokens, typography, and microcopy  
> **Last Updated**: 2026-01-17

---

## Purpose

These are not aesthetic preferences. They are signals of credibility, restraint, and permanence. This document prevents the product from drifting toward consumer SaaS as features expand.

---

## Part 1: Visual Design Tokens

### 1. Color Posture (Non-Negotiable)

#### Backgrounds

| Element | Value | Purpose |
|---------|-------|---------|
| Primary app background | `#0E0E0E` | Near-black, not pure black |
| Secondary panels/cards | `#141414` | Elevated surfaces |
| Dividers/borders | `rgba(255,255,255,0.06)` | Subtle separation |

#### Why This Matters

| Reason | Explanation |
|--------|-------------|
| Authority tone | Matches website's institutional feel |
| Eye fatigue | Reduced strain for long sessions |
| System signal | "System of record," not "consumer SaaS" |

#### Prohibited Colors

| Pattern | Why Prohibited |
|---------|----------------|
| Pure black `#000` | Too harsh, lacks depth |
| High-contrast gradients | Consumer aesthetic |
| Glassmorphism / heavy blur | Trendy, not institutional |
| Purple/blue SaaS gradients | Generic startup look |

---

### 2. Typography Hierarchy

#### Font Family

| Rule | Specification |
|------|---------------|
| Primary font | Same family as website (locked permanently) |
| TRIBES wordmark | Always uppercase, 0.08em tracking |
| System font fallback | -apple-system, BlinkMacSystemFont |

#### Size Scale

| Element | Size | Weight | Notes |
|---------|------|--------|-------|
| Page title | 16–18px | Semibold | Tight tracking |
| Section headers | 13–14px | Medium | Uppercase optional |
| Body text | 13px | Regular | Primary content |
| Secondary/meta | 12px | Regular | Muted color |

#### Line Height

| Context | Value | Notes |
|---------|-------|-------|
| All text | 1.45–1.55 | Never compressed |
| Headings | 1.2–1.3 | Tighter for titles |

> **Rationale**: Institutional systems optimize for reading, not flair. Smaller, consistent type signals seriousness.

---

### 3. Iconography Rules

#### Specifications

| Property | Value |
|----------|-------|
| Size | 16–18px max |
| Stroke width | 1.25–1.5 |
| Color | Inherit text color |

#### Prohibited Patterns

| Pattern | Why Prohibited |
|---------|----------------|
| Thick strokes | Playful, not institutional |
| Filled icons | Heavy, distracting |
| Decorative icons | Unnecessary visual noise |
| Accent-colored icons | Draws unwarranted attention |

> **Principle**: Icons are functional, not expressive.

---

### 4. Button Governance

#### Primary Action

| Property | Value |
|----------|-------|
| Background | `#FFFFFF` (white) |
| Border | `#D9DDE3` (subtle) |
| Text | `#111827` (near-black) |
| Height | 40–44px |
| Radius | 6px |
| Padding | Balanced left/right |

#### Secondary Action

| Property | Value |
|----------|-------|
| Background | `#FFFFFF` (white) |
| Border | `#E6E8EC` (subtle) |
| Text | `#111827` (near-black) |
| Hover | Subtle grey wash |

#### Governance Principle

> Buttons should be **visible** on grey backgrounds. Use WHITE surface with subtle border, NOT grey-on-grey.

```tsx
// Correct: Institutional white surface button with border
<Button>
  Approve change
</Button>

// Wrong: Grey button that disappears on grey backgrounds
<Button className="bg-gray-200">
  Submit
</Button>
```

---

### 5. Modals & Sheets

#### Specifications

| Property | Value |
|----------|-------|
| Background | Solid `#141414` |
| Transparency | None (no glass) |
| Border | 1px `rgba(255,255,255,0.08)` |
| Shadow | Only if needed for separation |
| Mobile layout | Vertical preferred |

#### Prohibited Patterns

| Pattern | Why Prohibited |
|---------|----------------|
| Glass transparency | Trendy, not institutional |
| Backdrop blur | Consumer aesthetic |
| Animated entrances | Distracting |
| Playful spring physics | Wrong tone |

> **Principle**: A modal should feel like a document, not a pop-up.

---

## Part 2: Copy Refinement Rules

### 1. Voice Contract

#### Required Tone

| Quality | Example |
|---------|---------|
| Neutral | "This action is restricted" |
| Formal | "Authority change recorded" |
| Calm | "Review proposed changes" |
| Declarative | "Status: Approved" |

#### Prohibited Tone

| Quality | Example | Why Prohibited |
|---------|---------|----------------|
| Friendly | "Hey there!" | Consumer SaaS |
| Encouraging | "Great job!" | Gamification |
| Apologetic | "Sorry, something went wrong" | Weakness signal |
| Excited | "Success! 🎉" | Unprofessional |

> **Principle**: This is not motivation software.

---

### 2. Canonical Language Patterns

#### Authority Terms

| Use | Don't Use |
|-----|-----------|
| Authority | Permissions (unless technical) |
| Access | Power |
| Scope | Admin stuff |
| Recorded | Logged |
| Approved | Accepted |
| Restricted | Blocked |

#### Error & Restriction Messages

| Instead of | Use |
|------------|-----|
| "You don't have permission" | "This action is restricted to authorized administrators." |
| "Access denied" | "This setting cannot be changed in your current role." |
| "Error: insufficient privileges" | "This action requires organization administrator authority." |

#### Confirmation Messages

| Instead of | Use |
|------------|-----|
| "Changes saved!" | "Authority change recorded." |
| "Done!" | "No changes were made." |
| "Success!" | "Change applied." |

---

### 3. Editing Posture Language

#### CTAs

| Context | Label |
|---------|-------|
| Enter edit mode | "Propose Authority Change" |
| Review step | "Review proposed changes" |
| Confirm action | "Approve change" |
| Cancel action | "Cancel" |

#### Prohibited Verbs

| Verb | Why Prohibited |
|------|----------------|
| Edit | Too casual |
| Update | Generic |
| Modify | Technical |
| Change (inline) | Suggests immediacy |

---

### 4. Audit & History Language

#### Correct Patterns

| Context | Format |
|---------|--------|
| Timestamp | "Recorded on [date]" |
| Actor | "Approved by [name]" |
| Immutability | "This record is immutable" |
| Timeline entry | "[Actor] proposed [action] on [date]" |

#### Prohibited Terms

| Term | Alternative |
|------|-------------|
| Log | Record |
| Activity feed | Authority timeline |
| History list | Authority history |
| Event stream | Audit record |

> **Principle**: Words matter here. Legal defensibility starts with precise language.

---

### 5. Mobile Copy Discipline

#### Rules

| Rule | Implementation |
|------|----------------|
| No authority sentence truncation | Full meaning visible |
| Minimum line-clamp | `line-clamp-2` |
| Layout redesign over language cut | Preserve meaning |

#### Prohibited Patterns

| Pattern | Why Prohibited |
|---------|----------------|
| Single-line truncation of authority text | Loses legal meaning |
| Abbreviations for governance terms | Reduces clarity |
| Icons replacing text labels | Authority must be explicit |

> **Principle**: If text cannot fit, redesign the layout—not the language.

---

## Part 3: Quick Reference

### Color Palette

```css
:root {
  --background: #0E0E0E;
  --surface-card: #141414;
  --border-subtle: rgba(255,255,255,0.06);
  --border-default: rgba(255,255,255,0.08);
  --text-primary: rgba(255,255,255,0.92);
  --text-secondary: rgba(255,255,255,0.72);
  --text-muted: rgba(255,255,255,0.55);
}
```

### Typography Scale

```css
.page-title { font-size: 18px; font-weight: 600; letter-spacing: -0.02em; }
.section-header { font-size: 14px; font-weight: 500; }
.body-text { font-size: 13px; font-weight: 400; line-height: 1.5; }
.meta-text { font-size: 12px; color: var(--text-muted); }
```

### Microcopy Templates

| Context | Template |
|---------|----------|
| Restriction | "This action is restricted to [role]." |
| Confirmation | "[Action] recorded." |
| Timestamp | "Recorded on [date] by [actor]" |
| Immutability | "This record cannot be modified." |

---

## Validation Checklist

Before shipping any UI:

- [ ] Colors use design tokens (no hardcoded values)
- [ ] Typography follows scale (no custom sizes)
- [ ] Icons are 16-18px, stroke 1.25-1.5
- [ ] Buttons follow governance style
- [ ] Modals are solid, no glass
- [ ] Copy is neutral and formal
- [ ] No emojis or exclamation points
- [ ] Authority terms used correctly
- [ ] Mobile text is not truncated below meaning

---

## Related Documents

| Document | Purpose |
|----------|---------|
| `tribes-theme.css` | CSS token definitions |
| `institutional-copy.ts` | Canonical microcopy constants |
| `GLOBAL_ADMIN_UI_STANDARD.md` | Admin view patterns |
| `USER_JOURNEY_UX_AFFORDANCES.md` | UX behavior rules |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-17 | Initial visual and copy standards |
