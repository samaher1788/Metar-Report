# ⚡ دليل سريع: ربط GitHub بـ Cloudflare Pages

## 🎯 الهدف
عندما تعمل `git push` → الموقع يتحدث تلقائياً على https://metar-reports.pages.dev

---

## 📱 الخطوات (5 دقائق):

### 1️⃣ افتح Cloudflare Dashboard
```
🔗 https://dash.cloudflare.com
```

### 2️⃣ اذهب لـ Pages → metar-reports

<details>
<summary>📸 انقر لرؤية الصورة</summary>

```
القائمة الجانبية → Pages → ابحث عن metar-reports
```
</details>

### 3️⃣ اضغط Settings → Builds & deployments

### 4️⃣ في قسم Source:

#### إذا لم يكن مربوط:
1. اضغط **"Connect to Git"**
2. اختر **GitHub**
3. سيفتح نافذة: اضغط **"Authorize Cloudflare Pages"**
4. اختر repository: **samaher1788/Metar-Report**
5. اضغط **"Install & Authorize"**

#### إذا كان مربوط:
✅ تأكد أنك ترى: **"Connected to GitHub: samaher1788/Metar-Report"**

### 5️⃣ تأكد من إعدادات Build:

```yaml
Production branch:    main
Build command:        npm run build
Build output:         dist
Root directory:       /
```

اضغط **"Save and Deploy"**

---

## ✅ اختبار النشر التلقائي

### من الـ Sandbox:

```bash
cd /home/user/webapp

# عمل تغيير بسيط
echo "<!-- Updated: $(date) -->" >> README.md

# حفظ
git add .
git commit -m "Test auto deployment 🚀"

# رفع
git push origin main
```

### راقب Cloudflare:

1. ارجع لـ Cloudflare Dashboard
2. افتح تبويب **Deployments**
3. خلال **30 ثانية** سترى deployment جديد! 🎉
4. انتظر **2-3 دقائق** حتى يكتمل
5. افتح https://metar-reports.pages.dev

---

## 🔍 علامات النجاح:

### في Cloudflare Dashboard:

```
✅ Source: Connected to GitHub
✅ Last deployment: من main branch
✅ Status: Success (Production)
✅ Deployed to: https://metar-reports.pages.dev
```

### في GitHub:

```
✅ في صفحة Commits ترى علامة ✅ خضراء
✅ في Settings → Webhooks ترى webhook من Cloudflare
```

---

## 🚀 سير العمل بعد الربط:

```
📝 تعديل الكود
   ↓
💾 git add & commit
   ↓
⬆️  git push origin main
   ↓
⏱️  30 ثانية
   ↓
🔨 Cloudflare يبني المشروع (2 دقيقة)
   ↓
✅ الموقع يتحدث تلقائياً!
```

---

## 🛠️ إذا لم يشتغل:

### 1. تحقق من الربط:
```
Settings → Builds & deployments → Source
```
يجب أن تشوف: "Connected to GitHub"

### 2. تحقق من Branch:
```
Settings → Builds & deployments → Production branch = main
```

### 3. تحقق من GitHub Webhooks:
```
🔗 https://github.com/samaher1788/Metar-Report/settings/hooks
```
يجب أن ترى webhook من Cloudflare (Active ✅)

### 4. جرّب إعادة Push:
```bash
git commit --allow-empty -m "Trigger deployment"
git push origin main
```

---

## 📞 المساعدة:

إذا واجهت مشكلة:

1. **تحقق من Build logs:**
   ```
   Cloudflare Dashboard → metar-reports → Deployments → اضغط على آخر deployment
   ```

2. **اقرأ الـ Error message** في Build logs

3. **الأخطاء الشائعة:**
   - ❌ `npm run build failed` → تحقق من package.json
   - ❌ `dist/ not found` → تأكد من Build output directory = dist
   - ❌ `Permission denied` → تحقق من GitHub App permissions

---

## 🎉 النتيجة النهائية:

بعد الربط الناجح، كل ما عليك:

```bash
git push origin main
```

**والباقي تلقائي! 🚀**

---

## 🔗 الروابط المهمة:

| الرابط | الاستخدام |
|--------|-----------|
| [Cloudflare Dashboard](https://dash.cloudflare.com) | إدارة المشروع |
| [GitHub Repo](https://github.com/samaher1788/Metar-Report) | الكود المصدري |
| [Live Site](https://metar-reports.pages.dev) | الموقع المباشر |

---

**تم إعداد هذا الدليل بواسطة المركز الإقليمي للعواصف الغبارية والرملية** 🇸🇦
