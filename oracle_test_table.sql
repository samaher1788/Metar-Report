-- =====================================================
-- 🧪 جدول تجريبي بسيط للاختبار
-- =====================================================
-- هذا جدول صغير فقط للتجربة
-- إذا اشتغل، نطبق على الجداول الكبيرة
-- =====================================================

-- 1️⃣ جدول تجريبي بسيط
CREATE TABLE TEST_METAR (
    ID NUMBER,
    STATION_CODE VARCHAR2(10),
    OBSERVATION_TIME VARCHAR2(50),
    TEMPERATURE NUMBER(5,2),
    WEATHER_CODES VARCHAR2(100),
    CREATED_AT TIMESTAMP
);

-- Primary Key
ALTER TABLE TEST_METAR ADD CONSTRAINT PK_TEST_METAR PRIMARY KEY (ID);

-- Sequence
CREATE SEQUENCE TEST_METAR_SEQ START WITH 1 INCREMENT BY 1;

-- =====================================================
-- ✅ جدول التجربة جاهز!
-- =====================================================

-- 2️⃣ إدراج بيانات تجريبية
INSERT INTO TEST_METAR (ID, STATION_CODE, OBSERVATION_TIME, TEMPERATURE, WEATHER_CODES, CREATED_AT)
VALUES (TEST_METAR_SEQ.NEXTVAL, 'OERK', '2026-03-10 12:00', 25.5, 'BLDU', SYSTIMESTAMP);

INSERT INTO TEST_METAR (ID, STATION_CODE, OBSERVATION_TIME, TEMPERATURE, WEATHER_CODES, CREATED_AT)
VALUES (TEST_METAR_SEQ.NEXTVAL, 'OEJN', '2026-03-10 13:00', 28.3, 'DU', SYSTIMESTAMP);

COMMIT;

-- 3️⃣ اختبار القراءة
SELECT * FROM TEST_METAR;

-- =====================================================
-- النتيجة المتوقعة:
-- 
-- ID | STATION_CODE | OBSERVATION_TIME     | TEMP | WEATHER_CODES | CREATED_AT
-- ---|--------------|---------------------|------|---------------|-------------------
-- 1  | OERK         | 2026-03-10 12:00    | 25.5 | BLDU          | 2026-03-10 15:30:45
-- 2  | OEJN         | 2026-03-10 13:00    | 28.3 | DU            | 2026-03-10 15:30:45
-- 
-- ✅ إذا شفت هالنتيجة، معناها الجدول اشتغل!
-- =====================================================
