
-- Fix: restrict audit_log inserts to authenticated users only
DROP POLICY "System can insert audit log" ON public.audit_log;
CREATE POLICY "Authenticated users can insert audit log" ON public.audit_log
  FOR INSERT TO authenticated WITH CHECK (true);
