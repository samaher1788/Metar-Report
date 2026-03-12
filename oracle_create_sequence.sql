-- ✅ إنشاء Sequence لـ METAR_ID
-- ================================
-- 
-- تنفيذ هذا الكود أولاً قبل REST API Handlers

-- التحقق من آخر METAR_ID موجود
DECLARE
    v_max_id NUMBER;
BEGIN
    SELECT NVL(MAX(METAR_ID), 0) INTO v_max_id FROM METAR_DATA;
    
    -- حذف Sequence القديم إذا كان موجوداً
    BEGIN
        EXECUTE IMMEDIATE 'DROP SEQUENCE METAR_ID_SEQ';
    EXCEPTION
        WHEN OTHERS THEN NULL;
    END;
    
    -- إنشاء Sequence جديد يبدأ بعد آخر ID
    EXECUTE IMMEDIATE 'CREATE SEQUENCE METAR_ID_SEQ START WITH ' || (v_max_id + 1) || ' INCREMENT BY 1 NOCACHE';
    
    DBMS_OUTPUT.PUT_LINE('✅ تم إنشاء METAR_ID_SEQ بنجاح');
    DBMS_OUTPUT.PUT_LINE('يبدأ من: ' || (v_max_id + 1));
END;
/

-- التحقق من الـ Sequence
SELECT METAR_ID_SEQ.NEXTVAL FROM DUAL;
