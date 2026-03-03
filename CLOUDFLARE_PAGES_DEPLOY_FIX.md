# 🚀 دليل النشر على Cloudflare Pages

## ⚠️ إصلاح خطأ "Output directory dist not found"

---

## **المشكلة:**

```
Error: Output directory "dist" not found.
No build command specified. Skipping build step.
```

---

## **السبب:**

Cloudflare Pages لم يتم إعطاؤه **Build command** لبناء المشروع قبل النشر.

---

## **✅ الحل:**

### **الطريقة 1: تعديل إعدادات المشروع الحالي**

1. **افتح Cloudflare Dashboard:**
   https://dash.cloudflare.com

2. **اذهب إلى:** Workers & Pages

3. **اختر المشروع:** `dust-storm-reporter`

4. **Settings → Builds & deployments**

5. **عدّل Build configuration:**

   ```
   Production branch: main
   
   Build command: npm run build
   Build output directory: dist
   Root directory: (leave empty)
   
   Install command: npm install (default - don't change)
   ```

6. **Save changes**

7. **ارجع إلى Deployments → Retry deployment**

---

### **الطريقة 2: إنشاء مشروع جديد (إذا لم تنجح الطريقة 1)**

#### **الخطوة 1: حذف المشروع القديم (اختياري)**

1. Workers & Pages → اختر المشروع
2. Settings → Delete project
3. اكتب اسم المشروع للتأكيد → Delete

#### **الخطوة 2: إنشاء مشروع جديد**

1. **Workers & Pages → Create application**

2. **Pages → Connect to Git**

3. **اختر GitHub**
   - قد تحتاج منح الأذونات
   - اختر Repository: `samaher1788/Metar-Report`

4. **Begin setup:**

   ```
   ┌──────────────────────────────────────────────┐
   │ Project name: dust-storm-reporter            │
   │ (أو أي اسم تريده)                            │
   ├──────────────────────────────────────────────┤
   │ Production branch: main                      │
   ├──────────────────────────────────────────────┤
   │ Build settings:                              │
   │                                              │
   │ Framework preset: None                       │
   │ (اترك على None - مهم!)                      │
   │                                              │
   │ Build command:                               │
   │ npm run build                                │
   │ ⚠️ لا تتركه فارغاً!                         │
   │                                              │
   │ Build output directory:                      │
   │ dist                                         │
   │ (بدون ./ في البداية)                        │
   │                                              │
   │ Root directory (advanced):                   │
   │ (leave empty)                                │
   │                                              │
   │ Environment variables:                       │
   │ (none needed for now)                        │
   └──────────────────────────────────────────────┘
   ```

5. **Save and Deploy**

6. **انتظر 2-4 دقائق** حتى يكتمل النشر

---

## **📋 ماذا يحدث أثناء البناء:**

```
1. ⏬ Cloning repository from GitHub...
   ├─ Fetching: samaher1788/Metar-Report
   └─ Branch: main
   
2. 📦 Installing dependencies...
   ├─ Running: npm install
   ├─ Installing: hono, vite, wrangler, etc.
   └─ Time: ~1-2 minutes
   
3. 🔨 Building project...
   ├─ Running: npm run build
   ├─ Vite building for production...
   ├─ Compiling TypeScript...
   ├─ Bundling assets...
   └─ Output: dist/ directory
   
4. ⬆️ Uploading to Cloudflare Pages...
   ├─ Uploading: _worker.js
   ├─ Uploading: _routes.json
   ├─ Uploading: static/* files
   └─ Creating deployment URL
   
5. ✅ Deployment successful!
   └─ URL: https://dust-storm-reporter.pages.dev
```

---

## **🔍 التحقق من نجاح النشر:**

### **1. في Cloudflare Dashboard:**

```
✅ Status: Active
✅ Latest deployment: Success (green checkmark)
✅ Production URL: https://dust-storm-reporter.pages.dev
```

### **2. اختبار الموقع:**

```bash
# الصفحة الرئيسية
https://dust-storm-reporter.pages.dev

# API - قائمة الشبكات
https://dust-storm-reporter.pages.dev/api/networks

# الملفات الثابتة
https://dust-storm-reporter.pages.dev/static/ncm-logo.png
```

---

## **❌ استكشاف الأخطاء:**

### **خطأ 1: "npm: command not found"**

**الحل:**
- هذا لا يحدث عادةً في Cloudflare Pages
- إذا حدث، جرب تغيير Build command إلى:
  ```
  npx vite build
  ```

### **خطأ 2: "Module not found"**

**الحل:**
- تأكد أن `package.json` موجود في المستودع
- تأكد أن جميع الـ dependencies موجودة في `package.json`

### **خطأ 3: "Build exceeded time limit"**

**الحل:**
- عادة لا يحدث مع هذا المشروع (البناء يأخذ ~30 ثانية)
- إذا حدث، تواصل مع دعم Cloudflare

### **خطأ 4: "dist directory is empty"**

**الحل:**
- افحص Build logs في Cloudflare
- تأكد أن `npm run build` نجح
- تحقق من `vite.config.ts` أن `build.outDir` = `dist`

---

## **🎯 النتيجة النهائية:**

بعد اتباع الخطوات، سيكون لديك:

```
✅ موقع مباشر على الإنترنت
✅ رابط احترافي: https://dust-storm-reporter.pages.dev
✅ HTTPS تلقائي (SSL)
✅ نشر تلقائي عند كل Push لـ GitHub
✅ CDN عالمي سريع
✅ مجاني للأبد
```

---

## **📞 الدعم:**

إذا واجهت أي مشاكل:
1. راجع Build logs في Cloudflare Dashboard
2. تأكد من الإعدادات أعلاه
3. جرب حذف المشروع وإنشاء واحد جديد
4. تواصل مع دعم Cloudflare إذا استمرت المشكلة

---

**آخر تحديث:** 2026-03-03
**المشروع:** مولد تقارير العواصف الغبارية والرملية
**المستودع:** https://github.com/samaher1788/Metar-Report
