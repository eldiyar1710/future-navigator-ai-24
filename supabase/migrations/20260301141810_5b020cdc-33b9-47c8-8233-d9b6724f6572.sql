
-- Invitations table for consultant onboarding
CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role app_role NOT NULL DEFAULT 'consultant',
  token text NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by uuid NOT NULL,
  accepted_at timestamp with time zone,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(email, role)
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invitations"
  ON public.invitations FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can read own invitation by email"
  ON public.invitations FOR SELECT
  TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Events table for O2O lead generation
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  location text,
  promo_code text UNIQUE,
  custom_questions jsonb DEFAULT '[]'::jsonb,
  event_date timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consultants can manage own events"
  ON public.events FOR ALL
  TO authenticated
  USING (consultant_id = auth.uid() AND public.has_role(auth.uid(), 'consultant'));

CREATE POLICY "Admins can manage all events"
  ON public.events FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can read active events"
  ON public.events FOR SELECT
  USING (is_active = true);

-- Event registrations table for lead capture
CREATE TABLE public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text,
  email text NOT NULL,
  phone text,
  answers jsonb DEFAULT '{}'::jsonb,
  user_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consultants can read own event registrations"
  ON public.event_registrations FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.events e
    WHERE e.id = event_registrations.event_id
    AND e.consultant_id = auth.uid()
  ));

CREATE POLICY "Admins can read all registrations"
  ON public.event_registrations FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can register for events"
  ON public.event_registrations FOR INSERT
  WITH CHECK (true);

-- Trigger for events updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function: process invitation on user signup
CREATE OR REPLACE FUNCTION public.process_invitation()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  -- Check if there's a pending invitation for this email
  IF EXISTS (
    SELECT 1 FROM public.invitations
    WHERE email = NEW.email
    AND accepted_at IS NULL
    AND expires_at > now()
  ) THEN
    -- Add the invited role
    INSERT INTO public.user_roles (user_id, role)
    SELECT NEW.id, i.role
    FROM public.invitations i
    WHERE i.email = NEW.email
    AND i.accepted_at IS NULL
    AND i.expires_at > now()
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Mark invitation as accepted
    UPDATE public.invitations
    SET accepted_at = now()
    WHERE email = NEW.email
    AND accepted_at IS NULL;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger: run after new user creation
CREATE TRIGGER on_auth_user_created_process_invite
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.process_invitation();

-- Function: assign event lead when registration user_id is set
CREATE OR REPLACE FUNCTION public.assign_event_lead()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  v_consultant_id uuid;
BEGIN
  -- Get the consultant who owns this event
  SELECT consultant_id INTO v_consultant_id
  FROM public.events
  WHERE id = NEW.event_id;

  -- If user_id is provided, assign to consultant as HOT_LEAD
  IF NEW.user_id IS NOT NULL AND v_consultant_id IS NOT NULL THEN
    UPDATE public.student_portraits
    SET consultant_id = v_consultant_id,
        status = 'HOT_LEAD',
        needs_attention = false,
        updated_at = now()
    WHERE user_id = NEW.user_id
    AND consultant_id IS NULL;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_event_registration_assign_lead
  AFTER INSERT ON public.event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_event_lead();
