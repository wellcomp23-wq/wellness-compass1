-- Enhance medication_adherence table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='medication_adherence' AND column_name='medication_type') THEN
        ALTER TABLE public.medication_adherence ADD COLUMN medication_type TEXT DEFAULT 'PILL'; -- PILL, SYRUP, INJECTION, etc.
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='medication_adherence' AND column_name='image_url') THEN
        ALTER TABLE public.medication_adherence ADD COLUMN image_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='medication_adherence' AND column_name='reminder_times') THEN
        ALTER TABLE public.medication_adherence ADD COLUMN reminder_times TEXT[]; -- Array of times like ['08:00', '20:00']
    END IF;
END $$;

-- Ensure RLS is enabled and policies exist
ALTER TABLE public.medication_adherence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_doses ENABLE ROW LEVEL SECURITY;

-- Policies for medication_adherence
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'medication_adherence' AND policyname = 'Patients can manage their own medications') THEN
        CREATE POLICY "Patients can manage their own medications" ON public.medication_adherence
            FOR ALL USING (auth.uid() = patient_id);
    END IF;
END $$;

-- Policies for medication_doses
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'medication_doses' AND policyname = 'Patients can manage their own doses') THEN
        CREATE POLICY "Patients can manage their own doses" ON public.medication_doses
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.medication_adherence 
                    WHERE medication_adherence.adherence_id = medication_doses.adherence_id 
                    AND medication_adherence.patient_id = auth.uid()
                )
            );
    END IF;
END $$;
