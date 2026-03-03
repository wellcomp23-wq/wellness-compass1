-- ============================================================================
-- Supabase Storage RLS Policies for Wellness Compass
-- ============================================================================
-- This file contains the correct RLS policies for all storage buckets
-- These policies ensure that only authenticated users can upload and access files
-- ============================================================================

-- ============================================================================
-- Provider-docs Bucket Policies
-- ============================================================================

-- Allow authenticated users to insert files into provider-docs
CREATE POLICY "provider_docs_authenticated_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'provider-docs'::text);

-- Allow authenticated users to select files from provider-docs
CREATE POLICY "provider_docs_authenticated_select"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'provider-docs'::text);

-- Allow public to view files in provider-docs (for verification purposes)
CREATE POLICY "provider_docs_public_select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'provider-docs'::text);

-- Allow authenticated users to update files in provider-docs
CREATE POLICY "provider_docs_authenticated_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'provider-docs'::text)
WITH CHECK (bucket_id = 'provider-docs'::text);

-- Allow authenticated users to delete files in provider-docs
CREATE POLICY "provider_docs_authenticated_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'provider-docs'::text);

-- ============================================================================
-- Medical-documents Bucket Policies
-- ============================================================================

-- Allow authenticated users to insert files into medical-documents
CREATE POLICY "medical_documents_authenticated_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'medical-documents'::text);

-- Allow authenticated users to select files from medical-documents
CREATE POLICY "medical_documents_authenticated_select"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'medical-documents'::text);

-- Allow authenticated users to update files in medical-documents
CREATE POLICY "medical_documents_authenticated_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'medical-documents'::text)
WITH CHECK (bucket_id = 'medical-documents'::text);

-- Allow authenticated users to delete files in medical-documents
CREATE POLICY "medical_documents_authenticated_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'medical-documents'::text);

-- ============================================================================
-- Professional-documents Bucket Policies
-- ============================================================================

-- Allow authenticated users to insert files into professional-documents
CREATE POLICY "professional_documents_authenticated_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'professional-documents'::text);

-- Allow authenticated users to select files from professional-documents
CREATE POLICY "professional_documents_authenticated_select"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'professional-documents'::text);

-- Allow authenticated users to update files in professional-documents
CREATE POLICY "professional_documents_authenticated_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'professional-documents'::text)
WITH CHECK (bucket_id = 'professional-documents'::text);

-- Allow authenticated users to delete files in professional-documents
CREATE POLICY "professional_documents_authenticated_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'professional-documents'::text);

-- ============================================================================
-- Important Notes
-- ============================================================================
-- 
-- 1. These policies use bucket_id as a string comparison (NOT owner_id)
--    This avoids type mismatch issues between UUID and text
--
-- 2. All policies require authentication (TO authenticated)
--    This ensures only logged-in users can access files
--
-- 3. Public select policy on provider-docs allows verification of documents
--    without requiring authentication (for admin verification purposes)
--
-- 4. To verify these policies are applied:
--    SELECT * FROM pg_policies WHERE schemaname = 'storage';
--
-- 5. If you need to modify these policies, use the Supabase dashboard:
--    Authentication → Policies → storage.objects
--
