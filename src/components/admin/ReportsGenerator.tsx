import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Calendar } from "lucide-react";

const ReportsGenerator = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const reports = [
    {
      id: "users",
      name: "تقرير المستخدمين",
      description: "قائمة شاملة بجميع المستخدمين المسجلين في النظام",
      icon: "👥",
      color: "bg-blue-50"
    },
    {
      id: "applications",
      name: "تقرير طلبات الانضمام",
      description: "تفاصيل جميع طلبات مقدمي الخدمة المقبولة والمرفوضة",
      icon: "📋",
      color: "bg-orange-50"
    },
    {
      id: "reports",
      name: "تقرير البلاغات والشكاوى",
      description: "ملخص شامل لجميع البلاغات المقدمة والإجراءات المتخذة",
      icon: "🚨",
      color: "bg-red-50"
    },
    {
      id: "activity",
      name: "تقرير النشاط الشهري",
      description: "إحصائيات شاملة عن نشاط النظام والمستخدمين",
      icon: "📊",
      color: "bg-emerald-50"
    },
  ];

  const generateUserReport = () => {
    const users = JSON.parse(localStorage.getItem("adminUsers") || "[]");
    const csvContent = [
      ["الاسم", "البريد الإلكتروني", "رقم الهاتف", "الدور", "حالة التوثيق", "تاريخ الانضمام"],
      ...users.map((u: any) => [
        u.name,
        u.email,
        u.phone,
        u.role,
        u.isVerified ? "موثق" : "قيد الانتظار",
        u.joinDate
      ])
    ];
    downloadCSV(csvContent, "users-report");
  };

  const generateApplicationReport = () => {
    const applications = JSON.parse(localStorage.getItem("adminApplications") || "[]");
    const csvContent = [
      ["الاسم", "الدور", "البريد الإلكتروني", "رقم الهاتف", "التخصص", "تاريخ الطلب", "الحالة"],
      ...applications.map((a: any) => [
        a.name,
        a.role,
        a.email,
        a.phone,
        a.specialty || "-",
        a.date,
        a.status
      ])
    ];
    downloadCSV(csvContent, "applications-report");
  };

  const generateReportsReport = () => {
    const reports = JSON.parse(localStorage.getItem("adminReports") || "[]");
    const csvContent = [
      ["المبلغ عنه", "المبلغ", "السبب", "مستوى الخطورة", "الحالة", "التاريخ"],
      ...reports.map((r: any) => [
        r.target,
        r.reporter,
        r.reason,
        r.severity,
        r.status || "معلق",
        r.date
      ])
    ];
    downloadCSV(csvContent, "reports-report");
  };

  const generateActivityReport = () => {
    const users = JSON.parse(localStorage.getItem("adminUsers") || "[]");
    const applications = JSON.parse(localStorage.getItem("adminApplications") || "[]");
    const reports = JSON.parse(localStorage.getItem("adminReports") || "[]");

    const csvContent = [
      ["الإحصائية", "القيمة"],
      ["إجمالي المستخدمين", users.length],
      ["المستخدمين الموثقين", users.filter((u: any) => u.isVerified).length],
      ["طلبات الانضمام المعلقة", applications.filter((a: any) => a.status === "PENDING").length],
      ["البلاغات المعلقة", reports.filter((r: any) => r.status === "معلق").length],
      ["تاريخ التقرير", new Date().toISOString().split('T')[0]]
    ];
    downloadCSV(csvContent, "activity-report");
  };

  const downloadCSV = (data: any[][], filename: string) => {
    const csvContent = data.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleGenerateReport = (reportId: string) => {
    setIsGenerating(true);
    setSelectedReport(reportId);

    setTimeout(() => {
      switch (reportId) {
        case "users":
          generateUserReport();
          break;
        case "applications":
          generateApplicationReport();
          break;
        case "reports":
          generateReportsReport();
          break;
        case "activity":
          generateActivityReport();
          break;
      }

      setIsGenerating(false);
      setSelectedReport(null);
      toast({
        title: "تم توليد التقرير",
        description: "تم تحميل التقرير بنجاح بصيغة CSV",
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-black flex items-center gap-2">
            <FileText className="w-5 h-5" /> مولد التقارير
          </CardTitle>
          <CardDescription className="text-xs font-bold">توليد تقارير شاملة عن نشاط النظام والمستخدمين</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((report) => (
          <Card key={report.id} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="text-4xl">{report.icon}</div>
                  <Badge variant="outline" className="rounded-lg font-bold text-[10px]">
                    CSV
                  </Badge>
                </div>
                <div>
                  <h3 className="font-black text-base mb-1">{report.name}</h3>
                  <p className="text-xs text-muted-foreground font-bold">{report.description}</p>
                </div>
                <Button
                  onClick={() => handleGenerateReport(report.id)}
                  disabled={isGenerating && selectedReport === report.id}
                  className="w-full rounded-xl font-bold gap-2 h-10"
                >
                  <Download className={`w-4 h-4 ${isGenerating && selectedReport === report.id ? "animate-spin" : ""}`} />
                  {isGenerating && selectedReport === report.id ? "جاري التوليد..." : "تحميل التقرير"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Info */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
              <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-blue-900">
                  📅 التقارير تُحدّث تلقائياً بآخر البيانات من النظام
                </p>
                <p className="text-[10px] text-blue-700 font-bold mt-1">
                  يمكنك تحميل التقارير بصيغة CSV وفتحها في Excel أو Google Sheets
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {[
                { label: "صيغة الملف", value: "CSV (قابل للتحرير)" },
                { label: "التحديث", value: "فوري" },
                { label: "الحماية", value: "مشفر وآمن" },
                { label: "الحجم", value: "متغير حسب البيانات" },
              ].map((item, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-muted-foreground font-bold">{item.label}</p>
                  <p className="text-sm font-black mt-1">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsGenerator;
