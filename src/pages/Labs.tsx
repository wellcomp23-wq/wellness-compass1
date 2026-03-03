import { useState, useMemo, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  MapPin, 
  Clock, 
  Star, 
  FlaskConical, 
  ArrowRight,
  Loader2,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLabs } from "@/hooks/useLabs"

export default function Labs() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const { labs, loading, error } = useLabs()
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Auto-focus on search input
  useEffect(() => {
    if (!loading && !error) {
      searchInputRef.current?.focus()
    }
  }, [loading, error])

  const filteredLabs = useMemo(() => {
    return labs.filter(lab => 
      lab.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      lab.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.specializations?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [labs, searchQuery])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle pb-20" dir="rtl">
        <div className="container max-w-4xl mx-auto px-4 py-6">
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
            <h1 className="text-2xl font-bold">المختبرات الطبية</h1>
          </div>
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-muted-foreground">جاري تحميل المختبرات...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-subtle pb-20" dir="rtl">
        <div className="container max-w-4xl mx-auto px-4 py-6">
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
            <h1 className="text-2xl font-bold">المختبرات الطبية</h1>
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
      <div className="container max-w-4xl mx-auto px-4 py-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="rounded-full"
              tabIndex={0}
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">المختبرات الطبية</h1>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center">
            <FlaskConical className="w-6 h-6 text-primary" />
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative mb-6">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="ابحث عن مختبر..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-12 h-12 rounded-2xl bg-white border-primary/10"
            tabIndex={0}
          />
        </form>

        {/* Labs Grid */}
        {filteredLabs.length > 0 ? (
          <div className="space-y-4">
            {filteredLabs.map((lab) => (
              <div 
                key={lab.lab_id}
                className="bg-white rounded-[2rem] border border-primary/5 shadow-sm p-5 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Lab Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <FlaskConical className="w-8 h-8 text-primary" />
                    </div>

                    {/* Lab Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base mb-1 text-slate-900">{lab.name}</h3>
                      
                      {/* Address */}
                      <div className="flex items-start gap-1 text-xs text-muted-foreground mb-2">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-primary" />
                        <span>{lab.address}</span>
                      </div>

                      {/* Contact Info */}
                      <div className="flex flex-wrap gap-2">
                        {lab.phone_number && (
                          <Badge variant="secondary" className="text-[10px] bg-primary/5 text-primary border-none">
                            <Clock className="w-3 h-3 ml-1" />
                            {lab.phone_number}
                          </Badge>
                        )}
                        {lab.specializations && (
                          <Badge variant="outline" className="text-[10px] border-secondary/20 text-secondary">
                            {lab.specializations}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="rounded-xl text-xs flex-shrink-0 btn-medical"
                    tabIndex={0}
                    onClick={() => navigate(`/labs/${lab.lab_id}`)}
                  >
                    عرض التفاصيل
                  </Button>
                </div>

                {/* Available Tests / Description */}
                {lab.available_tests && lab.available_tests.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-500 mb-1">الفحوصات المتاحة:</p>
                    <div className="flex flex-wrap gap-1">
                      {lab.available_tests.slice(0, 5).map((test: string, idx: number) => (
                        <span key={idx} className="text-[10px] text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {test}
                        </span>
                      ))}
                      {lab.available_tests.length > 5 && (
                        <span className="text-[10px] text-primary font-bold">+ {lab.available_tests.length - 5} المزيد</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FlaskConical className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-medium">لم يتم العثور على مختبرات</p>
            <p className="text-xs text-muted-foreground">حاول البحث بكلمات مختلفة</p>
          </div>
        )}
      </div>
    </div>
  )
}
