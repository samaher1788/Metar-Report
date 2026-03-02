# حل مشكلة Cloudflare Pages Deploy

## المشكلة:
```
✘ [ERROR] It looks like you've run a Workers-specific command in a Pages project.
For Pages, please run `wrangler pages deploy` instead.
```

## السبب:
- ملف `wrangler.jsonc` موجود
- Cloudflare يعتقد أنه Workers project وليس Pages

## ✅ الحل:

### الطريقة 1: حذف wrangler.jsonc من GitHub (الأسهل)

1. **اذهب إلى GitHub:**
   https://github.com/samaher1788/Metar-Report

2. **احذف الملف:**
   - افتح `wrangler.jsonc`
   - اضغط على أيقونة القلم الرصاص (Edit)
   - اضغط على أيقونة القمامة (Delete)
   - اكتب رسالة: "Remove wrangler.jsonc for Pages"
   - اضغط "Commit changes"

3. **أعد Deploy في Cloudflare:**
   - اذهب إلى Cloudflare Dashboard
   - Workers & Pages → اختر مشروعك
   - اضغط "Retry deployment"

✅ **سيعمل بنجاح!**

---

### الطريقة 2: تعديل إعدادات Cloudflare

في Cloudflare Dashboard:

1. **اذهب إلى Settings → Builds & deployments**

2. **عدّل Build command:**
   ```
   npm run build
   ```

3. **احذف Deploy command:**
   ```
   (اتركه فارغاً أو احذف npx wrangler deploy)
   ```

4. **Output directory:**
   ```
   dist
   ```

5. **احفظ وأعد Deploy**

---

### الطريقة 3: استخدام Cloudflare Pages بدون GitHub

1. **ابنِ المشروع محلياً:**
   ```bash
   git clone https://github.com/samaher1788/Metar-Report.git
   cd Metar-Report
   npm install
   npm run build
   ```

2. **ارفع dist/ مباشرة:**
   - Cloudflare Dashboard → Workers & Pages
   - Create application → Pages → Upload assets
   - اسحب مجلد `dist/` واحذفه في المربع
   - اضغط "Deploy"

✅ **سيعمل فوراً!**

---

## 🎯 التوصية:

**استخدم الطريقة 1** - احذف `wrangler.jsonc` من GitHub (أسهل حل)

---

## ✅ بعد الحل:

سيعمل المشروع على:
```
https://metar-report.pages.dev
```

✅ بدون sandbox
✅ مع مولد التقارير
✅ جميع المميزات
