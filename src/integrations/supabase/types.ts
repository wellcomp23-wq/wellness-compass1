export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_id: string
          appointment_time: string
          created_at: string | null
          doctor_id: string | null
          hospital_id: string | null
          notes: string | null
          patient_id: string | null
          reason: string | null
          status: Database["public"]["Enums"]["appointment_status"] | null
        }
        Insert: {
          appointment_date: string
          appointment_id?: string
          appointment_time: string
          created_at?: string | null
          doctor_id?: string | null
          hospital_id?: string | null
          notes?: string | null
          patient_id?: string | null
          reason?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
        }
        Update: {
          appointment_date?: string
          appointment_id?: string
          appointment_time?: string
          created_at?: string | null
          doctor_id?: string | null
          hospital_id?: string | null
          notes?: string | null
          patient_id?: string | null
          reason?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["doctor_id"]
          },
          {
            foreignKeyName: "appointments_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["hospital_id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string | null
          comment_id: string
          content: string
          created_at: string | null
          post_id: string | null
        }
        Insert: {
          author_id?: string | null
          comment_id?: string
          content: string
          created_at?: string | null
          post_id?: string | null
        }
        Update: {
          author_id?: string | null
          comment_id?: string
          content?: string
          created_at?: string | null
          post_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["post_id"]
          },
        ]
      }
      content_reports: {
        Row: {
          content_id: string
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string | null
          reason: string | null
          report_id: string
          reporter_user_id: string | null
          status: Database["public"]["Enums"]["report_status"] | null
        }
        Insert: {
          content_id: string
          content_type: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          reason?: string | null
          report_id?: string
          reporter_user_id?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
        }
        Update: {
          content_id?: string
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string | null
          reason?: string | null
          report_id?: string
          reporter_user_id?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "content_reports_reporter_user_id_fkey"
            columns: ["reporter_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      doctors: {
        Row: {
          average_rating: number | null
          bio: string | null
          consultation_fee: number | null
          created_at: string | null
          doctor_id: string
          first_name: string
          last_name: string
          license_number: string
          qualification: string | null
          specialization: string
          years_of_experience: number | null
        }
        Insert: {
          average_rating?: number | null
          bio?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          doctor_id: string
          first_name: string
          last_name: string
          license_number: string
          qualification?: string | null
          specialization: string
          years_of_experience?: number | null
        }
        Update: {
          average_rating?: number | null
          bio?: string | null
          consultation_fee?: number | null
          created_at?: string | null
          doctor_id?: string
          first_name?: string
          last_name?: string
          license_number?: string
          qualification?: string | null
          specialization?: string
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      drug_orders: {
        Row: {
          created_at: string | null
          order_id: string
          patient_id: string | null
          pharmacy_id: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          total_price: number | null
        }
        Insert: {
          created_at?: string | null
          order_id?: string
          patient_id?: string | null
          pharmacy_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_price?: number | null
        }
        Update: {
          created_at?: string | null
          order_id?: string
          patient_id?: string | null
          pharmacy_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "drug_orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "drug_orders_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["pharmacy_id"]
          },
        ]
      }
      hospital_doctors: {
        Row: {
          doctor_id: string
          hospital_id: string
        }
        Insert: {
          doctor_id: string
          hospital_id: string
        }
        Update: {
          doctor_id?: string
          hospital_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hospital_doctors_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["doctor_id"]
          },
          {
            foreignKeyName: "hospital_doctors_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["hospital_id"]
          },
        ]
      }
      hospitals: {
        Row: {
          address: string
          created_at: string | null
          description: string | null
          email: string | null
          emergency_numbers: string[] | null
          hospital_id: string
          location_lat: number | null
          location_lng: number | null
          name: string
          phone_number: string | null
          website: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          emergency_numbers?: string[] | null
          hospital_id?: string
          location_lat?: number | null
          location_lng?: number | null
          name: string
          phone_number?: string | null
          website?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          description?: string | null
          email?: string | null
          emergency_numbers?: string[] | null
          hospital_id?: string
          location_lat?: number | null
          location_lng?: number | null
          name?: string
          phone_number?: string | null
          website?: string | null
        }
        Relationships: []
      }
      lab_test_requests: {
        Row: {
          doctor_id: string | null
          lab_id: string | null
          patient_id: string | null
          request_id: string
          requested_at: string | null
          result_file_url: string | null
          status: Database["public"]["Enums"]["request_status"] | null
          test_name: string
        }
        Insert: {
          doctor_id?: string | null
          lab_id?: string | null
          patient_id?: string | null
          request_id?: string
          requested_at?: string | null
          result_file_url?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          test_name: string
        }
        Update: {
          doctor_id?: string | null
          lab_id?: string | null
          patient_id?: string | null
          request_id?: string
          requested_at?: string | null
          result_file_url?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          test_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_test_requests_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["doctor_id"]
          },
          {
            foreignKeyName: "lab_test_requests_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "laboratories"
            referencedColumns: ["lab_id"]
          },
          {
            foreignKeyName: "lab_test_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      laboratories: {
        Row: {
          address: string
          available_tests: string[] | null
          created_at: string | null
          email: string | null
          lab_id: string
          license_number: string
          name: string
          phone_number: string | null
          specializations: string | null
        }
        Insert: {
          address: string
          available_tests?: string[] | null
          created_at?: string | null
          email?: string | null
          lab_id?: string
          license_number: string
          name: string
          phone_number?: string | null
          specializations?: string | null
        }
        Update: {
          address?: string
          available_tests?: string[] | null
          created_at?: string | null
          email?: string | null
          lab_id?: string
          license_number?: string
          name?: string
          phone_number?: string | null
          specializations?: string | null
        }
        Relationships: []
      }
      medication_adherence: {
        Row: {
          adherence_id: string
          created_at: string | null
          dosage: string
          end_date: string | null
          frequency_per_day: number
          instructions: string | null
          is_active: boolean | null
          medication_name: string
          patient_id: string | null
          start_date: string
        }
        Insert: {
          adherence_id?: string
          created_at?: string | null
          dosage: string
          end_date?: string | null
          frequency_per_day: number
          instructions?: string | null
          is_active?: boolean | null
          medication_name: string
          patient_id?: string | null
          start_date: string
        }
        Update: {
          adherence_id?: string
          created_at?: string | null
          dosage?: string
          end_date?: string | null
          frequency_per_day?: number
          instructions?: string | null
          is_active?: boolean | null
          medication_name?: string
          patient_id?: string | null
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_adherence_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      medication_doses: {
        Row: {
          adherence_id: string | null
          dose_id: string
          notes: string | null
          scheduled_datetime: string
          status: string | null
          taken_at: string | null
        }
        Insert: {
          adherence_id?: string | null
          dose_id?: string
          notes?: string | null
          scheduled_datetime: string
          status?: string | null
          taken_at?: string | null
        }
        Update: {
          adherence_id?: string | null
          dose_id?: string
          notes?: string | null
          scheduled_datetime?: string
          status?: string | null
          taken_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medication_doses_adherence_id_fkey"
            columns: ["adherence_id"]
            isOneToOne: false
            referencedRelation: "medication_adherence"
            referencedColumns: ["adherence_id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          is_read: boolean | null
          notification_id: string
          recipient_user_id: string | null
          reference_url: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          is_read?: boolean | null
          notification_id?: string
          recipient_user_id?: string | null
          reference_url?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          is_read?: boolean | null
          notification_id?: string
          recipient_user_id?: string | null
          reference_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      otp_attempts: {
        Row: {
          attempt_type: string
          created_at: string | null
          error_message: string | null
          id: string
          ip_address: string | null
          phone_number: string
          status: string
          updated_at: string | null
        }
        Insert: {
          attempt_type: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          phone_number: string
          status: string
          updated_at?: string | null
        }
        Update: {
          attempt_type?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          phone_number?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      otp_verifications: {
        Row: {
          attempts_count: number | null
          created_at: string | null
          expires_at: string | null
          id: string
          max_attempts: number | null
          phone_number: string
          twilio_sid: string | null
          updated_at: string | null
          verification_status: string
          verified_at: string | null
        }
        Insert: {
          attempts_count?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          max_attempts?: number | null
          phone_number: string
          twilio_sid?: string | null
          updated_at?: string | null
          verification_status: string
          verified_at?: string | null
        }
        Update: {
          attempts_count?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          max_attempts?: number | null
          phone_number?: string
          twilio_sid?: string | null
          updated_at?: string | null
          verification_status?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      patient_documents: {
        Row: {
          description: string | null
          document_id: string
          document_type: Database["public"]["Enums"]["document_type"]
          extracted_text: string | null
          file_url: string
          patient_id: string | null
          title: string
          uploaded_at: string | null
        }
        Insert: {
          description?: string | null
          document_id?: string
          document_type: Database["public"]["Enums"]["document_type"]
          extracted_text?: string | null
          file_url: string
          patient_id?: string | null
          title: string
          uploaded_at?: string | null
        }
        Update: {
          description?: string | null
          document_id?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          extracted_text?: string | null
          file_url?: string
          patient_id?: string | null
          title?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          blood_type: string | null
          created_at: string | null
          date_of_birth: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string
          gender: Database["public"]["Enums"]["gender"]
          last_name: string
          patient_id: string
        }
        Insert: {
          address?: string | null
          blood_type?: string | null
          created_at?: string | null
          date_of_birth: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name: string
          gender: Database["public"]["Enums"]["gender"]
          last_name: string
          patient_id: string
        }
        Update: {
          address?: string | null
          blood_type?: string | null
          created_at?: string | null
          date_of_birth?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string
          gender?: Database["public"]["Enums"]["gender"]
          last_name?: string
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      pharmacies: {
        Row: {
          address: string
          created_at: string | null
          email: string | null
          license_number: string
          name: string
          operating_hours: string | null
          pharmacy_id: string
          phone_number: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          email?: string | null
          license_number: string
          name: string
          operating_hours?: string | null
          pharmacy_id?: string
          phone_number?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          email?: string | null
          license_number?: string
          name?: string
          operating_hours?: string | null
          pharmacy_id?: string
          phone_number?: string | null
        }
        Relationships: []
      }
      pharmacists: {
        Row: {
          created_at: string | null
          first_name: string
          last_name: string
          license_number: string
          pharmacist_id: string
          qualification: string | null
          years_of_experience: number | null
        }
        Insert: {
          created_at?: string | null
          first_name: string
          last_name: string
          license_number: string
          pharmacist_id: string
          qualification?: string | null
          years_of_experience?: number | null
        }
        Update: {
          created_at?: string | null
          first_name?: string
          last_name?: string
          license_number?: string
          pharmacist_id?: string
          qualification?: string | null
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pharmacists_pharmacist_id_fkey"
            columns: ["pharmacist_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      pharmacy_pharmacists: {
        Row: {
          pharmacist_id: string
          pharmacy_id: string
        }
        Insert: {
          pharmacist_id: string
          pharmacy_id: string
        }
        Update: {
          pharmacist_id?: string
          pharmacy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_pharmacists_pharmacist_id_fkey"
            columns: ["pharmacist_id"]
            isOneToOne: false
            referencedRelation: "pharmacists"
            referencedColumns: ["pharmacist_id"]
          },
          {
            foreignKeyName: "pharmacy_pharmacists_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["pharmacy_id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string | null
          community_id: string | null
          content: string
          created_at: string | null
          is_anonymous: boolean | null
          post_id: string
        }
        Insert: {
          author_id?: string | null
          community_id?: string | null
          content: string
          created_at?: string | null
          is_anonymous?: boolean | null
          post_id?: string
        }
        Update: {
          author_id?: string | null
          community_id?: string | null
          content?: string
          created_at?: string | null
          is_anonymous?: boolean | null
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "support_communities"
            referencedColumns: ["community_id"]
          },
        ]
      }
      prescribed_drugs: {
        Row: {
          dosage: string | null
          drug_name: string
          instructions: string | null
          prescription_id: string
        }
        Insert: {
          dosage?: string | null
          drug_name: string
          instructions?: string | null
          prescription_id: string
        }
        Update: {
          dosage?: string | null
          drug_name?: string
          instructions?: string | null
          prescription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescribed_drugs_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["prescription_id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          created_at: string | null
          issue_date: string | null
          issuing_doctor_id: string | null
          notes: string | null
          patient_id: string | null
          prescription_id: string
        }
        Insert: {
          created_at?: string | null
          issue_date?: string | null
          issuing_doctor_id?: string | null
          notes?: string | null
          patient_id?: string | null
          prescription_id?: string
        }
        Update: {
          created_at?: string | null
          issue_date?: string | null
          issuing_doctor_id?: string | null
          notes?: string | null
          patient_id?: string | null
          prescription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_issuing_doctor_id_fkey"
            columns: ["issuing_doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["doctor_id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      provider_applications: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          document_url: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          phone: string
          role_requested: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["provider_status"] | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          document_url?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          phone: string
          role_requested: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["provider_status"] | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          document_url?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          role_requested?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["provider_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          patient_id: string | null
          provider_user_id: string | null
          rating_id: string
          sentiment_score: number | null
          stars: number | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          patient_id?: string | null
          provider_user_id?: string | null
          rating_id?: string
          sentiment_score?: number | null
          stars?: number | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          patient_id?: string | null
          provider_user_id?: string | null
          rating_id?: string
          sentiment_score?: number | null
          stars?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ratings_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["patient_id"]
          },
          {
            foreignKeyName: "ratings_provider_user_id_fkey"
            columns: ["provider_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      support_communities: {
        Row: {
          community_id: string
          created_at: string | null
          description: string | null
          name: string
        }
        Insert: {
          community_id?: string
          created_at?: string | null
          description?: string | null
          name: string
        }
        Update: {
          community_id?: string
          created_at?: string | null
          description?: string | null
          name?: string
        }
        Relationships: []
      }
      symptom_check_history: {
        Row: {
          ai_analysis: string | null
          created_at: string | null
          id: string
          patient_id: string | null
          recommendations: string | null
          suggested_specialty: string | null
          symptoms: string
        }
        Insert: {
          ai_analysis?: string | null
          created_at?: string | null
          id?: string
          patient_id?: string | null
          recommendations?: string | null
          suggested_specialty?: string | null
          symptoms: string
        }
        Update: {
          ai_analysis?: string | null
          created_at?: string | null
          id?: string
          patient_id?: string | null
          recommendations?: string | null
          suggested_specialty?: string | null
          symptoms?: string
        }
        Relationships: [
          {
            foreignKeyName: "symptom_check_history_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["patient_id"]
          },
        ]
      }
      system_requests: {
        Row: {
          created_at: string | null
          notes: string | null
          request_id: string
          request_type: Database["public"]["Enums"]["system_request_type"]
          requester_user_id: string | null
          status: Database["public"]["Enums"]["system_request_status"] | null
        }
        Insert: {
          created_at?: string | null
          notes?: string | null
          request_id?: string
          request_type: Database["public"]["Enums"]["system_request_type"]
          requester_user_id?: string | null
          status?: Database["public"]["Enums"]["system_request_status"] | null
        }
        Update: {
          created_at?: string | null
          notes?: string | null
          request_id?: string
          request_type?: Database["public"]["Enums"]["system_request_type"]
          requester_user_id?: string | null
          status?: Database["public"]["Enums"]["system_request_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "system_requests_requester_user_id_fkey"
            columns: ["requester_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status"]
          created_at: string | null
          email: string
          is_verified: boolean | null
          password_hash: string | null
          phone_number: string | null
          profile_picture_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          account_status?: Database["public"]["Enums"]["account_status"]
          created_at?: string | null
          email: string
          is_verified?: boolean | null
          password_hash?: string | null
          phone_number?: string | null
          profile_picture_url?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string
          username?: string | null
        }
        Update: {
          account_status?: Database["public"]["Enums"]["account_status"]
          created_at?: string | null
          email?: string
          is_verified?: boolean | null
          password_hash?: string | null
          phone_number?: string | null
          profile_picture_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_otp_rate_limit: {
        Args: { p_ip_address?: string; p_phone_number: string }
        Returns: {
          blocked_until: string
          is_blocked: boolean
          remaining_attempts: number
        }[]
      }
      cleanup_expired_otps: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      account_status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING_ACTIVATION"
      app_role: "patient" | "doctor" | "pharmacy" | "lab" | "hospital" | "admin"
      appointment_status: "PENDING" | "CONFIRMED" | "CANCELED" | "COMPLETED"
      content_type: "POST" | "COMMENT"
      document_type:
        | "PRESCRIPTION"
        | "LAB_RESULT"
        | "MEDICAL_REPORT"
        | "X_RAY"
        | "OTHER"
      gender: "MALE" | "FEMALE" | "OTHER"
      order_status:
        | "PENDING"
        | "PROCESSING"
        | "READY_FOR_PICKUP"
        | "DELIVERED"
        | "REJECTED"
      provider_status: "PENDING" | "APPROVED" | "REJECTED"
      report_status: "PENDING" | "RESOLVED_DELETED" | "RESOLVED_IGNORED"
      request_status: "PENDING" | "COMPLETED"
      system_request_status: "PENDING" | "APPROVED" | "REJECTED"
      system_request_type:
        | "LINK_DOCTOR_TO_HOSPITAL"
        | "UNLINK_DOCTOR_FROM_HOSPITAL"
      user_role:
        | "PATIENT"
        | "DOCTOR"
        | "PHARMACIST"
        | "LAB_MANAGER"
        | "HOSPITAL_MANAGER"
        | "SYSTEM_ADMIN"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_status: ["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING_ACTIVATION"],
      app_role: ["patient", "doctor", "pharmacy", "lab", "hospital", "admin"],
      appointment_status: ["PENDING", "CONFIRMED", "CANCELED", "COMPLETED"],
      content_type: ["POST", "COMMENT"],
      document_type: [
        "PRESCRIPTION",
        "LAB_RESULT",
        "MEDICAL_REPORT",
        "X_RAY",
        "OTHER",
      ],
      gender: ["MALE", "FEMALE", "OTHER"],
      order_status: [
        "PENDING",
        "PROCESSING",
        "READY_FOR_PICKUP",
        "DELIVERED",
        "REJECTED",
      ],
      provider_status: ["PENDING", "APPROVED", "REJECTED"],
      report_status: ["PENDING", "RESOLVED_DELETED", "RESOLVED_IGNORED"],
      request_status: ["PENDING", "COMPLETED"],
      system_request_status: ["PENDING", "APPROVED", "REJECTED"],
      system_request_type: [
        "LINK_DOCTOR_TO_HOSPITAL",
        "UNLINK_DOCTOR_FROM_HOSPITAL",
      ],
      user_role: [
        "PATIENT",
        "DOCTOR",
        "PHARMACIST",
        "LAB_MANAGER",
        "HOSPITAL_MANAGER",
        "SYSTEM_ADMIN",
      ],
    },
  },
} as const
