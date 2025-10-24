-- Create role enum
CREATE TYPE public.user_role AS ENUM ('student', 'school_admin', 'education_officer');

-- Create app status enum
CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected', 'completed');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role public.user_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create students table
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  university TEXT NOT NULL,
  student_id TEXT NOT NULL,
  course TEXT NOT NULL,
  year_of_study INTEGER NOT NULL,
  skills TEXT[],
  kuccps_verified BOOLEAN DEFAULT false,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create schools table
CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  school_name TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  contact_person TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create education officers table
CREATE TABLE public.education_officers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  office_name TEXT NOT NULL,
  region TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create school postings table
CREATE TABLE public.school_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  subject_area TEXT NOT NULL,
  required_skills TEXT[],
  duration_weeks INTEGER NOT NULL,
  stipend_amount DECIMAL(10, 2),
  start_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  posting_id UUID NOT NULL REFERENCES public.school_postings(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  status public.application_status NOT NULL DEFAULT 'pending',
  cover_letter TEXT,
  officer_approved BOOLEAN DEFAULT false,
  officer_id UUID REFERENCES public.education_officers(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Students policies
CREATE POLICY "Anyone can view student profiles"
  ON public.students FOR SELECT
  USING (true);

CREATE POLICY "Students can update their own profile"
  ON public.students FOR UPDATE
  USING (user_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Students can insert their own profile"
  ON public.students FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));

-- Schools policies
CREATE POLICY "Anyone can view school profiles"
  ON public.schools FOR SELECT
  USING (true);

CREATE POLICY "Schools can update their own profile"
  ON public.schools FOR UPDATE
  USING (user_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Schools can insert their own profile"
  ON public.schools FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));

-- Education officers policies
CREATE POLICY "Anyone can view education officers"
  ON public.education_officers FOR SELECT
  USING (true);

CREATE POLICY "Officers can update their own profile"
  ON public.education_officers FOR UPDATE
  USING (user_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Officers can insert their own profile"
  ON public.education_officers FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));

-- School postings policies
CREATE POLICY "Anyone can view open postings"
  ON public.school_postings FOR SELECT
  USING (true);

CREATE POLICY "Schools can create postings"
  ON public.school_postings FOR INSERT
  WITH CHECK (school_id IN (SELECT id FROM public.schools WHERE user_id = auth.uid()));

CREATE POLICY "Schools can update their own postings"
  ON public.school_postings FOR UPDATE
  USING (school_id IN (SELECT id FROM public.schools WHERE user_id = auth.uid()));

CREATE POLICY "Schools can delete their own postings"
  ON public.school_postings FOR DELETE
  USING (school_id IN (SELECT id FROM public.schools WHERE user_id = auth.uid()));

-- Applications policies
CREATE POLICY "Students can view their own applications"
  ON public.applications FOR SELECT
  USING (
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
    OR posting_id IN (SELECT id FROM public.school_postings WHERE school_id IN (SELECT id FROM public.schools WHERE user_id = auth.uid()))
    OR auth.uid() IN (SELECT user_id FROM public.education_officers)
  );

CREATE POLICY "Students can create applications"
  ON public.applications FOR INSERT
  WITH CHECK (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

CREATE POLICY "Students can update their own applications"
  ON public.applications FOR UPDATE
  USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));

CREATE POLICY "Schools can update applications to their postings"
  ON public.applications FOR UPDATE
  USING (posting_id IN (SELECT id FROM public.school_postings WHERE school_id IN (SELECT id FROM public.schools WHERE user_id = auth.uid())));

CREATE POLICY "Officers can update all applications"
  ON public.applications FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM public.education_officers));

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'student')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_school_postings
  BEFORE UPDATE ON public.school_postings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_applications
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;