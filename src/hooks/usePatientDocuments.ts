import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Tables, TablesInsert } from '@/integrations/supabase/types'

type PatientDocument = Tables<'patient_documents'>
type DocumentInsert = TablesInsert<'patient_documents'>

export function usePatientDocuments(patientId?: string) {
  const [documents, setDocuments] = useState<PatientDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (patientId) {
      fetchDocuments()
    }
  }, [patientId])

  const fetchDocuments = async () => {
    if (!patientId) return

    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('patient_documents')
        .select('*')
        .eq('patient_id', patientId)
        .order('uploaded_at', { ascending: false })

      if (err) throw err
      setDocuments(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في جلب المستندات')
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  const uploadDocument = async (document: DocumentInsert, file?: File) => {
    try {
      let fileUrl = document.file_url

      // إذا كان هناك ملف، قم برفعه إلى Storage
      if (file && patientId) {
        const fileName = `${patientId}/${Date.now()}_${file.name}`
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('patient-documents')
          .upload(fileName, file)

        if (uploadErr) throw uploadErr
        fileUrl = uploadData.path
      }

      const { data, error: err } = await supabase
        .from('patient_documents')
        .insert([{ ...document, file_url: fileUrl }])
        .select()
        .single()

      if (err) throw err
      setDocuments([data, ...documents])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في رفع المستند')
      return null
    }
  }

  const deleteDocument = async (id: string) => {
    try {
      const { error: err } = await supabase
        .from('patient_documents')
        .delete()
        .eq('document_id', id)

      if (err) throw err
      setDocuments(documents.filter(d => d.document_id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في حذف المستند')
      return false
    }
  }

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    uploadDocument,
    deleteDocument
  }
}
