-- Wellness Compass Initial Schema Migration
-- Based on reference documentation and frontend requirements

-- 1. Create Custom Types (Enums)
CREATE TYPE user_role AS ENUM ('PATIENT', 'DOCTOR', 'PHARMACIST', 'ADMIN', 'LAB', 'HOSPITAL');
CREATE TYPE account_status AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');
CREATE TYPE gender AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE blood_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE appointment_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
CREATE TYPE order_status AS ENUM ('PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED');
CREATE TYPE lab_request_status AS ENUM ('PENDING', 'COLLECTED', 'PROCESSING', 'COMPLETED', 'CANCELLED');
CREATE TYPE request_type AS ENUM ('ROLE_UPGRADE', 'DATA_CORRECTION', 'ACCOUNT_DELETION');
CREATE TYPE system_request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE content_type AS ENUM ('POST', 'COMMENT');
CREATE TYPE report_status AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED');

-- 2. Core Tables
CREATE TABLE IF NOT EXISTS public.users (
    user_id UUID PRIMARY KEY DEFAULT auth.uid(),
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'PATIENT',
    status account_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.patients (
    patient_id UUID PRIMARY KEY REFERENCES public.users(user_id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    birth_date DATE,
    gender gender,
    blood_type blood_type,
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    address TEXT,
    emergency_contact TEXT,
    emergency_phone TEXT,
    chronic_diseases TEXT[],
    allergies TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.doctors (
    doctor_id UUID PRIMARY KEY REFERENCES public.users(user_id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    license_number TEXT UNIQUE NOT NULL,
    bio TEXT,
    clinic_address TEXT,
    consultation_fee DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pharmacists (
    pharmacist_id UUID PRIMARY KEY REFERENCES public.users(user_id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    license_number TEXT UNIQUE NOT NULL,
    work_location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hospitals (
    hospital_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pharmacies (
    pharmacy_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.laboratories (
    lab_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Medical Tables
CREATE TABLE IF NOT EXISTS public.medical_records (
    record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctors(doctor_id) ON DELETE SET NULL,
    diagnosis TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.prescriptions (
    prescription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctors(doctor_id) ON DELETE SET NULL,
    issue_date DATE DEFAULT CURRENT_DATE,
    status order_status DEFAULT 'PENDING',
    qr_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.prescribed_drugs (
    prescription_id UUID REFERENCES public.prescriptions(prescription_id) ON DELETE CASCADE,
    drug_name TEXT NOT NULL,
    dosage TEXT,
    instructions TEXT,
    PRIMARY KEY (prescription_id, drug_name)
);

CREATE TABLE IF NOT EXISTS public.appointments (
    appointment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctors(doctor_id) ON DELETE CASCADE,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status appointment_status DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lab_requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.doctors(doctor_id) ON DELETE SET NULL,
    lab_id UUID REFERENCES public.laboratories(lab_id) ON DELETE SET NULL,
    status lab_request_status DEFAULT 'PENDING',
    result_file_url TEXT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Community & Interaction
CREATE TABLE IF NOT EXISTS public.support_communities (
    community_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.community_members (
    community_id UUID REFERENCES public.support_communities(community_id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    join_date DATE DEFAULT CURRENT_DATE,
    PRIMARY KEY (community_id, patient_id)
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

CREATE TABLE IF NOT EXISTS public.post_likes (
    post_id UUID REFERENCES public.posts(post_id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.ratings (
    rating_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    provider_user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
    stars INTEGER CHECK (stars >= 1 AND stars <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. System Management
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
    request_type request_type NOT NULL,
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

-- 6. Junction Tables
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

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacists ENABLE ROW LEVEL SECURITY;
-- (Add more RLS policies as needed in Phase 2)
