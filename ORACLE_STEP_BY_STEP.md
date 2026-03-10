# 🔧 حل ORA-00900: invalid SQL statement

---

## ❌ **المشكلة:**
```
ORA-00900: invalid SQL statement
```

## 💡 **السبب:**
Oracle APEX SQL Commands لا يقبل:
- ❌ الـ `/` في نهاية PL/SQL Block
- ❌ أوامر PL/SQL معقدة أحياناً

---

## ✅ **الحل الأسهل (خطوة بخطوة):**

### في Oracle APEX:

#### 📍 **الموقع:**
```
SQL Workshop → SQL Commands
```

---

### **الخطوة 1️⃣: أنشئ الجدول**

**انسخ والصق هذا الأمر فقط:**

```sql
CREATE TABLE TEST_METAR (
    ID NUMBER PRIMARY KEY,
    STATION_CODE VARCHAR2(10),
    OBSERVATION_TIME VARCHAR2(50),
    TEMPERATURE NUMBER(5,2),
    WEATHER_CODES VARCHAR2(100),
    CREATED_AT TIMESTAMP
);
```

**اضغط "Run" (أو F5)**

✅ **يجب أن تشوف:**
```
Table created.
```

---

### **الخطوة 2️⃣: أنشئ Sequence**

**امسح الأمر السابق، والصق هذا:**

```sql
CREATE SEQUENCE TEST_METAR_SEQ START WITH 1;
```

**اضغط "Run"**

✅ **يجب أن تشوف:**
```
Sequence created.
```

---

### **الخطوة 3️⃣: ادرج بيانات**

**امسح الأمر السابق، والصق هذا:**

```sql
INSERT INTO TEST_METAR (ID, STATION_CODE, OBSERVATION_TIME, TEMPERATURE, WEATHER_CODES, CREATED_AT)
VALUES (1, 'TEST1', '2026-03-10 12:00', 25.5, 'BLDU', SYSTIMESTAMP);
```

**اضغط "Run"**

✅ **يجب أن تشوف:**
```
1 row inserted.
```

---

### **الخطوة 4️⃣: ادرج سجل ثاني**

```sql
INSERT INTO TEST_METAR (ID, STATION_CODE, OBSERVATION_TIME, TEMPERATURE, WEATHER_CODES, CREATED_AT)
VALUES (2, 'OERK', '2026-03-10 14:00', 30.5, 'DS', SYSTIMESTAMP);
```

**اضغط "Run"**

✅ **يجب أن تشوف:**
```
1 row inserted.
```

---

### **الخطوة 5️⃣: احفظ**

```sql
COMMIT;
```

**اضغط "Run"**

✅ **يجب أن تشوف:**
```
Commit complete.
```

---

### **الخطوة 6️⃣: شوف النتيجة**

```sql
SELECT * FROM TEST_METAR ORDER BY ID;
```

**اضغط "Run"**

✅ **يجب أن تشوف:**

| ID | STATION_CODE | OBSERVATION_TIME | TEMPERATURE | WEATHER_CODES | CREATED_AT |
|----|--------------|------------------|-------------|---------------|------------|
| 1  | TEST1        | 2026-03-10 12:00 | 25.5        | BLDU          | 2026-03-10 16:05:30 |
| 2  | OERK         | 2026-03-10 14:00 | 30.5        | DS            | 2026-03-10 16:05:45 |

---

## 🎉 **إذا شفت سجلين → نجح!**

---

## 🚀 **الخطوة التالية: اختبار Sequence**

```sql
INSERT INTO TEST_METAR (ID, STATION_CODE, OBSERVATION_TIME, TEMPERATURE, WEATHER_CODES, CREATED_AT)
VALUES (TEST_METAR_SEQ.NEXTVAL, 'OEJN', '2026-03-10 15:00', 32.0, 'BLSA', SYSTIMESTAMP);

COMMIT;

SELECT * FROM TEST_METAR ORDER BY ID;
```

✅ **يجب أن تشوف 3 سجلات الآن**

---

## 📋 **ملخص الأوامر (للنسخ السريع):**

```sql
-- 1
CREATE TABLE TEST_METAR (
    ID NUMBER PRIMARY KEY,
    STATION_CODE VARCHAR2(10),
    OBSERVATION_TIME VARCHAR2(50),
    TEMPERATURE NUMBER(5,2),
    WEATHER_CODES VARCHAR2(100),
    CREATED_AT TIMESTAMP
);

-- 2
CREATE SEQUENCE TEST_METAR_SEQ START WITH 1;

-- 3
INSERT INTO TEST_METAR VALUES (1, 'TEST1', '2026-03-10 12:00', 25.5, 'BLDU', SYSTIMESTAMP);

-- 4
INSERT INTO TEST_METAR VALUES (2, 'OERK', '2026-03-10 14:00', 30.5, 'DS', SYSTIMESTAMP);

-- 5
COMMIT;

-- 6
SELECT * FROM TEST_METAR ORDER BY ID;
```

---

## 🔍 **إذا لسه في مشكلة:**

### ❓ **خطأ: "Table or view already exists"**

**الحل:** امسح الجدول القديم أولاً:

```sql
DROP TABLE TEST_METAR CASCADE CONSTRAINTS;
DROP SEQUENCE TEST_METAR_SEQ;
```

ثم ابدأ من جديد من الخطوة 1.

---

### ❓ **خطأ: "Insufficient privileges"**

**الحل:** تأكد إن عندك صلاحيات:
- CREATE TABLE
- CREATE SEQUENCE

تواصل مع مدير Workspace.

---

### ❓ **الأمر اشتغل لكن ما شفت نتيجة**

**الحل:** تأكد إنك في **SQL Commands** (مو SQL Scripts)

---

## ✅ **بعد النجاح:**

### الخطوة التالية: إنشاء REST API

1. اذهب إلى: **SQL Workshop → RESTful Services**
2. اضغط **Create Module**
3. اتبع الخطوات في: `ORACLE_TEST_GUIDE.md`

---

**جرّب الآن خطوة خطوة! 🚀**
