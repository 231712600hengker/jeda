# Jeda v2 — Design System "Serene Hearth"

**Version**: 2.0  
**Based on**: Stitch Jeda Mental Wellness App + v2 Architecture  
**Last Updated**: Sep 23, 2026

---

## 📖 Table of Contents

1. [Brand & Philosophy](#brand--philosophy)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Layout & Spacing](#layout--spacing)
5. [Components](#components)
6. [Elevation & Depth](#elevation--depth)
7. [Implementation Guide](#implementation-guide)

---

## 🎯 Brand & Philosophy

### What is Jeda?

**Jeda** is a safe, anonymous mental wellness check-in app for Indonesian students. It's designed as a **contemplative sanctuary** for tracking stress, burnout, and thesis progress without judgment.

### Design Principles

- **Grounded & Non-prescriptive** — We listen, not diagnose
- **Nurturing & Quiet** — Emphasis on reflection over alerts
- **Human-centric Minimalism** — Organic shapes, warm textures, breathing room
- **Low-stress Interface** — Every element serves psychological safety
- **Tactile Yet Weightless** — Soft shadows, generous spacing, fluid interactions

### Audience

- Indonesian university students (18–25 years old)
- Navigating thesis stress, anxiety, emotional regulation
- Value privacy, autonomy, and understanding over judgment

### Visual Metaphors

Think of the app as:
- A journal with paper texture and warm light
- A contemplative tea ceremony (ritual, pausing, grounding)
- A forest path (clarity, organic flow, interconnected nodes)
- Not: a clinical health dashboard, a hospital waiting room, or a social feed

---

## 🎨 Color Palette

### Primary Color: Sage Green

**Intent**: Natural restoration, balance, reassurance

| Stop | Hex | Use Case |
|------|-----|----------|
| Lightest (Tint) | `#c5ebd7` | Secondary button bg, selected pills, soft fills |
| Base Primary | `#6b8e7d` | Primary button bg, active states, accent lines |
| Dark Primary | `#4a6b5b` | Hover states, strong contrast, text on light fills |
| Darkest | `#2c4d3f` | Deep accent, key UI elements |

**Shadow Tint**: Sage green at 8% opacity (`rgba(107, 142, 125, 0.08)`) — simulate soft sunlight through leaves.

### Secondary / Surface: Warm Beige

**Intent**: Organic warmth, parchment texture, reduce canvas fatigue

| Shade | Hex | Use Case |
|-------|-----|----------|
| Light Sand | `#f5f0eb` | Card backgrounds, tinted sections, hover fills |
| Warm Beige | `#eae2d8` | Subtle dividers, form backgrounds |

### Tertiary: Warm Terracotta

**Intent**: Human vitality, breakthrough moments, gentle warmth

| Shade | Hex | Use Case |
|-------|-----|----------|
| Soft Peach | `#f4ddd4` | Low-intensity tertiary button |
| Terracotta | `#d98e73` | Streak highlights, energy metrics, affirmations |
| Deep Warm | `#a6634b` | Tertiary hover state |

### Neutral Canvas

| Element | Hex | Use Case |
|---------|-----|----------|
| Page Background | `#fbf9f6` | Main canvas (soft cream, never white) |
| Text Primary | `#2d3748` | Body copy, high-contrast headlines |
| Text Secondary | `#4a5568` | Supporting text, metadata |
| Text Muted | `#a0aec0` | Placeholders, captions, disabled states |
| Border Light | `#e4e2df` | Hairline dividers, card borders |

### Color Psychology Map

```
🟢 Sage Green    → Calm, safety, grounding
🟡 Warm Beige    → Comfort, approachability, organic
🟠 Terracotta    → Warmth, vitality, breakthrough
⚪ Soft Cream    → Openness, breathing room, clarity
```

**Do Not Use**:
- Pure black (`#000000`) — reads clinical
- Harsh white (`#ffffff`) — causes eye strain, feels sterile
- Cool blues — create distance
- Red alerts — trigger anxiety (our users came for calm!)

---

## 🔤 Typography

### Font Family: Plus Jakarta Sans

**Why?** Geometric clarity with friendly, sculpted terminals. Avoids corporate rigidity while maintaining excellent readability.

**Fallback Stack**: `Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

### Type Scale

#### Headings

| Role | Size (Desktop) | Weight | Line Height | Use |
|------|---|---|---|---|
| h1 (headline-xl) | 40px | 600 | 52px | Page title |
| h1 (mobile) | 30px | 600 | 40px | Page title on mobile |
| h2 (headline-lg) | 32px | 600 | 42px | Section heading |
| h2 (mobile) | 24px | 600 | 32px | Section heading on mobile |
| h3 (headline-md) | 22px | 500 | 30px | Card title, modal heading |
| h4 (headline-sm) | 18px | 500 | 26px | Form group label, subheading |

#### Body

| Role | Size | Weight | Line Height | Use |
|------|---|---|---|---|
| body-lg | 18px | 400 | 30px | Rich content, journal entries |
| body-md | 16px | 400 | 26px | Default paragraph copy |
| body-sm | 14px | 400 | 22px | Card descriptions, helper text |

#### Labels & Micro

| Role | Size | Weight | Line Height | Letter Spacing | Use |
|------|---|---|---|---|---|
| label-lg | 15px | 500 | 20px | +0.02em | Form labels, button text |
| label-md | 13px | 500 | 18px | +0.03em | Captions, metadata |
| label-sm | 11px | 600 | 16px | +0.04em | Tags, badges, status |

### Line Height & Spacing

- **Body text**: 1.68x (26–30px line-height) — generous breathing for comfortable reading and personal reflections
- **Headlines**: 1.3x — preserves structural elegance
- **Letter spacing**: Subtle negative tracking on headlines (`-0.015em`), expanded on small caps (`+0.04em`) for effortless legibility

### Hierarchy

**Three-tier optical ceiling per view**: Avoid more than 3 distinct sizes on a single screen. Quiet emphasis achieved via weight transitions (400 → 500 → 600), not stark size leaps.

**Example**:
```
[h3 headline-md]       ← 22px, weight 500
Description paragraph  ← 16px, weight 400
Supporting metadata    ← 13px, weight 500 (weight, not size, for hierarchy)
```

---

## 📐 Layout & Spacing

### Grid System

#### Desktop (> 1024px)
- 12-column grid
- Max-width reading container: 1140px
- Outer margins: 3rem+ (generous padding to frame content)
- Gutter: 1.5rem between columns

#### Tablet (768px – 1024px)
- 8-column grid
- Outer margins: 2rem
- Gutter: 1.5rem

#### Mobile (< 768px)
- 1-column stack (full-width, edge-to-edge)
- Outer margins: 1.25rem
- Gutter: 1rem
- Bottom navigation: tight, compact

### Spacing Tokens

| Token | Value | Use |
|-------|-------|-----|
| `--space-xs` | 0.375rem (6px) | Inline icon/text gaps |
| `--space-sm` | 0.75rem (12px) | Compact spacing |
| `--space-md` | 1.25rem (20px) | Default vertical rhythm |
| `--space-lg` | 2rem (32px) | Card internal padding |
| `--space-xl` | 3.5rem (56px) | Section separation |

### Padding & Margins

- **Cards**: 2rem padding (minimum)
- **Form groups**: 1.5rem vertical margin between
- **Sections**: 3rem vertical spacing
- **Button height**: 44–48px (touch-friendly)
- **Input height**: 44px (consistent with buttons)

### Whitespace Philosophy

**More is better.** Generous vertical spacing between sections reduces cognitive load. A card with 2rem padding feels more "breathable" than one with 1rem.

---

## 🧩 Components

### Buttons

#### Primary (Solid Sage Green)

```
Background: #6b8e7d
Text: white (on-primary)
Padding: 0.75rem 2rem (36–44px height)
Border-radius: 9999px (full pill)
Font: label-lg (15px, weight 500)
```

**States**:
- Rest: `#6b8e7d`, no shadow
- Hover: `#4a6b5b`, scale(1.015), subtle shadow
- Active: scale(0.98)
- Disabled: `#a0aec0`, cursor: not-allowed

#### Secondary (Soft Tint)

```
Background: #e8efea (sage tint)
Text: #4a6b5b (dark sage)
Padding: 0.75rem 2rem
Border-radius: 9999px
Border: none
```

**States**:
- Hover: Background lightens to #c5ebd7
- Active: scale(0.98)

#### Ghost / Outline

```
Background: transparent
Text: #4a5568 (warm slate)
Border: 1px solid #e4e2df (light)
Padding: 0.75rem 2rem
Border-radius: 9999px
```

**States**:
- Hover: Background #f5f0eb (soft sand fill)
- Active: scale(0.98)

### Cards

#### Content Card (Journal, Prompt, Data)

```
Background: #ffffff (pure white)
Border: 1px solid #e4e2df
Border-radius: 24px (rounded-2xl)
Padding: 2rem
Shadow: 0 10px 25px -5px rgba(107, 142, 125, 0.08), 
         0 8px 10px -6px rgba(107, 142, 125, 0.04)
```

**Use for**: Check-in forms, dashboard cards, journal entries, alerts

#### Tinted / Secondary Card

```
Background: #f5f0eb (warm sand)
Border: none
Border-radius: 1rem
Padding: 1.5rem
Shadow: none (no elevation)
```

**Use for**: Supporting notes, tips, guided cues, metadata

### Form Elements

#### Text Input / Textarea

- **Background**: #fbf9f6 (page bg) or #ffffff (card bg)
- **Border**: 1px solid #e4e2df (at rest)
- **Padding**: 0.75rem 1rem
- **Font**: body-md (16px, line-height 26px)
- **Height**: 44px (inputs)
- **Focus**: 1px solid #6b8e7d, subtle shadow `0 0 0 3px rgba(107, 142, 125, 0.1)`

#### Placeholder

- **Color**: #a0aec0 (muted)
- **Font-style**: normal (no italic)
- **Example**: "e.g. Bagaimana perasaanmu hari ini?"

#### Mood Sliders (Tactile)

```
Track width: 8px
Track color: #e8efea (sage tint)
Thumb size: 28px diameter
Thumb color: white
Thumb shadow: 0 2px 8px rgba(45, 55, 72, 0.15)
Indicator pip: 4px diameter, centered, sage (#6b8e7d)
```

**Interaction**: Spring animation on touch/drag

#### Checkboxes & Habit Toggles

- **Inactive**: 24px circle, #e4e2df border
- **Active**: 24px circle, #6b8e7d fill, white checkmark
- **Animation**: Smooth reveal (80ms)

### Pills & Badges

#### Mood Pills (Full Pill Shape)

```
Background: #e8efea (inactive), #6b8e7d (active)
Text: #4a6b5b (inactive), white (active)
Padding: 0.375rem 1rem
Border-radius: 9999px
Font: label-md (13px)
```

**Use for**: Mood selection (Cerah, Berawan, Hujan, Badai)

#### Stressor Chips / Tags

```
Background: #f5f0eb (inactive), varies by stressor (active)
Text: #4a5568 (inactive), white (active)
Padding: 0.5rem 1rem
Border-radius: 9999px
Font: label-md
```

**Stressor Color Map**:
- Technical → Sage green (`#6b8e7d`)
- Guidance/Bureaucracy → Warm beige (`#eae2d8`)
- Time Management → Terracotta (`#d98e73`)
- Infrastructure → Soft gray (`#b4b2a9`)
- Personal → Soft peach (`#f4ddd4`)

### Alerts & Insight Boxes

#### Insight Box (Breather Box)

```
Background: #c5ebd7 (sage tint)
Border-left: 4px solid #6b8e7d
Padding: 1.5rem
Border-radius: 0.75rem
```

**Content**:
- Icon (18px): Centered left margin
- Text: body-sm, #2c4d3f (dark text on light fill)
- Line-height: 1.7 (generous for readability)

#### Alert Badges

- **Acute**: Red tint bg `#ffcccb`, text `#8b0000`
- **Chronic**: Orange tint bg `#ffe8cc`, text `#b8630b`
- **Info**: Sage tint bg `#c5ebd7`, text `#2c4d3f`

### Chart & Data Viz

#### Trend Lines

- **Anxiety**: Sage green gradient (`#6b8e7d` → `#c5ebd7`)
- **Fatigue**: Warm sand → terracotta (`#f5f0eb` → `#d98e73`)
- **Progress**: Sage green (`#6b8e7d`)
- **Stressor Distribution**: Bar chart with stressor colors

**Reference line** (threshold): Dashed #a0aec0, 2px, opacity 0.6

#### Metric Cards

```
Background: #f5f0eb (soft sand)
Border: 1px solid #e4e2df
Border-radius: 1rem
Padding: 1.25rem
Text-align: center
```

**Structure**:
- Label: label-md (13px), #4a5568, uppercase, letter-spacing +0.05em
- Value: 32px, weight 600, #6b8e7d
- Change: label-md, #d98e73 or #4a5568

---

## 🎭 Elevation & Depth

### Shadow System

**Philosophy**: Soft, sage-tinted ambient shadows (not harsh mechanical drops).

#### Primary Ambient Shadow (Cards)

```css
box-shadow: 0 10px 25px -5px rgba(107, 142, 125, 0.08),
            0 8px 10px -6px rgba(107, 142, 125, 0.04);
```

**Effect**: Simulates gentle sunlight through leaves

#### Floating Modals & Sheets

```css
box-shadow: 0 20px 35px -10px rgba(45, 55, 72, 0.06),
            0 1px 3px 0 rgba(107, 142, 125, 0.04);
```

**Effect**: Subtle depth for overlays

#### No Borders, Only Tones

- Avoid opaque black or gray borders
- Demarcate sections via tonal shifts + whitespace
- Borders where absolutely necessary: 1px `#e4e2df` (light)

### Surface Layering

| Depth Level | Background | Use Case |
|---|---|---|
| Canvas (Level 0) | #fbf9f6 | Page background |
| Inflow Card (Level 1) | #ffffff | Dashboard cards, content blocks |
| Tinted Section (Level 1) | #f5f0eb | Supporting notes, inset fields |
| Floating Modal | #ffffff | Overlays, popups |

---

## 🔨 Implementation Guide

### For Web Developers (React/Next.js + Tailwind)

#### 1. CSS Variables (Tailwind)

Create a Tailwind config with Serene Hearth colors:

```javascript
// tailwind.config.js
export default {
  theme: {
    colors: {
      primary: {
        50: '#c5ebd7',
        400: '#6b8e7d',
        600: '#4a6b5b',
        900: '#2c4d3f',
      },
      secondary: {
        light: '#f5f0eb',
        base: '#eae2d8',
      },
      tertiary: {
        light: '#f4ddd4',
        base: '#d98e73',
        dark: '#a6634b',
      },
      neutral: {
        0: '#fbf9f6',
        1: '#f5f3f0',
        2: '#ffffff',
        text: {
          primary: '#2d3748',
          secondary: '#4a5568',
          muted: '#a0aec0',
        },
        border: '#e4e2df',
      },
    },
    borderRadius: {
      sm: '0.25rem',
      DEFAULT: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem',
      pill: '9999px',
    },
    boxShadow: {
      card: '0 10px 25px -5px rgba(107, 142, 125, 0.08), 0 8px 10px -6px rgba(107, 142, 125, 0.04)',
      modal: '0 20px 35px -10px rgba(45, 55, 72, 0.06), 0 1px 3px 0 rgba(107, 142, 125, 0.04)',
    },
  },
};
```

#### 2. Component Skeleton (React)

```jsx
// components/Card.tsx
export function Card({ children, className = '', ...props }) {
  return (
    <div className={`bg-neutral-2 border border-neutral-border rounded-2xl p-8 shadow-card ${className}`} {...props}>
      {children}
    </div>
  );
}

// components/Button.tsx
export function Button({ variant = 'primary', children, ...props }) {
  const baseClass = 'px-8 py-3 font-label-lg rounded-pill transition-all';
  const variants = {
    primary: 'bg-primary-400 text-white hover:bg-primary-600 hover:scale-101',
    secondary: 'bg-primary-50 text-primary-600 hover:bg-primary-100',
    ghost: 'bg-transparent text-neutral-text-secondary border border-neutral-border hover:bg-secondary-light',
  };
  return <button className={`${baseClass} ${variants[variant]}`} {...props}>{children}</button>;
}

// Usage:
<Card>
  <h2 className="text-headline-md mb-4">Check-in Harian</h2>
  <Button variant="primary">Simpan Cek-in</Button>
</Card>
```

#### 3. Form Pattern

```jsx
// components/FormGroup.tsx
export function FormGroup({ label, hint, children }) {
  return (
    <div className="mb-6">
      <label className="block text-label-lg font-500 mb-2 text-neutral-text-primary">
        {label}
      </label>
      {hint && <p className="text-body-sm text-neutral-text-secondary mb-2">{hint}</p>}
      {children}
    </div>
  );
}

// Usage:
<FormGroup label="Cuaca di relung hatimu?" hint="Pilih satu yang paling cocok">
  <MoodSelector />
</FormGroup>
```

#### 4. Spacing Scale

```css
/* Use these consistently */
--space-xs: 0.375rem;  /* 6px — icon gaps */
--space-sm: 0.75rem;   /* 12px — compact */
--space-md: 1.25rem;   /* 20px — rhythm */
--space-lg: 2rem;      /* 32px — padding */
--space-xl: 3.5rem;    /* 56px — sections */
```

### For Designers (Figma)

#### Setup

1. **Create a design file** with these frames:
   - 🎨 Colors (all palette stops)
   - 🔤 Typography (scale, weights, line-heights)
   - 🧩 Components (buttons, cards, forms, etc.)
   - 📱 Responsive layouts (desktop 1440px, tablet 768px, mobile 375px)

2. **Component Library**:
   - Button (3 variants: primary, secondary, ghost)
   - Card (2 variants: content, tinted)
   - Form inputs, checkboxes, sliders
   - Pills/badges
   - Modals

3. **Auto-layout** for breathing room:
   - Cards: padding 2rem
   - Form groups: spacing 1.5rem
   - Sections: spacing 3rem

#### Accessibility Checklist

- ✅ Contrast ratios (WCAG AA minimum on all text)
- ✅ Touch target size (44px minimum)
- ✅ Keyboard navigation (tab-order, focus states)
- ✅ Color-blind friendly (no red-only, green-only indicators)
- ✅ Font sizes (no smaller than 12px for body)

---

## 🎬 Animation & Motion

### Principles

- **Duration**: 200–300ms for micro-interactions, 400–500ms for modals
- **Easing**: `ease-out` for entrance, `ease-in-out` for interactive drag
- **No flashing**: Avoid rapid color changes; use opacity transitions

### Examples

```css
/* Button hover */
.btn:hover {
  transition: background-color 200ms ease-out, transform 200ms ease-out;
  transform: scale(1.015);
}

/* Modal entrance */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.modal {
  animation: slideUp 400ms ease-out;
}

/* Slider thumb */
.slider-thumb {
  transition: box-shadow 200ms ease-out;
}
.slider-thumb:hover {
  box-shadow: 0 0 0 6px rgba(107, 142, 125, 0.1);
}
```

---

## 📱 Responsive Strategy

### Breakpoints

| Label | Width | Use |
|-------|-------|-----|
| Mobile | < 768px | Single column, compressed |
| Tablet | 768–1024px | 8-column grid |
| Desktop | > 1024px | 12-column grid, max-width 1140px |

### Mobile-First Approach

1. **Default**: Mobile single-column layout
2. **Tablet**: Multi-column with reduced padding
3. **Desktop**: Full-width grid with generous margins

### Responsive Type

```css
/* Headlines scale down on mobile */
h1 {
  font-size: clamp(30px, 5vw, 40px); /* min 30px, max 40px */
  line-height: clamp(40px, 6vw, 52px);
}

/* Body text stays readable */
body {
  font-size: 16px; /* Never below 16px on mobile */
  line-height: 26px;
}
```

---

## 🎨 Special Cases

### Empty States

```
Headline: body-md (invitation, not apology)
Subtext: body-sm (one line, explains space)
Icon: 48px, primary color
CTA: Primary button

Example:
"Mulai dengan cek-in pertamamu"
"Luangkan 2 menit untuk memulai perjalanan refleksi."
[Button: Mulai Cek-in]
```

### Loading States

- **Pulse animation** on skeleton screens (subtle opacity 0.5 → 0.8)
- **Color**: Use neutral-1 (#f5f3f0) for placeholders
- **Duration**: 1.2s fade in/out

### Error States

- **Border**: 1px #d32f2f (red) on input
- **Text**: body-sm #8b0000 below field
- **Clear on input**: Dynamically hide error when user begins typing

### Success States

- **Toast**: Sage green bg (#6b8e7d) + white text, 44px height
- **Icon**: Checkmark (18px)
- **Duration**: 4 seconds auto-dismiss
- **Position**: Bottom-center on mobile, top-right on desktop

---

## 📚 References

**Original Research**:
- Saragih & Situngkir (2022). "GIAT: Teknologi untuk Masyarakat" — Thesis stress detection methodology

**Design Inspiration**:
- Stitch Jeda Mental Wellness App (Serene Hearth design system)
- Material Design 3 (elevation, typography scale)
- Apple Human Interface Guidelines (spacing, haptics)

**Accessibility**:
- WCAG 2.1 Level AA
- Inclusive Components (https://inclusive-components.design)
- The A11Y Project (https://www.a11yproject.com)

---

## 🚀 Next Steps

1. **Component Library**: Build Figma components + code components (React)
2. **Storybook**: Document each component with variants & documentation
3. **QA**: Test on real devices (iOS, Android, desktop)
4. **Usability Testing**: Validate with 5–10 students
5. **Handoff**: Provide component specs + code snippets to dev team

---

**Questions?** Refer back to the brand philosophy: *Does this feel like a safe, caring space for reflection?* If yes, you're on brand.
