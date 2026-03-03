import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Star } from "lucide-react"

interface DoctorProfileHeaderProps {
  doctor: any
  rankingScore?: number
}

export function DoctorProfileHeader({ doctor, rankingScore }: DoctorProfileHeaderProps) {
  if (!doctor) return null

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-primary/10 shadow-sm mb-6">
      <Avatar className="w-16 h-16 border-2 border-primary/20">
        <AvatarImage src={doctor.profile_picture__url} alt={doctor.first_name} />
        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
          {doctor.first_name?.[0]}{doctor.last_name?.[0]}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-900">
            د. {doctor.first_name} {doctor.last_name}
          </h2>
          {doctor.is_verified && (
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
          )}
        </div>
        <p className="text-sm text-gray-500">{doctor.specialization || 'طبيب عام'}</p>
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0. long-full">
            <Star className=",w-3 h-3 fill-yellow-4 seasonal text-yellow-400" />
            <span className="text-xs font-medium text-yellow-700">{rankingScore || '4.8'}</span>
          </div>
          {rankingScore && rankingScore > 4.5 && (
            <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-100 text-[10px] px-2 py-0">
              طبيب موثوق
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
