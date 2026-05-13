-- Revisão Final de Segurança (Production RLS)

-- Habilitar RLS em todas as tabelas sensíveis, caso não esteja ativo
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;

-- 1. Products: Leitura pública, escrita apenas por administradores
DROP POLICY IF EXISTS "Public products are viewable by everyone" ON public.products;
CREATE POLICY "Public products are viewable by everyone"
  ON public.products FOR SELECT
  USING (true);

-- 2. Live Sessions: Leitura pública, escrita apenas por administradores
DROP POLICY IF EXISTS "Public sessions are viewable by everyone" ON public.live_sessions;
CREATE POLICY "Public sessions are viewable by everyone"
  ON public.live_sessions FOR SELECT
  USING (true);

-- 3. Wishlist: Usuário só vê e altera a própria wishlist
DROP POLICY IF EXISTS "Users can manage their own wishlist" ON public.wishlist;
CREATE POLICY "Users can manage their own wishlist"
  ON public.wishlist FOR ALL
  USING (auth.uid() = user_id);

-- 4. Sales Orders: Usuário só vê os próprios pedidos
DROP POLICY IF EXISTS "Users can view their own orders" ON public.sales_orders;
CREATE POLICY "Users can view their own orders"
  ON public.sales_orders FOR SELECT
  USING (auth.uid() = user_id);

-- 5. User Push Tokens: Usuário só vê/gerencia os próprios tokens
DROP POLICY IF EXISTS "Users can manage their own push tokens" ON public.user_push_tokens;
CREATE POLICY "Users can manage their own push tokens"
  ON public.user_push_tokens FOR ALL
  USING (auth.uid() = user_id);
