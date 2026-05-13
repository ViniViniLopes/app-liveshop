-- Seed data for Liveshop Zen
-- Run this in your Supabase SQL Editor to see products and lives in the app.

-- 1. Create a default tenant if not exists
INSERT INTO tenants (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000000', 'Liveshop Zen HQ', 'zen')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- 2. Add some products
INSERT INTO products (tenant_id, bling_product_id, sku, name, description, price, stock, status)
VALUES 
('00000000-0000-0000-0000-000000000000', '101', 'ZEN-RUN-01', 'Zen Runner Pro v1', 'O tênis definitivo para alta performance.', 899.00, 50, 'active'),
('00000000-0000-0000-0000-000000000000', '102', 'NEON-SET-02', 'Neon Fitness Set', 'Conjunto térmico com compressão inteligente.', 349.00, 100, 'active'),
('00000000-0000-0000-0000-000000000000', '103', 'CYBER-CAP-03', 'Cyber-Zen Cap', 'Acessório com proteção UV e estilo noir.', 149.00, 200, 'active')
ON CONFLICT (tenant_id, bling_product_id) DO NOTHING;

-- 3. Add a live session
INSERT INTO live_sessions (id, tenant_id, status, title, started_at)
VALUES ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'live', 'Drop Especial: Cyber-Zen V1', now())
ON CONFLICT (id) DO NOTHING;

-- 4. Bind live to media items
INSERT INTO media_items (tenant_id, type, title, bling_product_id, asset_id, is_active)
VALUES ('00000000-0000-0000-0000-000000000000', 'live', 'Drop Especial: Cyber-Zen V1', '101', '00000000-0000-0000-0000-000000000001', true)
ON CONFLICT DO NOTHING;
