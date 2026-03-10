# 🧪 اختبار الربط - دليل خطوة بخطوة

---

## 🎯 الهدف:
اختبار الربط بين نظام METAR وقاعدة بيانات Oracle APEX الموجودة

---

## 📋 الخطوات:

### 1️⃣ إنشاء جدول تجريبي (دقيقة واحدة):

```sql
-- في Oracle APEX → SQL Workshop → SQL Commands
-- انسخ والصق من ملف: oracle_test_table.sql

CREATE TABLE TEST_METAR (
    ID NUMBER,
    STATION_CODE VARCHAR2(10),
    OBSERVATION_TIME VARCHAR2(50),
    TEMPERATURE NUMBER(5,2),
    WEATHER_CODES VARCHAR2(100),
    CREATED_AT TIMESTAMP
);

ALTER TABLE TEST_METAR ADD CONSTRAINT PK_TEST_METAR PRIMARY KEY (ID);
CREATE SEQUENCE TEST_METAR_SEQ START WITH 1 INCREMENT BY 1;

-- اختبر بإدراج سجل
INSERT INTO TEST_METAR (ID, STATION_CODE, OBSERVATION_TIME, TEMPERATURE, WEATHER_CODES, CREATED_AT)
VALUES (TEST_METAR_SEQ.NEXTVAL, 'TEST', '2026-03-10 12:00', 25.5, 'BLDU', SYSTIMESTAMP);
COMMIT;

SELECT * FROM TEST_METAR;
```

✅ **إذا شفت السجل، الجدول اشتغل!**

---

### 2️⃣ إنشاء REST API تجريبي (3 دقائق):

#### أ) إنشاء Module:
```
SQL Workshop → RESTful Services → Create Module

Module Name: test_api
Base Path: /test/
```

#### ب) إنشاء Resource Template:
```
Resource Template: data/
```

#### ج) إضافة Handler:

**GET Method** (للقراءة):

```sql
BEGIN
    apex_json.open_array;
    
    FOR rec IN (SELECT * FROM TEST_METAR ORDER BY ID DESC) LOOP
        apex_json.open_object;
        apex_json.write('id', rec.ID);
        apex_json.write('station', rec.STATION_CODE);
        apex_json.write('time', rec.OBSERVATION_TIME);
        apex_json.write('temp', rec.TEMPERATURE);
        apex_json.write('weather', rec.WEATHER_CODES);
        apex_json.close_object;
    END LOOP;
    
    apex_json.close_array;
END;
```

**POST Method** (للإدراج):

```sql
DECLARE
    v_id NUMBER;
BEGIN
    apex_json.parse(:body);
    
    INSERT INTO TEST_METAR (
        ID,
        STATION_CODE,
        OBSERVATION_TIME,
        TEMPERATURE,
        WEATHER_CODES,
        CREATED_AT
    ) VALUES (
        TEST_METAR_SEQ.NEXTVAL,
        apex_json.get_varchar2('station'),
        apex_json.get_varchar2('time'),
        apex_json.get_number('temp'),
        apex_json.get_varchar2('weather'),
        SYSTIMESTAMP
    ) RETURNING ID INTO v_id;
    
    COMMIT;
    
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

---

### 3️⃣ اختبار REST API (دقيقة واحدة):

#### من داخل Oracle APEX:

```
RESTful Services → test_api → data/ → Test
```

**اختبر GET:**
- Method: GET
- اضغط "Test"
- يجب أن تشوف البيانات بصيغة JSON

**اختبر POST:**
- Method: POST
- Body:
```json
{
  "station": "OERK",
  "time": "2026-03-10 14:00",
  "temp": 30.5,
  "weather": "DU"
}
```
- اضغط "Test"
- يجب أن تشوف: `{"success":true,"id":2,...}`

---

### 4️⃣ الحصول على رابط API:

بعد التجربة الناجحة، اذهب إلى:
```
RESTful Services → test_api → Copy Full URL
```

**مثال:**
```
https://apex.oracle.com/pls/apex/your_workspace/test/data/
```

---

### 5️⃣ اختبار من خارج APEX (curl):

```bash
# اختبار GET
curl "https://apex.oracle.com/pls/apex/your_workspace/test/data/"

# اختبار POST
curl -X POST "https://apex.oracle.com/pls/apex/your_workspace/test/data/" \
  -H "Content-Type: application/json" \
  -d '{
    "station": "OEJN",
    "time": "2026-03-10 15:00",
    "temp": 32.0,
    "weather": "BLDU"
  }'
```

---

## ✅ علامات النجاح:

### الجدول:
```
✅ SELECT * FROM TEST_METAR; → يظهر بيانات
```

### REST API - GET:
```json
✅ [
  {"id":1,"station":"TEST","time":"2026-03-10 12:00","temp":25.5,"weather":"BLDU"},
  {"id":2,"station":"OERK","time":"2026-03-10 14:00","temp":30.5,"weather":"DU"}
]
```

### REST API - POST:
```json
✅ {"success":true,"id":3,"message":"Data inserted successfully"}
```

---

## 🎯 الخطوة التالية:

**إذا نجح الاختبار:**
1. ✅ معناها الربط يشتغل 100%
2. ✅ نقدر نطبق على الجداول الحقيقية
3. ✅ نضيف OAuth للأمان
4. ✅ نربط النظام بالـ API

**أخبرني إذا:**
- ✅ الجدول اشتغل
- ✅ REST API GET اشتغل
- ✅ REST API POST اشتغل
- ✅ حصلت على رابط API

**وبكمل الخطوات! 🚀**

---

## 🔍 استكشاف الأخطاء:

### إذا فشل الجدول:
- تحقق من الـ privileges
- تأكد من وجود مساحة في الـ workspace

### إذا فشل REST API:
- تحقق من تفعيل RESTful Services
- تأكد من صحة الـ PL/SQL syntax

### إذا فشل Test:
- تحقق من وجود بيانات في الجدول
- راجع الـ error message

---

**جاهز للتجربة! 😊**
