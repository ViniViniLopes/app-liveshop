# LiveShop Stitch Exports — Screen Index

Catálogo de todas as telas geradas no Stitch para o projeto **LiveShop Platform**.  
Cada entrada inclui: chave da tela, descrição, categoria, arquivos disponíveis e status de implementação.

> **Localização dos arquivos**: `templates/stitch/exports/{screen_key}/`  
> **Conteúdo de cada pasta**: `screen.png` (preview visual) + `code.html` (código Stitch exportado)  
> **Regra**: Código Stitch **não vai direto para produção**. Deve ser normalizado em componentes TypeScript revisados.

---

## 📱 Screens — Mobile (React Native / Expo)

| Chave | Tela | Categoria | Arquivos | Implementado |
|-------|------|-----------|----------|:---:|
| `feed_de_live_shop` | Feed de LiveShop | Storefront / Feed | `screen.png` `code.html` | ⬜ |
| `feed_de_v_deo_com_produto_ajustado` | Feed de Vídeo com Produto (ajustado) | Storefront / Feed | `screen.png` `code.html` | ⬜ |
| `home_e_commerce` | Home E-commerce | Storefront / Home | `screen.png` `code.html` | ⬜ |
| `detalhes_do_produto` | Detalhes do Produto | Produto | `screen.png` `code.html` | ⬜ |
| `detalhes_do_produto_no_v_deo` | Detalhes do Produto no Vídeo | Produto / Vídeo | `screen.png` `code.html` | ⬜ |
| `detalhes_do_produto_no_v_deo_ajustado` | Detalhes do Produto no Vídeo (ajustado) | Produto / Vídeo | `screen.png` `code.html` | ⬜ |
| `carrinho_de_compras` | Carrinho de Compras | Checkout | `screen.png` `code.html` | ⬜ |
| `checkout_e_pagamento` | Checkout e Pagamento | Checkout | `screen.png` `code.html` | ⬜ |
| `checkout_com_gamifica_o` | Checkout com Gamificação | Checkout | `screen.png` `code.html` | ⬜ |
| `checkout_com_v_deo_flutuante_pip` | Checkout com Vídeo Flutuante (PiP) | Checkout / Live | `screen.png` `code.html` | ⬜ |
| `electric_social_commerce` | Electric Social Commerce | Storefront / Social | `screen.png` `code.html` | ⬜ |
| `recomenda_es_de_ia_personalizada` | Recomendações de IA Personalizada | AI Copilot | `screen.png` `code.html` | ⬜ |
| `sele_o_de_login` | Seleção de Login | Auth | `screen.png` `code.html` | ⬜ |
| `login_com_e_mail` | Login com E-mail | Auth | `screen.png` `code.html` | ⬜ |
| `splash_screen_video_opening` | Splash Screen / Video Opening | Onboarding | `screen.png` `code.html` | ⬜ |

---

## 🎨 Assets & Brand

| Chave | Descrição | Arquivos |
|-------|-----------|----------|
| `runner_s_xchange_brand_logo_refined` | Logo refinado (Runner's Xchange — tenant demo) | `screen.png` `code.html` |

---

## 📸 Screenshots de Referência Visual

Capturas de tela de referência usadas durante o processo de design no Stitch (2026-05-11):

| Arquivo | Data |
|---------|------|
| `screenshot_2026_05_11_at_15.47.08.png/` | 2026-05-11 15:47 |
| `screenshot_2026_05_11_at_15.47.27.png/` | 2026-05-11 15:47 |
| `screenshot_2026_05_11_at_15.47.36.png/` | 2026-05-11 15:47 |
| `screenshot_2026_05_11_at_15.47.44.png/` | 2026-05-11 15:47 |
| `screenshot_2026_05_11_at_15.47.52.png/` | 2026-05-11 15:47 |
| `screenshot_2026_05_11_at_15.48.05.png/` | 2026-05-11 15:48 |
| `screenshot_2026_05_11_at_15.48.15.png/` | 2026-05-11 15:48 |
| `screenshot_2026_05_11_at_15.49.03.png/` | 2026-05-11 15:49 |
| `screenshot_2026_05_11_at_15.49.031_copy.jpg/` | 2026-05-11 15:49 |
| `screenshot_2026_05_11_at_15.49.39.png/` | 2026-05-11 15:49 |

---

## 🗺️ Mapeamento por Fase do Roadmap

| Fase | Telas relevantes |
|------|-----------------|
| **Fase 1 — Foundation** | `sele_o_de_login`, `login_com_e_mail`, `splash_screen_video_opening` |
| **Fase 2 — Sales** | `carrinho_de_compras`, `checkout_e_pagamento`, `checkout_com_gamifica_o`, `checkout_com_v_deo_flutuante_pip` |
| **Fase 3 — Media & Live** | `feed_de_live_shop`, `feed_de_v_deo_com_produto_ajustado`, `home_e_commerce`, `detalhes_do_produto`, `detalhes_do_produto_no_v_deo`, `detalhes_do_produto_no_v_deo_ajustado`, `electric_social_commerce` |
| **Fase 4 — SaaS / AI** | `recomenda_es_de_ia_personalizada` |

---

## 📋 Regras de uso do código Stitch

1. **Nunca copiar `code.html` direto para produção** — o código é referência, não componente final.
2. **Extrair design tokens** (cores, raios, sombras, tipografia) e registrar em `packages/liquidos-ui`.
3. **Mapear cada elemento** ao component map em `templates/stitch/component-maps/`.
4. **Toda ação de botão** deve ser mapeada a um `action_type` em `ui_action_events`.
5. **Toda animação** deve virar um preset em `animation_presets`.
6. Após implementar um componente, marcar a coluna **Implementado** como ✅ neste índice.

---

*Última atualização: 2026-05-12 — gerado automaticamente pelo Antigravity durante o checkpoint gap closure.*
