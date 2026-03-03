# دليل نشر نظام OTP - بوصلة العافية

## نظرة عامة

هذا الدليل يوضح كيفية نشر نظام OTP على الإنتاج (Production)، بما في ذلك إعداد المتغيرات البيئية والـ Edge Functions.

---

## 1. المتطلبات الأساسية

### أدوات مطلوبة

```bash
# تثبيت Supabase CLI
npm install -g supabase

# التحقق من التثبيت
supabase --version
```

### حسابات مطلوبة

- ✅ حساب Supabase (مشروع موجود)
- ✅ حساب Twilio (مع Verify Service)
- ✅ حساب GitHub (لنشر الكود)

---

## 2. إعداد Twilio

### الخطوة 1: الحصول على بيانات Twilio

1. قم بتسجيل الدخول إلى [Twilio Console](https://www.twilio.com/console)
2. انسخ **Account SID** و **Auth Token** من الصفحة الرئيسية
3. انتقل إلى **Verify** → **Services**
4. أنشئ خدمة جديدة أو استخدم خدمة موجودة
5. انسخ **Service SID**

### الخطوة 2: تحديد رقم الهاتف للاختبار

في Twilio Console:
1. انتقل إلى **Phone Numbers** → **Verified Caller IDs**
2. أضف رقم الهاتف الذي تريد اختباره
3. تحقق من الرقم عبر الرسالة النصية

---

## 3. إعداد Supabase

### الخطوة 1: تسجيل الدخول إلى Supabase

```bash
supabase login
```

### الخطوة 2: ربط المشروع

```bash
cd /home/ubuntu/wellness-compass

# ربط المشروع
supabase link --project-ref utkxlorfpersgufprjoh
```

### الخطوة 3: إضافة المتغيرات البيئية (Secrets)

```bash
# إضافة Twilio Secrets
supabase secrets set TWILIO_ACCOUNT_SID="your-account-sid"
supabase secrets set TWILIO_AUTH_TOKEN="your-auth-token"
supabase secrets set TWILIO_VERIFY_SERVICE_SID="your-verify-service-sid"

# إضافة JWT Secret (استخدم كلمة سر قوية)
supabase secrets set JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
```

### الخطوة 4: التحقق من المتغيرات

```bash
supabase secrets list
```

**النتيجة المتوقعة:**
```
name                          value
TWILIO_ACCOUNT_SID            ****...
TWILIO_AUTH_TOKEN             ****...
TWILIO_VERIFY_SERVICE_SID     ****...
JWT_SECRET                    ****...
```

---

## 4. نشر Edge Functions

### الخطوة 1: التحقق من الملفات

```bash
# التحقق من وجود الملفات
ls -la supabase/functions/send-otp/
ls -la supabase/functions/verify-otp/

# النتيجة المتوقعة:
# - index.ts (الملف الرئيسي)
```

### الخطوة 2: اختبار محلياً

```bash
# بدء Supabase محلياً
supabase start

# في نافذة أخرى: اختبار send-otp
curl -X POST \
  http://localhost:54321/functions/v1/send-otp \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0a3hsb3JmcGVyc2d1ZnByam9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1Mzg0NzksImV4cCI6MjA4NzExNDQ3OX0.lg05W-XX_oqnPeezi3z0u__io63JANVcP8kpTlmgKOY" \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+967771234567"}'
```

### الخطوة 3: نشر على الإنتاج

```bash
# نشر send-otp
supabase functions deploy send-otp

# نشر verify-otp
supabase functions deploy verify-otp

# النتيجة المتوقعة:
# ✓ Function deployed successfully
```

### الخطوة 4: التحقق من النشر

```bash
# عرض قائمة الـ Functions
supabase functions list

# النتيجة المتوقعة:
# send-otp
# verify-otp
```

---

## 5. إعداد قاعدة البيانات

### الخطوة 1: تطبيق الهجرات

```bash
# تطبيق جميع الهجرات
supabase db push

# النتيجة المتوقعة:
# ✓ Migration applied successfully
```

### الخطوة 2: التحقق من الجداول

في Supabase Dashboard:
1. انتقل إلى **Database** → **Tables**
2. تحقق من وجود الجداول:
   - ✅ `otp_attempts`
   - ✅ `otp_verifications`
   - ✅ `users`

### الخطوة 3: التحقق من الفهارس (Indexes)

```sql
-- في Supabase SQL Editor
SELECT * FROM pg_indexes 
WHERE tablename IN ('otp_attempts', 'otp_verifications');

-- النتيجة المتوقعة: يجب أن تكون هناك فهارس على:
-- - otp_attempts (phone_number, created_at)
-- - otp_verifications (phone_number)
```

---

## 6. إعداد الواجهة الأمامية

### الخطوة 1: متغيرات البيئة

تحقق من ملف `.env`:

```env
VITE_SUPABASE_URL="https://utkxlorfpersgufprjoh.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0a3hsb3JmcGVyc2d1ZnByam9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1Mzg0NzksImV4cCI6MjA4NzExNDQ3OX0.lg05W-XX_oqnPeezi3z0u__io63JANVcP8kpTlmgKOY"
```

### الخطوة 2: بناء المشروع

```bash
# تثبيت المكتبات
npm install

# بناء المشروع
npm run build

# النتيجة المتوقعة:
# ✓ built in 45.23s
```

### الخطوة 3: اختبار محلياً

```bash
# بدء خادم التطوير
npm run dev

# الوصول إلى الصفحة
# http://localhost:5173/otp-verification
```

---

## 7. نشر على Vercel (أو أي منصة أخرى)

### الخطوة 1: إعداد Vercel

```bash
# تثبيت Vercel CLI
npm install -g vercel

# تسجيل الدخول
vercel login
```

### الخطوة 2: ربط المشروع

```bash
# ربط المشروع
vercel link

# إضافة متغيرات البيئة
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### الخطوة 3: النشر

```bash
# نشر على الإنتاج
vercel --prod

# النتيجة المتوقعة:
# ✓ Production: https://wellness-compass.vercel.app
```

---

## 8. نشر على GitHub

### الخطوة 1: إنشاء مستودع GitHub

```bash
# تهيئة Git
git init

# إضافة ملفات
git add .

# Commit الأول
git commit -m "Initial commit: OTP system implementation"

# إضافة Remote
git remote add origin https://github.com/wellcomp23-wq/wellness-compass.git

# Push إلى GitHub
git branch -M main
git push -u origin main
```

### الخطوة 2: إعداد GitHub Actions (اختياري)

إنشاء ملف `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 9. المراقبة والصيانة

### الخطوة 1: مراقبة السجلات

```bash
# عرض سجلات Edge Functions
supabase functions logs send-otp

# عرض سجلات قاعدة البيانات
supabase db logs
```

### الخطوة 2: مراقبة الأداء

في Supabase Dashboard:
1. انتقل إلى **Analytics**
2. راقب:
   - عدد الطلبات
   - وقت الاستجابة
   - معدل الأخطاء

### الخطوة 3: النسخ الاحتياطي

```bash
# إنشاء نسخة احتياطية من قاعدة البيانات
supabase db backup create

# عرض النسخ الاحتياطية
supabase db backup list
```

---

## 10. استكشاف الأخطاء

### المشكلة: "Function not found"

**الحل:**
```bash
# تحقق من نشر الـ Functions
supabase functions list

# أعد نشر الـ Functions
supabase functions deploy send-otp
supabase functions deploy verify-otp
```

### المشكلة: "Secret not found"

**الحل:**
```bash
# تحقق من المتغيرات
supabase secrets list

# أضف المتغيرات المفقودة
supabase secrets set TWILIO_ACCOUNT_SID="your-value"
```

### المشكلة: "Database connection error"

**الحل:**
```bash
# تحقق من اتصال قاعدة البيانات
supabase db status

# أعد تطبيق الهجرات
supabase db push
```

---

## 11. قائمة التحقق النهائية

### قبل النشر

- [ ] جميع المتغيرات البيئية محددة
- [ ] Edge Functions مختبرة محلياً
- [ ] قاعدة البيانات محدثة
- [ ] لا توجد أخطاء في الكود
- [ ] الأداء مقبول

### بعد النشر

- [ ] الـ Functions تعمل على الإنتاج
- [ ] قاعدة البيانات متصلة
- [ ] الواجهة الأمامية تعمل بشكل صحيح
- [ ] السجلات تُسجل بشكل صحيح
- [ ] المراقبة نشطة

---

## 12. الخطوات التالية

بعد النشر الناجح:

1. ✅ مراقبة الأداء والأمان
2. ✅ جمع ملاحظات المستخدمين
3. ✅ إصلاح أي مشاكل تظهر
4. ✅ تحسين النظام بناءً على الملاحظات
5. ✅ إضافة ميزات جديدة

---

## 13. الموارد الإضافية

- [Supabase Documentation](https://supabase.com/docs)
- [Twilio Verify API](https://www.twilio.com/docs/verify/api)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Vercel Deployment](https://vercel.com/docs)

---

**آخر تحديث:** 23 فبراير 2026
**الإصدار:** 1.0.0
