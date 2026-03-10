-- =====================================================
-- 🧪 جدول تجريبي - نسخة واحدة كاملة
-- =====================================================
-- انسخ هذا الأمر كله والصقه مرة وحدة
-- =====================================================

BEGIN
    -- حذف القديم (إذا موجود)
    BEGIN
        EXECUTE IMMEDIATE 'DROP TABLE TEST_METAR CASCADE CONSTRAINTS';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    BEGIN
        EXECUTE IMMEDIATE 'DROP SEQUENCE TEST_METAR_SEQ';
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    
    -- إنشاء الجدول
    EXECUTE IMMEDIATE 'CREATE TABLE TEST_METAR (
        ID NUMBER PRIMARY KEY,
        STATION_CODE VARCHAR2(10),
        OBSERVATION_TIME VARCHAR2(50),
        TEMPERATURE NUMBER(5,2),
        WEATHER_CODES VARCHAR2(100),
        CREATED_AT TIMESTAMP
    )';
    
    -- إنشاء Sequence
    EXECUTE IMMEDIATE 'CREATE SEQUENCE TEST_METAR_SEQ START WITH 1 INCREMENT BY 1';
    
    -- إدراج بيانات تجريبية
    EXECUTE IMMEDIATE 'INSERT INTO TEST_METAR VALUES (TEST_METAR_SEQ.NEXTVAL, ''TEST1'', ''2026-03-10 12:00'', 25.5, ''BLDU'', SYSTIMESTAMP)';
    EXECUTE IMMEDIATE 'INSERT INTO TEST_METAR VALUES (TEST_METAR_SEQ.NEXTVAL, ''TEST2'', ''2026-03-10 13:00'', 28.0, ''DU'', SYSTIMESTAMP)';
    EXECUTE IMMEDIATE 'INSERT INTO TEST_METAR VALUES (TEST_METAR_SEQ.NEXTVAL, ''OERK'', ''2026-03-10 14:00'', 30.5, ''DS'', SYSTIMESTAMP)';
    
    COMMIT;
    
    DBMS_OUTPUT.PUT_LINE('✅ تم إنشاء الجدول والبيانات بنجاح!');
END;
/

-- التحقق
SELECT * FROM TEST_METAR ORDER BY ID;

-- =====================================================
-- يجب أن تشوف 3 سجلات
-- =====================================================
