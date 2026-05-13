# LiveShop LiquidOS — Design System & Interaction Spec

## 1. Objetivo

Criar uma experiência de Live Commerce com estética **Liquid Glass**, vídeo vertical imersivo, cards compráveis, animações orgânicas e interação em tempo real conectada ao Supabase.

A UI deve funcionar para:

- vídeo gravado;
- live ao vivo;
- replay;
- post externo publicado por autopost.

Todos usam o mesmo núcleo:

```text
media_item + bling_product_id + tenant_branding + tracking + Supabase actions
```

## 2. Regra de arquitetura visual

A vitrine pública e dashboard web usam:

```text
Next.js App Router + TypeScript + Tailwind CSS + Motion/Framer Motion
```

O app mobile nativo usa a mesma linguagem visual, mas com stack própria:

```text
React Native + Expo Development Build + Reanimated + Gesture Handler + Expo Blur/Native Blur + Expo Haptics
```

Não tentar usar Framer Motion diretamente como motor principal do app mobile nativo. O design é compartilhado por tokens; a implementação de animação é diferente por plataforma.

## 3. Tokens obrigatórios

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        'live-neon': '#A3FF00',
        'glass-white': 'rgba(255,255,255,0.10)',
      },
      borderRadius: {
        'ios-xl': '2.5rem',
        'ios-2xl': '3rem',
      },
      backdropBlur: {
        'ios': '40px',
      },
    },
  },
}
```

```css
/* globals.css */
:root {
  --live-theme-color: rgba(163,255,0,0.18);
  --live-accent-color: #A3FF00;
  --tenant-primary-color: #A3FF00;
  --tenant-surface-glass: rgba(255,255,255,0.10);
  --tenant-logo-url: '';
}

.liquid-glass {
  background: var(--live-theme-color);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.20);
  box-shadow: 0 8px 32px rgba(0,0,0,0.37);
}

.liquid-safe-contrast {
  text-shadow: 0 1px 10px rgba(0,0,0,0.45);
}
```

## 4. Core engine — useVideoTheme

A UI deve “sentir” o vídeo, extraindo cor predominante de forma controlada.

Regras:

- rodar no máximo a cada 500–1000ms;
- pausar quando a aba/app não estiver visível;
- nunca bloquear o frame principal da live;
- em vídeos cross-origin sem CORS, usar fallback baseado em `thumbnail_url`, `product_snapshot.main_image_url` ou `tenant_branding.primary_color`;
- respeitar acessibilidade: se contraste ficar baixo, aplicar overlay escuro.

```ts
// hooks/useVideoTheme.ts
export type VideoTheme = {
  liveThemeColor: string
  liveAccentColor: string
  contrastMode: 'light' | 'dark'
}

// Implementar extração com canvas 10x10 e fallback seguro.
// Atualizar CSS variables: --live-theme-color e --live-accent-color.
```

## 5. Componentes principais

### 5.1 ShoppableMediaScreen

Componente raiz da vitrine.

Responsável por:

- resolver `media_item`;
- resolver produto por `bling_product_id`;
- aplicar tenant branding;
- registrar `view_media`;
- renderizar vídeo, live ou replay;
- renderizar ProductFloatingCard;
- preservar UTM, affiliate_id e click_id.

### 5.2 MediaRenderer

```text
recorded_video -> HTML5/video ou player externo
live -> embed YouTube/Facebook ou player permitido
replay -> replay URL/embed
external_post -> embed/post URL quando permitido
```

### 5.3 Morphing Product Card

Estados:

```text
collapsed: preço + imagem + Comprar Agora
expanded: detalhes + variações + estoque + seleção + checkout
processing: bloqueia duplo clique + estado animado
success: vira badge de compra/cliente VIP
```

Web:

- usar `layoutId="product-box"`;
- usar `AnimatePresence`;
- usar transições de mola.

Mobile:

- usar Reanimated shared values/layout transitions;
- usar Gesture Handler para drag/tap;
- usar haptics em expansão, compra e sucesso.

### 5.4 Floating Video PiP

Comportamento:

- arrastável;
- snap-to-corners;
- respeitar safe area;
- nunca cobrir CTA principal;
- salvar posição local por usuário/dispositivo.

### 5.5 LiquidCheckout

Checkout em camada única.

Pix:

- mostrar QR Code e Pix copia-e-cola dentro de modal glass;
- ouvir confirmação por Supabase Realtime;
- disparar SuccessCelebration sem exigir clique “já paguei”.

Cartão/Apple Pay:

- usar provider de pagamento definido em `packages/payments`;
- idempotency key obrigatória;
- estado `processing` no botão;
- nunca salvar dados sensíveis de cartão.

### 5.6 SuccessCelebration

Ao confirmar pagamento:

- confetti neon (#A3FF00 + white);
- card encolhe para badge VIP;
- glow no chat e no avatar do comprador;
- registrar `checkout_success_celebration_viewed`.

## 6. Ações Supabase obrigatórias

Todo botão importante registra evento.

```text
buy_now
save_product
share_media
copy_affiliate_link
start_live
end_live
feature_product
subscribe_live_reminder
connect_social_account
publish_autopost
verify_domain
open_checkout
select_variant
confirm_pix_copy
apple_pay_started
payment_success
payment_failed
```

Tabela sugerida:

```sql
create table ui_action_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  user_id uuid,
  anonymous_id text,
  media_item_id uuid,
  live_session_id uuid,
  bling_product_id text,
  affiliate_id uuid,
  click_id uuid,
  action_type text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
```

RLS obrigatório por tenant.

## 7. Estrutura de pastas web

```text
apps/web/src
  app/
    api/checkout/
    live/[slug]/
    v/[mediaId]/
    p/[productSlug]/
    a/[affiliateSlug]/
    r/[shortCode]/
    dashboard/
  components/
    live/
      VideoPlayer.tsx
      ChatOverlay.tsx
      FloatingPip.tsx
    product/
      MorphCard.tsx
      ProductGallery.tsx
      ProductFloatingCard.tsx
    checkout/
      LiquidCheckout.tsx
      PixGlassModal.tsx
      SuccessState.tsx
    ui/
      GlassButton.tsx
      LiquidCard.tsx
      LiquidBadge.tsx
  hooks/
    useVideoTheme.ts
    useSnapToCorners.ts
    useSupabaseActionEvent.ts
  styles/
    globals.css
```

## 8. Estrutura de pastas mobile

```text
apps/mobile/src
  screens/
    LiveStudioScreen.tsx
    ShoppableMediaScreen.tsx
    ProductPickerScreen.tsx
    ConnectedAccountsScreen.tsx
  components/
    live/
    product/
    checkout/
    ui/
  hooks/
    useVideoThemeNative.ts
    useSnapToCornersNative.ts
    useHaptics.ts
    useSupabaseActionEvent.ts
  native/
    LiveStreamModule.ts
```

## 9. Performance budgets

Obrigatório:

- animações 60 fps mínimo no web; mirar 120 fps onde suportado;
- extração de cor não pode rodar em toda renderização;
- evitar blur pesado em listas grandes;
- fallback para `prefers-reduced-motion`;
- fallback para `reduce transparency`/alto contraste;
- PiP e MorphCard devem manter CTA clicável em dispositivos pequenos;
- checkout deve abrir em menos de 300ms após clique;
- confirmação visual de pagamento deve ocorrer imediatamente após webhook/realtime.

## 10. Prompt final para Antigravity

```text
Use docs/LIVESHOP_LIQUIDOS_SPEC.md como fonte visual obrigatória.
Não crie UI genérica.
Implemente primeiro os tokens, LiquidCard, GlassButton, useVideoTheme e ShoppableMediaScreen.
Todo botão precisa registrar action_type no Supabase.
Todo componente precisa aceitar tenant branding.
Todo card de produto deve vir de media_item + bling_product_id, nunca hard-coded.
Web usa Motion/Framer Motion. Mobile usa Reanimated/Gesture Handler/Expo Blur.
Antes de implementar, liste componentes, eventos, tabelas usadas, animações e testes.
```
