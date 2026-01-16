-- Create default institutional tenant
INSERT INTO public.tenants (name, slug)
VALUES ('Tribes Internal', 'tribes-internal')
ON CONFLICT DO NOTHING;

-- Create platform admin membership for adam@carpentercreate.com
WITH
u AS (
  SELECT id AS user_id
  FROM auth.users
  WHERE email = 'adam@carpentercreate.com'
),
t AS (
  SELECT id AS tenant_id
  FROM public.tenants
  WHERE name = 'Tribes Internal'
)
INSERT INTO public.tenant_memberships (
  tenant_id,
  user_id,
  role,
  status,
  allowed_contexts
)
SELECT
  t.tenant_id,
  u.user_id,
  'tenant_admin'::portal_role,
  'active'::membership_status,
  ARRAY['publishing', 'licensing']::portal_context[]
FROM u, t
WHERE NOT EXISTS (
  SELECT 1
  FROM public.tenant_memberships tm
  WHERE tm.tenant_id = t.tenant_id
    AND tm.user_id = u.user_id
);

-- Ensure user_profiles has platform_admin role
UPDATE public.user_profiles
SET platform_role = 'platform_admin', status = 'active'
WHERE user_id = '0980e0fc-fc1f-4ed3-b96a-7f8017165b6e';