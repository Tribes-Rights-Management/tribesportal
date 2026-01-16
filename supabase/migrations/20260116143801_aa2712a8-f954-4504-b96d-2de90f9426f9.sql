-- Trigger function to auto-generate correlation_id on licensing_request insert
CREATE OR REPLACE FUNCTION public.auto_generate_correlation_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only generate if not already set
  IF NEW.correlation_id IS NULL THEN
    NEW.correlation_id := generate_correlation_id();
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger function to enforce immutability of correlation_id
CREATE OR REPLACE FUNCTION public.enforce_correlation_id_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Prevent modification of correlation_id once set
  IF OLD.correlation_id IS NOT NULL AND NEW.correlation_id IS DISTINCT FROM OLD.correlation_id THEN
    RAISE EXCEPTION 'correlation_id is immutable and cannot be modified';
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-generate correlation_id on INSERT
CREATE TRIGGER trg_licensing_requests_generate_correlation_id
  BEFORE INSERT ON public.licensing_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_correlation_id();

-- Create trigger to enforce immutability on UPDATE
CREATE TRIGGER trg_licensing_requests_immutable_correlation_id
  BEFORE UPDATE ON public.licensing_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_correlation_id_immutability();

-- Apply same triggers to licensing_agreements for consistency
CREATE TRIGGER trg_licensing_agreements_generate_correlation_id
  BEFORE INSERT ON public.licensing_agreements
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_correlation_id();

CREATE TRIGGER trg_licensing_agreements_immutable_correlation_id
  BEFORE UPDATE ON public.licensing_agreements
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_correlation_id_immutability();