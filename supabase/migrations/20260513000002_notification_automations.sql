-- Automatic Notification Trigger
-- When a live_session changes status to 'live', notify followers/wishlist users.

-- 1. Helper to call Edge Function
CREATE OR REPLACE FUNCTION notify_live_start()
RETURNS TRIGGER AS $$
BEGIN
  -- We insert into notification_jobs for a worker or edge function to process.
  -- Alternatively, we can use the net extension if available.
  -- For this MVP, we insert into a queue table.
  
  INSERT INTO notification_jobs (tenant_id, type, payload)
  SELECT 
    NEW.tenant_id,
    'live_start',
    jsonb_build_object(
      'live_session_id', NEW.id,
      'title', 'Drop AO VIVO!',
      'body', 'A live ' || COALESCE(NEW.embed_url, 'Especial') || ' começou agora! 🔥'
    );
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger on live_sessions
DROP TRIGGER IF EXISTS tr_live_start_notification ON live_sessions;
CREATE TRIGGER tr_live_start_notification
  AFTER UPDATE OF status ON live_sessions
  FOR EACH ROW
  WHEN (OLD.status <> 'live' AND NEW.status = 'live')
  EXECUTE FUNCTION notify_live_start();
