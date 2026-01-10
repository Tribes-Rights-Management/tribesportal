-- Drop dependent policies on user_profiles that reference role column
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.user_profiles;

-- Drop the role column from user_profiles (now stored in user_roles)
ALTER TABLE public.user_profiles DROP COLUMN role;

-- Recreate policies using has_role function
CREATE POLICY "Admins can read all profiles"
ON public.user_profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can update all profiles"
ON public.user_profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can insert profiles"
ON public.user_profiles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::user_role));