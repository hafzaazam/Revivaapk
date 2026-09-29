# Revivaa

Premium botanical hair oil — Vite + React + Framer Motion + plain CSS.

## Stack (locked)

- **Bundler:** Vite 8
- **UI:** React 19
- **Motion:** Framer Motion
- **Styles:** CSS modules-per-component + global design tokens (**not Tailwind**)
- **Theme:** `data-theme="light" | "dark"` on `<html>` via `ThemeProvider`

## Folder structure

```
src/
  assets/          # module-imported brand assets (logo, etc.)
  components/      # shared chrome: Navbar, Cursor, Preloader, ScrollProgress
  sections/        # page sections (new work lands here)
  hooks/           # React hooks
  lib/             # non-React utilities
  styles/
    tokens.css     # ★ design system — use these names in all new UI
  theme/           # ThemeProvider + useTheme
  App.jsx
  main.jsx
  index.css        # legacy global + clay helpers (migrate gradually)
public/
  images/
  videos/
```

## Design tokens

Source of truth: [`src/styles/tokens.css`](src/styles/tokens.css).  
Imported first in `main.jsx` so every stylesheet can reference these variables.

### Colors — use these names

| Token | Value / role |
| --- | --- |
| `--color-olive` | `#878038` — primary brand, buttons, accents |
| `--color-orange` | `#f2970c` — highlight, CTA/energy (logo) |
| `--color-bg-dark` | `#1a1804` — dark canvas |
| `--color-bg-light` | `#fffdf6` — light canvas / cards |
| `--color-text-light` | `#fffdf6` — text on dark |
| `--color-text-dark` | `#1a1804` — text on light |
| `--color-olive-10` / `-20` / `-40` | olive opacity tints (surfaces, borders) |
| `--color-orange-glow` | soft orange for hover glow / shadows |
| `--color-bg-dark-elevated` | stacked panels on dark |

**Semantic (theme-aware):** `--color-bg`, `--color-bg-elevated`, `--color-text`, `--color-heading`, `--color-border`, `--color-accent`, `--color-accent-hot`, `--color-text-muted`.

Prefer semantic tokens in components so light/dark just works.

### Typography

| Token | Intent |
| --- | --- |
| `--font-display` | Headlines — **Fraunces** (locked) |
| `--font-body` | UI/body — Outfit |
| `--text-xs` … `--text-display` | Fluid `clamp()` scale |

### Spacing & radius

| Token | Values |
| --- | --- |
| `--space-1` … `--space-8` | 8 / 16 / 24 / 32 / 48 / 64 / 96 / 128 |
| `--radius-pill` | brand pills (nav, buttons) |
| `--radius-sm` … `--radius-xl` | 8 → 32 |

### Motion

| Token | Use |
| --- | --- |
| `--ease-out-expo` | default branded easing |
| `--duration-fast` / `-base` / `-slow` | 180 / 350 / 600ms (collapse to ~0 under `prefers-reduced-motion`) |

Animate with **transform + opacity** only. Always gate decorative motion behind `prefers-reduced-motion: reduce`.

### Example

```css
.cta {
  background: var(--color-olive);
  color: var(--color-on-accent);
  border-radius: var(--radius-pill);
  padding: var(--space-2) var(--space-4);
  box-shadow: var(--shadow-orange-glow);
  transition: transform var(--duration-fast) var(--ease-out-expo);
}
.cta:hover {
  transform: translateY(-2px);
}
```

Legacy variables (`--olive`, `--cream`, `--forest`, …) are bridged in `tokens.css` so existing sections keep working while we migrate.

## Motion system (shared vocabulary)

Do **not** invent one-off section transitions. Import from [`src/lib/motion.js`](src/lib/motion.js).

### `<ScrollReveal>` — in-section entrances

```jsx
import { ScrollReveal } from './lib/motion'

<ScrollReveal variant="fade-up">…</ScrollReveal>
<ScrollReveal variant="blur-in" delay={0.1}>…</ScrollReveal>
<ScrollReveal variant="mask-wipe-left">…</ScrollReveal>
<ScrollReveal variant="mask-wipe-right">…</ScrollReveal>
<ScrollReveal variant="scale-in">…</ScrollReveal>
<ScrollReveal variant="stagger-children" stagger={0.08}>
  <div>A</div>
  <div>B</div>
</ScrollReveal>
```

Reduced-motion / failed JS: children stay fully visible in DOM order.

### `<OilTransition>` — major section boundaries

Place **between** full sections (Hero→Story, Story→Why, Difference→Ingredients, …):

```jsx
<Hero />
<OilTransition />
<ProblemSolution />
```

Uses a precomputed SVG liquid edge (olive→orange, low opacity) + `translateY` — not per-frame path math. Reduced-motion collapses to a 1px rule.

### Scroll-scrubbed pins (Story / Difference tabs)

```jsx
import { useScrollPin, ScrollPinnedSection, PinProgress, PinTabs } from './lib/motion'

const ref = useRef(null)
const pin = useScrollPin(ref, { panels: 3, thresholds: [0.28, 0.58] })

<ScrollPinnedSection ref={ref} id="solution" height="240vh" reducedMotion={pin.reducedMotion}>
  <PinProgress progressWidth={pin.progressWidth} activeIndex={pin.activeIndex} labels={tabs} />
  <PinTabs tabs={tabs} activeIndex={pin.activeIndex} />
  {/* drive panel cross-fades with pin.scrollYProgress */}
</ScrollPinnedSection>
```

Progress line + dots reflect **scroll** inside the pin, not click state. Reduced-motion unpins and stacks content (`.is-static`).

### Legacy helpers

`oilPourClip` / `oilRevealClip` in `lib/liquidClip.js` remain for rare clip-path needs (e.g. hero scroll-out). Prefer `<OilTransition>` for section seams.

## Scripts

```bash
npm run dev
npm run build
npm run lint
```