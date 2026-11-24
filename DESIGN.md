# Design Brief

## Direction

Midnight Ledger — a premium dark fintech rewards platform where neon cyan light cuts through deep navy-black glass.

## Tone

Refined high-tech luxury: dark, confident, and glowing — fintech precision with a nightclub-grade neon signature.

## Differentiation

Every surface is frosted glass lit from within by cyan glow; currency and rewards numbers glow like instrument readouts.

## Color Palette

| Token      | OKLCH        | Role                          |
| ---------- | ------------ | ----------------------------- |
| background | 0.16 0.03 250 | Deep navy-black canvas        |
| foreground | 0.96 0.01 220 | Near-white text               |
| card       | 0.21 0.035 250 | Elevated glass surfaces       |
| primary    | 0.82 0.15 195 | Neon cyan — CTAs, active, glow |
| accent     | 0.85 0.13 175 | Turquoise — secondary highlights |
| muted      | 0.26 0.04 250 | Inactive fills, dividers      |

## Typography

- Display: Space Grotesk — headings, balances, plan prices
- Body: DM Sans — labels, paragraphs, UI text
- Mono: Geist Mono — currency figures, transaction amounts
- Scale: hero `text-4xl md:text-6xl font-bold tracking-tight`, h2 `text-2xl md:text-3xl font-bold tracking-tight`, label `text-xs font-semibold tracking-widest uppercase`, body `text-base`

## Elevation & Depth

Depth comes from layered glass: `glass` surfaces over a fixed radial cyan glow, with `shadow-elevated` for cards and `shadow-glow` reserved for active/premium elements.

## Structural Zones

| Zone    | Background            | Border              | Notes                                      |
| ------- | --------------------- | ------------------- | ------------------------------------------ |
| Header  | glass (frosted)       | border-b            | Sticky; brand mark + profile/notification  |
| Sidebar | sidebar (0.14 0.03 250) | border-r          | Desktop only; cyan active indicator bar    |
| Content | background + glow     | —                   | Alternating glass cards on navy canvas     |
| Bottom  | glass-strong          | border-t            | Mobile only; 5-icon nav, cyan active state |
| Footer  | muted/40              | border-t            | Desktop; muted legal + links               |

## Spacing & Rhythm

Mobile-first: `px-4` gutters, `gap-3`/`gap-4` grids, `py-6` section rhythm; desktop widens to `px-8` with `gap-6` and generous `space-y-8` separation.

## Component Patterns

- Buttons: fully rounded pills; primary = cyan gradient with glow, secondary = glass outline, hover lifts + intensifies glow
- Cards: `rounded-2xl` glass with `border-glass-border` and `shadow-elevated`; premium plan gets `ring-2 ring-primary` + `animate-pulse-glow`
- Badges: small rounded-full pills; cyan-on-navy for tier labels, "MOST POPULAR" gets solid cyan fill
- Currency: always ₹ with Indian digit grouping, rendered in Geist Mono

## Motion

- Entrance: `animate-fade-in-up` staggered 60ms per card, 0.5s ease-out
- Hover: `transition-smooth` 300ms lift + glow increase on cards/buttons
- Decorative: `animate-pulse-glow` on the ₹500 plan border, `animate-float` on hero orbs, `shimmer` on loading skeletons

## Constraints

- Dark theme only — no light/dark mode switch; `.dark` mirrors `:root`
- Never use raw hex/rgb in components — semantic tokens only
- Mobile-first; bottom nav on mobile, sidebar on desktop
- No fake balances, earnings, testimonials, or payment success
- Exactly seven membership plans; ₹500 is MOST POPULAR

## Signature Detail

The glowing cyan membership ring and pulsing "MOST POPULAR" border — a luminous status signal that makes tier standing feel earned.
