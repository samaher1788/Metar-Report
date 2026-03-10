# 🔧 حل مشكلة ORA-00922 - دليل خطوة بخطوة

---

## ❌ المشكلة:
```
Error at line 19/2: ORA-00922: missing or invalid option
```

## ✅ الحل:

المشكلة في `CURRENT_TIMESTAMP` - يجب استخدام `SYSTIMESTAMP` في Oracle.

---

## 📋 الطريقة الصحيحة:

### الخيار 1️⃣: استخدم ملف `oracle_tables.sql` (محدّث)

انسخ الملف `oracle_tables.sql` والصقه في **SQL Commands** ونفّذه.

✅ **تم تصحيح:**
- `CURRENT_TIMESTAMP` → `SYSTIMESTAMP`
- تمت إضافة جميع الـ Indexes
- تمت إضافة جميع الـ Constraints

---

### الخيار 2️⃣: استخدم `oracle_tables_simple.sql` (أمر أمر)

إذا كانت المشكلة مستمرة، استخدم النسخة المبسطة:

```sql
-- 1️⃣ أنشئ الجدول أولاً (بدون constraints)
CREATE TABLE METAR_REPORTS (
    REPORT_ID NUMBER,
    STATION_CODE VARCHAR2(10),
    OBSERVATION_TIME TIMESTAMP,
    LATITUDE NUMBER(10,6),
    LONGITUDE NUMBER(10,6),
    TEMPERATURE NUMBER(5,2),
    DEW_POINT NUMBER(5,2),
    WIND_DIRECTION NUMBER(3),
    WIND_SPEED NUMBER(5,2),
    VISIBILITY NUMBER(10,2),
    PRESSURE NUMBER(10,2),
    WEATHER_CODES VARCHAR2(100),
    RAW_METAR VARCHAR2(500),
    NETWORK VARCHAR2(20),
    COUNTRY_CODE VARCHAR2(5),
    CREATED_AT TIMESTAMP
);

-- 2️⃣ أضف Primary Key
ALTER TABLE METAR_REPORTS ADD CONSTRAINT PK_METAR_REPORTS PRIMARY KEY (REPORT_ID);

-- 3️⃣ أضف Unique Constraint
ALTER TABLE METAR_REPORTS ADD CONSTRAINT UK_METAR UNIQUE (STATION_CODE, OBSERVATION_TIME);

-- 4️⃣ أضف Not Null
ALTER TABLE METAR_REPORTS MODIFY STATION_CODE NOT NULL;
ALTER TABLE METAR_REPORTS MODIFY OBSERVATION_TIME NOT NULL;

-- 5️⃣ أنشئ Sequence
CREATE SEQUENCE METAR_REPORTS_SEQ START WITH 1 INCREMENT BY 1;

-- 6️⃣ أنشئ Indexes
CREATE INDEX IDX_METAR_STATION ON METAR_REPORTS(STATION_CODE);
CREATE INDEX IDX_METAR_TIME ON METAR_REPORTS(OBSERVATION_TIME);
CREATE INDEX IDX_METAR_WEATHER ON METAR_REPORTS(WEATHER_CODES);
CREATE INDEX IDX_METAR_COUNTRY ON METAR_REPORTS(COUNTRY_CODE);
```

---

## 🎯 خطوات التنفيذ في Oracle APEX:

### 1️⃣ افتح SQL Commands:
```
SQL Workshop → SQL Commands
```

### 2️⃣ انسخ السكريبت:
- من ملف `oracle_tables.sql` (الخيار الأول)
- أو من `oracle_tables_simple.sql` (الخيار الثاني)

### 3️⃣ الصق في SQL Commands

### 4️⃣ اضغط "Run"

### 5️⃣ تحقق من النتيجة:
```sql
-- يجب أن ترى:
SELECT COUNT(*) FROM METAR_REPORTS; -- 0 rows
SELECT COUNT(*) FROM DUST_PHENOMENA; -- 0 rows
SELECT COUNT(*) FROM STATIONS; -- 0 rows
SELECT COUNT(*) FROM DAILY_STATISTICS; -- 0 rows
```

---

## 🔍 استكشاف الأخطاء:

### إذا استمرت المشكلة:

#### خطأ: `ORA-00922`
**السبب:** استخدام `CURRENT_TIMESTAMP`  
**الحل:** استخدم `SYSTIMESTAMP` أو احذف `DEFAULT` كلياً

#### خطأ: `ORA-00955: name is already used`
**السبب:** الجدول موجود بالفعل  
**الحل:** احذف الجدول أولاً:
```sql
DROP TABLE DUST_PHENOMENA CASCADE CONSTRAINTS;
DROP TABLE METAR_REPORTS CASCADE CONSTRAINTS;
DROP TABLE STATIONS CASCADE CONSTRAINTS;
DROP TABLE DAILY_STATISTICS CASCADE CONSTRAINTS;

DROP SEQUENCE METAR_REPORTS_SEQ;
DROP SEQUENCE DUST_PHENOMENA_SEQ;
DROP SEQUENCE STATIONS_SEQ;
DROP SEQUENCE DAILY_STATISTICS_SEQ;
```

#### خطأ: `ORA-02264: name already used by constraint`
**السبب:** Constraint بنفس الاسم موجود  
**الحل:** غيّر أسماء الـ Constraints:
```sql
-- بدلاً من PK_METAR_REPORTS
-- استخدم PK_METAR_REPORTS_V2
```

---

## ✅ التحقق من النجاح:

بعد التنفيذ، نفّذ:

```sql
-- عرض جميع الجداول
SELECT TABLE_NAME FROM USER_TABLES 
WHERE TABLE_NAME IN ('METAR_REPORTS', 'DUST_PHENOMENA', 'STATIONS', 'DAILY_STATISTICS');

-- عرض جميع الـ Sequences
SELECT SEQUENCE_NAME FROM USER_SEQUENCES 
WHERE SEQUENCE_NAME LIKE '%METAR%' OR SEQUENCE_NAME LIKE '%DUST%' OR SEQUENCE_NAME LIKE '%STATION%';

-- عرض جميع الـ Indexes
SELECT INDEX_NAME, TABLE_NAME FROM USER_INDEXES 
WHERE TABLE_NAME IN ('METAR_REPORTS', 'DUST_PHENOMENA', 'STATIONS', 'DAILY_STATISTICS');
```

### النتيجة المتوقعة:
```
✅ 4 جداول
✅ 4 sequences
✅ 14 indexes
✅ 4 primary keys
✅ 2 unique constraints
✅ 1 foreign key
```

---

## 📞 إذا احتجت مساعدة:

أرسل لي:
1. نص الخطأ الكامل
2. رقم السطر
3. Oracle Database Version (من SQL Workshop → About)

**سأحلها فوراً! 🚀**
