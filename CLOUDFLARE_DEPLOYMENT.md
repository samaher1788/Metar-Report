# دليل النشر على Cloudflare Pages - خطوة بخطوة
# Cloudflare Pages Deployment Guide - Step by Step

## لماذا Cloudflare Pages؟

✅ **مجاني 100%** - بدون حدود للزوار
✅ **رابط نظيف** - `your-project.pages.dev`
✅ **SSL مجاني** - HTTPS تلقائي
✅ **سرعة عالية** - CDN عالمي
✅ **لا يظهر sandbox** - رابط احترافي كامل

---

## الخطوات التفصيلية:

### 1️⃣ إنشاء حساب Cloudflare

1. اذهب إلى: https://dash.cloudflare.com/sign-up
2. أدخل بريدك الإلكتروني
3. اختر كلمة مرور قوية
4. تحقق من البريد الإلكتروني

**مجاني تماماً - لا يطلب بطاقة ائتمانية**

---

### 2️⃣ الذهاب إلى Workers & Pages

1. بعد تسجيل الدخول، من القائمة اليسرى اختر:
   ```
   Workers & Pages
   ```

2. اضغط على الزر الأزرق:
   ```
   Create application
   ```

3. اختر التبويب:
   ```
   Pages
   ```

---

### 3️⃣ ربط GitHub

#### الطريقة A: ربط GitHub مباشرة (موصى بها)

1. اضغط على:
   ```
   Connect to Git
   ```

2. اختر:
   ```
   GitHub
   ```

3. سجل الدخول إلى GitHub

4. امنح Cloudflare الصلاحيات للوصول إلى:
   ```
   samaher1788/Metar-Report
   ```

5. اضغط:
   ```
   Install & Authorize
   ```

#### الطريقة B: رفع مباشر (بدون GitHub)

1. اختر:
   ```
   Upload assets
   ```

2. ارفع مجلد `dist` بعد البناء:
   ```bash
   # على جهازك المحلي
   cd webapp
   npm install
   npm run build
   # ثم ارفع مجلد dist عبر واجهة Cloudflare
   ```

---

### 4️⃣ إعدادات المشروع

بعد اختيار Repository، ستظهر لك صفحة الإعدادات:

```
Project name: dust-storm-reporter
```
*(يمكنك تغييره لأي اسم تريد)*

```
Production branch: main
```

**Build settings:**
```
Framework preset: None
Build command: npm run build
Build output directory: dist
Root directory (advanced): (اتركه فارغاً)
```

**Environment variables:** (اتركها فارغة - غير مطلوبة)

---

### 5️⃣ النشر

1. اضغط الزر الأزرق:
   ```
   Save and Deploy
   ```

2. انتظر 2-3 دقائق حتى يكتمل البناء

3. ستحصل على رابطين:
   ```
   Production: https://dust-storm-reporter.pages.dev
   Preview: https://[commit-hash].dust-storm-reporter.pages.dev
   ```

---

## 🎯 النتيجة النهائية:

### رابطك الجديد:
```
https://dust-storm-reporter.pages.dev
```

### أو مع Custom Domain:
```
https://sds-ras.gov.sa
```

---

## 🌐 إضافة Domain مخصص (اختياري)

### الخطوة 1: شراء Domain

**للجهات الحكومية:**
- SaudiNIC: https://nic.sa (مجاني)
- طلب Domain بصيغة `.gov.sa`

**للعام:**
- Namecheap: $8-12/سنة
- GoDaddy: $10-15/سنة

### الخطوة 2: ربط Domain في Cloudflare

1. في صفحة المشروع، اذهب إلى:
   ```
   Custom domains
   ```

2. اضغط:
   ```
   Set up a custom domain
   ```

3. أدخل الدومين:
   ```
   sds-ras.gov.sa
   ```
   (أو أي دومين لديك)

4. اتبع التعليمات لتحديث DNS Records:
   ```
   Type: CNAME
   Name: @ أو www
   Value: dust-storm-reporter.pages.dev
   ```

5. انتظر 5-10 دقائق للتفعيل

---

## ✅ الميزات بعد النشر:

- ✅ **رابط نظيف:** `https://dust-storm-reporter.pages.dev`
- ✅ **لا يظهر sandbox.novita.ai** أبداً
- ✅ **SSL/HTTPS** تلقائي
- ✅ **سرعة عالية** في جميع أنحاء العالم
- ✅ **Auto-deploy** عند كل تحديث على GitHub
- ✅ **Analytics** مجاني
- ✅ **مجاني بالكامل** حتى 500 builds/شهر

---

## 🔧 التحديثات المستقبلية:

بعد النشر الأول، أي تحديث على GitHub سيُنشر تلقائياً:

```bash
# على جهازك المحلي
git add .
git commit -m "Update report design"
git push origin main
```

بعد 2-3 دقائق، التحديث سيظهر على:
```
https://dust-storm-reporter.pages.dev
```

---

## 🎯 الخلاصة:

1. **أنشئ حساب Cloudflare** (مجاني)
2. **اربط GitHub Repository**
3. **اضبط Build Settings**
4. **Deploy!**
5. **احصل على رابط نظيف:** `https://dust-storm-reporter.pages.dev`

**لا يظهر sandbox.novita.ai نهائياً!**

---

## 📞 المساعدة:

إذا واجهت أي مشكلة:
- راجع: https://developers.cloudflare.com/pages/
- أو خذ screenshot وسأساعدك خطوة بخطوة

---

**الوقت المتوقع: 10 دقائق**  
**التكلفة: مجاني 100%**  
**الرابط: احترافي ونظيف تماماً**
