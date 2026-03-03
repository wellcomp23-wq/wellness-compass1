# دليل اختبار نظام OTP - بوصلة العافية

## نظرة عامة

هذا الدليل يوضح كيفية اختبار نظام OTP بالكامل، من إرسال الرمز إلى التحقق منه وإنشاء الجلسة.

---

## 1. الاختبار المحلي (Local Testing)

### المتطلبات الأساسية

```bash
# تثبيت المكتبات
npm install

# بدء خادم التطوير
npm run dev

# في نافذة أخرى: بدء Supabase محلياً
supabase start
```

### الخطوة 1: الوصول إلى صفحة OTP

```
http://localhost:5173/otp-verification
```

### الخطوة 2: إدخال رقم الهاتف

1. أدخل رقم هاتف يمني (مثلاً: 771234567)
2. سيتم تطبيعه تلقائياً إلى: +967771234567
3. اضغط على "إرسال رمز التحقق"

**النتيجة المتوقعة:**
- ✅ ظهور رسالة نجاح
- ✅ الانتقال إلى خطوة إدخال الرمز

### الخطوة 3: إدخال رمز OTP

1. ستتلقى رسالة نصية بالرمز (أو يمكنك الحصول عليه من Twilio Console)
2. أدخل الرمز في الحقول الستة
3. اضغط على "تحقق"

**النتيجة المتوقعة:**
- ✅ ظهور رسالة نجاح
- ✅ إعادة التوجيه إلى الصفحة الرئيسية (/home)
- ✅ حفظ الجلسة في localStorage

---

## 2. اختبار API (cURL)

### اختبار send-otp

```bash
curl -X POST \
  https://utkxlorfpersgufprjoh.supabase.co/functions/v1/send-otp \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0a3hsb3JmcGVyc2d1ZnByam9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1Mzg0NzksImV4cCI6MjA4NzExNDQ3OX0.lg05W-XX_oqnPeezi3z0u__io63JANVcP8kpTlmgKOY" \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+967771234567"
  }'
```

**النتيجة المتوقعة:**
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

### اختبار verify-otp

```bash
curl -X POST \
  https://utkxlorfpersgufprjoh.supabase.co/functions/v1/verify-otp \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0a3hsb3JmcGVyc2d1ZnByam9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1Mzg0NzksImV4cCI6MjA4NzExNDQ3OX0.lg05W-XX_oqnPeezi3z0u__io63JANVcP8kpTlmgKOY" \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+967771234567",
    "otp_code": "123456"
  }'
```

**النتيجة المتوقعة:**
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

---

## 3. حالات الاختبار (Test Cases)

### 3.1 اختبار صحة الرقم

| الحالة | الإدخال | النتيجة المتوقعة |
|--------|--------|-----------------|
| رقم صحيح | 771234567 | ✅ نجاح |
| رقم مع مفتاح الدولة | +967771234567 | ✅ نجاح |
| رقم مع 0 في البداية | 0771234567 | ✅ نجاح (تطبيع تلقائي) |
| رقم قصير جداً | 77123 | ❌ خطأ: "Invalid phone number format" |
| رقم طويل جداً | 77123456789012 | ❌ خطأ: "Invalid phone number format" |
| رقم يبدأ برقم غير صحيح | 881234567 | ❌ خطأ: "Invalid Yemeni phone number" |
| حقل فارغ | (فارغ) | ❌ خطأ: "Phone number is required" |

### 3.2 اختبار معدل الإرسال (Rate Limiting)

| المحاولة | الفاصل الزمني | النتيجة المتوقعة |
|---------|-------------|-----------------|
| 1 | 0 ثانية | ✅ نجاح |
| 2 | 10 ثواني | ✅ نجاح |
| 3 | 20 ثانية | ✅ نجاح |
| 4 | 30 ثانية | ❌ خطأ: "Rate limit exceeded" (429) |

### 3.3 اختبار التحقق من الرمز

| الحالة | الإدخال | النتيجة المتوقعة |
|--------|--------|-----------------|
| رمز صحيح | 123456 | ✅ نجاح |
| رمز خاطئ | 654321 | ❌ خطأ: "Invalid OTP code" |
| رمز منتهي الصلاحية | (بعد 10 دقائق) | ❌ خطأ: "OTP code has expired" |
| رمز ناقص | 12345 | ❌ خطأ: "Invalid OTP format" |
| محاولات متعددة خاطئة | (3 محاولات) | ❌ خطأ: "Too many failed attempts" (429) |

### 3.4 اختبار الواجهة الأمامية

| الحالة | الإجراء | النتيجة المتوقعة |
|--------|--------|-----------------|
| تطبيع الرقم | إدخال 771234567 | ✅ عرض: +967 771 234 567 |
| لصق الرمز | Ctrl+V مع 123456 | ✅ ملء جميع الحقول تلقائياً |
| عداد الوقت | بعد الإرسال | ✅ عرض العد التنازلي (10:00) |
| انتهاء الصلاحية | بعد 10 دقائق | ✅ عرض رسالة "انتهت الصلاحية" |
| الرجوع | اضغط "رجوع" | ✅ العودة إلى خطوة الهاتف |

---

## 4. اختبار الأمان

### 4.1 اختبار حماية من الهجمات

```bash
# محاولة إرسال طلب بدون Authorization
curl -X POST \
  https://utkxlorfpersgufprjoh.supabase.co/functions/v1/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+967771234567"}'

# النتيجة المتوقعة: ❌ 401 Unauthorized
```

### 4.2 اختبار SQL Injection

```bash
# محاولة SQL Injection
curl -X POST \
  https://utkxlorfpersgufprjoh.supabase.co/functions/v1/send-otp \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+967771234567\"; DROP TABLE users; --"
  }'

# النتيجة المتوقعة: ❌ خطأ في التحقق من الصيغة
```

### 4.3 اختبار XSS

```bash
# محاولة XSS
curl -X POST \
  https://utkxlorfpersgufprjoh.supabase.co/functions/v1/send-otp \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "<script>alert(\"XSS\")</script>"
  }'

# النتيجة المتوقعة: ❌ خطأ في التحقق من الصيغة
```

---

## 5. اختبار الأداء

### 5.1 اختبار الاستجابة السريعة

```bash
# قياس وقت الاستجابة
time curl -X POST \
  https://utkxlorfpersgufprjoh.supabase.co/functions/v1/send-otp \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+967771234567"}'

# النتيجة المتوقعة: < 2 ثانية
```

### 5.2 اختبار تحت الضغط

```bash
# استخدام Apache Bench لاختبار الحمل
ab -n 100 -c 10 -p data.json -T application/json \
  https://utkxlorfpersgufprjoh.supabase.co/functions/v1/send-otp

# النتيجة المتوقعة: معدل نجاح عالي، معدل خطأ منخفض
```

---

## 6. اختبار قاعدة البيانات

### 6.1 التحقق من جدول otp_attempts

```sql
-- الاتصال بـ Supabase
SELECT * FROM otp_attempts 
ORDER BY created_at DESC 
LIMIT 10;

-- النتيجة المتوقعة: جميع المحاولات مسجلة بشكل صحيح
```

### 6.2 التحقق من جدول otp_verifications

```sql
SELECT * FROM otp_verifications 
WHERE phone_number = '+967771234567';

-- النتيجة المتوقعة: حالة التحقق محدثة بشكل صحيح
```

### 6.3 التحقق من جدول users

```sql
SELECT * FROM users 
WHERE phone_number = '+967771234567';

-- النتيجة المتوقعة: المستخدم الجديد تم إنشاؤه بنجاح
```

---

## 7. اختبار الأجهزة المختلفة

### 7.1 اختبار Mobile

- [ ] اختبار على iPhone (Safari)
- [ ] اختبار على Android (Chrome)
- [ ] اختبار على الأجهزة اللوحية
- [ ] اختبار الاتصالات البطيئة (3G)

### 7.2 اختبار المتصفحات

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### 7.3 اختبار الاتجاهات

- [ ] اختبار RTL (العربية)
- [ ] اختبار LTR (الإنجليزية)

---

## 8. قائمة التحقق النهائية

### قبل النشر (Pre-Deployment)

- [ ] جميع حالات الاختبار تمر بنجاح
- [ ] لا توجد أخطاء في وحدة التحكم (Console)
- [ ] الأداء مقبول (< 2 ثانية)
- [ ] الأمان مؤمّن (لا توجد ثغرات)
- [ ] جميع المتغيرات البيئية محددة
- [ ] الكود موثق بشكل جيد
- [ ] لا توجد رسائل تحذير (Warnings)

### بعد النشر (Post-Deployment)

- [ ] اختبار على الخادم الحي
- [ ] مراقبة السجلات (Logs)
- [ ] قياس الأداء الفعلي
- [ ] جمع ملاحظات المستخدمين
- [ ] إصلاح أي مشاكل تظهر

---

## 9. استكشاف الأخطاء

### المشكلة: لا يتم استقبال الرسالة النصية

**الحل:**
1. تحقق من رقم الهاتف (يجب أن يكون صحيحاً)
2. تحقق من Twilio Console (هل الخدمة نشطة؟)
3. تحقق من السجلات (Logs) في Supabase
4. تحقق من المتغيرات البيئية

### المشكلة: رسالة خطأ "Rate limit exceeded"

**الحل:**
1. انتظر دقيقة واحدة قبل إعادة المحاولة
2. تحقق من عدد المحاولات السابقة
3. امسح بيانات localStorage إذا لزم الأمر

### المشكلة: الرمز غير صحيح

**الحل:**
1. تحقق من أن الرمز صحيح (6 أرقام)
2. تحقق من أن الرمز لم ينتهِ (10 دقائق)
3. تحقق من أنك لم تتجاوز 3 محاولات خاطئة

### المشكلة: لا يتم إنشاء المستخدم

**الحل:**
1. تحقق من أن رقم الهاتف فريد (لا يوجد مستخدم بنفس الرقم)
2. تحقق من أن قاعدة البيانات تعمل بشكل صحيح
3. تحقق من السجلات (Logs) في Supabase

---

## 10. الخطوات التالية

بعد النجاح في جميع الاختبارات:

1. ✅ نشر الكود على GitHub
2. ✅ توثيق المتغيرات البيئية
3. ✅ إعداد CI/CD Pipeline
4. ✅ مراقبة الأداء والأمان
5. ✅ جمع ملاحظات المستخدمين
6. ✅ تحسين النظام بناءً على الملاحظات

---

**آخر تحديث:** 23 فبراير 2026
**الإصدار:** 1.0.0
