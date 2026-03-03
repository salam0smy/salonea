-- supabase/migrations/20260303000000_create_tenant_payment_settings.sql

CREATE TABLE IF NOT EXISTS tenant_payment_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL DEFAULT 'moyasar',
    moyasar_publishable_key TEXT,
    moyasar_secret_key TEXT,        -- AES-256-GCM encrypted
    moyasar_webhook_secret TEXT,    -- AES-256-GCM encrypted
    is_connected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, provider)
);

ALTER TABLE tenant_payment_settings ENABLE ROW LEVEL SECURITY;

-- Only the tenant's own admin can read or write payment settings
CREATE POLICY "admin can manage payment_settings"
    ON tenant_payment_settings FOR ALL
    USING (tenant_id = current_tenant_id());
