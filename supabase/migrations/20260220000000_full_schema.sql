-- Wellness Compass Full Schema Migration
-- Generated from Analysis Documentation

-- 1. Create Custom Types (Enums)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('PATIENT', 'DOCTOR', 'PHARMACIST', 'LAB_MANAGER', 'HOSPITAL_MANAGER', 'SYSTEM_ADMIN');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status') THEN
        CREATE TYPE account_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_ACTIVATION');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender') THEN
        CREATE TYPE gender AS ENUM ('MALE', 'FEMALE', 'OTHER');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
        CREATE TYPE document_type AS ENUM ('PRESCRIPTION', 'LAB_RESULT', 'MEDICAL_REPORT', 'X_RAY', 'OTHER');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status') THEN
        CREATE TYPE appointment_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELED', 'COMPLETED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('PENDING', 'PROCESSING', 'READY_FOR_PICKUP', 'DELIVERED', 'REJECTED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status') THEN
        CREATE TYPE request_status AS ENUM ('PENDING', 'COMPLETED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'system_request_type') THEN
        CREATE TYPE system_request_type AS ENUM ('LINK_DOCTOR_TO_HOSPITAL', 'UNLINK_DOCTOR_FROM_HOSPITAL');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'system_request_status') THEN
        CREATE TYPE system_request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_type') THEN
        CREATE TYPE content_type AS ENUM ('POST', 'COMMENT');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_status') THEN
        CREATE TYPE report_status AS ENUM ('PENDING', 'RESOLVED_DELETED', 'RESOLVED_IGNORED');
    END IF;
END $$;

-- 2. Core Tables
CREATE TABLE IF NOT EXISTS public.users (
    user_id UUID PRIMARY KEY DEFAULT auth.uid(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    password_hash TEXT,
    phone_number TEXT,
    profile_picture_url TEXT,
    role user_role NOT NULL,
    account_status account_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.patients (
    patient_id UUID PRIMARY KEY REFERENCES public.users(user_id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender gender NOT NULL,
    blood_type TEXT,
    address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.doctors (
    doctor_id UUID PRIMARY KEY REFERENCES public.users(user_id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    license_number TEXT UNIQUE NOT NULL,
    years_of_experience INTEGER CHECK (years_of_experience >= 0),
    qualification TEXT,
    bio TEXT,
    consultation_fee DECIMAL(10,2) CHECK (consultation_fee >= 0),
    average_rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pharmacists (
    pharmacist_id UUID PRIMARY KEY REFERENCES public.users(user_id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    license_number TEXT UNIQUE NOT NULL,
    years_of_experience INTEGER CHECK (years_of_experience >= 0),
    qualification TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hospitals (
    hospital_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    location_lat DECIMAL(9,6),
    location_lng DECIMAL(9,6),
    phone_number TEXT,
    email TEXT,
    website TEXT,
    description TEXT,
    emergency_numbers TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pharmacies (
    pharmacy_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone_number TEXT,
    email TEXT,
    license_number TEXT UNIQUE NOT NULL,
    operating_hours TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.laboratories (
    lab_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone_number TEXT,
    email TEXT,
    license_number TEXT UNIQUE NOT NULL,
    specializations TEXT,
    available_tests TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Medical Tables
CREATE TABLE IF NOT EXISTS public.appointments (
    appointment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctors(doctor_id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES public.hospitals(hospital_id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status appointment_status DEFAULT 'PENDING',
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.patient_documents (
    document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    document_type document_type NOT NULL,
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    description TEXT,
    extracted_text TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.prescriptions (
    prescription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    issuing_doctor_id UUID REFERENCES public.doctors(doctor_id) ON DELETE SET NULL,
    issue_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.prescribed_drugs (
    prescription_id UUID REFERENCES public.prescriptions(prescription_id) ON DELETE CASCADE,
    drug_name TEXT NOT NULL,
    dosage TEXT,
    instructions TEXT,
    PRIMARY KEY (prescription_id, drug_name)
);

CREATE TABLE IF NOT EXISTS public.medication_adherence (
    adherence_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    medication_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency_per_day INTEGER NOT NULL CHECK (frequency_per_day > 0),
    start_date DATE NOT NULL,
    end_date DATE,
    instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.medication_doses (
    dose_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adherence_id UUID REFERENCES public.medication_adherence(adherence_id) ON DELETE CASCADE,
    scheduled_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'PENDING', -- PENDING, TAKEN, SKIPPED
    taken_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS public.drug_orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    pharmacy_id UUID REFERENCES public.pharmacies(pharmacy_id) ON DELETE CASCADE,
    status order_status DEFAULT 'PENDING',
    total_price DECIMAL(10,2) CHECK (total_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lab_test_requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctors(doctor_id) ON DELETE SET NULL,
    lab_id UUID REFERENCES public.laboratories(lab_id) ON DELETE SET NULL,
    test_name TEXT NOT NULL,
    status request_status DEFAULT 'PENDING',
    result_file_url TEXT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ratings (
    rating_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    provider_user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
    stars INTEGER CHECK (stars >= 1 AND stars <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Community & Interaction
CREATE TABLE IF NOT EXISTS public.support_communities (
    community_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.posts (
    post_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID REFERENCES public.support_communities(community_id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.comments (
    comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(post_id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    reference_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.system_requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
    request_type system_request_type NOT NULL,
    status system_request_status DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.content_reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
    content_id UUID NOT NULL,
    content_type content_type NOT NULL,
    reason TEXT,
    status report_status DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Junction Tables
CREATE TABLE IF NOT EXISTS public.pharmacy_pharmacists (
    pharmacy_id UUID REFERENCES public.pharmacies(pharmacy_id) ON DELETE CASCADE,
    pharmacist_id UUID REFERENCES public.pharmacists(pharmacist_id) ON DELETE CASCADE,
    PRIMARY KEY (pharmacy_id, pharmacist_id)
);

CREATE TABLE IF NOT EXISTS public.hospital_doctors (
    hospital_id UUID REFERENCES public.hospitals(hospital_id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctors(doctor_id) ON DELETE CASCADE,
    PRIMARY KEY (hospital_id, doctor_id)
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laboratories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescribed_drugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_adherence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_doses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drug_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_test_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_pharmacists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_doctors ENABLE ROW LEVEL SECURITY;

-- 7. Basic RLS Policies
-- (These are basic policies, should be refined based on roles)
CREATE POLICY "Users can view their own data" ON public.users FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Patients can view their own profile" ON public.patients FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Doctors can view their own profile" ON public.doctors FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "Pharmacists can view their own profile" ON public.pharmacists FOR SELECT USING (auth.uid() = pharmacist_id);

-- (Add more policies as needed)
