-- ✅ كود POST Handler النهائي (يعمل مع جميع إصدارات Oracle APEX)

DECLARE
    v_id NUMBER;
    v_station VARCHAR2(10);
    v_time VARCHAR2(50);
    v_temperature NUMBER;
    v_weather VARCHAR2(100);
    v_body_text VARCHAR2(32767);
BEGIN
    -- تحويل BLOB إلى VARCHAR2
    v_body_text := utl_raw.cast_to_varchar2(:body);
    
    -- Parse JSON
    apex_json.parse(v_body_text);
    
    -- استخراج القيم
    v_station := apex_json.get_varchar2('station');
    v_time := apex_json.get_varchar2('time');
    v_temperature := apex_json.get_number('temperature');
    v_weather := apex_json.get_varchar2('weather');
    
    -- إدخال البيانات
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
        v_temperature,
        v_weather,
        SYSTIMESTAMP
    ) RETURNING ID INTO v_id;
    
    COMMIT;
    
    -- إرجاع استجابة نجاح
    :status := 201;
    apex_json.open_object;
    apex_json.write('success', TRUE);
    apex_json.write('id', v_id);
    apex_json.write('message', 'Data inserted successfully');
    apex_json.close_object;
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        :status := 500;
        apex_json.open_object;
        apex_json.write('success', FALSE);
        apex_json.write('error', SQLERRM);
        apex_json.close_object;
END;
