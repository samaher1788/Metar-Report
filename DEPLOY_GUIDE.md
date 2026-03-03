# 🚀 دليل نشر التحديثات على Cloudflare Pages

## 📋 الطريقة الأولى: النشر التلقائي (الأسهل)

إذا كان المشروع متصل بـ GitHub، سيتم النشر تلقائياً عند push:

```bash
# 1. حفظ التغييرات في Git
cd /home/user/webapp
git add -A
git commit -m "Update: Remove maps and improve PDF"

# 2. رفع إلى GitHub
git push origin main

# ✅ Cloudflare Pages سيبني وينشر تلقائياً!
```

---

## 📋 الطريقة الثانية: النشر اليدوي (باستخدام wrangler)

### الخطوة 1: تسجيل الدخول لـ Wrangler (مرة واحدة فقط)

```bash
cd /home/user/webapp
npx wrangler login
```

سيفتح متصفح، قم بتسجيل الدخول إلى حساب Cloudflare الخاص بك.

### الخطوة 2: بناء المشروع

```bash
npm run build
```

### الخطوة 3: النشر

```bash
npx wrangler pages deploy dist --project-name metar-reports
```

أو استخدم الأمر المختصر:

```bash
npm run deploy:prod
```

---

## 📋 الطريقة الثالثة: النشر عبر Cloudflare Dashboard (واجهة ويب)

### الخطوة 1: تحميل الملفات

1. اذهب إلى: https://dash.cloudflare.com
2. اختر **Pages** من القائمة الجانبية
3. اختر مشروع **metar-reports**
4. اضغط على **Create deployment**
5. ارفع مجلد `dist/` بالكامل

### الخطوة 2: تأكيد النشر

- سيقوم Cloudflare بمعالجة الملفات
- بعد 1-2 دقيقة، التحديثات ستكون مباشرة على:
  ```
  https://metar-reports.pages.dev
  ```

---

## ✅ التحديثات الجاهزة للنشر:

### 1️⃣ حذف الخرائط التفاعلية
- ❌ Leaflet.js محذوفة
- ❌ map-generator.js محذوف
- ❌ map-capture.js محذوف
- ❌ عناصر HTML للخريطة محذوفة
- ✅ حجم أصغر: 45.61 KB → 41.60 KB

### 2️⃣ تحسين تقارير PDF
- ❌ حذف النص التحذيري
- ✅ تقليل المسافات بين الأقسام
- ✅ مظهر أكثر احترافية
- ✅ محتوى أكثر في كل صفحة

### 3️⃣ الوظائف المحفوظة
- ✅ جلب بيانات METAR من جميع الشبكات
- ✅ تحليل الظواهر الغبارية
- ✅ عرض بطاقات الإحصائيات
- ✅ توليد تقارير PDF احترافية
- ✅ دعم 10 شبكات (SA, AE, KW, BH, QA, OM, JO, IQ, YE, IR)

---

## 🔍 التحقق من النشر

بعد النشر، تحقق من:

1. **افتح الرابط:**
   ```
   https://metar-reports.pages.dev
   ```

2. **اختبر الوظائف:**
   - ✅ اختر تاريخ وشبكة
   - ✅ اضغط "إنشاء التقرير"
   - ✅ تأكد من ظهور الإحصائيات
   - ✅ حمّل PDF وتأكد من عدم وجود نص تحذيري

---

## 🛠️ الأوامر السريعة

```bash
# بناء المشروع
npm run build

# النشر (بعد تسجيل الدخول)
npx wrangler pages deploy dist --project-name metar-reports

# أو استخدم script جاهز
npm run deploy:prod
```

---

## 📝 ملاحظات مهمة

1. **ملفات dist/ محلية فقط:**
   - لا ترفع مجلد `dist/` إلى GitHub
   - اتركه في `.gitignore`

2. **النشر التلقائي عبر GitHub:**
   - إذا كان GitHub متصل، كل push ينشر تلقائياً
   - لا حاجة لـ wrangler في هذه الحالة

3. **التحديثات الفورية:**
   - بعد النشر، التحديثات تظهر خلال 1-2 دقيقة
   - يمكنك مسح الكاش إذا لم تظهر التحديثات

---

## ⚡ الطريقة الأسرع (إذا كان GitHub متصل)

```bash
cd /home/user/webapp
git add -A
git commit -m "Deploy: Remove maps and improve PDF layout"
git push origin main

# ✅ انتهى! Cloudflare سينشر تلقائياً
```

---

## 🎯 الحالة الحالية

- ✅ المشروع مبني (`npm run build`)
- ✅ الملفات جاهزة في `dist/`
- ✅ wrangler.jsonc محدّث
- ⏳ جاهز للنشر!

---

**اختر الطريقة الأنسب لك وابدأ النشر!** 🚀
