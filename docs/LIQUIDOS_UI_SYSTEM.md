# LiquidOS UI System — LiveShop Platform

This document defines the core principles of the LiquidOS design language and its implementation rules.

## 1. Design Language: Liquid Glass
- **Aesthetic**: Immersive, translucent surfaces with vibrant accents.
- **Key Tokens**:
    - `--live-neon`: `#A3FF00` (Main accent).
    - `--glass-white`: `rgba(255, 255, 255, 0.10)`.
    - `--ios-blur`: `40px`.
- **Interaction**: Smooth transitions, spring physics, and haptic feedback (mobile).

## 2. Implementation Rules

### No Hard-coded Data
- Every component must receive its data through props or hooks linked to Supabase/Bling.
- `media_items` is the source of truth for all storefront content.
- `bling_product_id` is used to fetch product details.

### Tenant Branding (White-label)
- Components must resolve branding tokens from the `tenants.branding` JSON.
- Default to `live-neon` if tenant branding is missing.
- Logos and favicons are tenant-scoped.

### Platform-Specific Logic
- **Web**: Use Framer Motion for animations and Tailwind CSS for styling.
- **Mobile**: Use Reanimated and Gesture Handler.
- **Safe Area**: Respect device safe areas (notches, home bars) on mobile.

## 3. Core Components

### ShoppableMediaScreen
- Full-screen video/live container.
- Handles host-based tenant resolution.
- Integrates `useVideoTheme` to adapt UI colors to the video content.

### Morphing Product Card (`MorphCard`)
- States: `collapsed`, `expanded`, `processing`, `success`.
- Must handle inventory levels from the cached product data.
- Emits `buy_now` and `select_variant` events.

### LiquidCheckout
- Glass-morphism based single-page checkout.
- Must support Pix (realtime confirmation) and Cards.
- Idempotency must be handled at the button-click level.

## 4. Performance & Accessibility
- Animations must maintain 60fps minimum.
- Fallback for `prefers-reduced-motion`.
- High contrast mode support.
