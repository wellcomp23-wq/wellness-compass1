import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  Users,
  UserCheck,
  TrendingUp,
  AlertTriangle,
  Settings,
  Search,
  BarChart3,
  Activity,
  Shield,
  Loader2,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  Lock,
  AlertCircle,
  LogOut,
  Copy,
  Mail
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { supabase } from "@/integrations/supabase/client"
import { generateUsername, generatePassword } from "@/lib/auth-utils"

interface User {
  id: string
  email: string
  role: string
  created_at: string
  status: string
  username?: string
}

interface ProviderApplication {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  role_requested: string
  document_url: string
  status: string
  created_at: string
  user_id?: string
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [applications, setApplications] = useState<ProviderApplication[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [newAdminPassword, setNewAdminPassword] = useState("")
  const [confirmAdminPassword, setConfirmAdminPassword] = useState("")
  const [selectedApp, setSelectedApp] = useState<ProviderApplication | null>(null)
  const [showCredentials, setShowCredentials] = useState<{ [key: string]: boolean }>({})
  const [generatedCredentials, setGeneratedCredentials] = useState<{ [key: string]: { username: string; password: string } }>({})

  useEffect(() => {
    fetchUsers()
    fetchApplications()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      console.error("Error fetching users:", err)
      toast({ title: "خطأ", description: "فشل في تحميل المستخدمين", variant: "destructive" })
    }
  }

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('provider_applications')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setApplications(data || [])
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveApplication = async (appId: string) => {
    try {
      const app = applications.find(a => a.id === appId)
      if (!app) throw new Error("لم يتم العثور على الطلب")

      // توليد اسم مستخدم وكلمة مرور
      const username = generateUsername(app.first_name, app.last_name)
      const tempPassword = generatePassword()
      const providerEmail = `${username}@provider.local`

      // إنشاء حساب في Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: providerEmail,
        password: tempPassword,
        email_confirm: true
      })

      if (authError) throw authError
      if (!authData.user) throw new Error("فشل في إنشاء حساب المستخدم")

      const userId = authData.user.id

      // إنشاء سجل في جدول users
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          user_id: userId,
          email: app.email,
          phone_number: app.phone,
          role: app.role_requested.toLowerCase(),
          username: username
        }])

      if (userError) throw userError

      // إنشاء سجل في جدول user_roles
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{
          user_id: userId,
          role: app.role_requested.toLowerCase()
        }])

      if (roleError) throw roleError

      // إنشاء سجل في الجدول المناسب حسب نوع مقدم الخدمة
      const roleMap: { [key: string]: string } = {
        'doctor': 'doctors',
        'pharmacy': 'pharmacies',
        'lab': 'laboratories',
        'hospital': 'hospitals'
      }

      const tableName = roleMap[app.role_requested.toLowerCase()]
      if (tableName) {
        const idField = `${app.role_requested.toLowerCase()}_id`
        const { error: providerError } = await supabase
          .from(tableName)
          .insert([{
            [idField]: userId,
            first_name: app.first_name,
            last_name: app.last_name,
            email: app.email,
            phone: app.phone
          }])

        if (providerError) console.error(`Error creating ${tableName} record:`, providerError)
      }

      // تحديث حالة الطلب
      const { error: updateError } = await supabase
        .from('provider_applications')
        .update({ 
          status: 'APPROVED',
          user_id: userId
        })
        .eq('id', appId)

      if (updateError) throw updateError

      // حفظ بيانات الاعتماد
      setGeneratedCredentials(prev => ({
        ...prev,
        [appId]: { username, password: tempPassword }
      }))

      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'APPROVED', user_id: userId } : a))
      
      toast({ 
        title: "نجاح", 
        description: `تم الموافقة على الطلب. اسم المستخدم: ${username}` 
      })
    } catch (err: any) {
      console.error("Error approving application:", err)
      toast({ title: "خطأ", description: err.message || "فشل في الموافقة على الطلب", variant: "destructive" })
    }
  }

  const handleRejectApplication = async (appId: string) => {
    try {
      const { error } = await supabase
        .from('provider_applications')
        .update({ status: 'REJECTED' })
        .eq('id', appId)

      if (error) throw error

      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'REJECTED' } : a))
      toast({ title: "نجاح", description: "تم رفض الطلب" })
    } catch (err) {
      toast({ title: "خطأ", description: "فشل في رفض الطلب", variant: "destructive" })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('user_id', userId)

      if (error) throw error

      setUsers(prev => prev.filter(u => u.id !== userId))
      toast({ title: "نجاح", description: "تم حذف المستخدم بنجاح" })
    } catch (err) {
      toast({ title: "خطأ", description: "فشل في حذف المستخدم", variant: "destructive" })
    }
  }

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredApplications = applications.filter(a => 
    (a.first_name + " " + a.last_name).toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAdminPassword || !confirmAdminPassword) {
      toast({ title: "تنبيه", description: "يرجى ملء جميع الحقول", variant: "destructive" })
      return
    }
    if (newAdminPassword !== confirmAdminPassword) {
      toast({ title: "خطأ", description: "كلمة المرور الجديدة غير متطابقة", variant: "destructive" })
      return
    }
    if (newAdminPassword.length < 8) {
      toast({ title: "خطأ", description: "يجب أن تكون كلمة المرور 8 أحرف على الأقل", variant: "destructive" })
      return
    }

    const adminPassword = localStorage.getItem("adminPassword")
    if (adminPassword !== newAdminPassword) {
      localStorage.setItem("adminPassword", newAdminPassword)
      setNewAdminPassword("")
      setConfirmAdminPassword("")
      toast({ title: "نجاح", description: "تم تحديث كلمة مرور الأدمن بنجاح" })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminTokenExpiry")
    localStorage.removeItem("adminPassword")
    navigate("/admin/login")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "تم النسخ", description: "تم نسخ البيانات إلى الحافظة" })
  }

  const pendingCount = applications.filter(a => a.status === 'PENDING').length
  const approvedCount = applications.filter(a => a.status === 'APPROVED').length
  const rejectedCount = applications.filter(a => a.status === 'REJECTED').length

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20" dir="rtl">
      <div className="container max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">لوحة تحكم الإدارة</h1>
              <p className="text-sm text-muted-foreground">إدارة المستخدمين والطلبات</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-primary/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">طلبات معلقة</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">طلبات موافق عليها</p>
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">طلبات مرفوضة</p>
                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="applications" className="bg-white rounded-xl border border-primary/10">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
            <TabsTrigger value="applications" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              <AlertCircle className="w-4 h-4 ml-2" />
              طلبات مقدمي الخدمات ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              <Users className="w-4 h-4 ml-2" />
              المستخدمين ({users.length})
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              <Settings className="w-4 h-4 ml-2" />
              الإعدادات
            </TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications" className="p-6 space-y-4">
            <div className="flex gap-2 mb-4">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="ابحث عن الطلبات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="space-y-4">
              {filteredApplications.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-2" />
                  <p className="text-muted-foreground">لا توجد طلبات</p>
                </div>
              ) : (
                filteredApplications.map(app => (
                  <div key={app.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{app.first_name} {app.last_name}</h3>
                        <p className="text-sm text-muted-foreground">{app.email}</p>
                        <p className="text-sm text-muted-foreground">{app.phone}</p>
                      </div>
                      <Badge className={cn(
                        app.status === 'PENDING' && 'bg-yellow-100 text-yellow-800',
                        app.status === 'APPROVED' && 'bg-green-100 text-green-800',
                        app.status === 'REJECTED' && 'bg-red-100 text-red-800'
                      )}>
                        {app.status === 'PENDING' && 'قيد الانتظار'}
                        {app.status === 'APPROVED' && 'موافق عليه'}
                        {app.status === 'REJECTED' && 'مرفوض'}
                      </Badge>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-semibold mb-1">نوع الخدمة:</p>
                      <Badge variant="outline">{app.role_requested}</Badge>
                    </div>

                    {/* Show credentials if approved */}
                    {app.status === 'APPROVED' && generatedCredentials[app.id] && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-3 border border-blue-200">
                        <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          بيانات الدخول
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between bg-white p-2 rounded border">
                            <code className="font-mono">{generatedCredentials[app.id].username}</code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(generatedCredentials[app.id].username)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex items-center justify-between bg-white p-2 rounded border">
                            <code className="font-mono">
                              {showCredentials[app.id] ? generatedCredentials[app.id].password : '••••••••'}
                            </code>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowCredentials(prev => ({ ...prev, [app.id]: !prev[app.id] }))}
                              >
                                {showCredentials[app.id] ? <Eye className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(generatedCredentials[app.id].password)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {app.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleApproveApplication(app.id)}
                        >
                          <CheckCircle2 className="w-4 h-4 ml-2" />
                          الموافقة
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleRejectApplication(app.id)}
                        >
                          <XCircle className="w-4 h-4 ml-2" />
                          الرفض
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="p-6 space-y-4">
            <div className="flex gap-2 mb-4">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="ابحث عن المستخدمين..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="space-y-2">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-2" />
                  <p className="text-muted-foreground">لا يوجد مستخدمين</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right p-3">البريد الإلكتروني</th>
                        <th className="text-right p-3">اسم المستخدم</th>
                        <th className="text-right p-3">الدور</th>
                        <th className="text-right p-3">تاريخ الإنشاء</th>
                        <th className="text-right p-3">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{user.email}</td>
                          <td className="p-3">{user.username || '-'}</td>
                          <td className="p-3">
                            <Badge variant="outline">{user.role}</Badge>
                          </td>
                          <td className="p-3 text-xs text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString('ar-SA')}
                          </td>
                          <td className="p-3">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent dir="rtl">
                                <AlertDialogTitle>حذف المستخدم</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.
                                </AlertDialogDescription>
                                <div className="flex gap-2 justify-end">
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    حذف
                                  </AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="p-6">
            <div className="max-w-md">
              <h3 className="text-lg font-bold mb-4">تغيير كلمة مرور الأدمن</h3>
              <form onSubmit={handleChangeAdminPassword} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-1 block">كلمة المرور الجديدة</label>
                  <Input
                    type="password"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور الجديدة"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1 block">تأكيد كلمة المرور</label>
                  <Input
                    type="password"
                    value={confirmAdminPassword}
                    onChange={(e) => setConfirmAdminPassword(e.target.value)}
                    placeholder="أعد إدخال كلمة المرور"
                  />
                </div>
                <Button type="submit" className="w-full">
                  تحديث كلمة المرور
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
