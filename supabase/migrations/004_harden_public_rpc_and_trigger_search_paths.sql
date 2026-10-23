-- Applied to production on 2026-10-23. Restrict exposed SECURITY DEFINER RPCs to authenticated users
-- whose user-bound checks are enforced inside each function.
REVOKE EXECUTE ON FUNCTION public.consume_ai_usage(uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.consume_ai_usage(uuid, integer) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.create_resume_with_quota(text, jsonb, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_resume_with_quota(text, jsonb, text, text, text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.ensure_free_billing_row(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ensure_free_billing_row(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_resume_quota() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_resume_quota() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE OR REPLACE FUNCTION public.touch_billing_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE OR REPLACE FUNCTION public.touch_resumes_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
