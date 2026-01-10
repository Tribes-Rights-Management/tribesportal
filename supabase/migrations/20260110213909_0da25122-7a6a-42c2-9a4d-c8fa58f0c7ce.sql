-- Update user to platform_admin with active status
UPDATE user_profiles 
SET platform_role = 'platform_admin', status = 'active'
WHERE email = 'adam@carpentercreate.com';

-- Create the platform tenant
INSERT INTO tenants (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'Tribes Platform', 'tribes-platform');

-- Create active membership with both contexts
INSERT INTO tenant_memberships (user_id, tenant_id, status, role, allowed_contexts, default_context)
VALUES (
  '0980e0fc-fc1f-4ed3-b96a-7f8017165b6e',
  '00000000-0000-0000-0000-000000000001',
  'active',
  'tenant_admin',
  ARRAY['publishing', 'licensing']::portal_context[],
  'publishing'
);