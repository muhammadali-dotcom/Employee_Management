# AGENTS.md — UI/UX + Code Standards for Web App AI Agents

> Use this file as the main instruction guide for AI agents working on UI, UX, frontend code, layouts, components, and design improvements.
>
> Goal: Build web apps that are simple, clean, consistent, accessible, responsive, fast, and enterprise-grade.

---

## 1. Agent Role

The agent must act like a senior UI/UX designer and frontend engineer.

For every UI task, the agent must:

- Understand the real user goal before changing the UI.
- Improve usability, not only appearance.
- Preserve existing business logic unless clearly asked to change it.
- Use reusable components where possible.
- Follow accessibility, responsiveness, and consistency rules.
- Avoid unnecessary visual decoration.
- Return complete, practical, copy-paste-ready output when code is requested.

Priority order:

```text
User goal
> Existing functionality
> Accessibility
> Clarity
> Consistency
> Responsiveness
> Performance
> Visual polish
```

---

## 2. Code Style Rules

All functions must use arrow function syntax.

Bad:

```js
function getUser() {}
```

Good:

```js
const getUser = () => {};
```

This applies to:

- React components
- Utility functions
- API handlers
- Event handlers
- Callbacks
- Helper functions

Traditional `function` declarations are not allowed unless a library or framework specifically requires them.

When writing code, the agent must:

- Preserve existing logic unless changes are required.
- Avoid unnecessary rewrites.
- Keep components readable and maintainable.
- Avoid duplicate code.
- Use meaningful variable and component names.
- Keep styling consistent with the existing project.
- Explain important changes briefly.

---

## 3. Core UI/UX Principle

A good web app helps users complete their task with less thinking, less confusion, and less friction.

Good UI/UX must be:

- Clear
- Fast
- Consistent
- Accessible
- Predictable
- Responsive
- Trustworthy
- Easy to recover from mistakes

The agent must choose:

```text
Clear over clever.
Useful over decorative.
Accessible over trendy.
Consistent over unique.
Fast over fancy.
Simple over overloaded.
```

---

## 4. Standards to Follow

The agent should apply practical principles used by major design systems and product companies, including:

- WCAG accessibility principles
- Nielsen Norman Group usability heuristics
- Google Material Design
- Apple Human Interface Guidelines
- Microsoft Fluent
- IBM Carbon
- Atlassian Design System
- Shopify Polaris

Do not blindly copy any company’s style. Apply the shared standards behind them:

- Clear hierarchy
- Reusable components
- Strong accessibility
- Consistent tokens
- Predictable interaction patterns
- Helpful feedback
- Error prevention
- Minimal visual noise

---

## 5. UI/UX Rules

### 5.1 Clarity

The user must instantly understand:

- Where they are
- What the page is about
- What they can do
- What will happen after clicking
- What went wrong when an error appears

Use specific labels.

Bad:

```text
Submit
Proceed
Click here
Manage
Misc
```

Good:

```text
Create account
Save changes
Continue to payment
Download report
Invite member
Reset password
```

Rules:

- Use plain language.
- Avoid internal jargon.
- Avoid vague labels.
- Avoid icon-only actions unless the meaning is obvious and an accessible label exists.

---

### 5.2 Simplicity

Simple does not mean empty. Simple means every visible element has a purpose.

Remove or hide:

- Duplicate actions
- Repeated cards
- Unused filters
- Too many buttons
- Too many colors
- Too many nested menus
- Unclear icons
- Long unnecessary text

Rule:

```text
If an element does not help the current user goal, remove it, hide it, or move it to a secondary area.
```

---

### 5.3 Consistency

The same action must look and behave the same everywhere.

Consistency applies to:

- Buttons
- Inputs
- Cards
- Tables
- Modals
- Drawers
- Badges
- Icons
- Spacing
- Typography
- Colors
- Loading states
- Empty states
- Error states

Rules:

- Red means destructive/error.
- Green means success/positive.
- Yellow/orange means warning/attention.
- Blue or brand color means primary action/information.
- Do not change color meaning between pages.
- Do not mix different icon styles randomly.
- Do not create new button styles without need.

---

### 5.4 Visual Hierarchy

The UI must guide the user’s eyes.

Importance order:

1. Page title
2. Main action
3. Primary content
4. Secondary actions
5. Metadata/supporting text
6. Footer/help links

Use:

- Size
- Weight
- Contrast
- Spacing
- Grouping
- Position
- Color

Rules:

- One main title per page.
- One primary action per section.
- Do not make all text bold.
- Do not make every action colorful.
- Use whitespace to separate groups.

---

### 5.5 Feedback

Every user action needs feedback.

Use:

- Button loading state
- Toast message
- Inline message
- Skeleton loader
- Progress bar
- Status badge
- Success confirmation
- Error recovery action

Examples:

```text
Saving...
Changes saved.
Could not save changes. Check your connection and try again.
```

Rules:

- Do not leave users guessing after an action.
- Prevent double submissions.
- Show useful loading states instead of blank screens.

---

### 5.6 Error Prevention and Recovery

Prevent mistakes before they happen.

The agent must:

- Validate fields clearly.
- Disable unavailable actions.
- Explain why disabled actions are disabled when needed.
- Confirm destructive actions.
- Warn before losing unsaved changes.
- Provide undo where possible.
- Show recovery actions after errors.

Bad:

```text
Error 500
```

Good:

```text
We could not save your changes.
Check your connection and try again.
[Try again]
```

---

## 6. Mandatory Color System: 60–30–10 Rule

All UI must follow the 60–30–10 color usage rule.

This keeps the interface clean, readable, modern, and enterprise-grade.

### 6.1 60% — Background / Base Layer

This is the main canvas of the app.

Used for:

- Page background
- App shell
- Large empty areas
- Main layout background

Rules:

- Must be neutral.
- Must not compete with content.
- Should create calm visual space.
- Do not use accent colors as large backgrounds.

Recommended colors:

```text
Light mode:
#F9FAFB
#F5F7FA
#FFFFFF

Dark mode:
#0F172A
#111827
#020617
```

---

### 6.2 30% — Surface / Secondary Layer

This layer creates structure and grouping.

Used for:

- Cards
- Panels
- Tables
- Sidebars
- Containers
- Form sections
- Dropdowns
- Modals

Rules:

- Must have subtle contrast from the background.
- Should separate content without looking heavy.
- Use borders or soft shadows only when needed.

Recommended colors:

```text
Light mode:
#FFFFFF
#F3F4F6
#F8FAFC

Dark mode:
#1F2937
#111827
#0B1220
```

---

### 6.3 10% — Primary / Accent / Interaction Layer

This layer is reserved for attention and interaction.

Used for:

- Primary buttons
- Active states
- Selected tabs
- Links
- Focus rings
- Key badges
- Important highlights
- Progress indicators

Rules:

- Use accent colors sparingly.
- Do not use multiple unrelated primary colors.
- Do not use accent color for large backgrounds.
- The primary color should guide attention to key actions only.

Recommended colors:

```text
Primary: #3B82F6
Success: #10B981
Warning: #F59E0B
Danger:  #EF4444
Info:    #06B6D4
```

---

### 6.4 Color Usage Rules

The agent must follow these rules strictly:

- 60% neutral background.
- 30% surfaces and containers.
- 10% primary/accent colors.
- Use color to communicate meaning, not decoration.
- Never make every icon colorful.
- Never use danger color for normal actions.
- Never use success color for random decoration.
- Do not rely on color alone to communicate status.
- Always pair status color with text or icon.
- Keep light and dark themes visually consistent.
- Use spacing, typography, and contrast before adding more color.

Example:

```text
Good:
Neutral page + white cards + one blue primary button.

Bad:
Blue page background + green cards + red icons + purple buttons + yellow badges everywhere.
```

Goal:

```text
Clean
Minimal
Predictable
Readable
Enterprise-grade
Similar quality level to Stripe, Linear, Notion, Shopify, and GitHub.
```

---

## 7. Design Tokens

Use design tokens instead of random values.

### 7.1 Spacing

Use an 8px-based system.

```text
0px
4px
8px
12px
16px
24px
32px
40px
48px
64px
80px
96px
```

Rules:

- Inside components: 4–12px
- Between related items: 8–16px
- Between sections: 24–48px
- Page padding: 16–80px depending on screen size

Avoid random spacing like:

```text
13px
19px
27px
43px
```

---

### 7.2 Typography

Suggested scale:

```text
Display:       40–56px
Page title:    28–40px
Section title: 20–28px
Card title:    16–20px
Body text:     14–16px
Helper text:   12–14px
Button text:   14–16px
```

Rules:

- Use 1–2 font families maximum.
- Use readable line height.
- Do not use too many font sizes.
- Use bold for hierarchy, not decoration.
- Body text should normally be at least 14px.

---

### 7.3 Border Radius

Recommended:

```text
Small controls: 6–8px
Inputs/buttons: 8–12px
Cards:          12–16px
Large panels:   16–24px
Pills/badges:   999px
```

Do not mix sharp, slightly rounded, and fully rounded styles randomly.

---

### 7.4 Shadows and Borders

Use shadows carefully.

Rules:

- Prefer subtle borders for simple separation.
- Use shadows only for layering.
- Do not use heavy shadows on every card.
- Dropdowns, popovers, modals, and drawers may use elevation.

---

## 8. Accessibility Rules

Accessibility is mandatory.

The agent must ensure:

- Text has readable contrast.
- Inputs have labels.
- Buttons are keyboard accessible.
- Focus states are visible.
- Color is not the only meaning.
- Images have meaningful alt text when needed.
- Touch targets are easy to tap.
- Semantic HTML is used.

Use semantic elements:

```html
<header>
<nav>
<main>
<section>
<footer>
<button>
<form>
<label>
<table>
```

Rules:

- Use `<button>` for actions.
- Use `<a>` for navigation.
- Do not use `<div>` as a button.
- Do not remove focus outlines unless replacing them with a clear custom focus style.
- Modals must support keyboard navigation and focus management.

Touch target recommendation:

```text
Minimum: 40x40px
Better: 44x44px or larger
```

---

## 9. Layout and Responsiveness

Every UI must work on desktop, tablet, and mobile.

Common page structure:

```text
Topbar / Header
Sidebar or Navigation
Main Content
Cards / Tables / Forms
Modals / Drawers where needed
```

Responsive rules:

- Mobile: single-column layout.
- Tablet: one or two columns.
- Desktop: full layout with sidebar or wider content grid.
- Tables should adapt on small screens.
- Forms should stack vertically on mobile.
- Buttons may become full-width on mobile.
- Avoid fixed widths that break small screens.

Suggested breakpoints:

```text
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

Page padding:

```text
Mobile: 16px
Tablet: 24px
Desktop: 32–48px
Large desktop: 48–80px
```

---

## 10. Component Standards

Prefer reusable components.

Minimum components:

```text
Button
Input
Textarea
Select
Checkbox
Radio
Switch
DatePicker
Modal
Drawer
Popover
Tooltip
Toast
Card
Badge
Table
Tabs
Breadcrumb
Pagination
Sidebar
Navbar
SearchBox
Avatar
EmptyState
ErrorState
Skeleton
Spinner
ProgressBar
Alert
```

Each component should support:

- Default state
- Hover state
- Focus state
- Active state
- Disabled state
- Loading state where needed
- Error state where needed
- Responsive behavior
- Accessibility labels/attributes where needed

---

## 11. Button Rules

Button hierarchy:

```text
Primary:   main action
Secondary: alternative action
Ghost:     low priority action
Danger:    destructive action
Link:      navigation or lightweight action
```

Rules:

- Use one primary button per section.
- Button text must describe the action.
- Add loading state after click.
- Disable only when necessary.
- Explain disabled actions when not obvious.
- Destructive actions must be visually distinct and confirmed when needed.

Good:

```text
Save changes
Create project
Invite member
Download invoice
Delete workspace
```

Bad:

```text
Submit
OK
Click
Proceed
```

---

## 12. Form Rules

Every form field should have:

- Label
- Input
- Helper text where needed
- Error text when invalid
- Correct input type
- Required/optional clarity

Rules:

- Do not use placeholder as the only label.
- Validate near the field.
- Group related fields.
- Break long forms into sections.
- Show password requirements before the user fails.
- Preserve user input after validation errors.

Bad:

```text
Invalid input
```

Good:

```text
Password must be at least 8 characters.
```

---

## 13. Tables and Data Display

Good tables include:

- Clear column names
- Search
- Filters
- Sorting
- Pagination
- Status badges
- Row actions
- Empty state
- Loading state
- Responsive behavior

Rules:

- Do not show too many columns.
- Put primary information on the left.
- Put actions on the right.
- Align numbers consistently.
- Use badges for statuses.
- Hide or collapse secondary columns on small screens.

---

## 14. Modals, Drawers, and Popovers

### Modal

Use for focused decisions or short forms.

Must include:

- Clear title
- Short content
- Primary action
- Cancel/close action
- Keyboard support
- Focus management

Do not use large modals for complex workflows unless necessary.

### Drawer

Use for contextual details without leaving the page.

Good for:

- Preview details
- Edit panel
- Related metadata
- Activity timeline

### Popover

Use for lightweight actions or short contextual content.

Do not hide critical workflows inside popovers.

---

## 15. Required UI States

The agent must handle all important states.

### Loading

Use:

- Skeleton for page/card content.
- Spinner for small actions.
- Button loading state after click.
- Progress bar for file upload or long process.

### Empty

Bad:

```text
No data
```

Good:

```text
No projects yet.
Create your first project to get started.
[Create project]
```

### Error

Bad:

```text
Something went wrong.
```

Good:

```text
We could not load your projects.
Check your connection and try again.
[Try again]
```

### Success

Examples:

```text
Changes saved.
Invitation sent.
File uploaded.
Payment completed.
```

Success should be visible but not annoying.

---

## 16. Navigation Rules

Navigation should show users:

- Where they are
- Where they can go
- What is active
- How to go back

Good navigation labels:

```text
Dashboard
Projects
Messages
Reports
Settings
Billing
Team
```

Bad navigation labels:

```text
Management
Operations
Data
Miscellaneous
Advanced
General
```

Rules:

- Highlight the active page.
- Keep labels simple.
- Group related items.
- Avoid too many nested menus.
- Use breadcrumbs for deep pages.
- Add global search when the app has many resources.

---

## 17. Content and Microcopy

UI text must be clear and helpful.

Rules:

- Use plain language.
- Be concise.
- Use active voice.
- Avoid blaming the user.
- Avoid technical jargon.
- Tell the user what to do next.
- Use sentence case for most UI text.
- Keep labels consistent.

Bad:

```text
Authentication credentials invalidated due to malformed identity token.
```

Good:

```text
Your session expired. Sign in again to continue.
```

Bad:

```text
Are you sure?
```

Good:

```text
Delete this project?
This action cannot be undone.
```

---

## 18. Motion and Interaction

Motion should explain change, not decorate everything.

Good motion:

- Dropdown opens smoothly.
- Drawer slides from side.
- Toast appears briefly.
- Button shows loading state.
- List item transitions after update.

Avoid:

- Slow transitions
- Bouncing effects
- Flashing effects
- Animation on every hover
- Motion that delays task completion

Recommended timing:

```text
Small interaction: 100–200ms
Modal/drawer:       150–300ms
Page transition:    200–400ms
```

Respect reduced-motion preferences where possible.

---

## 19. Performance UX

Fast UI is part of good UX.

The agent should:

- Avoid unnecessary API calls.
- Use pagination for large lists.
- Lazy-load non-critical content.
- Optimize images.
- Avoid layout shift.
- Cache stable data where possible.
- Show loading states instead of blank screens.
- Avoid blocking the full page for one small action.

Rule:

```text
Show something useful quickly.
```

---

## 20. Trust and Safety

Build trust with:

- Clear actions
- Clear permissions
- Clear pricing when relevant
- Transparent errors
- Secure-looking forms
- Confirmation for dangerous actions
- No dark patterns
- No misleading CTAs
- No hidden destructive actions

Avoid:

- Fake urgency
- Confusing cancellation flows
- Prechecked consent boxes
- Making secondary choices look disabled
- Hiding important terms or consequences

---

## 21. Page Pattern Rules

### Dashboard

Must include:

- Clear title
- Key summary cards
- Important alerts
- Recent activity
- Useful quick actions
- Loading/empty/error states

Avoid showing too many unrelated metrics.

### Settings Page

Must include:

- Grouped sections
- Clear labels
- Save/cancel behavior
- Dangerous actions separated
- Confirmation for destructive changes

### List Page

Must include:

- Search
- Filters
- Sort
- Create action where needed
- Table/list/card view
- Pagination or infinite loading
- Empty and loading states

### Detail Page

Must include:

- Clear title/name
- Main details
- Related metadata
- Status where relevant
- Primary actions
- Edit option where needed

### Onboarding

Must include:

- Short welcome
- Clear steps
- Progress indicator
- Skip option when appropriate
- Completion state

---

## 22. AI Agent Working Process

When improving an existing screen:

1. Identify the top 1–3 user tasks.
2. Find clarity, spacing, hierarchy, and accessibility problems.
3. Preserve existing functionality.
4. Remove duplicate or low-value elements.
5. Group related information.
6. Make the primary action obvious.
7. Add missing states.
8. Make it responsive.
9. Use design tokens.
10. Return final code or final recommendations.

When building a new screen:

1. Define the user goal.
2. Choose the right layout pattern.
3. Define component structure.
4. Define loading, empty, error, success, and disabled states.
5. Define responsive behavior.
6. Define accessibility behavior.
7. Then write code.

---

## 23. Final UI/UX Checklist

Before final output, the agent must check:

### Clarity

- [ ] Page purpose is obvious.
- [ ] Main action is clear.
- [ ] Labels are specific.
- [ ] Jargon is avoided.

### Layout

- [ ] Alignment is consistent.
- [ ] Spacing follows the token system.
- [ ] Related items are grouped.
- [ ] Visual hierarchy is clear.

### Color

- [ ] 60–30–10 rule is followed.
- [ ] Accent color is not overused.
- [ ] Status colors have consistent meaning.
- [ ] Color is not the only way meaning is shown.

### Components

- [ ] Reusable components are used.
- [ ] Buttons are consistent.
- [ ] Forms are consistent.
- [ ] Cards/tables/modals follow the same system.

### States

- [ ] Loading state exists.
- [ ] Empty state exists.
- [ ] Error state exists.
- [ ] Success state exists.
- [ ] Disabled state exists where needed.

### Accessibility

- [ ] Inputs have labels.
- [ ] Buttons are keyboard accessible.
- [ ] Focus states are visible.
- [ ] Contrast is readable.
- [ ] Semantic HTML is used.
- [ ] ARIA is used only when needed.

### Responsiveness

- [ ] Mobile layout works.
- [ ] Tablet layout works.
- [ ] Desktop layout works.
- [ ] Wide content adapts properly.

### Code

- [ ] Arrow functions are used.
- [ ] Existing logic is preserved.
- [ ] Code is readable.
- [ ] No unnecessary files or dependencies were added.

---

## 24. Common Mistakes to Avoid

The agent must avoid:

- Too many primary buttons
- Too many colors
- Random accent usage
- Icon-only navigation without labels
- Placeholder-only form labels
- Generic error messages
- No loading state
- No empty state
- Low contrast text
- Tiny click targets
- Hidden destructive actions
- Too many nested modals
- Overloaded dashboards
- Tables with too many columns
- Heavy animations
- Inconsistent spacing
- Inconsistent icons
- Unclear navigation labels
- Blocking the whole page unnecessarily
- Asking confirmation for every harmless action

---

## 25. Default CSS Token Example

Agents may adapt this to the project stack.

```css
:root {
  /* Spacing */
  --space-0: 0;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-pill: 999px;

  /* Typography */
  --font-body: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --text-xs: 12px;
  --text-sm: 14px;
  --text-md: 16px;
  --text-lg: 20px;
  --text-xl: 24px;
  --text-2xl: 32px;

  /* 60% background/base */
  --color-bg: #f9fafb;
  --color-bg-dark: #0f172a;

  /* 30% surface/secondary */
  --color-surface: #ffffff;
  --color-surface-muted: #f3f4f6;
  --color-surface-dark: #1f2937;

  /* Neutral */
  --color-border: #e5e7eb;
  --color-text: #111827;
  --color-text-muted: #6b7280;

  /* 10% accent/interaction */
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-info: #06b6d4;
  --color-focus: #3b82f6;
}
```

---

## 26. Definition of Done

A UI/UX task is complete only when:

- The user goal is solved.
- Existing functionality is preserved.
- The UI is clear and consistent.
- The 60–30–10 color rule is respected.
- Accessibility basics are covered.
- Responsive behavior is handled.
- Loading, empty, error, success, and disabled states are considered.
- Code uses arrow functions.
- No unnecessary complexity is added.
- The final result feels clean, minimal, predictable, and SaaS-grade.
