import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Usamos SERVICE_ROLE para poder criar registros em tabelas protegidas e gerenciar usuários
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, password, company_name, slug } = await req.json()

    if (!email || !company_name || !slug) {
      throw new Error('Email, Company Name and Slug are required.')
    }

    // 1. Criar Usuário no Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { company_name }
    })

    if (authError) throw authError

    const userId = authUser.user.id

    // 2. Criar o Tenant
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .insert({
        name: company_name,
        slug: slug.toLowerCase(),
        status: 'active'
      })
      .select()
      .single()

    if (tenantError) throw tenantError

    const tenantId = tenant.id

    // 3. Vincular Usuário como OWNER do Tenant
    const { error: memberError } = await supabaseAdmin
      .from('tenant_members')
      .insert({
        tenant_id: tenantId,
        user_id: userId,
        role: 'owner'
      })

    if (memberError) throw memberError

    // 4. Criar Branding Padrão (LiquidOS Base)
    await supabaseAdmin
      .from('tenant_branding')
      .insert({
        tenant_id: tenantId,
        primary_color: '#A3FF00', // Neon padrão
        background_color: '#0A0A0A',
        button_radius: '14px',
        font_family: 'Inter'
      })

    // 5. Ativar Feature Flags iniciais
    await supabaseAdmin
      .from('tenant_feature_flags')
      .insert([
        { tenant_id: tenantId, flag_key: 'live_shopping', is_enabled: true },
        { tenant_id: tenantId, flag_key: 'bling_integration', is_enabled: true },
        { tenant_id: tenantId, flag_key: 'affiliate_system', is_enabled: false } // Começa desligado
      ])

    return new Response(JSON.stringify({ 
      success: true, 
      tenant_id: tenantId, 
      user_id: userId,
      message: 'Platform bootstrapped successfully for tenant.' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
