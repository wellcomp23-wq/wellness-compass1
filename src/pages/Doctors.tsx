import { useState, useMemo, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { 
  Search, 
  MapPin, 
  Star, 
  Calendar, 
  Filter,
  Clock,
  Award,
  ChevronLeft,
  Heart,
  Stethoscope,
  Sparkles,
  Users,
  Loader2,
  AlertCircle,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import BookAppointmentModal from "@/components/medical/BookAppointmentModal"
import { useDoctors } from "@/hooks"

export default function DoctorsPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeSpecialty, setActiveSpecialty] = useState("الكل")
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<{
    id: string
    name: string
    hospital: string
  } | null>(null)
  
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { doctors, loading, error } = useDoctors()

  // Auto-focus on search input
  useEffect(() => {
    if (!loading && !error) {
      searchInputRef.current?.focus()
    }
  }, [loading, error])

  // استخراج التخصصات الفريدة
  const specialties = useMemo(() => {
    const specs = new Set(doctors.map(d => d.specialization))
    return ["الكل", ...Array.from(specs)]
  }, [doctors])

  // تصفية الأطباء
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doc => {
      const matchesSpecialty = activeSpecialty === "الكل" || doc.specialization === activeSpecialty
      const matchesSearch = 
        doc.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesSpecialty && matchesSearch
    })
  }, [doctors, activeSpecialty, searchTerm])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is already filtered via useMemo, but we can add additional logic here if needed
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle pb-20" dir="rtl">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-8">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="rounded-full"
              tabIndex={0}
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">الأطباء</h1>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-muted-foreground">جاري تحميل الأطباء...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-subtle pb-20" dir="rtl">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-8">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="rounded-full"
              tabIndex={0}
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">الأطباء</h1>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4 text-center px-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <p className="text-red-600 font-medium">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline" tabIndex={0}>
                إعادة محاولة
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20" dir="rtl">
      <div className="container max-w-6xl mx-auto px-4 py-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-3 mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-full"
            tabIndex={0}
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">الأطباء</h1>
        </div>

        {/* Search and Filter */}
        <div className="space-y-4 mb-8">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="ابحث عن طبيب أو تخصص..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-12 h-12 rounded-2xl bg-white border-primary/10"
              tabIndex={0}
            />
          </form>

          {/* Specialty Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2" role="tablist">
            {specialties.map((specialty, idx) => (
              <button
                key={specialty}
                role="tab"
                aria-selected={activeSpecialty === specialty}
                tabIndex={0}
                onClick={() => setActiveSpecialty(specialty)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft' && idx < specialties.length - 1) {
                    // Focus management could be added here
                  }
                }}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  activeSpecialty === specialty
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-white border border-primary/10 text-muted-foreground hover:border-primary/30"
                )}
              >
                {specialty}
              </button>
            ))}
          </div>
        </div>

        {/* Doctors Grid */}
        {filteredDoctors.length > 0 ? (
          <div className="space-y-4">
            {filteredDoctors.map((doctor) => (
              <div 
                key={doctor.doctor_id}
                className="bg-white rounded-[2rem] border border-primary/5 shadow-sm p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Doctor Avatar */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                    <Stethoscope className="w-8 h-8 text-primary" />
                  </div>

                  {/* Doctor Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-sm">
                          د. {doctor.first_name} {doctor.last_name}
                        </h3>
                        <p className="text-xs text-muted-foreground">{doctor.specialization}</p>
                      </div>
                      {doctor.average_rating && (
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-bold text-yellow-700">
                            {Number(doctor.average_rating).toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Experience and Qualification */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {doctor.years_of_experience && (
                        <Badge variant="outline" className="text-[10px]">
                          <Clock className="w-3 h-3 ml-1" />
                          {doctor.years_of_experience} سنة خبرة
                        </Badge>
                      )}
                      {doctor.consultation_fee && (
                        <Badge variant="outline" className="text-[10px]">
                          <Award className="w-3 h-3 ml-1" />
                          {doctor.consultation_fee} ريال
                        </Badge>
                      )}
                    </div>

                    {/* Bio */}
                    {doctor.bio && (
                      <p className="text-[10px] text-muted-foreground line-clamp-2 mb-3">
                        {doctor.bio}
                      </p>
                    )}
                  </div>

                  {/* Book Button */}
                  <Button 
                    variant="medical" 
                    className="rounded-xl h-10 px-4 text-xs font-bold flex-shrink-0"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedDoctorForBooking({
                        id: doctor.doctor_id,
                        name: `د. ${doctor.first_name} ${doctor.last_name}`,
                        hospital: ""
                      })
                      setIsBookingModalOpen(true)
                    }}
                  >
                    حجز
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Stethoscope className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">لم يتم العثور على أطباء</p>
            <p className="text-xs text-muted-foreground">حاول البحث بكلمات مختلفة</p>
          </div>
        )}

        {/* Booking Modal */}
        {selectedDoctorForBooking && (
          <BookAppointmentModal
            isOpen={isBookingModalOpen}
            onClose={() => {
              setIsBookingModalOpen(false)
              setSelectedDoctorForBooking(null)
            }}
            doctorId={selectedDoctorForBooking.id}
            doctorName={selectedDoctorForBooking.name}
            hospitalName={selectedDoctorForBooking.hospital}
            onSuccess={() => {
              setIsBookingModalOpen(false)
              setSelectedDoctorForBooking(null)
              navigate('/appointments')
            }}
          />
        )}
      </div>
    </div>
  )
}
