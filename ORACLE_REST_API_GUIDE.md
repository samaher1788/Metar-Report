# 🚀 إنشاء REST API لجدول TEST_METAR

---

## 📋 الخطوات (5 دقائق):

### 1️⃣ افتح RESTful Services

```
SQL Workshop → RESTful Services
```

---

### 2️⃣ أنشئ Module جديد

اضغط **"Create Module"**

أدخل المعلومات:

```
Module Name:      test_api
Base Path:        /test/
Items Per Page:   25
```

اضغط **"Create Module"**

---

### 3️⃣ أنشئ Resource Template

داخل `test_api` Module، اضغط **"Create Template"**

```
URI Template:  data/
```

اضغط **"Create Template"**

---

### 4️⃣ أنشئ GET Handler (للقراءة)

داخل `data/` Template، اضغط **"Create Handler"**

```
Method:        GET
Source Type:   PL/SQL
```

**PL/SQL Code:**

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

اضغط **"Create Handler"**

---

### 5️⃣ أنشئ POST Handler (للإدراج)

في نفس `data/` Template، اضغط **"Create Handler"** مرة أخرى

```
Method:        POST
Source Type:   PL/SQL
```

**PL/SQL Code:**

```sql
DECLARE
    v_id NUMBER;
    v_station VARCHAR2(10);
    v_time VARCHAR2(50);
    v_temp NUMBER;
    v_weather VARCHAR2(100);
BEGIN
    -- Parse JSON من الطلب
    apex_json.parse(:body);
    
    v_station := apex_json.get_varchar2('station');
    v_time := apex_json.get_varchar2('time');
    v_temp := apex_json.get_number('temperature');
    v_weather := apex_json.get_varchar2('weather');
    
    -- ادرج في الجدول
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

اضغط **"Create Handler"**

---

### 6️⃣ اختبر GET Handler

في `test_api` → `data/` → اضغط على GET Handler

اضغط **"Test"**

✅ **يجب أن تشوف JSON:**

```json
[
  {
    "id": 2,
    "station": "OERK",
    "time": "2026-03-10",
    "temperature": 30.5,
    "weather": "DS",
    "created_at": "2026-03-10 16:15:30"
  },
  {
    "id": 1,
    "station": "TEST1",
    "time": "2026-03-10",
    "temperature": 25.5,
    "weather": "BLDU",
    "created_at": "2026-03-10 16:15:25"
  }
]
```

---

### 7️⃣ اختبر POST Handler

في نفس المكان، اضغط على POST Handler

اضغط **"Test"**

في Request Body، الصق:

```json
{
  "station": "OEJN",
  "time": "2026-03-10 15:00",
  "temperature": 32.0,
  "weather": "BLSA"
}
```

اضغط **"Send Request"**

✅ **يجب أن تشوف:**

```json
{
  "success": true,
  "id": 3,
  "message": "Data inserted successfully"
}
```

---

### 8️⃣ احصل على رابط API

في `test_api` Module، ابحث عن **"Full URL"** أو اضغط على أيقونة النسخ

**الرابط سيكون شكله:**

```
https://apex.oracle.com/pls/apex/DUST_SCH/test/data/
```

أو

```
https://apex.oracle.com/pls/apex/your_workspace/test/data/
```

---

## ✅ **اختبار من خارج APEX:**

### من Terminal أو Command Line:

#### اختبار GET:

```bash
curl "https://apex.oracle.com/pls/apex/DUST_SCH/test/data/"
```

#### اختبار POST:

```bash
curl -X POST "https://apex.oracle.com/pls/apex/DUST_SCH/test/data/" \
  -H "Content-Type: application/json" \
  -d '{
    "station": "OERK",
    "time": "2026-03-10 16:00",
    "temperature": 35.0,
    "weather": "DS"
  }'
```

---

## 🎉 **إذا اشتغلت الاختبارات:**

✅ **معناها REST API شغّال 100%!**

الآن يمكننا:
1. ✅ ربط نظام METAR بهذا API
2. ✅ إرسال البيانات تلقائياً
3. ✅ جلب البيانات من قاعدة البيانات

---

## 📞 **الخطوة التالية:**

**أخبرني:**
- ✅ GET Handler اشتغل؟
- ✅ POST Handler اشتغل؟
- ✅ وش رابط API اللي طلع؟

**وبكمل معك ربط النظام! 🚀**
