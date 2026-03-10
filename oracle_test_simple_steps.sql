-- =====================================================
-- 🧪 أبسط نسخة ممكنة (SQL بسيط)
-- =====================================================
-- انسخ كل أمر لوحده ونفّذه
-- =====================================================

-- 1️⃣ أنشئ الجدول (PRIMARY KEY داخل CREATE)
CREATE TABLE TEST_METAR (
    ID NUMBER PRIMARY KEY,
    STATION_CODE VARCHAR2(10),
    OBSERVATION_TIME VARCHAR2(50),
    TEMPERATURE NUMBER(5,2),
    WEATHER_CODES VARCHAR2(100),
    CREATED_AT TIMESTAMP
);

-- =====================================================
-- ✅ إذا شفت "Table created" → نفّذ الأمر التالي
-- =====================================================

-- 2️⃣ أنشئ Sequence
CREATE SEQUENCE TEST_METAR_SEQ START WITH 1;

-- =====================================================
-- ✅ إذا شفت "Sequence created" → نفّذ الأمر التالي
-- =====================================================

-- 3️⃣ ادرج بيانات (سجل واحد أولاً)
INSERT INTO TEST_METAR (ID, STATION_CODE, OBSERVATION_TIME, TEMPERATURE, WEATHER_CODES, CREATED_AT)
VALUES (1, 'TEST1', '2026-03-10 12:00', 25.5, 'BLDU', SYSTIMESTAMP);

-- =====================================================
-- ✅ إذا شفت "1 row inserted" → نفّذ الأمر التالي
-- =====================================================

-- 4️⃣ ادرج سجل ثاني
INSERT INTO TEST_METAR (ID, STATION_CODE, OBSERVATION_TIME, TEMPERATURE, WEATHER_CODES, CREATED_AT)
VALUES (2, 'OERK', '2026-03-10 14:00', 30.5, 'DS', SYSTIMESTAMP);

-- =====================================================
-- ✅ إذا شفت "1 row inserted" → نفّذ الأمر التالي
-- =====================================================

-- 5️⃣ احفظ التغييرات
COMMIT;

-- =====================================================
-- ✅ إذا شفت "Commit complete" → نفّذ الأمر التالي
-- =====================================================

-- 6️⃣ شوف البيانات
SELECT * FROM TEST_METAR ORDER BY ID;

-- =====================================================
-- النتيجة المتوقعة:
-- 
-- ID | STATION_CODE | OBSERVATION_TIME     | TEMPERATURE | WEATHER_CODES | CREATED_AT
-- ---|--------------|---------------------|-------------|---------------|-------------------
-- 1  | TEST1        | 2026-03-10 12:00    | 25.5        | BLDU          | 2026-03-10 16:00:00
-- 2  | OERK         | 2026-03-10 14:00    | 30.5        | DS            | 2026-03-10 16:00:00
-- 
-- ✅ إذا شفت سجلين → نجح! 🎉
-- =====================================================

-- 7️⃣ اختبر Sequence (اختياري)
INSERT INTO TEST_METAR (ID, STATION_CODE, OBSERVATION_TIME, TEMPERATURE, WEATHER_CODES, CREATED_AT)
VALUES (TEST_METAR_SEQ.NEXTVAL, 'OEJN', '2026-03-10 15:00', 32.0, 'BLSA', SYSTIMESTAMP);

COMMIT;

SELECT * FROM TEST_METAR ORDER BY ID;

-- =====================================================
-- يجب أن تشوف 3 سجلات الآن
-- =====================================================
