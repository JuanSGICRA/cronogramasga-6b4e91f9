DROP POLICY IF EXISTS "Public can read dashboard state" ON public.dashboard_state;

CREATE POLICY "Authenticated users can read dashboard state"
  ON public.dashboard_state FOR SELECT
  TO authenticated
  USING (true);
