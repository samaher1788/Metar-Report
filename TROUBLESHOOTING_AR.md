# دليل استكشاف الأخطاء وإصلاحها

## المشاكل الشائعة والحلول

### ❌ خطأ: "Cannot convert undefined or null to object"

**السبب:**
- البيانات المُمررة للمولد المحسّن غير كاملة
- حقل `stationData` مفقود أو `null`
- بنية بيانات METAR غير صحيحة

**الحل:**
✅ تم إصلاحه في الإصدار الحالي:
- تم إضافة `stationData` إلى مخرجات `analyzeDustData()`
- تم إنشاء دالة `constructMetarString()` لبناء سلسلة METAR من حقول CSV
- تم إضافة حقل `visibility` للبيانات
- تم تعزيز كل تقرير غبار بسلسلة METAR كاملة

**التحقق:**
```bash
# افتح console المتصفح (F12)
# بعد توليد التقرير، تحقق من البيانات:
console.log(currentAnalysis)
// يجب أن تحتوي على:
// - stationData: Array
// - byStation: Array
// - byType: Object
// - totalReports: Number
```

---

### ❌ خطأ: "stationData is not iterable"

**السبب:**
- `analysis.stationData` ليس مصفوفة (Array)

**الحل:**
```javascript
// في pdf-generator-reference.js
// تأكد من التحقق قبل الاستخدام:
if (analysis && Array.isArray(analysis.stationData)) {
    analysis.stationData.forEach(record => {
        // معالجة البيانات
    })
}
```

---

### ❌ خطأ: "record.metar is undefined"

**السبب:**
- بيانات METAR مفقودة من السجلات

**الحل:**
✅ تم إصلاحه: دالة `constructMetarString()` تُنشئ سلسلة METAR تلقائياً من:
- `station`: محطة ICAO
- `valid`: التاريخ والوقت
- `drct`, `sknt`, `gust_sknt`: الرياح
- `vsby`: الرؤية
- `wxcodes`: رموز الطقس
- `tmpf`, `dwpf`: درجة الحرارة/نقطة الندى
- `mslp`: الضغط

---

### ❌ الموقع لا يعمل بعد إعادة التشغيل

**التحقق:**
```bash
# 1. تحقق من حالة PM2
pm2 status

# 2. إذا كانت الخدمة متوقفة:
pm2 restart dust-storm-reporter

# 3. تحقق من السجلات:
pm2 logs dust-storm-reporter --nostream

# 4. اختبر الخدمة:
curl http://localhost:3000
```

**إذا فشل التشغيل:**
```bash
# أعد البناء
npm run build

# نظف المنفذ
fuser -k 3000/tcp 2>/dev/null || true

# أعد التشغيل
pm2 restart dust-storm-reporter
```

---

### ❌ ورود الرياح لا تظهر

**السبب:**
- Python backend غير متصل
- بيانات الرياح غير كافية

**الحل الحالي:**
التقرير يُولّد بدون ورود رياح (صفحات فارغة). لتفعيل ورود الرياح:

**الخيار 1: Python محلي**
```bash
# قم بتوليد ورود الرياح يدوياً
python3 wind_rose_generator_enhanced.py < analysis.json
```

**الخيار 2: تكامل مستقبلي**
- إضافة خدمة Python منفصلة
- استدعاء API من frontend
- تخزين الصور مؤقتاً

---

### ❌ التحويلات غير صحيحة

**التحقق من التحويلات:**

**1. درجة الحرارة (F → C):**
```javascript
// الصيغة: (°F - 32) × 5/9
48°F → Math.round((48 - 32) * 5 / 9) = 9°C
```

**2. الرؤية (miles → meters):**
```javascript
// الصيغة: miles × 1609.34
1.24 miles → Math.round(1.24 * 1609.34) = 2000 m
```

**3. السرعة (kt → km/h):**
```javascript
// الصيغة: knots × 1.852
20 kt → Math.round(20 * 1.852) = 37 km/h
```

**إذا كانت التحويلات خاطئة:**
- تحقق من دالة `constructMetarString()` في `src/index.tsx`
- تحقق من دالة `addStationDetailTable()` في `pdf-generator-reference.js`

---

### ❌ الشعار لا يظهر

**السبب:**
- ملف الشعار غير موجود
- مسار الشعار خاطئ

**التحقق:**
```bash
# تحقق من وجود الشعار
ls -lh public/static/ncm-logo.png

# تحقق من تحميله في المتصفح
curl -I http://localhost:3000/static/ncm-logo.png
```

**الحل:**
```bash
# تأكد من أن الشعار موجود في:
# 1. public/static/ncm-logo.png
# 2. dist/static/ncm-logo.png (بعد البناء)

# أعد البناء إذا لزم الأمر
npm run build
```

---

### ❌ الجداول فارغة

**السبب:**
- لا توجد بيانات غبار في الفترة المختارة
- فلترة خاطئة للبيانات

**التحقق:**
```javascript
// في console المتصفح
console.log(currentAnalysis.totalReports)
// يجب أن يكون > 0

console.log(currentAnalysis.stationData.length)
// يجب أن يكون > 0
```

**الحل:**
1. اختر فترة زمنية مختلفة
2. اختر شبكة (دولة) أخرى
3. تحقق من أن رموز الطقس مدعومة:
   - BLDU, BLSA, DU, SA, SS, DS, PO

---

### ❌ التقرير بطيء جداً

**الأسباب المحتملة:**
1. بيانات كثيرة (مئات المحطات)
2. ورود رياح كثيرة
3. متصفح بطيء

**الحلول:**
```javascript
// 1. حد عدد السجلات المعروضة
// في pdf-generator-reference.js
stationRecords.slice(0, 15) // أول 15 فقط

// 2. عطّل ورود الرياح مؤقتاً
const windRoseData = {} // بدلاً من await generateWindRoses()

// 3. استخدم متصفح أسرع (Chrome/Edge)
```

---

### ❌ خطأ CORS

**السبب:**
- API endpoint غير مُكوّن بشكل صحيح

**التحقق:**
```bash
# تحقق من إعدادات CORS في src/index.tsx
grep -A 3 "cors()" src/index.tsx
```

**يجب أن يكون:**
```typescript
app.use('/api/*', cors())
```

---

## نصائح لتجنب المشاكل

### ✅ قبل التطوير:
1. تحقق من إصدارات المكتبات: `npm list`
2. نظف المنفذ: `fuser -k 3000/tcp`
3. أعد بناء: `npm run build`

### ✅ أثناء التطوير:
1. افتح Console (F12) لمراقبة الأخطاء
2. تحقق من Network tab لطلبات API
3. استخدم `console.log()` بكثرة

### ✅ بعد التعديلات:
1. أعد البناء: `npm run build`
2. أعد تشغيل PM2: `pm2 restart dust-storm-reporter`
3. انتظر 2-3 ثواني
4. اختبر: `curl http://localhost:3000`

---

## أوامر مفيدة

```bash
# حالة الخدمة
pm2 status

# سجلات الخدمة
pm2 logs dust-storm-reporter --nostream --lines 50

# إعادة التشغيل
pm2 restart dust-storm-reporter

# إيقاف
pm2 stop dust-storm-reporter

# حذف من PM2
pm2 delete dust-storm-reporter

# معلومات التطبيق
pm2 info dust-storm-reporter

# مراقبة الموارد
pm2 monit
```

---

## للدعم

إذا استمرت المشاكل:

1. **تحقق من السجلات:**
   ```bash
   pm2 logs dust-storm-reporter --nostream --lines 100
   ```

2. **تحقق من Console المتصفح (F12)**
   - علامة تبويب Console
   - علامة تبويب Network

3. **اختبر API مباشرة:**
   ```bash
   # اختبر جلب البيانات
   curl -X GET "http://localhost:3000/api/fetch-metar?network=JO__ASOS&start_date=2026-01-12&end_date=2026-01-12"
   
   # اختبر التحليل
   curl -X POST http://localhost:3000/api/analyze-dust \
     -H "Content-Type: application/json" \
     -d '{"csvData":"..."}'
   ```

4. **راجع الوثائق:**
   - `README.md`
   - `REFERENCE_REPORT_IMPLEMENTATION.md`
   - `IMPLEMENTATION_SUMMARY_AR.md`

---

**آخر تحديث:** 3 مارس 2026  
**الإصدار:** 1.0.1  
**الحالة:** ✅ جميع المشاكل الرئيسية محلولة
