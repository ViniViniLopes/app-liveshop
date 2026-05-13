# Events & Webhooks — LiveShop Platform

This document specifies the internal event-driven architecture and external webhook processing rules.

## Internal Supabase Events
Every core UI action and backend trigger must emit an event for tracking and automation.

### UI Action Events (`ui_action_events`)
- `buy_now`: Customer clicked buy.
- `add_to_cart`: Product added to session.
- `share_media`: Media link shared.
- `subscribe_live`: Opt-in for live reminder.
- `select_variant`: Variant chosen in MorphCard.

### Backend Triggers
- `media_item_created`: Notify subscribers (if live).
- `payment_success`: Trigger order creation in Bling.
- `live_status_changed`: Notify Realtime clients (start/end).
- `bling_sync_completed`: Update storefront stock levels.

## Webhook Processing Rules
Integrations (Pagar.me, Stripe, Bling, Social) must follow these strict rules:

### 1. Persistence First
All incoming webhooks must be saved raw in `raw_webhook_logs` before any processing logic is executed.
- `id`, `provider`, `payload`, `headers`, `processed_at`.

### 2. Idempotency
- Every processor must check if the `external_event_id` or a combination of `provider` + `unique_payload_id` has already been processed.
- If already processed, return `200 OK` without re-executing.

### 3. Asynchronous Processing
- Webhook handlers should do minimal work (e.g., save raw and enqueue job).
- The actual business logic (e.g., updating order status) happens in a worker or background job.

### 4. Verification
- Validate signatures for Pagar.me/Stripe.
- Reject requests that do not pass verification with `401 Unauthorized`.

## Job Queue & Retries
- Every failed job (e.g., creating order in Bling) must be enqueued with a `retry_count`.
- Exponential backoff: 5m, 15m, 1h, 4h, 24h.
- After max retries, move to `dead_letter` status for manual intervention in the **Error Recovery Center**.
