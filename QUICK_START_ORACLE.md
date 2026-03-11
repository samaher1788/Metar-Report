# 🚀 دليل البدء السريع - ربط Oracle APEX

## ✅ **ما تم إنجازه:**

1. ✅ **Oracle Sync Module** (`public/static/oracle-sync.js`)
2. ✅ **Auto-sync Integration** في `app.js`
3. ✅ **REST API Handler** كود SQL جاهز
4. ✅ **Test Scripts** للاختبار
5. ✅ **Complete Guide** (`ORACLE_AUTO_SYNC_GUIDE.md`)

---

## 🎯 **الخطوات التالية (يجب عليك القيام بها):**

### **الخطوة 1️⃣: فهم جدول METAR_DATA** ⏱️ 5 دقائق

في **Oracle APEX → SQL Workshop → SQL Commands**، شغّل:

```sql
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    DATA_LENGTH,
    NULLABLE
FROM USER_TAB_COLUMNS
WHERE TABLE_NAME = 'METAR_DATA'
ORDER BY COLUMN_ID;
```

**أرسل لي النتيجة** حتى أعدّل كود POST Handler ليتوافق مع جدولك!

---

### **الخطوة 2️⃣: إنشاء REST API في Oracle** ⏱️ 15 دقيقة

#### **2.1 إنشاء Module:**
1. **SQL Workshop → RESTful Services**
2. **Create Module:**
   - Module Name: `metar_api`
   - Base Path: `/metar/`
   - ✅ **Save**

#### **2.2 إنشاء Resource Template:**
1. اضغط على `metar_api`
2. **Create Template:**
   - URI Template: `save/`
   - ✅ **Create**

#### **2.3 إنشاء POST Handler:**
1. اضغط **Create Handler**
2. Method: `POST`
3. Source Type: `PL/SQL`
4. الصق الكود من ملف: `oracle_post_handler_final.sql`
5. ✅ **Create Handler**

**ملاحظة:** الكود في `oracle_post_handler_final.sql` قد يحتاج تعديل أسماء الأعمدة حسب جدولك!

---

### **الخطوة 3️⃣: إنشاء Batch Handler** ⏱️ 10 دقائق

#### **إنشاء Template جديد:**
1. في `metar_api` → **Create Template**
2. URI Template: `save-batch/`
3. ✅ **Create**

#### **إنشاء POST Handler:**
- الصق الكود من `ORACLE_AUTO_SYNC_GUIDE.md` (قسم "Batch Handler")

---

### **الخطوة 4️⃣: اختبار REST API** ⏱️ 5 دقائق

**شغّل سكريبت الاختبار:**
```bash
./test-oracle-integration.sh
```

**النتيجة المتوقعة:**
```
✅ الاتصال بـ Oracle يعمل
✅ نجح حفظ السجل
✅ نجح حفظ 3 سجل
```

---

### **الخطوة 5️⃣: اختبار Auto-sync** ⏱️ 5 دقائق

1. **افتح الواجهة:** https://metars-report.pages.dev/
2. **افتح Console:** اضغط `F12`
3. **أنشئ تقرير:** اختر تواريخ وشبكة → اضغط "إنشاء التقرير"
4. **راقب Console:**
   ```
   🔄 تفعيل الحفظ التلقائي في Oracle...
   🔄 جاري حفظ 15 سجل...
   ✅ تم حفظ 15 سجل بنجاح
   ```

5. **تحقق من Oracle:**
   ```sql
   SELECT COUNT(*) FROM METAR_DATA WHERE CREATED_AT > SYSDATE - 1/24;
   ```

---

## 🎨 **المميزات المتوفرة:**

### ✅ **Auto-sync:**
- يحفظ تلقائياً بعد كل تحليل
- يتجاهل السجلات المكررة
- يعرض إشعار نجاح

### ✅ **Batch Insert:**
- يقسم إلى دفعات (50 سجل/دفعة)
- معالجة متوازية
- retry logic

### ✅ **Error Handling:**
- معالجة الأخطاء تلقائياً
- لا يوقف عمل الواجهة
- logs مفصلة في Console

---

## 🔧 **التحكم في Auto-sync:**

### **تعطيل Auto-sync:**
افتح `public/static/oracle-sync.js` وغيّر:
```javascript
AUTO_SYNC_ENABLED: false  // كان true
```

### **تغيير حجم الدفعة:**
```javascript
BATCH_SIZE: 100  // كان 50
```

---

## 📊 **مراقبة البيانات:**

### **آخر السجلات:**
```sql
SELECT 
    STATION_CODE,
    OBSERVATION_TIME,
    WEATHER_CODES,
    CREATED_AT
FROM METAR_DATA
ORDER BY CREATED_AT DESC
FETCH FIRST 20 ROWS ONLY;
```

### **إحصائيات يومية:**
```sql
SELECT 
    TRUNC(CREATED_AT) AS DAY,
    COUNT(*) AS TOTAL,
    COUNT(DISTINCT STATION_CODE) AS STATIONS
FROM METAR_DATA
GROUP BY TRUNC(CREATED_AT)
ORDER BY DAY DESC;
```

---

## 🆘 **استكشاف الأخطاء:**

### **مشكلة: Console يقول "OracleSync is not defined"**
- **السبب:** الملف `oracle-sync.js` لم يُحمّل
- **الحل:** تأكد من build ثم redeploy:
  ```bash
  npm run build
  npm run deploy:prod
  ```

### **مشكلة: "Failed to fetch"**
- **السبب:** REST API غير موجود
- **الحل:** تحقق من URL في Oracle APEX

### **مشكلة: "ORA-00001: unique constraint"**
- **السبب:** بيانات مكررة (عادي!)
- **الحل:** السكريبت يتجاهلها تلقائياً

---

## 🎯 **ملخص الملفات:**

| الملف | الوصف |
|------|-------|
| `ORACLE_AUTO_SYNC_GUIDE.md` | دليل شامل 10 صفحات |
| `public/static/oracle-sync.js` | وحدة المزامنة الرئيسية |
| `public/static/styles.css` | CSS للإشعارات |
| `oracle_post_handler_final.sql` | كود POST Handler |
| `test-oracle-integration.sh` | سكريبت اختبار |

---

## 📞 **الدعم:**

**الآن أنت بحاجة لـ:**
1. ✅ تشغيل SQL من الخطوة 1 وإرسال النتيجة
2. ✅ إنشاء REST API في Oracle APEX
3. ✅ اختبار بواسطة `test-oracle-integration.sh`

**بعد الانتهاء، سيكون النظام يحفظ تلقائياً! 🎉**

---

**ابدأ بالخطوة 1 الآن! 🚀**
