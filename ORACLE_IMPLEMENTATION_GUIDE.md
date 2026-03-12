# 🎯 دليل التطبيق النهائي - ربط METAR_DATA مع Oracle APEX

## ✅ **كل شيء جاهز الآن!**

لديك 3 ملفات SQL جاهزة:
1. ✅ `oracle_create_sequence.sql` - إنشاء Sequence
2. ✅ `oracle_post_handler_metar_data.sql` - حفظ سجل واحد
3. ✅ `oracle_batch_handler_metar_data.sql` - حفظ دفعات

---

## 🚀 **خطوات التطبيق (15 دقيقة فقط!)**

### **الخطوة 1️⃣: إنشاء Sequence** ⏱️ 2 دقيقة

**في Oracle APEX → SQL Workshop → SQL Commands:**

```sql
-- التحقق من آخر METAR_ID موجود
DECLARE
    v_max_id NUMBER;
BEGIN
    SELECT NVL(MAX(METAR_ID), 0) INTO v_max_id FROM METAR_DATA;
    
    -- حذف Sequence القديم إذا كان موجوداً
    BEGIN
        EXECUTE IMMEDIATE 'DROP SEQUENCE METAR_ID_SEQ';
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;
    
    -- إنشاء Sequence جديد يبدأ بعد آخر ID
    EXECUTE IMMEDIATE 'CREATE SEQUENCE METAR_ID_SEQ START WITH ' || (v_max_id + 1) || ' INCREMENT BY 1 NOCACHE';
    
    DBMS_OUTPUT.PUT_LINE('✅ تم إنشاء METAR_ID_SEQ بنجاح');
END;
/
```

**النتيجة المتوقعة:**
```
PL/SQL procedure successfully completed.
✅ تم إنشاء METAR_ID_SEQ بنجاح
```

---

### **الخطوة 2️⃣: إنشاء REST API Module** ⏱️ 3 دقائق

**1. اذهب إلى:** `SQL Workshop → RESTful Services`

**2. Create Module:**
- **Module Name:** `metar_api`
- **Base Path:** `/metar/`
- **Published:** ✅ Yes
- اضغط **Create Module**

---

### **الخطوة 3️⃣: إنشاء Template للسجل الواحد** ⏱️ 5 دقائق

**1. اضغط على Module** `metar_api`

**2. Create Template:**
- **URI Template:** `save/`
- اضغط **Create Template**

**3. Create Handler:**
- **Method:** `POST`
- **Source Type:** `PL/SQL`
- **Source:** انسخ الكود كاملاً من `oracle_post_handler_metar_data.sql`
- اضغط **Create Handler**

---

### **الخطوة 4️⃣: إنشاء Template للدفعات** ⏱️ 5 دقائق

**1. ارجع لـ Module** `metar_api`

**2. Create Template:**
- **URI Template:** `save-batch/`
- اضغط **Create Template**

**3. Create Handler:**
- **Method:** `POST`
- **Source Type:** `PL/SQL`
- **Source:** انسخ الكود كاملاً من `oracle_batch_handler_metar_data.sql`
- اضغط **Create Handler**

---

## 🧪 **الاختبار**

### **اختبار 1: حفظ سجل واحد**

```bash
curl -X POST http://193.122.89.34/ncmapp/dustws/metar/save/ \
  -H "Content-Type: application/json" \
  -d '{
    "station": "OERK",
    "valid": "2026-03-11 10:00",
    "tmpf": 75.2,
    "dwpf": 45.0,
    "sknt": 15,
    "drct": 270,
    "vsby": 5.0,
    "alti": 29.92,
    "wxcodes": "BLDU",
    "metar": "OERK 111000Z 27015KT 8000 BLDU 24/07 Q1015"
  }'
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "id": 123456,
  "station": "OERK",
  "message": "تم حفظ البيانات بنجاح"
}
```

---

### **اختبار 2: حفظ دفعة**

```bash
curl -X POST http://193.122.89.34/ncmapp/dustws/metar/save-batch/ \
  -H "Content-Type: application/json" \
  -d '{
    "records": [
      {
        "station": "OERK",
        "valid": "2026-03-11 10:00",
        "tmpf": 75.2,
        "wxcodes": "BLDU",
        "sknt": 15,
        "drct": 270,
        "vsby": 5.0,
        "alti": 29.92,
        "metar": "OERK 111000Z 27015KT 8000 BLDU 24/07 Q1015"
      },
      {
        "station": "OEDF",
        "valid": "2026-03-11 10:00",
        "tmpf": 82.5,
        "wxcodes": "DS",
        "sknt": 20,
        "drct": 290,
        "vsby": 2.5,
        "alti": 29.88,
        "metar": "OEDF 111000Z 29020KT 4000 DS 28/10 Q1012"
      }
    ]
  }'
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "saved": 2,
  "duplicates": 0,
  "errors": 0,
  "total_processed": 2,
  "message": "تم حفظ 2 سجل بنجاح"
}
```

---

## 🔍 **التحقق من البيانات**

```sql
-- آخر 10 سجلات
SELECT 
    METAR_ID,
    STATION_ID,
    OBS_YEAR || '-' || LPAD(OBS_MONTH,2,'0') || '-' || LPAD(OBS_DAY,2,'0') AS DATE,
    TEMPERATURE_C,
    PHENOMENA_CODE,
    CREATED_BY,
    CREATED_ON
FROM METAR_DATA
WHERE CREATED_BY = 'AUTO_SYNC'
ORDER BY CREATED_ON DESC
FETCH FIRST 10 ROWS ONLY;
```

---

## 📊 **إحصائيات**

```sql
-- إحصائيات Auto-sync
SELECT 
    COUNT(*) AS TOTAL_RECORDS,
    COUNT(DISTINCT STATION_ID) AS UNIQUE_STATIONS,
    MIN(CREATED_ON) AS FIRST_SYNC,
    MAX(CREATED_ON) AS LAST_SYNC
FROM METAR_DATA
WHERE CREATED_BY = 'AUTO_SYNC';
```

---

## 🎯 **الميزات المُضمنة:**

### ✅ **تحويلات تلقائية:**
- ✅ **درجة الحرارة:** فهرنهايت → مئوي
- ✅ **الرؤية:** ميل → كيلومتر
- ✅ **الضغط:** inHg → hPa
- ✅ **الوقت:** timestamp → (year, month, day, hour, minute)

### ✅ **معالجة أخطاء:**
- ✅ تجاهل السجلات المكررة
- ✅ معالجة القيم NULL
- ✅ rollback عند الفشل
- ✅ رسائل خطأ واضحة

---

## 🚀 **اختبار Auto-sync من الواجهة**

**1. افتح الواجهة:**
```
https://metars-report.pages.dev/
```

**2. افتح Console (F12)**

**3. أنشئ تقرير:**
- اختر التواريخ
- اختر الشبكة (مثلاً: السعودية)
- اضغط "إنشاء التقرير"

**4. راقب Console:**
```
🔄 تفعيل الحفظ التلقائي في Oracle...
🔄 جاري حفظ 15 سجل...
✅ تم حفظ 15 سجل بنجاح
```

**5. تحقق من Oracle:**
```sql
SELECT COUNT(*) FROM METAR_DATA 
WHERE CREATED_BY = 'AUTO_SYNC' 
  AND CREATED_ON > SYSDATE - 1/24;
```

---

## 📁 **ملخص الملفات:**

| الملف | الوصف |
|------|-------|
| `oracle_create_sequence.sql` | إنشاء Sequence |
| `oracle_post_handler_metar_data.sql` | POST Handler (سجل واحد) |
| `oracle_batch_handler_metar_data.sql` | POST Handler (دفعات) |
| `public/static/oracle-sync.js` | وحدة المزامنة التلقائية |

---

## 🎉 **بعد التطبيق:**

✅ **ستحصل على:**
- حفظ تلقائي لكل تقرير
- تحويلات وحدات صحيحة
- معالجة أخطاء ذكية
- إشعارات جميلة
- بيانات منظمة في جدولك!

---

## 🆘 **استكشاف الأخطاء:**

### **خطأ: "ORA-02289: sequence does not exist"**
- **الحل:** شغّل `oracle_create_sequence.sql` أولاً

### **خطأ: "ORA-00001: unique constraint violated"**
- **عادي!** السكريبت يتجاهل التكرار تلقائياً

### **خطأ: "PLS-00201: identifier must be declared"**
- **السبب:** اسم العمود خطأ
- **الحل:** راجع أسماء الأعمدة في الكود

---

**ابدأ التطبيق الآن! خطوة خطوة! 🚀**
