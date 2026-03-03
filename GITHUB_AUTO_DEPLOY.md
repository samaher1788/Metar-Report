# 🔄 تفعيل النشر التلقائي من GitHub إلى Cloudflare Pages

## ⚡ الهدف
ربط GitHub repository بـ Cloudflare Pages حتى عند عمل `git push` يتم النشر تلقائياً!

---

## 📋 الخطوات التفصيلية:

### 1️⃣ افتح Cloudflare Dashboard

اذهب إلى:
```
https://dash.cloudflare.com
```

### 2️⃣ اذهب إلى Pages

من القائمة الجانبية:
- اضغط على **Pages**

### 3️⃣ افتح مشروع metar-reports

- ابحث عن المشروع **metar-reports**
- اضغط عليه لفتح صفحة المشروع

### 4️⃣ اذهب إلى Settings

في صفحة المشروع:
- اضغط على تبويب **Settings** (في الأعلى)

### 5️⃣ ابحث عن Builds & deployments

في القائمة الجانبية للإعدادات:
- اضغط على **Builds & deployments**

### 6️⃣ ربط GitHub Repository

ستجد قسم **Source**:

#### إذا لم يكن مربوط:
1. اضغط **Connect to Git**
2. اختر **GitHub**
3. سيطلب منك السماح لـ Cloudflare بالوصول لـ GitHub
4. اضغط **Authorize Cloudflare**
5. اختر repository: **samaher1788/Metar-Report**
6. اضغط **Begin setup**

#### إذا كان مربوط بالفعل:
- تحقق أن الاتصال نشط ✅
- تأكد أن Branch المختار هو: `main`

---

## ⚙️ إعدادات Build

عند ربط GitHub، سيطلب منك Cloudflare إعدادات Build:

### ✅ الإعدادات الصحيحة:

```
Framework preset: None
Build command: npm run build
Build output directory: dist
Root directory: /
```

### 📝 شرح الإعدادات:

| الإعداد | القيمة | السبب |
|---------|--------|-------|
| **Production branch** | `main` | الفرع الذي سينشر على Production |
| **Build command** | `npm run build` | الأمر لبناء المشروع |
| **Build output** | `dist` | المجلد الذي يحتوي النسخة المبنية |
| **Root directory** | `/` | مجلد المشروع الأساسي |
| **Node version** | `18` أو `20` | نسخة Node.js |

---

## 🎯 التفعيل

بعد إتمام الإعدادات:

1. اضغط **Save and Deploy**
2. Cloudflare سيبدأ أول deployment تلقائياً
3. انتظر 2-3 دقائق حتى يكتمل

---

## ✅ التحقق من التفعيل

### 1. افتح تبويب Deployments

في صفحة المشروع:
- اضغط **Deployments**
- تأكد أنك ترى:
  - ✅ آخر deployment من `main` branch
  - ✅ حالة: **Success** (Production)

### 2. اختبر النشر التلقائي

الآن جرّب عمل تغيير بسيط:

```bash
cd /home/user/webapp

# عمل تغيير بسيط
echo "# Last updated: $(date)" >> README.md

# حفظ التغيير
git add README.md
git commit -m "Test auto deployment"

# رفع للـ GitHub
git push origin main
```

### 3. راقب Cloudflare

- افتح صفحة Deployments
- خلال 30 ثانية سترى deployment جديد يبدأ تلقائياً! 🎉
- انتظر 2-3 دقائق حتى يكتمل
- افتح https://metar-reports.pages.dev وتحقق من التحديث

---

## 🔔 إشعارات GitHub (اختياري)

### ربط Cloudflare بـ GitHub Status:

عند نجاح ربط GitHub:
- ستظهر تحديثات حالة deployment في GitHub
- في صفحة commits سترى ✅ أو ❌ بجانب كل commit
- هذا يخبرك هل النشر نجح أم فشل

---

## 🚀 سير العمل التلقائي بعد الربط:

```
1. تعديل الكود في الـ Sandbox أو محلياً
   ↓
2. git add . && git commit -m "..."
   ↓
3. git push origin main
   ↓
4. GitHub يستقبل التحديثات
   ↓
5. Cloudflare يكتشف Push تلقائياً (خلال 30 ثانية)
   ↓
6. Cloudflare يبدأ Build (npm run build)
   ↓
7. Cloudflare ينشر dist/ على Edge Network
   ↓
8. الموقع يتحدث على https://metar-reports.pages.dev
   ↓
✅ انتهى! (إجمالي: 2-3 دقائق)
```

---

## 🛠️ استكشاف الأخطاء

### ❌ إذا لم يبدأ deployment تلقائياً:

#### 1. تحقق من الربط:
```
Settings → Builds & deployments → Source
```
يجب أن ترى: **Connected to GitHub: samaher1788/Metar-Report**

#### 2. تحقق من Branch:
تأكد أن Production branch هو `main` وليس `master`

#### 3. تحقق من Webhooks في GitHub:
```
https://github.com/samaher1788/Metar-Report/settings/hooks
```
يجب أن ترى Webhook من Cloudflare (نشط ✅)

#### 4. جرّب إعادة الربط:
```
Settings → Builds & deployments → Source
اضغط Disconnect
ثم Connect to Git مرة أخرى
```

---

## 📊 مزايا النشر التلقائي:

| الميزة | الوصف |
|--------|-------|
| ⚡ **سرعة** | نشر خلال دقائق من الـ push |
| 🔄 **تلقائي** | لا حاجة لأوامر wrangler يدوية |
| 📝 **تاريخ** | كل deployment مرتبط بـ commit |
| 🌍 **Edge** | نشر عالمي على شبكة Cloudflare |
| ✅ **اختبار** | كل commit يُختبر قبل النشر |
| 🔙 **Rollback** | إمكانية الرجوع لأي نسخة سابقة |

---

## 🎉 بعد الربط الناجح:

✅ **ما عليك فعله:**
```bash
git add .
git commit -m "Your changes"
git push origin main
```

✅ **Cloudflare يفعل الباقي:**
- Build المشروع
- Deploy على Edge
- تحديث الموقع
- إرسال إشعار النجاح

---

## 🔗 الروابط المهمة:

- **Cloudflare Dashboard:** https://dash.cloudflare.com
- **Project Settings:** https://dash.cloudflare.com → Pages → metar-reports → Settings
- **Deployments:** https://dash.cloudflare.com → Pages → metar-reports → Deployments
- **GitHub Repo:** https://github.com/samaher1788/Metar-Report
- **Live Site:** https://metar-reports.pages.dev

---

**الآن موقعك سيتحدث تلقائياً مع كل push للـ GitHub! 🚀**
