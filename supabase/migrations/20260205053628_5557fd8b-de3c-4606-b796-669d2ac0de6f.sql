-- Step 1: Create a SECURITY DEFINER function that bypasses RLS
CREATE OR REPLACE FUNCTION check_is_company_user(check_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_users
    WHERE user_id = check_user_id
      AND deactivated_at IS NULL
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- Step 2: Drop the recursive policies
DROP POLICY IF EXISTS "Company users viewable by company users" ON company_users;
DROP POLICY IF EXISTS "company_users_read" ON company_users;

-- Step 3: Recreate without recursion
CREATE POLICY "company_users_read" ON company_users
  FOR SELECT TO authenticated
  USING (check_is_company_user(auth.uid()));