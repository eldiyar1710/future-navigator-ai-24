
-- Documents table with version control
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  parent_id UUID REFERENCES public.documents(id),
  status TEXT NOT NULL DEFAULT 'DRAFT',
  reviewer_id UUID,
  reviewer_notes TEXT,
  document_type TEXT,
  target_program_id UUID REFERENCES public.target_programs(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Students can read own documents
CREATE POLICY "Students can read own documents"
ON public.documents FOR SELECT
USING (auth.uid() = user_id);

-- Students can insert own documents
CREATE POLICY "Students can insert own documents"
ON public.documents FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Students can update own documents (only DRAFT status)
CREATE POLICY "Students can update own draft documents"
ON public.documents FOR UPDATE
USING (auth.uid() = user_id AND status = 'DRAFT');

-- Consultants can read documents of assigned students
CREATE POLICY "Consultants can read assigned documents"
ON public.documents FOR SELECT
USING (
  has_role(auth.uid(), 'consultant') AND
  EXISTS (
    SELECT 1 FROM public.student_portraits sp
    WHERE sp.user_id = documents.user_id AND sp.consultant_id = auth.uid()
  )
);

-- Consultants can update document status (review)
CREATE POLICY "Consultants can review documents"
ON public.documents FOR UPDATE
USING (
  has_role(auth.uid(), 'consultant') AND
  EXISTS (
    SELECT 1 FROM public.student_portraits sp
    WHERE sp.user_id = documents.user_id AND sp.consultant_id = auth.uid()
  )
);

-- Admins full access
CREATE POLICY "Admins can manage all documents"
ON public.documents FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_parent_id ON public.documents(parent_id);
CREATE INDEX idx_documents_target_program_id ON public.documents(target_program_id);

-- Storage bucket for student documents (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-documents', 'student-documents', false);

-- Storage RLS: students can upload to their own folder
CREATE POLICY "Students can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'student-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Students can read own files
CREATE POLICY "Students can read own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'student-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Consultants can read assigned student files
CREATE POLICY "Consultants can read assigned student files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'student-documents' AND
  has_role(auth.uid(), 'consultant') AND
  EXISTS (
    SELECT 1 FROM public.student_portraits sp
    WHERE sp.user_id::text = (storage.foldername(name))[1] AND sp.consultant_id = auth.uid()
  )
);

-- Admins can read all files
CREATE POLICY "Admins can read all student files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'student-documents' AND
  has_role(auth.uid(), 'admin')
);

-- Enable realtime for documents
ALTER PUBLICATION supabase_realtime ADD TABLE public.documents;
