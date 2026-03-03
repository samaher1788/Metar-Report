# 🚀 نشر التطبيق على Cloudflare Pages

## الموقع الحالي (Sandbox):
```
https://3000-izpgo3lrykp31lm2zny4e-8f57ffe2.sandbox.novita.ai
```

## الموقع المستهدف (Production):
```
https://metar-reports.pages.dev
```

---

## ✅ الملفات جاهزة للنشر:

```
dist/
├── _worker.js (41 KB) ✅
├── _routes.json ✅
└── static/
    ├── app.js (19 KB) ✅
    ├── pdf-generator-reference.js (30 KB) ✅
    ├── pdf-generator.js (18 KB) ✅
    ├── wind-rose-simple.js (7 KB) ✅
    ├── ncm-logo.png (59 KB) ✅
    ├── logo.png (50 KB) ✅
    ├── favicon.svg ✅
    └── style.css ✅
```

---

## 🚀 خيارات النشر:

### خيار 1: عبر GitHub (الموصى به - تلقائي)

إذا كان الريبو متصل بـ GitHub:

```bash
cd /home/user/webapp
git push origin main
```

Cloudflare Pages سيبني وينشر تلقائياً خلال 2-3 دقائق.

---

### خيار 2: عبر Wrangler CLI (يدوي - سريع)

```bash
# 1. تسجيل الدخول (مرة واحدة فقط)
cd /home/user/webapp
npx wrangler login

# 2. النشر مباشرة
npx wrangler pages deploy dist --project-name metar-reports
```

أو استخدم الأمر المختصر:

```bash
npm run deploy:prod
```

---

### خيار 3: عبر Cloudflare Dashboard (واجهة ويب)

1. افتح: https://dash.cloudflare.com
2. اذهب إلى: **Pages** → **metar-reports**
3. اضغط: **Create deployment**
4. ارفع مجلد `dist/` كاملاً من جهازك
5. اضغط: **Deploy site**

---

## ⚙️ إعدادات المشروع:

### wrangler.jsonc:
```json
{
  "name": "metar-reports",
  "compatibility_date": "2026-03-03",
  "pages_build_output_dir": "./dist"
}
```

### package.json scripts:
```json
{
  "deploy:prod": "npm run build && wrangler pages deploy dist --project-name metar-reports"
}
```

---

## ✅ التحقق بعد النشر:

### 1. افتح الرابط:
```
https://metar-reports.pages.dev
```

### 2. تحقق من الوظائف:
- ✅ الصفحة تحمّل بدون أخطاء
- ✅ التواريخ محددة تلقائياً
- ✅ قائمة الشبكات تعمل (10 شبكات)
- ✅ زر "إنشاء التقرير" يعمل
- ✅ **لا توجد خريطة** (تم حذفها)
- ✅ بطاقات الإحصائيات تظهر (4 بطاقات)
- ✅ زر "تحميل PDF" يعمل

### 3. اختبر PDF:
- ✅ افتح PDF المُحمّل
- ✅ تحقق من:
  - شعار NCM في الأعلى
  - العنوان والتاريخ
  - جدول الملخص الشامل
  - وصف المحطات
  - تفاصيل كل محطة
  - **لا يوجد نص تحذيري** في النهاية
  - المسافات قريبة ومنظمة

---

## 🔄 إذا لم تظهر التحديثات:

### 1. امسح Cache:
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

### 2. تحقق من Deployments:
```
https://dash.cloudflare.com
→ Pages → metar-reports → Deployments
```

تأكد أن آخر deployment:
- ✅ Status: Success
- ✅ Branch: main
- ✅ Environment: Production
- ✅ Timestamp: الآن

### 3. أعد النشر:
```bash
npm run deploy:prod
```

---

## 📊 ما سيتم نشره:

### التحديثات المشمولة:
1. ✅ حذف جميع الخرائط التفاعلية
2. ✅ حذف Leaflet.js و map-generator.js
3. ✅ تحسين PDF (بدون disclaimer، مسافات أقل)
4. ✅ تنظيف الملفات (من 17 → 8 ملفات)
5. ✅ تقليل الحجم (من 340KB → 205KB)

### الوظائف المحفوظة:
1. ✅ جلب بيانات METAR (10 شبكات)
2. ✅ تحليل الظواهر الغبارية
3. ✅ عرض الإحصائيات
4. ✅ توليد تقارير PDF احترافية
5. ✅ واجهة عربية كاملة

---

## ⚡ الأمر السريع - انسخ والصق:

```bash
# إذا كان GitHub متصل:
cd /home/user/webapp && git push origin main

# أو للنشر اليدوي:
cd /home/user/webapp && npx wrangler login && npm run deploy:prod
```

---

## 🎯 النتيجة المتوقعة:

بعد النشر، الموقع على `https://metar-reports.pages.dev` سيكون:

✅ **مطابق تماماً** للموقع الحالي على Sandbox
✅ **بدون خرائط** تفاعلية
✅ **PDF محسّن** بدون disclaimer
✅ **أسرع** في التحميل (205KB فقط)
✅ **احترافي** وسهل الاستخدام

---

**ابدأ النشر الآن واختبر بعد 2-3 دقائق!** 🚀
