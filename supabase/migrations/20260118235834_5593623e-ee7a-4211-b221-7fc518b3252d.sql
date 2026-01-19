-- 1) Add ui_density_mode to user_preferences (user-scoped preference)
ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS ui_density_mode text NOT NULL DEFAULT 'comfortable';

-- Constrain values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_preferences_ui_density_mode_check'
  ) THEN
    ALTER TABLE public.user_preferences
    ADD CONSTRAINT user_preferences_ui_density_mode_check
    CHECK (ui_density_mode IN ('comfortable','compact'));
  END IF;
END $$;

-- 2) Create tenant_ui_policies (workspace policy overrides)
CREATE TABLE IF NOT EXISTS public.tenant_ui_policies (
  tenant_id uuid PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  ui_density_policy text NULL, -- NULL = user choice, otherwise enforced: 'comfortable'|'compact'
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid NULL
);

-- Constrain values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tenant_ui_policies_ui_density_policy_check'
  ) THEN
    ALTER TABLE public.tenant_ui_policies
    ADD CONSTRAINT tenant_ui_policies_ui_density_policy_check
    CHECK (ui_density_policy IS NULL OR ui_density_policy IN ('comfortable','compact'));
  END IF;
END $$;

-- 3) RLS
ALTER TABLE public.tenant_ui_policies ENABLE ROW LEVEL SECURITY;

-- Read: platform admins OR tenant admins of that tenant can read policies
DROP POLICY IF EXISTS "tenant_ui_policies_read" ON public.tenant_ui_policies;
CREATE POLICY "tenant_ui_policies_read"
ON public.tenant_ui_policies
FOR SELECT
USING (
  public.is_platform_admin(auth.uid())
  OR public.is_tenant_admin(tenant_id, auth.uid())
);

-- Write: platform admins OR tenant admins can upsert/update policies
DROP POLICY IF EXISTS "tenant_ui_policies_write" ON public.tenant_ui_policies;
CREATE POLICY "tenant_ui_policies_write"
ON public.tenant_ui_policies
FOR INSERT
WITH CHECK (
  public.is_platform_admin(auth.uid())
  OR public.is_tenant_admin(tenant_id, auth.uid())
);

DROP POLICY IF EXISTS "tenant_ui_policies_update" ON public.tenant_ui_policies;
CREATE POLICY "tenant_ui_policies_update"
ON public.tenant_ui_policies
FOR UPDATE
USING (
  public.is_platform_admin(auth.uid())
  OR public.is_tenant_admin(tenant_id, auth.uid())
)
WITH CHECK (
  public.is_platform_admin(auth.uid())
  OR public.is_tenant_admin(tenant_id, auth.uid())
);