# 🎓 شرح تفصيلي: كيف تنشئ REST API في Oracle APEX

---

## 📍 **الموقع: Oracle APEX**

افتح Oracle APEX وسجّل دخولك

---

## 🚀 **الخطوات بالتفصيل:**

---

### **الخطوة 1️⃣: افتح RESTful Services**

#### 📌 الموقع:
```
من القائمة العلوية → SQL Workshop → RESTful Services
```

#### 🖼️ ما راح تشوفه:
- قائمة بالـ Modules الموجودة (إذا كان فيه)
- زر **"Create Module"** أزرق كبير

#### ✅ اضغط على: **"Create Module"**

---

### **الخطوة 2️⃣: إنشاء Module جديد**

#### 📝 راح تظهر لك صفحة فيها حقول:

**املأ الحقول بهالشكل:**

| الحقل | القيمة | الشرح |
|-------|--------|-------|
| **Module Name** | `test_api` | اسم الـ API (بدون مسافات) |
| **URI Prefix** | يترك فاضي | خلّه فاضي |
| **Base Path** | `/test/` | المسار الأساسي (لا تنسى / في البداية والنهاية) |
| **Items Per Page** | `25` | عدد النتائج في الصفحة (اتركه كما هو) |

#### 🖼️ مثال:
```
Module Name:     test_api
URI Prefix:      [فاضي]
Base Path:       /test/
Items Per Page:  25
```

#### ✅ اضغط: **"Create Module"**

---

### **الخطوة 3️⃣: إنشاء Resource Template**

#### 📌 بعد إنشاء Module، راح تفتح صفحة الـ Module

راح تشوف:
- اسم الـ Module في الأعلى: `test_api`
- تبويبات (Tabs) تحت
- قسم **"Resource Templates"** فاضي

#### ✅ في قسم "Resource Templates"، اضغط: **"Create Template"**

---

### **الخطوة 4️⃣: ضبط Resource Template**

#### 📝 املأ الحقول:

| الحقل | القيمة | الشرح |
|-------|--------|-------|
| **URI Template** | `data/` | المسار الفرعي (لا تنسى / في النهاية) |

#### 🖼️ مثال:
```
URI Template:  data/
```

#### 💡 الرابط النهائي راح يكون:
```
https://apex.oracle.com/pls/apex/YOUR_WORKSPACE/test/data/
```

#### ✅ اضغط: **"Create Template"**

---

### **الخطوة 5️⃣: إنشاء GET Handler (للقراءة)**

#### 📌 بعد إنشاء Template، راح تفتح صفحة الـ Template

راح تشوف:
- URI Template: `data/`
- قسم **"Resource Handlers"** فاضي

#### ✅ اضغط: **"Create Handler"**

---

### **الخطوة 6️⃣: ضبط GET Handler**

#### 📝 املأ الحقول:

| الحقل | القيمة |
|-------|--------|
| **Method** | `GET` (اختره من القائمة المنسدلة) |
| **Source Type** | `PL/SQL` (مختار افتراضياً) |
| **Requires Secure Access** | لا تعلّمه (اتركه فاضي للتجربة) |

#### 📄 في حقل **"Source"** (المربع الكبير)، الصق هذا الكود:

```sql
BEGIN
    apex_json.open_array;
    
    FOR rec IN (
        SELECT 
            ID,
            STATION_CODE,
            OBSERVATION_TIME,
            TEMPERATURE,
            WEATHER_CODES,
            TO_CHAR(CREATED_AT, 'YYYY-MM-DD HH24:MI:SS') AS CREATED_AT
        FROM TEST_METAR
        ORDER BY ID DESC
    ) LOOP
        apex_json.open_object;
        apex_json.write('id', rec.ID);
        apex_json.write('station', rec.STATION_CODE);
        apex_json.write('time', rec.OBSERVATION_TIME);
        apex_json.write('temperature', rec.TEMPERATURE);
        apex_json.write('weather', rec.WEATHER_CODES);
        apex_json.write('created_at', rec.CREATED_AT);
        apex_json.close_object;
    END LOOP;
    
    apex_json.close_array;
END;
```

#### 💡 شرح الكود:
- يجلب كل السجلات من `TEST_METAR`
- يحوّلها لصيغة JSON
- يرجع النتيجة كـ Array

#### ✅ اضغط: **"Create Handler"**

---

### **الخطوة 7️⃣: اختبار GET Handler**

#### 📌 بعد الإنشاء، راح ترجع لصفحة Template

راح تشوف GET Handler في القائمة

#### ✅ اضغط على اسم GET Handler

#### 📌 راح تفتح صفحة تفاصيل Handler

#### ✅ اضغط زر: **"Test"** (في الأعلى)

---

### **الخطوة 8️⃣: شاهد النتيجة (GET)**

#### 📌 راح تفتح صفحة Test

راح تشوف:
- **Request URL**: الرابط الكامل للـ API
- زر **"Send Request"**

#### ✅ اضغط: **"Send Request"**

#### 🎉 النتيجة المتوقعة (في قسم "Response"):

```json
[
  {
    "id": 2,
    "station": "OERK",
    "time": "2026-03-10",
    "temperature": 30.5,
    "weather": "DS",
    "created_at": "2026-03-10 16:20:30"
  },
  {
    "id": 1,
    "station": "TEST1",
    "time": "2026-03-10",
    "temperature": 25.5,
    "weather": "BLDU",
    "created_at": "2026-03-10 16:20:25"
  }
]
```

#### ✅ إذا شفت JSON زي كذا → GET Handler اشتغل! 🎉

---

### **الخطوة 9️⃣: إنشاء POST Handler (للإدراج)**

#### 📌 ارجع لصفحة `data/` Template

في قسم "Resource Handlers"، راح تشوف GET Handler موجود

#### ✅ اضغط مرة ثانية: **"Create Handler"**

---

### **الخطوة 🔟: ضبط POST Handler**

#### 📝 املأ الحقول:

| الحقل | القيمة |
|-------|--------|
| **Method** | `POST` (اختره من القائمة) |
| **Source Type** | `PL/SQL` |

#### 📄 في حقل **"Source"**، الصق هذا الكود:

```sql
DECLARE
    v_id NUMBER;
    v_station VARCHAR2(10);
    v_time VARCHAR2(50);
    v_temp NUMBER;
    v_weather VARCHAR2(100);
BEGIN
    -- قراءة JSON من الطلب
    apex_json.parse(:body);
    
    v_station := apex_json.get_varchar2('station');
    v_time := apex_json.get_varchar2('time');
    v_temp := apex_json.get_number('temperature');
    v_weather := apex_json.get_varchar2('weather');
    
    -- إدراج في الجدول
    INSERT INTO TEST_METAR (
        ID,
        STATION_CODE,
        OBSERVATION_TIME,
        TEMPERATURE,
        WEATHER_CODES,
        CREATED_AT
    ) VALUES (
        TEST_METAR_SEQ.NEXTVAL,
        v_station,
        v_time,
        v_temp,
        v_weather,
        SYSTIMESTAMP
    ) RETURNING ID INTO v_id;
    
    COMMIT;
    
    -- رد ناجح
    :status := 201;
    apex_json.open_object;
    apex_json.write('success', true);
    apex_json.write('id', v_id);
    apex_json.write('message', 'Data inserted successfully');
    apex_json.close_object;
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        :status := 500;
        apex_json.open_object;
        apex_json.write('success', false);
        apex_json.write('error', SQLERRM);
        apex_json.close_object;
END;
```

#### 💡 شرح الكود:
- يستقبل JSON من الطلب
- يدرج البيانات في الجدول
- يرجع رسالة نجاح أو فشل

#### ✅ اضغط: **"Create Handler"**

---

### **الخطوة 1️⃣1️⃣: اختبار POST Handler**

#### 📌 اضغط على POST Handler

#### ✅ اضغط: **"Test"**

#### 📌 راح تفتح صفحة Test

راح تشوف:
- **Method**: POST
- **Request Body**: مربع فاضي

#### 📝 في مربع "Request Body"، الصق:

```json
{
  "station": "OEJN",
  "time": "2026-03-10 15:00",
  "temperature": 32.5,
  "weather": "BLSA"
}
```

#### ✅ اضغط: **"Send Request"**

#### 🎉 النتيجة المتوقعة:

```json
{
  "success": true,
  "id": 3,
  "message": "Data inserted successfully"
}
```

#### ✅ إذا شفت `"success": true` → POST Handler اشتغل! 🎉

---

### **الخطوة 1️⃣2️⃣: نسخ رابط API**

#### 📌 ارجع لصفحة Module `test_api`

#### 📍 راح تلقى في الأعلى معلومات:

```
Full URL: https://apex.oracle.com/pls/apex/DUST_SCH/test/data/
```

#### ✅ انسخ هذا الرابط! (بتحتاجه لاحقاً)

---

## 🎉 **تمت العملية بنجاح!**

### ✅ ما أنجزناه:

| الخطوة | الحالة |
|--------|--------|
| ✅ إنشاء Module | تم |
| ✅ إنشاء Template | تم |
| ✅ إنشاء GET Handler | تم |
| ✅ اختبار GET | تم |
| ✅ إنشاء POST Handler | تم |
| ✅ اختبار POST | تم |
| ✅ نسخ رابط API | تم |

---

## 🧪 **اختبار نهائي من SQL Commands:**

```sql
-- تحقق من البيانات الجديدة
SELECT * FROM TEST_METAR ORDER BY ID DESC;
```

يجب أن تشوف السجل الجديد (OEJN) في القمة!

---

## 🚀 **الخطوة التالية:**

الآن عندك REST API شغّال!

**يمكنك:**
1. ✅ استدعاء API من أي مكان (curl, Postman, JavaScript)
2. ✅ ربطه بنظام METAR
3. ✅ إرسال البيانات تلقائياً

---

## 📞 **أخبرني:**

- ✅ GET Handler اشتغل؟
- ✅ POST Handler اشتغل؟
- ✅ وش رابط API اللي طلع عندك؟

**وبكمل معك الخطوات! 🎯**
