-- إضافة جدول الإشعارات
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('appointment', 'medication', 'lab_result', 'system', 'general')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- إضافة جدول طلبات الفحوصات
CREATE TABLE IF NOT EXISTS public.lab_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  lab_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  test_types TEXT[] NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'rejected')),
  result_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- تفعيل RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_requests ENABLE ROW LEVEL SECURITY;

-- سياسات RLS للإشعارات
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- سياسات RLS لطلبات الفحوصات
CREATE POLICY "Patients can view their lab requests"
  ON public.lab_requests FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() = doctor_id OR auth.uid() = lab_id);

CREATE POLICY "Doctors can create lab requests"
  ON public.lab_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('doctor', 'hospital')
    )
  );

CREATE POLICY "Labs can update lab requests"
  ON public.lab_requests FOR UPDATE
  USING (
    auth.uid() = lab_id OR 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'lab'
    )
  );

-- Trigger لتحديث updated_at
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lab_requests_updated_at
  BEFORE UPDATE ON public.lab_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();