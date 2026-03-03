# 🚀 دليل البدء السريع - نظام OTP

## 5 دقائق للبدء

### 1️⃣ الوصول إلى الصفحة

```
http://localhost:5173/otp-verification
```

### 2️⃣ إدخال رقم الهاتف

```
أدخل: 771234567
سيصبح: +967771234567
```

### 3️⃣ استقبال الرمز

```
ستتلقى رسالة نصية برمز 6 أرقام
```

### 4️⃣ إدخال الرمز

```
أدخل الرمز في الحقول الستة
```

### 5️⃣ النجاح! 🎉

```
سيتم إعادة التوجيه إلى الصفحة الرئيسية
```

---

## 🔧 الإعداد الأساسي

### المتطلبات

```bash
# Node.js v18+
node --version

# npm
npm --version
```

### التثبيت

```bash
# تثبيت المكتبات
npm install

# بدء خادم التطوير
npm run dev
```

---

## 📚 الوثائق الكاملة

| الملف | الوصف |
| --- | --- |
| **OTP_README.md** | نظرة عامة شاملة |
| **OTP_SYSTEM_DOCUMENTATION.md** | توثيق تقني مفصل |
| **OTP_TESTING_GUIDE.md** | دليل الاختبار |
| **OTP_DEPLOYMENT_GUIDE.md** | دليل النشر |
| **OTP_SUMMARY.md** | ملخص المشروع |

---

## ⚙️ المتغيرات البيئية

### Frontend (.env )

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Backend (Supabase Secrets )

```bash
supabase secrets set TWILIO_ACCOUNT_SID=your-value
supabase secrets set TWILIO_AUTH_TOKEN=your-value
supabase secrets set TWILIO_VERIFY_SERVICE_SID=your-value
supabase secrets set JWT_SECRET=your-value
```

---

## 🧪 الاختبار السريع

### اختبار محلي

```bash
# 1. بدء Supabase
supabase start

# 2. بدء التطوير
npm run dev

# 3. الوصول إلى الصفحة
# http://localhost:5173/otp-verification
```

### اختبار API

```bash
# إرسال OTP
curl -X POST \
  http://localhost:54321/functions/v1/send-otp \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+967771234567"}'

# التحقق من OTP
curl -X POST \
  http://localhost:54321/functions/v1/verify-otp \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+967771234567", "otp_code": "123456"}'
```

---

## 🚀 النشر

### نشر Edge Functions

```bash
# ربط المشروع
supabase link --project-ref your-project-ref

# نشر الـ Functions
supabase functions deploy send-otp
supabase functions deploy verify-otp

# تطبيق الهجرات
supabase db push
```

### بناء المشروع

```bash
# بناء
npm run build

# النتيجة: dist/
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: لا يتم استقبال الرسالة

**الحل:**

1. تحقق من رقم الهاتف

1. تحقق من Twilio Console

1. تحقق من السجلات

### المشكلة: Rate limit exceeded

**الحل:**

1. انتظر دقيقة واحدة

1. جرب رقم هاتف مختلف

### المشكلة: الرمز غير صحيح

**الحل:**

1. تحقق من الرمز (6 أرقام )

1. تحقق من أن الرمز لم ينتهِ (10 دقائق)

---

## 📞 الدعم

### الموارد المتاحة

- 📖 [Supabase Docs](https://supabase.com/docs)

- 📖 [Twilio Docs](https://www.twilio.com/docs)

- 📖 [React Docs](https://react.dev)

### الملفات المهمة

```
wellness-compass/
├── src/pages/OTPVerification.tsx      # الصفحة الرئيسية
├── src/components/auth/
│   ├── PhoneInput.tsx                 # إدخال الهاتف
│   └── OTPInput.tsx                   # إدخال الرمز
├── supabase/functions/
│   ├── send-otp/index.ts              # إرسال الرمز
│   └── verify-otp/index.ts            # التحقق
└── OTP_*.md                           # الوثائق
```

---

## ✅ قائمة التحقق

- [x] تثبيت المكتبات

- [ ] إعداد المتغيرات البيئية

- [ ] بدء خادم التطوير

- [ ] الوصول إلى الصفحة

- [ ] اختبار الإرسال والتحقق

- [ ] قراءة الوثائق الكاملة

---

## 🎉 هذا كل شيء!

**أنت الآن جاهز للبدء مع نظام OTP! 🚀**

للمزيد من المعلومات، اقرأ الملفات الأخرى في المشروع.

---

**آخر تحديث:** 23 فبراير 2026

