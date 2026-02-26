# دليل نشر الكود على GitHub

## 📋 المتطلبات الأساسية

### 1. حساب GitHub

تأكد من وجود حساب GitHub وتسجيل الدخول.

### 2. Git CLI

```bash
# تثبيت Git
sudo apt-get install git

# التحقق من التثبيت
git --version
```

### 3. SSH Key (اختياري لكن موصى به)

```bash
# إنشاء SSH Key
ssh-keygen -t ed25519 -C "your-email@example.com"

# إضافة المفتاح إلى GitHub
# https://github.com/settings/keys
```

---

## 🚀 خطوات النشر

### الخطوة 1: تهيئة Git (إذا لم يتم من قبل)

```bash
cd /home/ubuntu/wellness-compass

# تهيئة Git
git init

# إضافة المستخدم
git config user.name "Your Name"
git config user.email "your-email@example.com"
```

### الخطوة 2: إضافة الملفات

```bash
# إضافة جميع الملفات
git add .

# أو إضافة ملفات محددة
git add src/ supabase/ OTP_*.md QUICK_START.md CHANGELOG.md
```

### الخطوة 3: Commit الأول

```bash
# إنشاء commit
git commit -m "feat: Implement complete OTP system

- Add Supabase Edge Functions (send-otp, verify-otp)
- Add React components (PhoneInput, OTPInput, OTPVerification)
- Add comprehensive documentation (5 guides)
- Add security features (Rate Limiting, RLS, Input Validation)
- Add database schema with migrations
- Add testing guide and deployment guide
- Fully production-ready and tested"
```

### الخطوة 4: إنشاء مستودع على GitHub

1. قم بتسجيل الدخول إلى [GitHub](https://github.com)
2. انقر على **New Repository**
3. أدخل اسم المستودع: `wellness-compass`
4. اختر **Private** (لحماية البيانات)
5. انقر على **Create repository**

### الخطوة 5: إضافة Remote

```bash
# استبدل USERNAME بـ اسم المستخدم الخاص بك
git remote add origin https://github.com/USERNAME/wellness-compass.git

# أو استخدم SSH (إذا كان لديك SSH Key)
git remote add origin git@github.com:USERNAME/wellness-compass.git

# التحقق من Remote
git remote -v
```

### الخطوة 6: Push إلى GitHub

```bash
# إعادة تسمية الفرع الرئيسي (إذا لزم الأمر)
git branch -M main

# Push إلى GitHub
git push -u origin main

# النتيجة المتوقعة:
# Enumerating objects: 100, done.
# Counting objects: 100% (100/100), done.
# Writing objects: 100% (100/100), 50 KB/s, done.
# ...
# To github.com:USERNAME/wellness-compass.git
#  * [new branch]      main -> main
```

---

## 📁 ملفات يجب تجاهلها (.gitignore)

```bash
# إنشاء ملف .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Environment variables
.env
.env.local
.env.*.local

# Build files
dist/
build/
.next/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Supabase
supabase/.branches/
supabase/.temp/

# OS
Thumbs.db
.DS_Store

# Secrets
*.key
*.pem
.env.production
EOF

# إضافة .gitignore
git add .gitignore
git commit -m "chore: Add .gitignore"
git push
```

---

## 🔐 حماية البيانات الحساسة

### ⚠️ تحذير مهم

**لا تنشر المفاتيح السرية على GitHub!**

### ملفات يجب عدم نشرها

```
❌ .env (يحتوي على مفاتيح سرية)
❌ .env.local
❌ .env.production
❌ ملفات المفاتيح (.key, .pem)
```

### كيفية التعامل مع المتغيرات البيئية

```bash
# 1. إنشاء ملف .env.example
cat > .env.example << 'EOF'
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
EOF

# 2. إضافة .env.example إلى Git
git add .env.example
git commit -m "docs: Add .env.example template"

# 3. توثيق المتغيرات في README
# (تم بالفعل في OTP_DEPLOYMENT_GUIDE.md)
```

---

## 🔄 التحديثات المستقبلية

### إضافة ملفات جديدة

```bash
# إضافة الملفات
git add new-file.ts

# Commit
git commit -m "feat: Add new feature"

# Push
git push
```

### تعديل ملفات موجودة

```bash
# تعديل الملفات
# (قم بتعديل الملفات مباشرة)

# إضافة التعديلات
git add modified-file.ts

# Commit
git commit -m "fix: Fix bug in feature"

# Push
git push
```

### إنشاء فروع (Branches)

```bash
# إنشاء فرع جديد
git checkout -b feature/new-feature

# العمل على الفرع
# (قم بالتعديلات)

# Commit
git commit -m "feat: Add new feature"

# Push الفرع
git push -u origin feature/new-feature

# إنشاء Pull Request على GitHub
# (سيظهر خيار على GitHub)
```

---

## 📊 التحقق من الحالة

### عرض حالة Git

```bash
# عرض الملفات المعدلة
git status

# عرض السجل
git log

# عرض الفروع
git branch -a

# عرض Remote
git remote -v
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: "fatal: not a git repository"

**الحل:**
```bash
git init
```

### المشكلة: "fatal: remote origin already exists"

**الحل:**
```bash
git remote remove origin
git remote add origin https://github.com/USERNAME/wellness-compass.git
```

### المشكلة: "Permission denied (publickey)"

**الحل:**
```bash
# استخدم HTTPS بدلاً من SSH
git remote set-url origin https://github.com/USERNAME/wellness-compass.git
```

### المشكلة: "fatal: The current branch main has no upstream branch"

**الحل:**
```bash
git push -u origin main
```

---

## 📋 قائمة التحقق

- [ ] تثبيت Git
- [ ] إعداد اسم المستخدم والبريد الإلكتروني
- [ ] إنشاء مستودع على GitHub
- [ ] إضافة .gitignore
- [ ] Commit الملفات
- [ ] إضافة Remote
- [ ] Push إلى GitHub
- [ ] التحقق من GitHub

---

## 🎯 الخطوة التالية

بعد النشر على GitHub:

1. ✅ إعداد CI/CD Pipeline (GitHub Actions)
2. ✅ إعداد Branch Protection Rules
3. ✅ إضافة README.md إلى المستودع
4. ✅ إضافة Issues و Pull Request Templates
5. ✅ إعداد GitHub Pages (اختياري)

---

## 📚 الموارد المفيدة

- [GitHub Documentation](https://docs.github.com)
- [Git Documentation](https://git-scm.com/doc)
- [GitHub CLI](https://cli.github.com)

---

**آخر تحديث:** 23 فبراير 2026
