# نظام التحقق عبر رقم الهاتف (OTP) - بوصلة العافية

## نظرة عامة

نظام OTP احترافي وآمن وجاهز للإنتاج (Production-Ready) لتطبيق بوصلة العافية. يستخدم **Twilio Verify API** للتحقق من أرقام الهاتف، و**Supabase Edge Functions** للمعالجة الآمنة للطلبات، و**React** للواجهة الأمامية.

---

## المعمارية

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend                            │
│  (PhoneInput.tsx, OTPInput.tsx, OTPVerification.tsx)         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP Requests
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase Edge Functions                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ send-otp: إرسال رمز التحقق عبر Twilio Verify API   │   │
│  │ verify-otp: التحقق من الرمز وإنشاء جلسة المستخدم  │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────────┐    ┌──────────────────────┐
│  Twilio Verify   │    │  PostgreSQL Database │
│  (OTP Service)   │    │  (Supabase)          │
└──────────────────┘    └──────────────────────┘
```

---

## المكونات الرئيسية

### 1. **Supabase Edge Functions**

#### **send-otp** (`/supabase/functions/send-otp/index.ts`)

**الوظيفة:** إرسال رمز التحقق عبر Twilio Verify API

**المدخلات:**
```json
{
  "phone_number": "+967771234567"
}
```

**المخرجات (نجاح):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "phone_number": "+967771234567",
    "expires_in": 600,
    "attempt_count": 1
  }
}
```

**المخرجات (خطأ):**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "status_code": 429
}
```

**المميزات:**
- ✅ تطبيع أرقام الهاتف إلى صيغة E.164 (+967XXXXXXXXX)
- ✅ التحقق من صيغة الرقم اليمني (9 أرقام)
- ✅ فحص معدل الإرسال (Rate Limiting): 3 محاولات في الدقيقة
- ✅ حفظ السجل في قاعدة البيانات
- ✅ معالجة شاملة للأخطاء

---

#### **verify-otp** (`/supabase/functions/verify-otp/index.ts`)

**الوظيفة:** التحقق من رمز OTP وإنشاء جلسة المستخدم

**المدخلات:**
```json
{
  "phone_number": "+967771234567",
  "otp_code": "123456"
}
```

**المخرجات (نجاح):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "user_id": "uuid-here",
    "session": {
      "access_token": "jwt-token-here",
      "refresh_token": "jwt-refresh-token-here",
      "expires_in": 86400
    },
    "user": {
      "id": "uuid-here",
      "phone_number": "+967771234567"
    }
  }
}
```

**المخرجات (خطأ):**
```json
{
  "success": false,
  "error": "Invalid OTP code",
  "status_code": 400
}
```

**المميزات:**
- ✅ التحقق من الرمز عبر Twilio Verify API
- ✅ فحص انتهاء صلاحية الرمز (10 دقائق)
- ✅ حماية من محاولات متعددة خاطئة (3 محاولات كحد أقصى)
- ✅ إنشاء أو البحث عن المستخدم تلقائياً
- ✅ إنشاء جلسة JWT آمنة
- ✅ تسجيل جميع المحاولات للأمان

---

### 2. **مكونات React**

#### **PhoneInput.tsx**

مكون إدخال الهاتف مع تطبيع تلقائي:

```tsx
<PhoneInput
  value={phoneNumber}
  onChange={setPhoneNumber}
  onSubmit={handlePhoneSubmit}
  isLoading={isLoading}
  error={error}
  success={success}
/>
```

**المميزات:**
- ✅ تطبيع تلقائي لأرقام اليمن
- ✅ تنسيق جميل للعرض (771 234 567)
- ✅ تحقق من الصحة في الوقت الفعلي
- ✅ رسائل خطأ واضحة
- ✅ Mobile-First Design

---

#### **OTPInput.tsx**

مكون إدخال الرمز مع 6 حقول منفصلة:

```tsx
<OTPInput
  phoneNumber={phoneNumber}
  onSubmit={handleOTPSubmit}
  onBack={handleBackFromOTP}
  isLoading={isLoading}
  error={error}
  success={success}
  expiresIn={600}
/>
```

**المميزات:**
- ✅ 6 حقول منفصلة للرمز
- ✅ التنقل التلقائي بين الحقول
- ✅ دعم اللصق (Paste)
- ✅ عداد الوقت المتبقي
- ✅ رسائل خطأ واضحة
- ✅ Mobile-First Design

---

#### **OTPVerification.tsx**

الصفحة الرئيسية للتحقق:

```tsx
<OTPVerification />
```

**المميزات:**
- ✅ إدارة حالة التحقق (Phone → OTP)
- ✅ الربط مع Edge Functions
- ✅ تخزين الجلسة في localStorage
- ✅ إعادة التوجيه إلى الصفحة الرئيسية بعد النجاح
- ✅ معالجة شاملة للأخطاء

---

## جداول قاعدة البيانات

### **otp_attempts**

تتبع محاولات الإرسال والتحقق:

```sql
CREATE TABLE otp_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  ip_address TEXT,
  attempt_type TEXT NOT NULL, -- 'SEND' or 'VERIFY'
  status TEXT NOT NULL, -- 'SUCCESS', 'FAILED', 'BLOCKED'
  error_message TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

---

### **otp_verifications**

جلسات التحقق النشطة:

```sql
CREATE TABLE otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL UNIQUE,
  verification_status TEXT DEFAULT 'PENDING', -- 'PENDING', 'VERIFIED', 'FAILED', 'EXPIRED'
  attempts_count INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  expires_at TIMESTAMP NOT NULL,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

---

### **users**

جدول المستخدمين:

```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'PATIENT', -- 'PATIENT', 'DOCTOR', 'ADMIN'
  account_status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE', 'SUSPENDED'
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

---

## المتغيرات البيئية

### **متغيرات Supabase (.env.local)**

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### **متغيرات Twilio (Supabase Secrets)**

في لوحة تحكم Supabase، أضف المتغيرات التالية:

```
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_VERIFY_SERVICE_SID=your-verify-service-sid
JWT_SECRET=your-jwt-secret-key
```

---

## خطوات الإعداد

### 1. **إعداد Twilio Verify**

1. قم بتسجيل الدخول إلى [Twilio Console](https://www.twilio.com/console)
2. انتقل إلى **Verify** → **Services**
3. أنشئ خدمة جديدة أو استخدم خدمة موجودة
4. احصل على `TWILIO_VERIFY_SERVICE_SID`
5. احصل على `TWILIO_ACCOUNT_SID` و `TWILIO_AUTH_TOKEN` من الإعدادات

### 2. **إعداد Supabase Secrets**

```bash
# من خلال Supabase CLI
supabase secrets set TWILIO_ACCOUNT_SID=your-value
supabase secrets set TWILIO_AUTH_TOKEN=your-value
supabase secrets set TWILIO_VERIFY_SERVICE_SID=your-value
supabase secrets set JWT_SECRET=your-secret-key
```

### 3. **نشر Edge Functions**

```bash
# من مجلد المشروع
supabase functions deploy send-otp
supabase functions deploy verify-otp
```

### 4. **تشغيل الهجرات**

```bash
supabase db push
```

---

## اختبار النظام

### **اختبار send-otp**

```bash
curl -X POST https://your-project.supabase.co/functions/v1/send-otp \
  -H "Authorization: Bearer your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+967771234567"}'
```

### **اختبار verify-otp**

```bash
curl -X POST https://your-project.supabase.co/functions/v1/verify-otp \
  -H "Authorization: Bearer your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+967771234567", "otp_code": "123456"}'
```

---

## الأمان والحماية

### 1. **عدم كشف المفاتيح السرية**
- ✅ جميع المفاتيح السرية في Edge Functions فقط
- ✅ لا توجد مفاتيح في الكود الأمامي
- ✅ استخدام `service_role` للعمليات الحساسة

### 2. **حماية من الهجمات**
- ✅ Rate Limiting: 3 محاولات إرسال في الدقيقة
- ✅ حماية من محاولات التحقق المتعددة: 3 محاولات كحد أقصى
- ✅ انتهاء صلاحية الرمز: 10 دقائق
- ✅ تسجيل جميع المحاولات (عنوان IP، النوع، الحالة)

### 3. **سياسات الأمان (RLS)**
- ✅ جميع الجداول محمية بـ RLS
- ✅ المستخدمون يمكنهم فقط رؤية بياناتهم الخاصة
- ✅ الإدارة فقط يمكنها الوصول إلى السجلات

---

## معالجة الأخطاء

### **رموز الأخطاء الشائعة**

| الخطأ | السبب | الحل |
|------|------|------|
| `400` | بيانات غير صحيحة | تحقق من صيغة الرقم والرمز |
| `429` | تجاوز معدل الإرسال | انتظر قبل إعادة المحاولة |
| `500` | خطأ في الخادم | تحقق من المتغيرات البيئية |

---

## الخطوات التالية

### **المرحلة الرابعة: الاختبار والتوثيق**
- [ ] اختبار كامل للنظام
- [ ] اختبار الأداء تحت الضغط
- [ ] اختبار الأمان
- [ ] توثيق API الكامل

### **المرحلة الخامسة: التحسينات المستقبلية**
- [ ] دعم لغات متعددة
- [ ] دعم دول أخرى
- [ ] تحسين الواجهة الأمامية
- [ ] دعم المصادقة الثنائية (2FA)

---

## الملاحظات المهمة

1. **الأرقام اليمنية:** التطبيق مخصص لليمن حالياً (مفتاح +967)
2. **صيغة E.164:** جميع الأرقام تُخزن بصيغة E.164 الدولية
3. **الجلسات:** تُخزن الجلسات في localStorage على الواجهة الأمامية
4. **الأداء:** استخدام Indexes لتحسين الأداء على جداول التتبع

---

## الدعم والمساعدة

للمزيد من المعلومات:
- [Twilio Verify Documentation](https://www.twilio.com/docs/verify/api)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [React Documentation](https://react.dev)

---

**آخر تحديث:** 23 فبراير 2026
**الإصدار:** 1.0.0
