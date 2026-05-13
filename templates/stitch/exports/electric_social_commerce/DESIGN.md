---
name: Electric Social Commerce
colors:
  surface: '#101508'
  surface-dim: '#101508'
  surface-bright: '#353b2c'
  surface-container-lowest: '#0a1005'
  surface-container-low: '#181d10'
  surface-container: '#1c2114'
  surface-container-high: '#262c1e'
  surface-container-highest: '#313728'
  on-surface: '#dfe5cf'
  on-surface-variant: '#c0caad'
  inverse-surface: '#dfe5cf'
  inverse-on-surface: '#2c3224'
  outline: '#8a947a'
  outline-variant: '#414a34'
  surface-tint: '#8cdc00'
  primary: '#ffffff'
  on-primary: '#1f3700'
  primary-container: '#a0fb00'
  on-primary-container: '#457000'
  inverse-primary: '#416900'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#4a4949'
  on-secondary-container: '#bab8b7'
  tertiary: '#ffffff'
  on-tertiary: '#2f3131'
  tertiary-container: '#e2e2e2'
  on-tertiary-container: '#636565'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#a0fb00'
  primary-fixed-dim: '#8cdc00'
  on-primary-fixed: '#102000'
  on-primary-fixed-variant: '#304f00'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#101508'
  on-background: '#dfe5cf'
  surface-variant: '#313728'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '900'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 28px
    fontWeight: '800'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.5'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.2'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 4px
  margin-mobile: 16px
  margin-desktop: 32px
  gutter: 12px
  safe-area-bottom: 32px
---

## Brand & Style

This design system is engineered for a high-velocity, video-first shopping experience. It prioritizes immersion by treating the screen as a window into live content, using a **Glassmorphism** aesthetic to layer interface elements over moving visuals without breaking the user's flow. 

The brand personality is **Electric, Hyper-Modern, and Energetic**. It targets a Gen-Z and Millennial audience that thrives on social proof and instantaneous gratification. The visual language utilizes high-contrast accents against a light-absorbing dark base to ensure that product colors and creator personalities remain the focal point. Movement is implied through soft blurs and vibrant highlights, creating a "neon-noir" digital environment that feels premium yet accessible.

## Colors

The palette is intentionally restricted to maximize the impact of the **Electric Lime (#A3FF00)**. This color is reserved exclusively for primary actions, "Live" indicators, and high-priority conversion points. 

**Deep Charcoal (#121212)** serves as the "true dark" foundation, providing a canvas that eliminates bezel distraction and makes video content appear borderless. **Crisp White** is used for maximum legibility in text and iconography. To maintain depth, a spectrum of translucent whites (Glass) is used for containers, allowing underlying video colors to bleed through subtly, creating a sense of environmental integration.

## Typography

This design system utilizes **Montserrat** for display and headings to convey a bold, urban energy. The extra-heavy weights (800-900) should be used for price points and "LIVE" status headers to ensure they command attention. 

**Inter** is the workhorse for all UI elements, descriptions, and comments. Its high x-height ensures readability even when rendered over complex video backgrounds or inside translucent glass containers. For mobile, headline sizes are scaled down to prevent excessive line-breaking, while maintaining the thick stroke weight that defines the brand's voice.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** model with an emphasis on "Safe Zones" for video content. Elements are pushed to the edges of the screen to maintain a full-screen immersive feel.

- **Mobile:** A 4-column grid with 16px side margins. Key interactions (Buy buttons, Share) are docked in the bottom 30% of the screen within thumb-reach.
- **Desktop/Tablet:** Content reflows to a centered max-width container for the video feed, with side panels for live chat and product catalogs using the 12-column grid.
- **Rhythm:** A 4px baseline grid governs all spacing. Vertical stacks use 8px (small), 16px (medium), and 32px (large) increments to maintain a fast, compact UI density.

## Elevation & Depth

Depth is achieved through **Glassmorphism and Layering** rather than traditional drop shadows. 

1.  **Base Layer:** The full-screen video content.
2.  **Surface Layer:** Semi-transparent containers (Background blur: 20px-40px) that host comments and product info.
3.  **Action Layer:** Solid Electric Lime elements that sit at the highest perceived elevation.

To enhance the "floating" effect, use a 1px inner border (stroke) on glass elements with a white opacity of 15%—this creates a "rim light" effect that separates the UI from the video content. Floating Action Buttons (FABs) utilize a subtle glow effect (box-shadow: 0 0 20px #A3FF0044) to emphasize their interactivity.

## Shapes

The shape language is dominated by **Hyper-Rounded** forms. A base radius of **24px** (rounded-xl) is the standard for cards and overlays, creating a friendly, organic feel that contrasts with the aggressive "Electric Lime" color. 

Interactive components like buttons, input fields, and tags should be **Pill-shaped (Fully Rounded)** to encourage touch interaction and reinforce the modern, social-first aesthetic. Product thumbnails within the chat or catalog use the 24px radius to maintain consistency.

## Components

- **Buttons:** Primary buttons are pill-shaped, solid Electric Lime with black text for maximum contrast. Secondary buttons use the glass effect with a white border.
- **Live Tags:** A "LIVE" badge should use a pulse animation with a solid red dot and Electric Lime text on a dark glass background.
- **Product Cards:** Floating overlays that appear over the video. They must feature a 24px corner radius, heavy background blur (40px), and a prominent "Add to Cart" pill button.
- **Chat Input:** A translucent pill-shaped bar at the bottom of the screen. Icons within the input (Emoji, Gift, Camera) are minimal, high-contrast white strokes.
- **Floating Action Buttons (FAB):** Vertical stack on the right side of the screen for social actions (Like, Comment, Share). Icons are white with a subtle text label underneath in Inter Bold 12px.
- **Chips/Filters:** Small, pill-shaped glass containers used for category browsing or selecting product variants (size, color). Active states are indicated by an Electric Lime border.