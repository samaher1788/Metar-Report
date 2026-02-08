# دليل فتح المشروع في VSCode
# VSCode Setup Guide

## 🚀 خطوات فتح المشروع في VSCode بدون مشاكل

### 1. استنساخ المشروع
```bash
git clone https://github.com/samaher1788/Metar-Report.git
cd Metar-Report
```

### 2. تثبيت المكتبات
```bash
npm install
```

### 3. فتح المشروع في VSCode
```bash
code .
```

أو افتح VSCode ثم:
- File → Open Folder
- اختر مجلد `Metar-Report`

---

## 🔧 الإضافات الموصى بها (Extensions)

عند فتح المشروع، سيقترح VSCode تثبيت هذه الإضافات:

1. **ESLint** - لفحص الأخطاء
2. **Prettier** - لتنسيق الكود
3. **Tailwind CSS IntelliSense** - للمساعدة في TailwindCSS
4. **TypeScript Next** - لدعم TypeScript
5. **Cloudflare Workers** - لدعم Cloudflare

اضغط **Install All** عند ظهور الإشعار.

---

## ✅ التحقق من صحة الإعدادات

### إذا ظهرت أخطاء TypeScript:

1. **أعد تحميل النافذة:**
   - اضغط `Ctrl+Shift+P` (أو `Cmd+Shift+P` على Mac)
   - اكتب: `Developer: Reload Window`
   - اضغط Enter

2. **حدد إصدار TypeScript:**
   - افتح أي ملف `.ts` أو `.tsx`
   - اضغط `Ctrl+Shift+P`
   - اكتب: `TypeScript: Select TypeScript Version`
   - اختر: `Use Workspace Version`

3. **أعد تشغيل TypeScript Server:**
   - اضغط `Ctrl+Shift+P`
   - اكتب: `TypeScript: Restart TS Server`

---

## 📁 بنية المشروع في VSCode

```
Metar-Report/
├── .vscode/              ← إعدادات VSCode (تم إضافتها)
│   ├── settings.json     ← الإعدادات المشتركة
│   └── extensions.json   ← الإضافات الموصى بها
├── src/
│   └── index.tsx         ← الملف الرئيسي
├── public/
│   └── static/           ← الملفات الثابتة
├── tsconfig.json         ← إعدادات TypeScript (محدّثة)
├── .editorconfig         ← إعدادات التنسيق (جديد)
└── package.json
```

---

## 🎨 الإعدادات المطبقة تلقائياً

✅ **التنسيق التلقائي عند الحفظ** (`Ctrl+S`)
✅ **استيراد الوحدات تلقائياً**
✅ **إخفاء المجلدات غير المهمة** (`node_modules`, `dist`, `.wrangler`)
✅ **دعم كامل لـ TypeScript**
✅ **دعم TailwindCSS**

---

## 🐛 حل المشاكل الشائعة

### المشكلة: "Cannot find module 'hono'"
**الحل:**
```bash
npm install
```

### المشكلة: أخطاء TypeScript في كل الملفات
**الحل:**
```bash
# احذف node_modules وأعد التثبيت
rm -rf node_modules package-lock.json
npm install

# ثم أعد تحميل VSCode
# Ctrl+Shift+P → Developer: Reload Window
```

### المشكلة: "JSX element implicitly has type 'any'"
**الحل:** تم حلها! ملف `tsconfig.json` محدّث بالإعدادات الصحيحة.

### المشكلة: لا تظهر اقتراحات TailwindCSS
**الحل:**
1. ثبّت إضافة **Tailwind CSS IntelliSense**
2. أعد تحميل VSCode

---

## 📝 اختصارات مفيدة في VSCode

| الاختصار | الوظيفة |
|----------|---------|
| `Ctrl+P` | البحث السريع عن ملف |
| `Ctrl+Shift+P` | قائمة الأوامر |
| `Ctrl+B` | إظهار/إخفاء الشريط الجانبي |
| `Ctrl+J` | إظهار/إخفاء Terminal |
| `Ctrl+Shift+F` | البحث في جميع الملفات |
| `F2` | إعادة تسمية متغير |
| `Ctrl+.` | عرض الإصلاحات السريعة |

---

## 🏃 تشغيل المشروع

### من Terminal داخل VSCode:

```bash
# بناء المشروع
npm run build

# تشغيل محلياً (Wrangler)
npm run dev

# تشغيل بواسطة PM2 (للإنتاج)
pm2 start ecosystem.config.cjs
```

---

## ✨ ميزات VSCode المُفعّلة

- ✅ **IntelliSense** - إكمال الكود التلقائي
- ✅ **Type Checking** - فحص الأخطاء أثناء الكتابة
- ✅ **Auto Import** - استيراد الوحدات تلقائياً
- ✅ **Format on Save** - تنسيق الكود عند الحفظ
- ✅ **Quick Fixes** - إصلاحات سريعة للأخطاء

---

## 📞 الدعم

إذا واجهت أي مشكلة:
1. تأكد من تثبيت Node.js 18+
2. تأكد من تثبيت جميع المكتبات: `npm install`
3. أعد تحميل VSCode: `Ctrl+Shift+P` → `Developer: Reload Window`

---

**المشروع الآن جاهز للعمل بدون أي مشاكل في VSCode!** ✅
