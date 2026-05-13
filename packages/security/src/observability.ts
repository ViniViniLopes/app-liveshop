import { createClient } from '@liveshop/database';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function logError(params: {
  tenantId?: string;
  userId?: string;
  errorCode: string;
  message: string;
  metadata?: any;
}) {
  await supabase.from('error_events').insert({
    tenant_id: params.tenantId,
    user_id: params.userId,
    error_code: params.errorCode,
    message: params.message,
    metadata: params.metadata || {},
    status: 'new'
  });

  // Automatically create a recovery task for critical errors
  if (params.metadata?.critical) {
    await supabase.from('recovery_tasks').insert({
      tenant_id: params.tenantId,
      error_code: params.errorCode,
      status: 'pending'
    });
  }
}

export async function logAudit(params: {
  tenantId: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  payload?: any;
}) {
  await supabase.from('audit_logs').insert({
    tenant_id: params.tenantId,
    user_id: params.userId,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId,
    payload: params.payload || {}
  });
}

export async function updateIntegrationHealth(name: string, status: 'operational' | 'degraded' | 'down') {
  await supabase.from('integration_health').upsert({
    name,
    status,
    updated_at: new Date().toISOString()
  });
}
