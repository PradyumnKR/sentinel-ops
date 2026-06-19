---
name: Obsidian Command
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f22'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#ffb783'
  on-tertiary: '#4f2500'
  tertiary-container: '#d97721'
  on-tertiary-container: '#452000'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb783'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#703700'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
  surface-zinc: '#18181b'
  critical: '#ef4444'
  warning: '#f59e0b'
  success: '#10b981'
  ai-glow: '#dfd1ff'
  system-white: '#ffffff'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.5'
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  max-width: 1440px
---

## Brand & Style

The design system is engineered for high-stakes, high-velocity environments where clarity and rapid response are paramount. It targets DevOps and security professionals who require a "Command Center" interface that feels sophisticated, authoritative, and technologically advanced.

The visual style is a hybrid of **Minimalist-Glassmorphism** and **Technical-Modernism**. It draws heavily from the "Linear" aesthetic—utilizing deep backgrounds, subtle functional borders, and surgical precision in layout. The environment evokes a sense of calm under pressure, using high-contrast typography and glowing accents to guide the eye toward critical AI-assisted insights and active incidents.

## Colors

The palette is rooted in a deep-space black (#09090b) to minimize eye strain during long-duration monitoring. Surfaces are tiered using Zinc (#18181b) to create logical separation without relying on heavy shadows.

- **Primary & AI Accents:** Indigo and Violet are reserved for primary action paths and AI-generated content. A subtle "AI Glow" (#dfd1ff) is used for backdrop blurs behind intelligence-driven components.
- **Status Indicators:** Red, Amber, and Emerald follow standard traffic-light semantics but are tuned for high luminosity against the dark background to ensure they "pop" even in peripheral vision.
- **Functional Borders:** Use low-opacity whites (10-15%) to define containers, maintaining the "Command Center" structural feel.

## Typography

This design system utilizes **Inter** for all UI elements and prose to maintain a modern, neutral, and highly legible feel. For technical data—such as incident IDs, log snippets, and terminal outputs—**JetBrains Mono** is used to provide a clear, monospaced distinction that signals "raw data" to the user.

- **Headlines:** Feature tight letter-spacing and semi-bold weights to look impactful and "technical."
- **Labels:** Use uppercase and increased tracking for metadata, mimicking dashboard instrumentation.
- **Micro-copy:** All body text should adhere to a strict 1.6x line height to ensure readability in data-dense incident reports.

## Layout & Spacing

The layout follows a **Rigid 4px Grid** system to ensure technical precision. 

- **Grid:** A 12-column fixed-width grid is used for desktop (centered), while mobile uses a fluid single-column layout.
- **Density:** The design system leans toward high-density information. Gutters are kept tight (16px) to maximize screen real estate for logs and monitoring graphs.
- **Breakpoints:** 
  - Mobile: < 768px (Single column, 16px margins)
  - Tablet: 768px - 1199px (2-column layout for sidebars)
  - Desktop: 1200px+ (Full command center view with persistent navigation)

## Elevation & Depth

Depth is conveyed through **Tonal Layering** and **Glassmorphism** rather than traditional elevation shadows.

- **Base Layer:** #09090b (The primary void).
- **Surface Layer:** #18181b (Used for cards and sidebars).
- **Active Layer:** Semi-transparent Zinc with a 12px Backdrop Blur (used for floating modals and dropdowns).
- **Accents:** Use a subtle "Inner Glow" (1px border-top with 20% white) on buttons and cards to simulate a physical edge caught in light.
- **Shadows:** Only used for "floating" elements like tooltips, using a sharp, high-spread shadow with 40% opacity to maintain the dark-mode aesthetic.

## Shapes

The shape language is **Soft-Technical**. We avoid perfectly sharp corners to maintain a premium "SaaS" feel, but keep the radius small (4px default) to preserve the professional, "command center" architectural look. 

- **Input Fields/Buttons:** 4px radius (Soft).
- **Cards/Containers:** 8px radius (Rounded-lg).
- **AI Badges:** 100px (Pill) to differentiate intelligent elements from standard functional ones.

## Components

- **Buttons:** 
  - *Primary:* Indigo background with a subtle top-light border. 
  - *Secondary:* Transparent with a Zinc border. 
  - *AI-Action:* Violet gradient with a soft outer glow.
- **Input Fields:** Dark Zinc backgrounds, 1px border (#ffffff 10%). On focus, the border brightens to Indigo with a 2px outer glow.
- **Status Chips:** Small, uppercase labels with a 4px dot icon colored by status (Red/Amber/Emerald). Use a low-opacity background tint of the status color.
- **Incident Cards:** Zinc background, 1px border. The left edge features a 4px vertical accent bar indicating the severity level.
- **Data Tables:** Borderless rows. Use horizontal dividers only (1px Zinc). Hover states should trigger a subtle Zinc background highlight.
- **AI Insight Panel:** Utilizes glassmorphism with a Violet-tinted backdrop blur to signal that the content is machine-generated.