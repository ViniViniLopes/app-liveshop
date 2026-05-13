# LiveShop Antigravity Agent Pack

Pacote próprio de skills, regras, workflows e templates para desenvolver o projeto **LiveShop** no Antigravity IDE.

## Estratégia recomendada

Use o **Antigravity Kit 2.1** como base de produtividade e este pack como camada especialista do projeto.

```bash
npx @vudovn/ag-kit init
```

Depois copie a pasta `.agent` deste pack para a raiz do seu monorepo.

```bash
cp -R .agent /caminho/do/seu/liveshop-platform/
```

Ou rode:

```bash
bash setup.sh /caminho/do/seu/liveshop-platform
```

## Uso no Antigravity

Prompt inicial recomendado:

```text
Use o contexto de .agent/project.md, as regras de .agent/rules.md e o workflow .agent/workflows/build-10-10.md.

Antes de alterar qualquer arquivo:
1. Leia project.md e rules.md.
2. Ative security-gate, architecture-reviewer e qa-e2e-validator.
3. Crie um plano técnico dividido por arquivos.
4. Aguarde aprovação para implementar.

Tarefa:
[descreva aqui a tarefa]
```

## Arquitetura alvo

- Mobile: React Native + Expo Development Build + TypeScript
- Live mobile: RTMPS nativo direto para YouTube/Facebook
- iOS encoder: HaishinKit
- Android encoder: RootEncoder
- Web/Vitrine/Dashboard: Next.js + TypeScript + Vercel
- Backend: Supabase Auth, Postgres, RLS, Realtime, Edge Functions, Cron, Queues
- ERP: Bling API + Bling MCP custom
- Pagamento: Pagar.me primeiro, Stripe depois
- Push: Supabase + Expo Push Notifications
- Workers: Docker/Hetzner
- MCP: Supabase MCP, Vercel MCP, Stripe MCP e MCPs custom

## Regra principal

Vídeo não passa pelo nosso servidor. A live sai do celular direto para YouTube/Facebook. O LiveShop controla produto, vitrine, checkout, afiliado, Bling, dashboard, push, autopost e tracking.

## v2 update: white-label domains and branding

This pack now includes a Nuvemshop-like white-label layer:

- `.agent/skills/tenant-branding-domain-specialist/SKILL.md`
- `.agent/workflows/custom-domain-branding.md`
- `templates/supabase/002_tenant_branding_domains.sql`
- `docs/WHITE_LABEL_DOMAINS.md`

Use this workflow when implementing tenant custom domains, logos, favicons, theme tokens, SEO metadata and host-based routing.


## v3 update: Cloudflare DNS Free for white-label

This pack now includes Cloudflare DNS as the default DNS automation layer for tenant custom domains:

- `.agent/skills/cloudflare-dns-whitelabel-specialist/SKILL.md`
- `.agent/workflows/cloudflare-dns-whitelabel.md`
- `templates/supabase/003_cloudflare_dns_whitelabel.sql`
- `docs/CLOUDFLARE_DNS_WHITELABEL.md`

Use this workflow to implement Cloudflare-managed tenant DNS, TXT verification, DNS record upsert, SSL/routing status checks and Host-header tenant resolution.

## v4 addition — Social OAuth Autopost

This pack includes the social account authentication architecture required for in-app autopost authorization:

- `.agent/skills/social-oauth-autopost-specialist/SKILL.md`
- `.agent/workflows/social-auth-autopost.md`
- `templates/supabase/004_social_oauth_autopost.sql`
- `docs/SOCIAL_AUTH_AUTOPOST.md`

Use this workflow before implementing autopost or social account connections.

## v5 Additions — Stitch Design + Supabase UI Logic

This version adds a Stitch design reference workflow so Antigravity can build UI from visual references without hard-coding behavior.

Added:
- `.agent/skills/stitch-design-system-specialist/`
- `.agent/skills/ui-interactions-supabase-specialist/`
- `.agent/workflows/stitch-design-implementation.md`
- `templates/supabase/005_stitch_ui_interactions.sql`
- `templates/stitch/`
- `docs/STITCH_DESIGN_SYSTEM.md`
- `docs/design/references/liveshop-neon-card-reference.jpeg`


## v6 additions — SaaS Operational Core

This version adds the missing operational SaaS modules before development:

- onboarding-wizard-specialist
- saas-billing-plans-specialist
- saas-admin-specialist
- roles-permissions-specialist
- feature-flags-specialist
- lgpd-compliance-specialist
- support-center-specialist
- app-store-readiness-specialist
- storefront-template-specialist
- error-recovery-specialist
- ai-commerce-copilot-specialist

New workflow pack: `.agent/packs/saas-operations.json`.
New migration: `templates/supabase/006_saas_operational_core.sql`.

## v7 integration audit patch

This version adds the Lego Integration Audit and the missing operational schema layer:

- `007_commerce_media_notifications_core.sql`
- `008_rls_alignment_and_helpers.sql`
- `docs/LEGO_INTEGRATION_AUDIT.md`
- `.agent/skills/integration-contract-validator/SKILL.md`
- `.agent/workflows/lego-integration-audit.md`

Run the Lego Integration Audit workflow before each coding phase.
