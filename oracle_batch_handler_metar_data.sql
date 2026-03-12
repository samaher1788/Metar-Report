-- ✅ Batch POST Handler لجدول METAR_DATA
-- ============================================
-- 
-- URI: /metar/save-batch/
-- Method: POST
-- 
-- يحفظ مجموعة سجلات METAR دفعة واحدة (Batch Insert)

DECLARE
    v_body_text VARCHAR2(32767);
    v_count NUMBER := 0;
    v_errors NUMBER := 0;
    v_duplicates NUMBER := 0;
    
    -- متغيرات لكل سجل
    v_station VARCHAR2(10);
    v_valid VARCHAR2(50);
    v_year NUMBER(4);
    v_month NUMBER(2);
    v_day NUMBER(2);
    v_hour NUMBER;
    v_minute NUMBER(2);
    v_temp_f NUMBER;
    v_temp_c NUMBER(4,1);
    v_dwpt_f NUMBER;
    v_dwpt_c NUMBER(4,1);
    v_wind_dir NUMBER(3);
    v_wind_speed NUMBER(4);
    v_visibility NUMBER(10,1);
    v_pressure NUMBER(5,1);
    v_wxcodes VARCHAR2(20);
    v_metar_msg VARCHAR2(200);
    v_timestamp TIMESTAMP;
    
BEGIN
    v_body_text := utl_raw.cast_to_varchar2(:body);
    apex_json.parse(v_body_text);
    
    -- معالجة مصفوفة السجلات
    FOR i IN 1..apex_json.get_count('records') LOOP
        BEGIN
            -- استخراج القيم لكل سجل
            v_station := apex_json.get_varchar2('records[%d].station', i);
            v_valid := apex_json.get_varchar2('records[%d].valid', i);
            v_metar_msg := apex_json.get_varchar2('records[%d].metar', i);
            
            -- تحليل الوقت
            BEGIN
                v_timestamp := TO_TIMESTAMP(v_valid, 'YYYY-MM-DD HH24:MI');
                v_year := EXTRACT(YEAR FROM v_timestamp);
                v_month := EXTRACT(MONTH FROM v_timestamp);
                v_day := EXTRACT(DAY FROM v_timestamp);
                v_hour := EXTRACT(HOUR FROM v_timestamp);
                v_minute := EXTRACT(MINUTE FROM v_timestamp);
            EXCEPTION
                WHEN OTHERS THEN
                    v_year := EXTRACT(YEAR FROM SYSDATE);
                    v_month := EXTRACT(MONTH FROM SYSDATE);
                    v_day := EXTRACT(DAY FROM SYSDATE);
                    v_hour := 0;
                    v_minute := 0;
            END;
            
            -- استخراج بيانات الطقس
            v_temp_f := apex_json.get_number('records[%d].tmpf', i);
            v_dwpt_f := apex_json.get_number('records[%d].dwpf', i);
            v_wind_dir := apex_json.get_number('records[%d].drct', i);
            v_wind_speed := apex_json.get_number('records[%d].sknt', i);
            v_visibility := apex_json.get_number('records[%d].vsby', i);
            v_pressure := apex_json.get_number('records[%d].alti', i);
            v_wxcodes := apex_json.get_varchar2('records[%d].wxcodes', i);
            
            -- التحويلات
            IF v_temp_f IS NOT NULL THEN
                v_temp_c := ROUND((v_temp_f - 32) * 5 / 9, 1);
            ELSE
                v_temp_c := NULL;
            END IF;
            
            IF v_dwpt_f IS NOT NULL THEN
                v_dwpt_c := ROUND((v_dwpt_f - 32) * 5 / 9, 1);
            ELSE
                v_dwpt_c := NULL;
            END IF;
            
            IF v_visibility IS NOT NULL THEN
                v_visibility := ROUND(v_visibility * 1.60934, 1);
            END IF;
            
            IF v_pressure IS NOT NULL THEN
                v_pressure := ROUND(v_pressure * 33.8639, 1);
            END IF;
            
            -- إدخال السجل
            INSERT INTO METAR_DATA (
                METAR_ID,
                STATION_ID,
                OBS_YEAR,
                OBS_MONTH,
                OBS_DAY,
                OBS_HOUR,
                OBS_MINUTE,
                TEMPERATURE_C,
                DEWPOINT_C,
                WIND_DIRECTION_DEG,
                WIND_SPEED_KT,
                VISIBILITY_KM,
                PHENOMENA_CODE,
                PRESSURE_QNH,
                MESSAGE_TYPE,
                METAR_MESSAGE,
                CREATED_BY,
                CREATED_ON
            ) VALUES (
                METAR_ID_SEQ.NEXTVAL,
                v_station,
                v_year,
                v_month,
                v_day,
                v_hour,
                v_minute,
                v_temp_c,
                v_dwpt_c,
                v_wind_dir,
                v_wind_speed,
                v_visibility,
                v_wxcodes,
                v_pressure,
                'METAR',
                v_metar_msg,
                'AUTO_SYNC',
                SYSDATE
            );
            
            v_count := v_count + 1;
            
        EXCEPTION
            WHEN DUP_VAL_ON_INDEX THEN
                v_duplicates := v_duplicates + 1;
                NULL; -- تجاهل التكرار
            WHEN OTHERS THEN
                v_errors := v_errors + 1;
                -- Log error (optional)
        END;
    END LOOP;
    
    COMMIT;
    
    -- رد النتيجة
    :status := 201;
    apex_json.open_object;
    apex_json.write('success', TRUE);
    apex_json.write('saved', v_count);
    apex_json.write('duplicates', v_duplicates);
    apex_json.write('errors', v_errors);
    apex_json.write('total_processed', v_count + v_duplicates + v_errors);
    apex_json.write('message', 'تم حفظ ' || v_count || ' سجل بنجاح');
    apex_json.close_object;
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        :status := 500;
        apex_json.open_object;
        apex_json.write('success', FALSE);
        apex_json.write('saved', v_count);
        apex_json.write('error', SQLERRM);
        apex_json.close_object;
END;
