import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Hospital,
  MapPin,
  Phone,
  Clock,
  Search,
  ChevronLeft,
  Star,
  Users,
  AlertCircle
} from 'lucide-react'

interface HospitalData {
  id: string
  name: string
  location: string
  phone?: string
  email?: string
  specializations?: string[]
  rating?: number
  doctors_count?: number
  beds_count?: number
  emergency_services?: boolean
  opening_hours?: string
}

export default function Hospitals() {
  const navigate = useNavigate()
  const [hospitals, setHospitals] = useState<HospitalData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredHospitals, setFilteredHospitals] = useState<HospitalData[]>([])

  useEffect(() => {
    fetchHospitals()
  }, [])

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = hospitals.filter(h =>
        h.name.includes(searchTerm) ||
        h.location.includes(searchTerm) ||
        h.specializations?.some(s => s.includes(searchTerm))
      )
      setFilteredHospitals(filtered)
    } else {
      setFilteredHospitals(hospitals)
    }
  }, [searchTerm, hospitals])

  const fetchHospitals = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('hospitals')
        .select('*')
        .order('name', { ascending: true })

      if (err) throw err

      const formattedHospitals: HospitalData[] = (data || []).map(h => ({
        id: h.hospital_id,
        name: h.name,
        location: h.location || 'غير محدد',
        phone: h.phone,
        email: h.email,
        specializations: h.specializations || [],
        rating: h.rating,
        doctors_count: h.doctors_count,
        beds_count: h.beds_count,
        emergency_services: h.emergency_services,
        opening_hours: h.opening_hours
      }))

      setHospitals(formattedHospitals)
      setFilteredHospitals(formattedHospitals)
    } catch (err) {
      console.error('Error fetching hospitals:', err)
      setError(err instanceof Error ? err.message : 'فشل في تحميل المستشفيات')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-slate-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Hospital className="w-6 h-6 text-blue-500" />
              المستشفيات
            </h1>
            <p className="text-sm text-slate-500">ابحث عن المستشفيات والخدمات الطبية</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
          <Input
            placeholder="ابحث عن مستشفى..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-4 pr-10 py-2 border-2 border-slate-200 focus:border-blue-500"
          />
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
              <Button onClick={fetchHospitals} className="mt-4 w-full">
                حاول مرة أخرى
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        )}

        {/* Hospitals Grid */}
        {!loading && filteredHospitals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHospitals.map((hospital) => (
              <Card
                key={hospital.id}
                className="border-2 border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{hospital.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" />
                        {hospital.location}
                      </CardDescription>
                    </div>
                    {hospital.rating && (
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded">
                        <Star className="w-4 h-4 text-amber-500" fill="currentColor" />
                        <span className="text-sm font-semibold text-amber-700">{hospital.rating}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-2">
                    {hospital.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4 text-blue-500" />
                        <a href={`tel:${hospital.phone}`} className="hover:text-blue-600">
                          {hospital.phone}
                        </a>
                      </div>
                    )}
                    {hospital.opening_hours && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span>{hospital.opening_hours}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    {hospital.doctors_count !== undefined && (
                      <div className="bg-blue-50 p-2 rounded border border-blue-200">
                        <p className="text-xs text-slate-600">الأطباء</p>
                        <p className="text-lg font-bold text-blue-600">{hospital.doctors_count}</p>
                      </div>
                    )}
                    {hospital.beds_count !== undefined && (
                      <div className="bg-emerald-50 p-2 rounded border border-emerald-200">
                        <p className="text-xs text-slate-600">الأسرة</p>
                        <p className="text-lg font-bold text-emerald-600">{hospital.beds_count}</p>
                      </div>
                    )}
                  </div>

                  {/* Services */}
                  {hospital.specializations && hospital.specializations.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-2">التخصصات</p>
                      <div className="flex flex-wrap gap-1">
                        {hospital.specializations.slice(0, 3).map((spec, i) => (
                          <span
                            key={i}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                          >
                            {spec}
                          </span>
                        ))}
                        {hospital.specializations.length > 3 && (
                          <span className="text-xs text-slate-500">
                            +{hospital.specializations.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Emergency Services Badge */}
                  {hospital.emergency_services && (
                    <div className="bg-red-50 border border-red-200 rounded p-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-xs font-semibold text-red-700">خدمات طوارئ متاحة</span>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                    عرض التفاصيل
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredHospitals.length === 0 && (
          <Card className="border-slate-200 bg-slate-50">
            <CardContent className="pt-12 pb-12 text-center">
              <Hospital className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 font-semibold mb-2">
                {searchTerm ? 'لم يتم العثور على مستشفيات' : 'لا توجد مستشفيات متاحة'}
              </p>
              <p className="text-sm text-slate-500">
                {searchTerm ? 'حاول البحث بكلمات مختلفة' : 'سيتم إضافة المستشفيات قريباً'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
