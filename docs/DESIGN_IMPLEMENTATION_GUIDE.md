# StudyCircle Design Implementation Guide

## Overview
This guide ensures all future implementations follow the established cohesive design system.

---

## Color Palette

### Primary Colors
```css
Burgundy: #7c2d12    /* Primary branding, headers, active states */
Navy: #1e3a8a        /* Primary actions, CTAs */
Amber: #d97706       /* Warm accents, highlights */
```

### Neutrals
```css
Rich Black: #1c1917   /* Main text */
Warm Gray: #78716c    /* Secondary text, labels */
Stone: #fafaf9        /* Background base */
Warm Cream: #fef3c7   /* Hover highlights */
White: #ffffff        /* Cards, surfaces */
Border: #e7e5e4       /* Card borders */
```

### Background Gradients
```css
Body: linear-gradient(180deg, #fef3c7 0%, #fef9e7 50%, #fafaf9 100%)
Cards: linear-gradient(145deg, #ffffff 0%, #fefdfb 100%)
Hero: linear-gradient(135deg, #7c2d12 0%, #92400e 100%)
```

---

## Typography

### Font Families
```css
Headings: 'Sora', sans-serif
Body: 'Inter', sans-serif
Data/Code: 'Space Mono', monospace
```

### Scale & Weights
```css
Hero Title: 3.5rem / 800 weight
Page Title: 2.5rem / 800 weight
Section Title: 2rem / 700 weight
Subtitle: 1.125rem / 400 weight
Body: 1rem / 400-500 weight
Small: 0.875rem / 400-600 weight
```

---

## Component Patterns

### Cards
```css
Background: linear-gradient(145deg, #ffffff 0%, #fefdfb 100%)
Border: 2px solid #e7e5e4
Border-radius: 16px
Padding: 1.5-2rem
Box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04)

/* Top accent bar (optional, shows on hover) */
::before {
  height: 4px
  background: linear-gradient(90deg, #7c2d12 0%, #1e3a8a 50%, #d97706 100%)
  opacity: 0 → 1 on hover
}

/* Hover state */
transform: translateY(-4px) scale(1.02)
border-color: #7c2d12
box-shadow: 0 12px 24px rgba(124, 45, 18, 0.12)
```

### Buttons

**Primary (Navy)**
```css
background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)
color: white
padding: 0.75rem 1.5rem
border-radius: 8-12px
font-weight: 600
box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3)

/* Hover */
transform: translateY(-2px)
box-shadow: 0 6px 20px rgba(30, 58, 138, 0.4)
```

**Secondary (Outline)**
```css
background: transparent / rgba(255, 255, 255, 0.2)
border: 2px solid [context-appropriate-color]
color: [context-appropriate]

/* Hover */
background: rgba(255, 255, 255, 0.3) / #fef3c7
```

**Tertiary (Gray)**
```css
background: #78716c
color: white

/* Hover */
background: #57534e
```

### Form Inputs
```css
background: #fafaf9
border: 2px solid #e7e5e4
border-radius: 8px
padding: 0.875rem 1rem
font-size: 1rem

/* Focus */
border-color: #7c2d12
background: white
box-shadow: 0 0 0 3px rgba(124, 45, 18, 0.1)
```

### Section Titles
```css
font-family: 'Sora'
font-size: 2rem
font-weight: 700
color: #7c2d12
text-align: center
padding-bottom: 1rem

/* Underline accent */
::after {
  width: 80px
  height: 4px
  background: linear-gradient(to right, #7c2d12, #1e3a8a, #d97706)
  centered below title
}
```

### Icon Badges
```css
Size: 64-72px
Border-radius: 12-16px
Background: Gradient matching category
Border: 2px solid lighter shade
Box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)

/* Categories */
Communities: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%), color: #7c2d12
Posts: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%), color: #1e3a8a
Courses: linear-gradient(135deg, #fde68a 0%, #fcd34d 100%), color: #92400e
Enrollments: linear-gradient(135deg, #fbcfe8 0%, #f9a8d4 100%), color: #be185d

/* Hover */
transform: scale(1.1) rotate(-5deg)
```

---

## Spacing System

```css
Base unit: 1rem (16px)
Scale: 0.25rem, 0.5rem, 0.75rem, 1rem, 1.5rem, 2rem, 3rem, 4rem, 5rem

Gap in grids: 1.5-2rem
Card padding: 1.5-2rem
Section padding: 3-4rem vertical, 2rem horizontal
Page max-width: 1200px (content), 1100px (centered content)
```

---

## Animation & Transitions

### Standard Transitions
```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
```

### Hover Transforms
```css
Cards: translateY(-4px) scale(1.02)
Buttons: translateY(-2px)
Icons: scale(1.1) rotate(-5deg)
```

### Special Animations
```css
/* Float animation for placeholder icons */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
animation: float 3s ease-in-out infinite

/* Shine effect on primary buttons */
::before {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)
  transition: left 0.5s ease
}
:hover::before {
  left: -100% → 100%
}
```

---

## Page Layouts

### Hero Section
```css
background: linear-gradient(135deg, #7c2d12 0%, #92400e 100%)
padding: 5rem 2rem
text-align: center
box-shadow: 0 4px 20px rgba(124, 45, 18, 0.15)

/* Shadow transition */
::after {
  curved shadow effect bleeding into next section
  width: 80%
  height: 40px
  centered below
}
```

### Content Sections
```css
padding: 4rem 2rem 3rem
max-width: 1100px
margin: 0 auto
position: relative
margin-top: -20px (to overlap with hero)

/* Optional gradient overlay */
background: linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.4) 100%)
```

### Grid Layouts
```css
display: grid
grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))
gap: 2rem
max-width: 1100px
margin: 0 auto
```

---

## Implementation Checklist

When implementing new features, ensure:

### Visual Elements
- [ ] Uses established color palette
- [ ] Includes tri-color accent where appropriate
- [ ] Cards have gradient background + hover state
- [ ] Typography uses Sora for headings, Inter for body
- [ ] Spacing follows system (multiples of 0.25rem)
- [ ] Border radius is 8-16px consistently

### Interactive Elements
- [ ] Buttons use navy gradient for primary actions
- [ ] Hover states include transform + shadow increase
- [ ] Focus states have burgundy outline
- [ ] Transitions are 0.3s cubic-bezier
- [ ] Form inputs follow established pattern

### Layout
- [ ] Max-width is 1100-1200px
- [ ] Sections have proper padding (4rem vertical)
- [ ] Grids use 2rem gap
- [ ] Centered content where appropriate

### Polish
- [ ] Icon badges match category color scheme
- [ ] Section titles have gradient underline
- [ ] Cards show tri-color top bar on hover
- [ ] All text colors use established palette
- [ ] Shadows are subtle (max 0.12 opacity)

---

## Common Patterns

### Error Messages
```css
background: #fef2f2
color: #7c2d12
border: 1px solid #fecaca
border-left: 3px solid #7c2d12
padding: 0.75-1rem
border-radius: 8px
```

### Success Messages
```css
background: #dbeafe
color: #1e3a8a
border: 1px solid #93c5fd
border-left: 3px solid #1e3a8a
```

### Loading States
```css
Spinner: 2px border, navy color
Text: "Loading..." in warm gray
Background: Same as non-loading state
```

### Empty States
```css
Large animated icon (5rem, floating)
Burgundy title
Gray subtitle
Feature list with colored badges
"Coming soon" italic text
```

### Modal/Dialog
```css
Overlay: rgba(0, 0, 0, 0.5)
Content: Same as card pattern
Max-width: 500px
Padding: 2rem
Border-radius: 16px
Box-shadow: 0 12px 40px rgba(124, 45, 18, 0.12)
```

---

## Responsive Breakpoints

```css
Mobile: < 480px
  - Single column layouts
  - Reduced padding (1-1.5rem)
  - Smaller font sizes
  - Full-width buttons

Tablet: < 768px
  - Two column grids where appropriate
  - Standard padding
  - Adjust hero section

Desktop: > 768px
  - Full layout with all features
  - Multi-column grids
  - Max widths enforced
```

---

## Don'ts (What to Avoid)

❌ Pure black (#000000) - use #1c1917 instead
❌ Generic blue (#007bff) - use navy #1e3a8a
❌ Purple gradients - outdated
❌ Neon colors - too bright
❌ Heavy drop shadows - keep subtle
❌ Glassmorphism everywhere - only when appropriate
❌ More than 3 font families
❌ Border radius > 20px (except special cases)
❌ Transitions > 0.5s (too slow)
❌ Box shadows > 0.15 opacity

---

## Quick Reference

**Need a button?**
→ Navy gradient for primary, outline for secondary

**Need a card?**
→ White gradient background, 2px border, hover shows tri-color bar

**Need a title?**
→ Sora font, burgundy color, centered gradient underline

**Need input focus?**
→ Burgundy border, subtle burgundy shadow

**Need hover?**
→ translateY(-2 to -4px), increase shadow

**Need colors?**
→ Burgundy (#7c2d12), Navy (#1e3a8a), Amber (#d97706)

---

*This design system creates a cohesive, warm, and professional experience across all pages. Follow it consistently for best results!*

