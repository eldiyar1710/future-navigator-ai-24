
-- 1. Enum для ролей
CREATE TYPE public.app_role AS ENUM ('student', 'consultant', 'admin');

-- 2. Таблица ролей
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Security definer функция для проверки ролей
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS для user_roles
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 4. Профили
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  middle_name TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'UTC',
  avatar_url TEXT,
  is_identity_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can read all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Consultants can read assigned profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'consultant'));

-- 5. Портрет студента
CREATE TABLE public.student_portraits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  gpa NUMERIC(4,2),
  ielts_score NUMERIC(3,1),
  toefl_score INTEGER,
  education_level TEXT,
  interests TEXT[],
  skills TEXT[],
  preferred_countries TEXT[],
  budget_preference TEXT,
  meta JSONB DEFAULT '{}',
  consultant_id UUID,
  status TEXT NOT NULL DEFAULT 'NEW',
  ai_roadmap JSONB,
  generation_count INTEGER NOT NULL DEFAULT 0,
  consultation_balance INTEGER NOT NULL DEFAULT 0,
  needs_attention BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.student_portraits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read own portrait" ON public.student_portraits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can update own portrait" ON public.student_portraits
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Students can insert own portrait" ON public.student_portraits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Consultants can read assigned portraits" ON public.student_portraits
  FOR SELECT USING (public.has_role(auth.uid(), 'consultant'));
CREATE POLICY "Consultants can update assigned portraits" ON public.student_portraits
  FOR UPDATE USING (public.has_role(auth.uid(), 'consultant') AND consultant_id = auth.uid());
CREATE POLICY "Admins can manage all portraits" ON public.student_portraits
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 6. Справочник вузов (только Admin добавляет)
CREATE TABLE public.organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  ranking INTEGER,
  tuition_min NUMERIC(10,2),
  tuition_max NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active organisations" ON public.organisations
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage organisations" ON public.organisations
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 7. Программы вузов
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  degree_level TEXT NOT NULL,
  language TEXT DEFAULT 'English',
  duration_months INTEGER,
  tuition NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  intake TEXT,
  deadline TIMESTAMPTZ,
  requirements JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active programs" ON public.programs
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage programs" ON public.programs
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 8. Целевые программы студента
CREATE TABLE public.target_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  application_status TEXT NOT NULL DEFAULT 'PLANNING',
  deadline TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.target_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read own targets" ON public.target_programs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Students can insert own targets" ON public.target_programs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Consultants can manage assigned targets" ON public.target_programs
  FOR ALL USING (public.has_role(auth.uid(), 'consultant'));
CREATE POLICY "Admins can manage all targets" ON public.target_programs
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 9. Аудит лог
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit log" ON public.audit_log
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert audit log" ON public.audit_log
  FOR INSERT WITH CHECK (true);

-- 10. Триггер для auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, timezone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'first_name', ''), COALESCE(NEW.raw_user_meta_data->>'timezone', 'UTC'));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  INSERT INTO public.student_portraits (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. Триггер обновления updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_student_portraits_updated_at BEFORE UPDATE ON public.student_portraits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_target_programs_updated_at BEFORE UPDATE ON public.target_programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
