# فحص وتحقق قاعدة البيانات

## الأعمدة المطلوبة في جدول users

تأكد من وجود الأعمدة التالية:

| الحقل | النوع | الوصف |
|------|------|-------|
| user_id | UUID | معرّف المستخدم الفريد |
| email | TEXT | البريد الإلكتروني |
| username | TEXT | اسم المستخدم (للمزودين) |
| phone_number | TEXT | رقم الهاتف |
| role | user_role | دور المستخدم |
| account_status | account_status | حالة الحساب |
| is_verified | BOOLEAN | هل تم التحقق من البريد |
| profile_picture_url | TEXT | رابط الصورة الشخصية |
| created_at | TIMESTAMP | تاريخ الإنشاء |
| updated_at | TIMESTAMP | تاريخ التحديث |

## قيم Enum المطلوبة

### user_role
يجب أن تحتوي على القيم التالية:
- PATIENT (مريض)
- DOCTOR (طبيب)
- PHARMACIST (صيدلي)
- LAB_MANAGER (مدير معمل)
- HOSPITAL_MANAGER (مدير مستشفى)
- SYSTEM_ADMIN (مسؤول النظام)

### account_status
يجب أن تحتوي على القيم التالية:
- ACTIVE (نشط وموافق عليه)
- INACTIVE (غير نشط)
- SUSPENDED (معلق)
- PENDING_ACTIVATION (في انتظار الموافقة)

### provider_status
يجب أن تحتوي على القيم التالية:
- PENDING (معلق)
- APPROVED (موافق عليه)
- REJECTED (مرفوض)

## الجداول المطلوبة

### جدول users
المستخدمون الأساسيون - يحتوي على البريد الإلكتروني والدور وحالة الحساب

### جدول provider_applications
طلبات مقدمي الخدمة - يحتوي على البيانات الشخصية والمستندات والحالة

### جداول مقدمي الخدمة
- `doctors` - الأطباء
- `pharmacists` - الصيادلة
- `laboratories` - المعامل
- `hospitals` - المستشفيات
- `patients` - المرضى

## استعلامات التحقق

### 1. التحقق من الأعمدة
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
```

### 2. التحقق من قيم Enum
```sql
SELECT enum_range(NULL::user_role);
SELECT enum_range(NULL::account_status);
```

### 3. عد المستخدمين حسب الدور
```sql
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role 
ORDER BY count DESC;
```

### 4. عد المستخدمين حسب حالة الحساب
```sql
SELECT account_status, COUNT(*) as count 
FROM users 
GROUP BY account_status 
ORDER BY count DESC;
```

### 5. التحقق من طلبات مقدمي الخدمة المعلقة
```sql
SELECT id, first_name, last_name, email, role_requested, status, created_at
FROM provider_applications
WHERE status = 'PENDING'
ORDER BY created_at DESC;
```

### 6. التحقق من المستخدمين بدون ملفات شخصية
```sql
SELECT u.user_id, u.email, u.role, u.account_status
FROM users u
LEFT JOIN patients p ON u.user_id = p.patient_id
LEFT JOIN doctors d ON u.user_id = d.doctor_id
LEFT JOIN pharmacists ph ON u.user_id = ph.pharmacist_id
LEFT JOIN laboratories l ON u.user_id = l.lab_id
LEFT JOIN hospitals h ON u.user_id = h.hospital_id
WHERE (u.role = 'PATIENT' AND p.patient_id IS NULL)
   OR (u.role = 'DOCTOR' AND d.doctor_id IS NULL)
   OR (u.role = 'PHARMACIST' AND ph.pharmacist_id IS NULL)
   OR (u.role = 'LAB_MANAGER' AND l.lab_id IS NULL)
   OR (u.role = 'HOSPITAL_MANAGER' AND h.hospital_id IS NULL);
```

## ملاحظات مهمة

### اسم المستخدم (username)
يجب أن يكون فريداً لكل مقدم خدمة. يتم توليده تلقائياً عند قبول الطلب من الأدمن ويتم استخدامه في تسجيل الدخول بدلاً من البريد الإلكتروني.

### حالة الحساب (account_status)
يجب أن تكون `ACTIVE` لكي يتمكن المزود من الدخول. يتم تعيينها تلقائياً عند قبول الطلب من الأدمن.

### الأدوار (roles)
يجب أن تكون بأحرف كبيرة (UPPERCASE) وتحدد نوع المستخدم والصلاحيات.

### الملفات الشخصية
يجب أن يكون لكل مستخدم ملف شخصي في الجدول المناسب. يتم إنشاؤها تلقائياً عند التسجيل أو قبول الطلب.

## الخطوات التالية

1. تشغيل استعلامات التحقق أعلاه في Supabase SQL Editor
2. التأكد من وجود جميع الأعمدة والقيم المطلوبة
3. إصلاح أي مشاكل تم اكتشافها
4. اختبار نظام تسجيل الدخول والتسجيل
