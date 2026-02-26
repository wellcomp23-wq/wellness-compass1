import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Activity, Search, Trash2, Download } from "lucide-react";

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  adminEmail: string;
  actionType: "CREATE" | "UPDATE" | "DELETE" | "APPROVE" | "REJECT" | "LOGIN" | "LOGOUT";
  targetType: "USER" | "APPLICATION" | "REPORT" | "SETTINGS";
}

const ActivityLogs = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");

  // Load logs from localStorage on mount
  useEffect(() => {
    loadActivityLogs();
  }, []);

  const loadActivityLogs = () => {
    const savedLogs = localStorage.getItem("adminActivityLogs");
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs));
      } catch (e) {
        console.error("Error loading activity logs:", e);
      }
    } else {
      // Initialize with sample logs
      const sampleLogs: ActivityLog[] = [
        {
          id: "log1",
          action: "تسجيل دخول",
          description: "قام المسؤول بتسجيل الدخول إلى لوحة التحكم",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          adminEmail: "admin@wellness.ps",
          actionType: "LOGIN",
          targetType: "SETTINGS"
        },
        {
          id: "log2",
          action: "موافقة على طلب",
          description: "تمت الموافقة على طلب انضمام د. خالد منصور",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          adminEmail: "admin@wellness.ps",
          actionType: "APPROVE",
          targetType: "APPLICATION"
        },
        {
          id: "log3",
          action: "إضافة مستخدم",
          description: "تم إضافة مستخدم جديد: محمد أحمد",
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          adminEmail: "admin@wellness.ps",
          actionType: "CREATE",
          targetType: "USER"
        },
        {
          id: "log4",
          action: "توثيق مستخدم",
          description: "تم توثيق حساب المستخدم: سارة علي",
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          adminEmail: "admin@wellness.ps",
          actionType: "UPDATE",
          targetType: "USER"
        },
        {
          id: "log5",
          action: "اتخاذ إجراء على بلاغ",
          description: "تم اتخاذ إجراء على البلاغ المقدم من أحمد حسن",
          timestamp: new Date(Date.now() - 18000000).toISOString(),
          adminEmail: "admin@wellness.ps",
          actionType: "APPROVE",
          targetType: "REPORT"
        }
      ];
      setLogs(sampleLogs);
      localStorage.setItem("adminActivityLogs", JSON.stringify(sampleLogs));
    }
  };

  const addActivityLog = (log: Omit<ActivityLog, "id">) => {
    const newLog: ActivityLog = {
      ...log,
      id: `log_${Date.now()}`
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    localStorage.setItem("adminActivityLogs", JSON.stringify(updatedLogs));
  };

  const handleClearLogs = () => {
    if (confirm("هل أنت متأكد من رغبتك في حذف جميع السجلات؟")) {
      setLogs([]);
      localStorage.removeItem("adminActivityLogs");
      toast({
        title: "تم حذف السجلات",
        description: "تم حذف جميع سجلات النشاط بنجاح.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadLogs = () => {
    const csvContent = [
      ["الإجراء", "الوصف", "النوع", "الهدف", "الوقت", "المسؤول"],
      ...logs.map(log => [
        log.action,
        log.description,
        log.actionType,
        log.targetType,
        log.timestamp,
        log.adminEmail
      ])
    ];

    const csv = csvContent.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);

    toast({
      title: "تم تحميل السجلات",
      description: "تم تحميل سجلات النشاط بصيغة CSV",
    });
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case "LOGIN":
      case "LOGOUT":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "CREATE":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "UPDATE":
        return "bg-purple-50 text-purple-600 border-purple-100";
      case "DELETE":
        return "bg-red-50 text-red-600 border-red-100";
      case "APPROVE":
        return "bg-green-50 text-green-600 border-green-100";
      case "REJECT":
        return "bg-orange-50 text-orange-600 border-orange-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  const getActionLabel = (actionType: string) => {
    const labels: { [key: string]: string } = {
      LOGIN: "دخول",
      LOGOUT: "خروج",
      CREATE: "إنشاء",
      UPDATE: "تحديث",
      DELETE: "حذف",
      APPROVE: "موافقة",
      REJECT: "رفض"
    };
    return labels[actionType] || actionType;
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.includes(searchQuery) || 
                         log.description.includes(searchQuery) ||
                         log.adminEmail.includes(searchQuery);
    const matchesFilter = filterType === "ALL" || log.actionType === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-black flex items-center gap-2">
            <Activity className="w-5 h-5" /> سجل العمليات والنشاط
          </CardTitle>
          <CardDescription className="text-xs font-bold">تتبع جميع العمليات التي قام بها المسؤولون في النظام</CardDescription>
        </CardHeader>
      </Card>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن إجراء أو وصف..."
            className="h-12 rounded-2xl bg-white border-none shadow-sm pr-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-12 px-4 rounded-2xl bg-white border-none shadow-sm font-bold text-sm"
        >
          <option value="ALL">جميع الأنواع</option>
          <option value="LOGIN">دخول وخروج</option>
          <option value="CREATE">إنشاء</option>
          <option value="UPDATE">تحديث</option>
          <option value="DELETE">حذف</option>
          <option value="APPROVE">موافقة</option>
          <option value="REJECT">رفض</option>
        </select>
      </div>

      {/* Activity Logs Table */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-muted-foreground">الإجراء</th>
                  <th className="px-6 py-4 text-xs font-black text-muted-foreground">الوصف</th>
                  <th className="px-6 py-4 text-xs font-black text-muted-foreground">النوع</th>
                  <th className="px-6 py-4 text-xs font-black text-muted-foreground">الوقت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold">{log.action}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-muted-foreground font-bold">{log.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`${getActionColor(log.actionType)} border rounded-lg font-bold text-[10px]`}>
                        {getActionLabel(log.actionType)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString("ar-PS")}
                      </p>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <p className="text-sm font-bold text-muted-foreground">لا توجد سجلات تطابق البحث</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "إجمالي العمليات", value: logs.length.toString() },
          { label: "العمليات اليوم", value: logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length.toString() },
          { label: "آخر عملية", value: logs.length > 0 ? new Date(logs[0].timestamp).toLocaleTimeString("ar-PS") : "-" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardContent className="p-6">
              <p className="text-xs text-muted-foreground font-bold">{stat.label}</p>
              <h3 className="text-2xl font-black mt-2">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleDownloadLogs}
          className="flex-1 rounded-xl font-bold gap-2 h-12"
        >
          <Download className="w-4 h-4" /> تحميل السجلات
        </Button>
        <Button
          onClick={handleClearLogs}
          variant="outline"
          className="flex-1 rounded-xl font-bold gap-2 h-12 text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" /> حذف السجلات
        </Button>
      </div>

      {/* Info */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
        <p className="text-xs font-bold text-blue-900">
          📝 ملاحظة: يتم حفظ جميع عمليات المسؤولين تلقائياً لأغراض الأمان والمراجعة. يمكنك تحميل السجلات أو حذفها حسب الحاجة.
        </p>
      </div>
    </div>
  );
};

export default ActivityLogs;
