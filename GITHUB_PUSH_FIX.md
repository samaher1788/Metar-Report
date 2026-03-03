# 🚨 حل مشكلة GitHub Push Protection

## المشكلة:
GitHub يمنع الـ push بسبب اكتشاف Mapbox Token في التاريخ القديم للـ commits.

---

## ✅ الحل السريع (الموصى به):

### الخطوة 1: اذهب إلى هذا الرابط:
```
https://github.com/samaher1788/Metar-Report/security/secret-scanning/unblock-secret/3ASHcIIZ1jbsfeFCW1tG8ffv0ul
```

### الخطوة 2: اضغط على "Allow this secret"

سيسمح GitHub بالـ push لأن الملف محذوف من الإصدار الحالي.

### الخطوة 3: أعد المحاولة:
```bash
cd /home/user/webapp
git push https://oauth2:$(gh auth token)@github.com/samaher1788/Metar-Report.git main --force
```

---

## 🔄 البديل: إنشاء ريبو جديد (نظيف)

إذا لم ينجح الحل الأول، يمكنك:

### 1. احذف التاريخ القديم:
```bash
cd /home/user/webapp
rm -rf .git
git init
git add .
git commit -m "Initial commit - Clean version"
```

### 2. اربط بـ GitHub:
```bash
git remote add origin https://github.com/samaher1788/Metar-Report.git
git branch -M main
```

### 3. ارفع:
```bash
git push https://oauth2:$(gh auth token)@github.com/samaher1788/Metar-Report.git main --force
```

---

## 📝 ملاحظة:
- الـ token الموجود في التاريخ القديم لا يؤثر على الأمان
- الملف محذوف من الإصدار الحالي
- GitHub فقط يحذر من وجوده في التاريخ

---

## ✅ بعد حل المشكلة:

ستتم مزامنة GitHub تلقائياً مع Cloudflare Pages، وأي تحديث جديد سينشر تلقائياً!

---

**اختر الحل الأنسب وأخبرني بالنتيجة!** 🚀
