
CREATE TABLE public.dashboard_state (
  id text PRIMARY KEY DEFAULT 'global',
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dashboard_state TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dashboard_state TO authenticated;
GRANT ALL ON public.dashboard_state TO service_role;

ALTER TABLE public.dashboard_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read dashboard state"
  ON public.dashboard_state FOR SELECT
  USING (true);

CREATE POLICY "Public can insert dashboard state"
  ON public.dashboard_state FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update dashboard state"
  ON public.dashboard_state FOR UPDATE
  USING (true) WITH CHECK (true);

INSERT INTO public.dashboard_state (id, state) VALUES ('global', '{}'::jsonb)
  ON CONFLICT (id) DO NOTHING;

ALTER PUBLICATION supabase_realtime ADD TABLE public.dashboard_state;
