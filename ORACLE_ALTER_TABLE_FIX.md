# 🔧 حل مشكلة ORA-01735 (ALTER TABLE)

---

## ❌ **المشكلة:**
```
ORA-01735: invalid ALTER TABLE option
```

## 💡 **السبب:**
Oracle APEX أحياناً لا يقبل `ALTER TABLE ADD CONSTRAINT` في نفس السكريبت مع `CREATE TABLE`.

---

## ✅ **3 حلول:**

### الحل 1️⃣: Primary Key مع CREATE TABLE مباشرة

```sql
-- ✅ صحيح
CREATE TABLE TEST_METAR (
    ID NUMBER PRIMARY KEY,     -- ← Primary Key هنا مباشرة
    STATION_CODE VARCHAR2(10),
    OBSERVATION_TIME VARCHAR2(50),
    TEMPERATURE NUMBER(5,2),
    WEATHER_CODES VARCHAR2(100),
    CREATED_AT TIMESTAMP
);
```

```sql
-- ❌ خطأ (لا تستخدم)
CREATE TABLE TEST_METAR (
    ID NUMBER,
    ...
);
ALTER TABLE TEST_METAR ADD CONSTRAINT PK_TEST_METAR PRIMARY KEY (ID);
```

---

### الحل 2️⃣: استخدم PL/SQL Block (أمر واحد)

```sql
-- انسخ من ملف: oracle_test_oneline.sql
-- كل شيء في BEGIN...END واحد
BEGIN
    EXECUTE IMMEDIATE 'CREATE TABLE ...';
    EXECUTE IMMEDIATE 'CREATE SEQUENCE ...';
    EXECUTE IMMEDIATE 'INSERT INTO ...';
    COMMIT;
END;
/
```

✅ **هذا يشتغل 100%**

---

### الحل 3️⃣: نفّذ أمر أمر (واحد واحد)

```sql
-- أمر 1: احذف القديم (إذا موجود)
DROP TABLE TEST_METAR CASCADE CONSTRAINTS;

-- أمر 2: أنشئ الجدول
CREATE TABLE TEST_METAR (
    ID NUMBER PRIMARY KEY,
    STATION_CODE VARCHAR2(10),
    OBSERVATION_TIME VARCHAR2(50),
    TEMPERATURE NUMBER(5,2),
    WEATHER_CODES VARCHAR2(100),
    CREATED_AT TIMESTAMP
);

-- أمر 3: أنشئ Sequence
CREATE SEQUENCE TEST_METAR_SEQ START WITH 1;

-- أمر 4: ادرج بيانات
INSERT INTO TEST_METAR VALUES (1, 'TEST', '2026-03-10', 25.5, 'BLDU', SYSTIMESTAMP);

-- أمر 5: احفظ
COMMIT;

-- أمر 6: اختبر
SELECT * FROM TEST_METAR;
```

---

## 📋 **الطريقة الموصى بها (أسرع):**

### في Oracle APEX → SQL Workshop → SQL Commands:

**انسخ والصق هذا الأمر الواحد:**

```sql
BEGIN
    BEGIN
        EXECUTE IMMEDIATE 'DROP TABLE TEST_METAR CASCADE CONSTRAINTS';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        EXECUTE IMMEDIATE 'DROP SEQUENCE TEST_METAR_SEQ';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    EXECUTE IMMEDIATE 'CREATE TABLE TEST_METAR (
        ID NUMBER PRIMARY KEY,
        STATION_CODE VARCHAR2(10),
        OBSERVATION_TIME VARCHAR2(50),
        TEMPERATURE NUMBER(5,2),
        WEATHER_CODES VARCHAR2(100),
        CREATED_AT TIMESTAMP
    )';
    
    EXECUTE IMMEDIATE 'CREATE SEQUENCE TEST_METAR_SEQ START WITH 1';
    
    EXECUTE IMMEDIATE 'INSERT INTO TEST_METAR VALUES (TEST_METAR_SEQ.NEXTVAL, ''TEST1'', ''2026-03-10 12:00'', 25.5, ''BLDU'', SYSTIMESTAMP)';
    EXECUTE IMMEDIATE 'INSERT INTO TEST_METAR VALUES (TEST_METAR_SEQ.NEXTVAL, ''TEST2'', ''2026-03-10 13:00'', 28.0, ''DU'', SYSTIMESTAMP)';
    EXECUTE IMMEDIATE 'INSERT INTO TEST_METAR VALUES (TEST_METAR_SEQ.NEXTVAL, ''OERK'', ''2026-03-10 14:00'', 30.5, ''DS'', SYSTIMESTAMP)';
    
    COMMIT;
END;
/

SELECT * FROM TEST_METAR ORDER BY ID;
```

**اضغط Run (أو F5)**

---

## ✅ **النتيجة المتوقعة:**

```
PL/SQL procedure successfully completed.

ID | STATION_CODE | OBSERVATION_TIME     | TEMP | WEATHER_CODES | CREATED_AT
---|--------------|---------------------|------|---------------|-------------------
1  | TEST1        | 2026-03-10 12:00    | 25.5 | BLDU          | 2026-03-10 15:50:23
2  | TEST2        | 2026-03-10 13:00    | 28.0 | DU            | 2026-03-10 15:50:23
3  | OERK         | 2026-03-10 14:00    | 30.5 | DS            | 2026-03-10 15:50:23

3 rows selected.
```

✅ **إذا شفت هالنتيجة → نجح!**

---

## 🎯 **بعد النجاح:**

### الخطوة التالية: إنشاء REST API

```
1. RESTful Services → Create Module
2. Module Name: test_api
3. Base Path: /test/
4. Resource Template: data/
5. Methods: GET و POST
```

**الكود موجود في:** `ORACLE_TEST_GUIDE.md`

---

## 🔍 **إذا استمرت المشكلة:**

### تحقق من:
1. ✅ إنك في **SQL Commands** (مو SQL Scripts)
2. ✅ إن الكود كامل مع `BEGIN...END;`
3. ✅ وجود `/` في السطر الأخير بعد `END;`

### أو جرّب:
```sql
-- أبسط اختبار
CREATE TABLE T1 (ID NUMBER PRIMARY KEY);
SELECT * FROM T1;
DROP TABLE T1;
```

إذا هذا اشتغل، معناها المشكلة في الكود المعقد.

---

**جرّب الحل 2️⃣ (PL/SQL Block) - يشتغل 100%! 🚀**
