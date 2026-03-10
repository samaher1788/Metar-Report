-- =====================================================
-- 🧪 جدول تجريبي - نسخة مصححة 100%
-- =====================================================
-- انسخ كل أمر لوحده ونفّذه (أمر أمر)
-- =====================================================

-- 1️⃣ احذف الجدول القديم (إذا كان موجود)
DROP TABLE TEST_METAR CASCADE CONSTRAINTS;
DROP SEQUENCE TEST_METAR_SEQ;

-- =====================================================

-- 2️⃣ أنشئ الجدول مع Primary Key مباشرة
CREATE TABLE TEST_METAR (
    ID NUMBER PRIMARY KEY,
    STATION_CODE VARCHAR2(10),
    OBSERVATION_TIME VARCHAR2(50),
    TEMPERATURE NUMBER(5,2),
    WEATHER_CODES VARCHAR2(100),
    CREATED_AT TIMESTAMP
);

-- =====================================================

-- 3️⃣ أنشئ Sequence
CREATE SEQUENCE TEST_METAR_SEQ START WITH 1 INCREMENT BY 1;

-- =====================================================

-- 4️⃣ ادرج بيانات تجريبية
INSERT INTO TEST_METAR (ID, STATION_CODE, OBSERVATION_TIME, TEMPERATURE, WEATHER_CODES, CREATED_AT)
VALUES (TEST_METAR_SEQ.NEXTVAL, 'TEST1', '2026-03-10 12:00', 25.5, 'BLDU', SYSTIMESTAMP);

INSERT INTO TEST_METAR (ID, STATION_CODE, OBSERVATION_TIME, TEMPERATURE, WEATHER_CODES, CREATED_AT)
VALUES (TEST_METAR_SEQ.NEXTVAL, 'TEST2', '2026-03-10 13:00', 28.0, 'DU', SYSTIMESTAMP);

INSERT INTO TEST_METAR (ID, STATION_CODE, OBSERVATION_TIME, TEMPERATURE, WEATHER_CODES, CREATED_AT)
VALUES (TEST_METAR_SEQ.NEXTVAL, 'OERK', '2026-03-10 14:00', 30.5, 'DS', SYSTIMESTAMP);

COMMIT;

-- =====================================================

-- 5️⃣ اختبر الجدول
SELECT * FROM TEST_METAR ORDER BY ID;

-- =====================================================
-- النتيجة المتوقعة:
-- 
-- ID | STATION_CODE | OBSERVATION_TIME     | TEMP | WEATHER_CODES | CREATED_AT
-- ---|--------------|---------------------|------|---------------|-------------------
-- 1  | TEST1        | 2026-03-10 12:00    | 25.5 | BLDU          | 2026-03-10 15:45:30
-- 2  | TEST2        | 2026-03-10 13:00    | 28.0 | DU            | 2026-03-10 15:45:30
-- 3  | OERK         | 2026-03-10 14:00    | 30.5 | DS            | 2026-03-10 15:45:30
-- 
-- ✅ إذا شفت 3 سجلات → الجدول اشتغل بنجاح!
-- =====================================================

-- 6️⃣ اختبر Sequence
SELECT TEST_METAR_SEQ.NEXTVAL FROM DUAL;
-- يجب أن يطلع: 4

-- =====================================================
-- ✅ جاهز! الآن روح للخطوة التالية (إنشاء REST API)
-- =====================================================
