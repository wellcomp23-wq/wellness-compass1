import { Button } from "@/components/ui/button"
import { Phone, MapPin, Navigation, ShieldAlert, HeartPulse, Siren } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"

interface Hospital {
  id: string
  name: string
  location: string
  emergency: string
  phone: string
}

export default function EmergencyNumbers() {
  const { toast } = useToast()

  const generalEmergency = [
    { name: "الإسعاف", number: "191", icon: HeartPulse, color: "bg-red-500" },
    { name: "الشرطة", number: "199", icon: ShieldAlert, color: "bg-blue-600" },
    { name: "الدفاع المدني", number: "191", icon: Siren, color: "bg-orange-500" },
  ]

  const hospitals: Hospital[] = [
    {
      id: "1",
      name: "مستشفى ابن سينا",
      location: "الحوبان، تعز",
      emergency: "04 234567",
      phone: "04 234568"
    },
    {
      id: "2",
      name: "مستشفى الثورة",
      location: "تعز",
      emergency: "04 345678",
      phone: "04 345679"
    },
    {
      id: "3",
      name: "مستشفى الجمهوري",
      location: "صنعاء",
      emergency: "01 456789",
      phone: "01 456790"
    }
  ]

  const handleCall = (number: string, name: string) => {
    toast({
      title: "جاري الاتصال...",
      description: `الاتصال بـ ${name} (${number})`,
    })
    window.open(`tel:${number}`, '_self');
  }

  return (
    <div className="space-y-8" dir="rtl">
      {/* General Emergency Grid */}
      <div className="grid grid-cols-3 gap-3">
        {generalEmergency.map((item, i) => (
          <button
            key={i}
            onClick={() => handleCall(item.number, item.name)}
            className="flex flex-col items-center gap-2 p-4 rounded-[2rem] bg-white border border-primary/5 shadow-sm active:scale-95 transition-all"
          >
            <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center shadow-lg shadow-black/10`}>
              <item.icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-bold">{item.name}</span>
            <span className="text-sm font-black text-primary">{item.number}</span>
          </button>
        ))}
      </div>

      {/* Hospitals List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-lg font-bold">طوارئ المستشفيات</h2>
          <span className="text-[10px] text-muted-foreground italic">اليمن - حسب المنطقة</span>
        </div>
        
        {hospitals.map((hospital) => (
          <Card key={hospital.id} className="border-none shadow-sm bg-white/80 backdrop-blur-sm rounded-[2rem] overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                      <HeartPulse className="w-5 h-5 text-red-500" />
                   </div>
                   <div>
                      <h3 className="font-bold text-sm leading-tight">{hospital.name}</h3>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {hospital.location}
                      </div>
                   </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full bg-accent/50 text-muted-foreground"
                  onClick={() => window.open(`https://maps.google.com/?q=${hospital.name} ${hospital.location}`, '_blank')}
                >
                   <Navigation className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="emergency"
                  className="h-12 rounded-xl font-bold gap-2 shadow-lg shadow-red-500/20"
                  onClick={() => handleCall(hospital.emergency, hospital.name)}
                >
                  <Phone className="w-4 h-4" />
                  طوارئ
                </Button>
                
                <Button
                  variant="outline"
                  className="h-12 rounded-xl font-bold gap-2 border-primary/10"
                  onClick={() => handleCall(hospital.phone, hospital.name)}
                >
                  <Phone className="w-4 h-4" />
                  الاستقبال
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
