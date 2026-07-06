---
name: AetherOS Terminal
colors:
  surface: '#0f1321'
  surface-dim: '#0f1321'
  surface-bright: '#353849'
  surface-container-lowest: '#0a0d1c'
  surface-container-low: '#171b2a'
  surface-container: '#1b1f2e'
  surface-container-high: '#262939'
  surface-container-highest: '#303444'
  on-surface: '#dfe1f6'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#dfe1f6'
  inverse-on-surface: '#2c303f'
  outline: '#849495'
  outline-variant: '#3a494b'
  surface-tint: '#00dbe7'
  primary: '#e1fdff'
  on-primary: '#00363a'
  primary-container: '#00f2ff'
  on-primary-container: '#006a71'
  inverse-primary: '#00696f'
  secondary: '#c0c1ff'
  on-secondary: '#1000a9'
  secondary-container: '#3131c0'
  on-secondary-container: '#b0b2ff'
  tertiary: '#fef4ff'
  on-tertiary: '#490080'
  tertiary-container: '#ebd1ff'
  on-tertiary-container: '#852cd3'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#74f5ff'
  primary-fixed-dim: '#00dbe7'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#f0dbff'
  tertiary-fixed-dim: '#ddb7ff'
  on-tertiary-fixed: '#2c0051'
  on-tertiary-fixed-variant: '#6900b3'
  background: '#0f1321'
  on-background: '#dfe1f6'
  surface-variant: '#303444'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.1em
  data-metric:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 40px
  gutter: 24px
  panel-gap: 16px
  glass-padding: 24px
---

## Brand & Style
The design system embodies the "AetherOS" aesthetic—a sophisticated fusion of deep-space exploration and high-fidelity spatial computing. It is designed for elite DevOps and Engineering leadership who require a "Mission Control" perspective on DORA metrics and release health.

The style is a disciplined evolution of **Glassmorphism** and **Futuristic Minimalism**. It leverages the physical depth of Apple Vision Pro's shared space, the technical density of NASA's telemetry displays, and the luminous energy of *Tron Legacy*. The UI should feel like a holographic projection floating in a dark, infinite void, utilizing light as the primary conveyor of information rather than solid matter.

## Colors
The palette is rooted in a "Deep Space" foundation (`#050816`), providing a high-contrast canvas for luminous data layers. 

- **Primary (Cyan):** Used for critical data points, active holographic states, and "nominal" health indicators.
- **Secondary (Indigo) & Tertiary (Violet):** Used for structural depth, background blurs, and "Aurora" gradients that signify system vitality.
- **Aurora Green:** Reserved specifically for "Success" states and high-performance DORA trend lines.
- **Surface Strategy:** Backgrounds are never solid. They use a mix of 60% opacity neutrals with heavy backdrop blurs (20px-40px) to simulate frosted glass.

## Typography
Typography reflects a balance between technical precision and modern editorial style. 

- **Space Grotesk** is used for headlines and large metric displays to evoke a futuristic, geometric feel.
- **Geist** provides a clean, highly legible foundation for body text and descriptions, maintaining a "developer-first" clarity.
- **JetBrains Mono** is utilized for all metadata, timestamps, and DORA attribute labels (e.g., *MTTR*, *CFR*) to reinforce the "Operating System" narrative. 

All headings should employ a slight text-shadow in their respective accent color at low opacity (5-10%) to simulate a holographic "glow" effect.

## Layout & Spacing
The layout follows a **Fluid Spatial Grid**. Elements are treated as "Modules" floating in a Z-axis.

- **Desktop:** A 12-column grid with wide margins (40px) to allow the background "Aurora" gradients to breathe. Modules are separated by 16px or 24px gaps.
- **Spatial Depth:** Padding within components is generous (`24px`) to emphasize the "Glass" container. 
- **Reflow:** On mobile, the 12-column grid collapses to 1 column, and "Display" typography scales down aggressively to maintain the technical density without overflowing.

## Elevation & Depth
Depth is not achieved through traditional drop shadows, but through **Tonal Stacking** and **Refraction**:

- **Level 0 (Void):** The base `#050816` background with animated, low-frequency Aurora blurs.
- **Level 1 (Panels):** Glassmorphic surfaces using `rgba(255, 255, 255, 0.03)` with a `backdrop-filter: blur(30px)`.
- **Level 2 (Active Elements):** Elements like active cards or modals use a subtle inner-glow (1px stroke at 20% opacity) and an ambient outer glow using the primary cyan or secondary indigo.
- **Contrast:** Use a 1px solid border at 10% white opacity on all glass panels to define edges against the dark void.

## Shapes
The shape language is "Advanced Geometric." While the environment is futuristic, it avoids the hyper-roundness of consumer apps to maintain a "Professional Tool" feel.

- **Standard Containers:** `0.5rem (8px)` corner radius provides a modern but structured look.
- **Buttons & Chips:** Use larger `rounded-xl` or full pill shapes to make interactive elements distinct from informational containers.
- **Data Lines:** Chart lines should use "smooth" interpolation (monotone cubic) rather than jagged angles to mimic fluid energy.

## Components

- **Glass Cards:** The primary container. Must include a `1px` top-down gradient border (White to Transparent) to catch "virtual light."
- **Holographic Buttons:** Primary buttons use a solid-to-transparent gradient background. Secondary buttons are "Ghost" style with a `1px` Cyan border and `hover: glow` effects.
- **DORA Metric Chips:** Small, mono-spaced badges with a "Status" dot. The dot should have a CSS `pulse` animation if the metric is currently being updated in real-time.
- **Interactive Graphs:** Line charts for *Lead Time* or *Deployment Frequency* should feature "Glow Paths"—the line itself is a light source, casting a faint color-matched shadow onto the area below it.
- **Status Indicators:** Use the Aurora colors. Instead of flat icons, use "Orb" icons that have a slight radial gradient to imply 3D volume.
- **Telemetry Lists:** Compact rows with `JetBrains Mono` text, separated by faint `0.5px` horizontal lines. Hovering over a row should trigger a subtle "scanline" highlight effect.