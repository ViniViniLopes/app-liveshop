-- Commerce & Sync Alignment
-- Adding fields to track payment status and ERP synchronization.

ALTER TABLE sales_orders 
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_id_external text,
ADD COLUMN IF NOT EXISTS bling_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS bling_sync_at timestamptz,
ADD COLUMN IF NOT EXISTS sync_error text;

-- Index for performance on sync jobs
CREATE INDEX IF NOT EXISTS idx_sales_orders_bling_status ON sales_orders(bling_status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_payment_status ON sales_orders(payment_status);
