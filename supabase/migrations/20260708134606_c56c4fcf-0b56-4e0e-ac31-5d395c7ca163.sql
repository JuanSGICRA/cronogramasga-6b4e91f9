DROP POLICY IF EXISTS "Public can insert dashboard state" ON public.dashboard_state;
DROP POLICY IF EXISTS "Public can update dashboard state" ON public.dashboard_state;

REVOKE INSERT, UPDATE ON public.dashboard_state FROM anon;
GRANT INSERT, UPDATE ON public.dashboard_state TO authenticated;

CREATE POLICY "Authenticated users can insert dashboard state"
  ON public.dashboard_state FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update dashboard state"
  ON public.dashboard_state FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);