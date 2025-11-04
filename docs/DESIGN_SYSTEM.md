# StudyCircle Design System

## Color Palette - "Classic Academic"

### Core Colors

**Primary: Deep Burgundy** `#7c2d12`
- Usage: Headers, active states, primary branding
- Psychology: Sophisticated, classic academic institutions (Harvard, MIT)
- Examples: Logo, hero section, active nav items

**Secondary: Forest Green** `#166534`
- Usage: Primary actions, success states
- Psychology: Calm, studious, growth-oriented
- Examples: CTA buttons, positive feedback

**Accent: Rich Brown** `#92400e`
- Usage: Tertiary actions, highlights
- Psychology: Warm, grounding, natural
- Examples: Hover states, subtle emphasis

### Neutrals

**Text Primary** `#292524` - Warm black for main content
**Text Secondary** `#78716c` - Muted text for labels
**Background** `#fafaf9` - Soft stone, paper-like
**Surface** `#ffffff` - White cards and panels
**Border** `#e7e5e4` - Subtle borders

---

## Typography

**Headings:** Sora (sans-serif, geometric)
**Body:** Inter (sans-serif, highly readable)
**Data/Code:** Space Mono (monospace)

### Scale
- H1: 3rem (48px) / 700 weight
- H2: 1.875rem (30px) / 600 weight
- Body: 1rem (16px) / 400-500 weight
- Small: 0.875rem (14px)

---

## Design Principles

### NO Gradients
- Solid colors only for a refined, timeless look
- Gradients removed from all buttons, headers, and logos

### Minimal Shadows
- Subtle shadows only on hover
- No heavy drop shadows or glassmorphism

### Clean Borders
- 1-2px solid borders instead of shadows
- Defines space without visual noise

### Neutral Background
- Simple stone/paper background
- No patterns or gradients

---

## Component Patterns

### Buttons
```css
Primary: #166534 (forest green)
Secondary: Border with transparent bg
Text: #292524 on hover
```

### Cards
```css
Background: #ffffff
Border: 1px solid #e7e5e4
Border-radius: 8px
Hover: Border color changes to primary
```

### Navigation
```css
Default: #78716c
Hover: #292524 with background
Active: #7c2d12 with white text
```

---

## Design Philosophy

**Inspiration:**
- Classic university libraries
- Academic journals and publications
- High-end stationery and paper goods
- Traditional but not outdated

**NOT Inspired By:**
- Tech startup dashboards
- Social media platforms
- Generic SaaS templates
- Trendy design systems

**Character:**
- Sophisticated without being stuffy
- Academic without being boring
- Modern without being trendy
- Timeless, not dated

---

## Visual Hierarchy

1. **Deep Burgundy (#7c2d12)** - Most important (logo, headers, active states)
2. **Forest Green (#166534)** - Primary actions
3. **Warm Black (#292524)** - Body text and important UI
4. **Warm Gray (#78716c)** - Secondary text
5. **Stone (#fafaf9)** - Backgrounds

---

## Accessibility

✅ All text meets WCAG AA contrast standards
✅ Color is not the only indicator (borders, text also used)
✅ Focus states clearly visible
✅ Touch targets minimum 44px

---

## Applied To

- ✅ Global styles (`src/style.css`)
- ✅ App header (`src/App.vue`)
- ✅ Home page (`src/views/Home.vue`)
- ⏳ Communities page (to be updated)
- ⏳ Login page (to be updated)
- ⏳ Other pages (to be updated)

---

## Next Steps

When building new features, use:
- Burgundy for primary emphasis
- Green for actions
- Neutrals for 90% of the UI
- Let whitespace do the work
- Borders over shadows
- Solid colors only

