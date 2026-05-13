# Stitch Design System for LiveShop

This project uses Stitch as a design reference and ideation layer, not as an uncontrolled source of production code.

## Why this exists
LiveShop needs a consistent UI across:
- mobile live studio
- shoppable storefront
- affiliate pages
- dashboard
- white-label tenant stores
- connected social accounts
- sales and receivables
- notifications

Stitch references, screenshots and exported code give Antigravity a strong visual target, but all generated code must be normalized into typed components.

## Required repository locations
- Reference images: `docs/design/references/`
- Stitch prompts: `templates/stitch/prompts/`
- Stitch exports: `templates/stitch/exports/`
- Component maps: `templates/stitch/component-maps/`
- Production components: `packages/ui`, `apps/web`, `apps/mobile`

## Core rule
Do not let UI be static. Every important button must map to a Supabase-tracked action.

Examples:
- Buy Now → `buy_now`
- Save Product → `save_product`
- Share → `share_media`
- Feature Product → `feature_product`
- Start Live → `start_live`
- Connect Social Account → `connect_social_account`
- Publish Autopost → `publish_autopost`

## Animation rule
Animations must be reusable presets:
- `card_enter`
- `cta_pulse`
- `live_badge_pulse`
- `product_switch`
- `sale_toast`
- `bottom_sheet_open`

## Supabase dependency
Use the migration `005_stitch_ui_interactions.sql` to store:
- design references
- component registry
- animation presets
- button configurations
- UI action events

## Antigravity workflow
Use `.agent/workflows/stitch-design-implementation.md` before implementing UI.

## Acceptance checklist
- [ ] Reference image or Stitch export saved
- [ ] Component map created
- [ ] Tokens mapped to tenant branding
- [ ] Buttons mapped to action types
- [ ] Events written to Supabase
- [ ] Animations use presets
- [ ] Web and mobile behavior defined
- [ ] Empty/loading/error states implemented
- [ ] No hard-coded product data
- [ ] No secret or token in UI
