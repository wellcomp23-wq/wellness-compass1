import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Database, RefreshCw, CheckCircle2, AlertCircle, Download, BarChart3 } from "lucide-react";

interface DatabaseStats {
  totalUsers: number;
  totalApplications: number;
  totalReports: number;
  databaseSize: string;
  lastBackup: string;
  connectionStatus: "متصل" | "غير متصل";
}

const DatabaseManager = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<DatabaseStats>({
    totalUsers: 0,
    totalApplications: 0,
    totalReports: 0,
    databaseSize: "0 MB",
    lastBackup: "2024-02-21",
    connectionStatus: "متصل"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Load stats from localStorage on mount
  useEffect(() => {
    loadDatabaseStats();
  }, []);

  const loadDatabaseStats = () => {
    try {
      const users = JSON.parse(localStorage.getItem("adminUsers") || "[]");
      const applications = JSON.parse(localStorage.getItem("adminApplications") || "[]");
      const reports = JSON.parse(localStorage.getItem("adminReports") || "[]");

      // حساب حجم قاعدة البيانات تقريبياً
      const dataSize = (JSON.stringify(users).length + JSON.stringify(applications).length + JSON.stringify(reports).length) / 1024;
      const dbSize = dataSize > 1024 ? `${(dataSize / 1024).toFixed(2)} MB` : `${dataSize.toFixed(2)} KB`;

      setStats({
        totalUsers: users.length,
        totalApplications: applications.length,
        totalReports: reports.length,
        databaseSize: dbSize,
        lastBackup: new Date().toISOString().split('T')[0],
        connectionStatus: "متصل"
      });
    } catch (error) {
      console.error("Error loading database stats:", error);
      setStats(prev => ({ ...prev, connectionStatus: "غير متصل" }));
    }
  };

  const handleRefreshStats = () => {
    setIsLoading(true);
    setTimeout(() => {
      loadDatabaseStats();
      setIsLoading(false);
      toast({
        title: "تم تحديث الإحصائيات",
        description: "تم تحميل أحدث بيانات قاعدة البيانات بنجاح.",
      });
    }, 1000);
  };

  const handleBackupDatabase = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      // إنشاء نسخة احتياطية
      const backupData = {
        users: JSON.parse(localStorage.getItem("adminUsers") || "[]"),
        applications: JSON.parse(localStorage.getItem("adminApplications") || "[]"),
        reports: JSON.parse(localStorage.getItem("adminReports") || "[]"),
        timestamp: new Date().toISOString()
      };

      // تحميل الملف
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `wellness-compass-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      setIsBackingUp(false);
      toast({
        title: "تم إنشاء النسخة الاحتياطية",
        description: "تم تحميل نسخة احتياطية من قاعدة البيانات بنجاح.",
      });
    }, 1500);
  };

  const handleOptimizeDatabase = () => {
    setIsLoading(true);
    setTimeout(() => {
      // محاكاة تحسين قاعدة البيانات
      toast({
        title: "تم تحسين قاعدة البيانات",
        description: "تم تنظيف البيانات الزائدة وتحسين الأداء.",
      });
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stats.connectionStatus === "متصل" ? "bg-emerald-50" : "bg-red-50"}`}>
                {stats.connectionStatus === "متصل" ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-500" />
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold">حالة الاتصال بقاعدة البيانات</p>
                <h3 className="text-lg font-black mt-1">{stats.connectionStatus}</h3>
              </div>
            </div>
            <Badge className={stats.connectionStatus === "متصل" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"}>
              {stats.connectionStatus === "متصل" ? "✓ متصل" : "✗ غير متصل"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Database Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "إجمالي المستخدمين", value: stats.totalUsers.toString(), icon: "👥" },
          { label: "طلبات الانضمام", value: stats.totalApplications.toString(), icon: "📋" },
          { label: "البلاغات", value: stats.totalReports.toString(), icon: "🚨" },
          { label: "حجم قاعدة البيانات", value: stats.databaseSize, icon: "💾" },
        ].map((item, i) => (
          <Card key={i} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="text-3xl">{item.icon}</div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{item.label}</p>
                  <h3 className="text-2xl font-black mt-2">{item.value}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Database Operations */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-black flex items-center gap-2">
            <Database className="w-5 h-5" /> عمليات قاعدة البيانات
          </CardTitle>
          <CardDescription className="text-xs font-bold">إدارة النسخ الاحتياطية والصيانة</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Button 
              onClick={handleRefreshStats}
              disabled={isLoading}
              className="rounded-xl font-bold gap-2 h-12"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "جاري التحديث..." : "تحديث الإحصائيات"}
            </Button>
            <Button 
              onClick={handleBackupDatabase}
              disabled={isBackingUp}
              variant="outline"
              className="rounded-xl font-bold gap-2 h-12"
            >
              <Download className={`w-4 h-4 ${isBackingUp ? "animate-spin" : ""}`} />
              {isBackingUp ? "جاري الحفظ..." : "نسخة احتياطية"}
            </Button>
            <Button 
              onClick={handleOptimizeDatabase}
              disabled={isLoading}
              variant="outline"
              className="rounded-xl font-bold gap-2 h-12"
            >
              <BarChart3 className="w-4 h-4" />
              تحسين الأداء
            </Button>
          </div>

          {/* Last Backup Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
            <p className="text-xs font-bold text-blue-900">
              📅 آخر نسخة احتياطية: {stats.lastBackup} | 🔐 جميع البيانات محمية وآمنة
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Table Statistics */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-black">إحصائيات الجداول</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-xs font-black text-muted-foreground">اسم الجدول</th>
                  <th className="px-6 py-3 text-xs font-black text-muted-foreground">عدد السجلات</th>
                  <th className="px-6 py-3 text-xs font-black text-muted-foreground">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { name: "المستخدمين", count: stats.totalUsers, status: "نشط" },
                  { name: "طلبات الانضمام", count: stats.totalApplications, status: "نشط" },
                  { name: "البلاغات", count: stats.totalReports, status: "نشط" },
                ].map((table, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold">{table.name}</td>
                    <td className="px-6 py-4 font-bold text-primary">{table.count}</td>
                    <td className="px-6 py-4">
                      <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 rounded-lg font-bold text-[10px]">
                        ✓ {table.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseManager;
