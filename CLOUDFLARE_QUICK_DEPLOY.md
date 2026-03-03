# 🚀 دليل النشر السريع على Cloudflare Pages

## **المشكلة الحالية:**
Cloudflare ينشر من commit قديم ولا يجد ملفات dist

---

## **✅ الحل 1: النشر المباشر (Direct Upload) - الأسهل**

### **الخطوات:**

1. **حذف المشروع الحالي:**
   - https://dash.cloudflare.com
   - Workers & Pages → اختر المشروع → Settings → Delete

2. **إنشاء مشروع جديد:**
   - Create application → Pages
   - اختر **"Upload assets"** (ليس Connect to Git!)
   - اسم المشروع: `dust-storm-reporter`

3. **تحميل الملفات الجاهزة:**
   - حمّل هذا الملف: https://www.genspark.ai/api/files/s/AflQHWUG
   - فك الضغط محلياً
   - ارفع محتويات مجلد `dist/` (ليس المجلد نفسه!)
   - أو اسحب مجلد `dist/` مباشرة إلى صفحة Cloudflare

4. **Deploy!**
   - انقر "Deploy"
   - انتظر 30 ثانية
   - ✅ الموقع جاهز!

---

## **✅ الحل 2: إعادة ربط GitHub بشكل صحيح**

### **الخطوات:**

1. **حذف المشروع الحالي** (نفس الخطوة السابقة)

2. **إنشاء مشروع جديد من GitHub:**
   - Create application → Pages → Connect to Git
   - اختر: `samaher1788/Metar-Report`
   - **Production branch: main** (مهم!)

3. **إعدادات البناء:**
   ```
   Framework preset: None
   Build command: npm run build
   Build output directory: dist
   Root directory: (empty)
   Node version: 20 (default)
   ```

4. **Environment variables: (none)**

5. **Save and Deploy**

---

## **✅ الحل 3: استخدام Platform Deploy (الأسرع)**

إذا كنت تستخدم GenSpark Platform:

1. اضغط على زر **"Deploy to Platform"**
2. اختر **Cloudflare Pages**
3. سيتم النشر تلقائياً!

---

## **📊 التحقق من النجاح:**

بعد النشر، افتح:

```
https://dust-storm-reporter.pages.dev
https://dust-storm-reporter.pages.dev/api/networks
https://dust-storm-reporter.pages.dev/static/ncm-logo.png
```

يجب أن تعمل جميع الروابط ✅

---

## **🎯 الملفات الجاهزة:**

إذا أردت رفع الملفات يدوياً:

**تحميل:** https://www.genspark.ai/api/files/s/AflQHWUG

**المحتويات:**
```
dist/
├── _worker.js          (39 KB - Hono API)
├── _routes.json        (54 bytes - routing config)
└── static/
    ├── app.js          (17 KB)
    ├── pdf-generator.js (18 KB)
    ├── ncm-logo.png    (59 KB)
    ├── logo.png        (50 KB)
    ├── style.css       (49 bytes)
    ├── favicon.svg     (341 bytes)
    └── wind-rose-colored.js (12 KB)
```

---

## **💡 توصيتي:**

**للنشر الفوري:**
👉 استخدم **Direct Upload** (الحل 1)

**للتحديثات المستقبلية:**
👉 أعد ربط GitHub بشكل صحيح (الحل 2)

---

**آخر تحديث:** 2026-03-03
