-- Grant full platform admin access to adam@tribesassets.com
UPDATE public.user_profiles 
SET 
  platform_role = 'platform_admin',
  status = 'active',
  updated_at = now()
WHERE email = 'adam@tribesassets.com';

-- Log the authority change
INSERT INTO public.audit_logs (
  actor_type,
  action,
  action_label,
  record_type,
  details
) VALUES (
  'system',
  'access_granted',
  'Granted platform_admin role to adam@tribesassets.com',
  'user_profile',
  jsonb_build_object(
    'email', 'adam@tribesassets.com',
    'new_role', 'platform_admin',
    'new_status', 'active',
    'granted_by', 'system_initialization'
  )
);