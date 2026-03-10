# 🔗 دليل ربط نظام METAR بقاعدة بيانات Oracle APEX

---

## 📋 نظرة عامة

هذا الدليل يشرح كيفية ربط نظام تقارير العواصف الغبارية بقاعدة بيانات Oracle APEX لتخزين البيانات تلقائياً.

---

## 🏗️ البنية المقترحة

```
METAR System (Cloudflare)
    ↓
  API Call
    ↓
Oracle APEX REST API
    ↓
Oracle Database Tables
```

---

## 📊 جداول قاعدة البيانات المطلوبة

### 1️⃣ جدول التقارير الرئيسي (METAR_REPORTS)

```sql
CREATE TABLE METAR_REPORTS (
    REPORT_ID NUMBER PRIMARY KEY,
    STATION_CODE VARCHAR2(10) NOT NULL,
    OBSERVATION_TIME TIMESTAMP NOT NULL,
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
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT UK_METAR UNIQUE (STATION_CODE, OBSERVATION_TIME)
);

-- إنشاء Sequence
CREATE SEQUENCE METAR_REPORTS_SEQ START WITH 1 INCREMENT BY 1;

-- إنشاء Indexes للأداء
CREATE INDEX IDX_METAR_STATION ON METAR_REPORTS(STATION_CODE);
CREATE INDEX IDX_METAR_TIME ON METAR_REPORTS(OBSERVATION_TIME);
CREATE INDEX IDX_METAR_WEATHER ON METAR_REPORTS(WEATHER_CODES);
CREATE INDEX IDX_METAR_COUNTRY ON METAR_REPORTS(COUNTRY_CODE);
```

### 2️⃣ جدول الظواهر الغبارية (DUST_PHENOMENA)

```sql
CREATE TABLE DUST_PHENOMENA (
    PHENOMENON_ID NUMBER PRIMARY KEY,
    REPORT_ID NUMBER NOT NULL,
    PHENOMENON_TYPE VARCHAR2(10) NOT NULL, -- BLDU, BLSA, DU, SA, DS, SS, PO
    SEVERITY VARCHAR2(20), -- SEVERE, MODERATE, LIGHT
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_DUST_REPORT FOREIGN KEY (REPORT_ID) 
        REFERENCES METAR_REPORTS(REPORT_ID) ON DELETE CASCADE
);

CREATE SEQUENCE DUST_PHENOMENA_SEQ START WITH 1 INCREMENT BY 1;
CREATE INDEX IDX_DUST_TYPE ON DUST_PHENOMENA(PHENOMENON_TYPE);
```

### 3️⃣ جدول المحطات (STATIONS)

```sql
CREATE TABLE STATIONS (
    STATION_ID NUMBER PRIMARY KEY,
    STATION_CODE VARCHAR2(10) UNIQUE NOT NULL,
    STATION_NAME VARCHAR2(100),
    COUNTRY_CODE VARCHAR2(5),
    COUNTRY_NAME VARCHAR2(50),
    LATITUDE NUMBER(10,6),
    LONGITUDE NUMBER(10,6),
    ELEVATION NUMBER(10,2),
    ACTIVE_FLAG VARCHAR2(1) DEFAULT 'Y',
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE STATIONS_SEQ START WITH 1 INCREMENT BY 1;
```

### 4️⃣ جدول الإحصائيات اليومية (DAILY_STATISTICS)

```sql
CREATE TABLE DAILY_STATISTICS (
    STAT_ID NUMBER PRIMARY KEY,
    REPORT_DATE DATE NOT NULL,
    COUNTRY_CODE VARCHAR2(5) NOT NULL,
    TOTAL_REPORTS NUMBER DEFAULT 0,
    BLDU_COUNT NUMBER DEFAULT 0,
    BLSA_COUNT NUMBER DEFAULT 0,
    DU_COUNT NUMBER DEFAULT 0,
    SA_COUNT NUMBER DEFAULT 0,
    DS_COUNT NUMBER DEFAULT 0,
    SS_COUNT NUMBER DEFAULT 0,
    PO_COUNT NUMBER DEFAULT 0,
    MIN_VISIBILITY NUMBER(10,2),
    MAX_WIND_SPEED NUMBER(5,2),
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT UK_DAILY_STAT UNIQUE (REPORT_DATE, COUNTRY_CODE)
);

CREATE SEQUENCE DAILY_STATISTICS_SEQ START WITH 1 INCREMENT BY 1;
```

---

## 🔌 إنشاء Oracle APEX REST API

### الخطوة 1: تفعيل RESTful Services في APEX

1. افتح **SQL Workshop** في APEX
2. اذهب إلى **RESTful Services**
3. اضغط **Create Module**

### الخطوة 2: إنشاء REST Module

```
Module Name: metar_api
Base Path: /metar/
```

### الخطوة 3: إنشاء Resource Templates

#### 📥 Template 1: إدراج تقارير METAR

**Resource Template:** `reports/`
**Method:** POST

**PL/SQL Handler:**

```sql
DECLARE
    v_report_id NUMBER;
    v_weather_codes VARCHAR2(100);
    v_phenomenon VARCHAR2(10);
BEGIN
    -- Parse JSON من الطلب
    apex_json.parse(:body);
    
    -- إدراج التقرير الرئيسي
    INSERT INTO METAR_REPORTS (
        REPORT_ID,
        STATION_CODE,
        OBSERVATION_TIME,
        LATITUDE,
        LONGITUDE,
        TEMPERATURE,
        DEW_POINT,
        WIND_DIRECTION,
        WIND_SPEED,
        VISIBILITY,
        PRESSURE,
        WEATHER_CODES,
        RAW_METAR,
        NETWORK,
        COUNTRY_CODE
    ) VALUES (
        METAR_REPORTS_SEQ.NEXTVAL,
        apex_json.get_varchar2('station'),
        TO_TIMESTAMP(apex_json.get_varchar2('valid'), 'YYYY-MM-DD HH24:MI'),
        apex_json.get_number('lat'),
        apex_json.get_number('lon'),
        apex_json.get_number('tmpf'),
        apex_json.get_number('dwpf'),
        apex_json.get_number('drct'),
        apex_json.get_number('sknt'),
        apex_json.get_number('vsby'),
        apex_json.get_number('mslp'),
        apex_json.get_varchar2('wxcodes'),
        apex_json.get_varchar2('metar'),
        apex_json.get_varchar2('network'),
        SUBSTR(apex_json.get_varchar2('station'), 1, 2)
    ) RETURNING REPORT_ID INTO v_report_id;
    
    -- معالجة الظواهر الغبارية
    v_weather_codes := apex_json.get_varchar2('wxcodes');
    
    IF v_weather_codes IS NOT NULL THEN
        -- BLDU - Blowing Dust
        IF INSTR(v_weather_codes, 'BLDU') > 0 THEN
            INSERT INTO DUST_PHENOMENA (PHENOMENON_ID, REPORT_ID, PHENOMENON_TYPE, SEVERITY)
            VALUES (DUST_PHENOMENA_SEQ.NEXTVAL, v_report_id, 'BLDU', 
                    CASE WHEN apex_json.get_number('vsby') < 1000 THEN 'SEVERE'
                         WHEN apex_json.get_number('vsby') < 3000 THEN 'MODERATE'
                         ELSE 'LIGHT' END);
        END IF;
        
        -- DU - Dust
        IF INSTR(v_weather_codes, 'DU') > 0 AND INSTR(v_weather_codes, 'BLDU') = 0 THEN
            INSERT INTO DUST_PHENOMENA (PHENOMENON_ID, REPORT_ID, PHENOMENON_TYPE, SEVERITY)
            VALUES (DUST_PHENOMENA_SEQ.NEXTVAL, v_report_id, 'DU', 'MODERATE');
        END IF;
        
        -- DS - Duststorm
        IF INSTR(v_weather_codes, 'DS') > 0 THEN
            INSERT INTO DUST_PHENOMENA (PHENOMENON_ID, REPORT_ID, PHENOMENON_TYPE, SEVERITY)
            VALUES (DUST_PHENOMENA_SEQ.NEXTVAL, v_report_id, 'DS', 'SEVERE');
        END IF;
        
        -- SS - Sandstorm
        IF INSTR(v_weather_codes, 'SS') > 0 THEN
            INSERT INTO DUST_PHENOMENA (PHENOMENON_ID, REPORT_ID, PHENOMENON_TYPE, SEVERITY)
            VALUES (DUST_PHENOMENA_SEQ.NEXTVAL, v_report_id, 'SS', 'SEVERE');
        END IF;
        
        -- SA - Sand
        IF INSTR(v_weather_codes, 'SA') > 0 AND INSTR(v_weather_codes, 'BLSA') = 0 THEN
            INSERT INTO DUST_PHENOMENA (PHENOMENON_ID, REPORT_ID, PHENOMENON_TYPE, SEVERITY)
            VALUES (DUST_PHENOMENA_SEQ.NEXTVAL, v_report_id, 'SA', 'MODERATE');
        END IF;
        
        -- BLSA - Blowing Sand
        IF INSTR(v_weather_codes, 'BLSA') > 0 THEN
            INSERT INTO DUST_PHENOMENA (PHENOMENON_ID, REPORT_ID, PHENOMENON_TYPE, SEVERITY)
            VALUES (DUST_PHENOMENA_SEQ.NEXTVAL, v_report_id, 'BLSA', 'SEVERE');
        END IF;
        
        -- PO - Dust Whirls
        IF INSTR(v_weather_codes, 'PO') > 0 THEN
            INSERT INTO DUST_PHENOMENA (PHENOMENON_ID, REPORT_ID, PHENOMENON_TYPE, SEVERITY)
            VALUES (DUST_PHENOMENA_SEQ.NEXTVAL, v_report_id, 'PO', 'LIGHT');
        END IF;
    END IF;
    
    COMMIT;
    
    -- إرجاع الرد
    :status := 201;
    apex_json.open_object;
    apex_json.write('success', true);
    apex_json.write('report_id', v_report_id);
    apex_json.write('message', 'Report inserted successfully');
    apex_json.close_object;
    
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK;
        :status := 409;
        apex_json.open_object;
        apex_json.write('success', false);
        apex_json.write('error', 'Duplicate report - already exists');
        apex_json.close_object;
    WHEN OTHERS THEN
        ROLLBACK;
        :status := 500;
        apex_json.open_object;
        apex_json.write('success', false);
        apex_json.write('error', SQLERRM);
        apex_json.close_object;
END;
```

#### 📊 Template 2: جلب الإحصائيات

**Resource Template:** `statistics/:date`
**Method:** GET

**PL/SQL Handler:**

```sql
BEGIN
    FOR rec IN (
        SELECT 
            COUNTRY_CODE,
            COUNTRY_NAME,
            TOTAL_REPORTS,
            BLDU_COUNT,
            BLSA_COUNT,
            DU_COUNT,
            SA_COUNT,
            DS_COUNT,
            SS_COUNT,
            PO_COUNT
        FROM DAILY_STATISTICS
        WHERE REPORT_DATE = TO_DATE(:date, 'YYYY-MM-DD')
        ORDER BY TOTAL_REPORTS DESC
    ) LOOP
        apex_json.open_object;
        apex_json.write('country_code', rec.COUNTRY_CODE);
        apex_json.write('country_name', rec.COUNTRY_NAME);
        apex_json.write('total_reports', rec.TOTAL_REPORTS);
        apex_json.write('bldu', rec.BLDU_COUNT);
        apex_json.write('blsa', rec.BLSA_COUNT);
        apex_json.write('du', rec.DU_COUNT);
        apex_json.write('sa', rec.SA_COUNT);
        apex_json.write('ds', rec.DS_COUNT);
        apex_json.write('ss', rec.SS_COUNT);
        apex_json.write('po', rec.PO_COUNT);
        apex_json.close_object;
    END LOOP;
END;
```

#### 📋 Template 3: جلب تقارير محطة معينة

**Resource Template:** `reports/:station/:date`
**Method:** GET

**PL/SQL Handler:**

```sql
BEGIN
    apex_json.open_array;
    
    FOR rec IN (
        SELECT 
            mr.REPORT_ID,
            mr.STATION_CODE,
            mr.OBSERVATION_TIME,
            mr.TEMPERATURE,
            mr.DEW_POINT,
            mr.WIND_DIRECTION,
            mr.WIND_SPEED,
            mr.VISIBILITY,
            mr.WEATHER_CODES,
            mr.RAW_METAR,
            LISTAGG(dp.PHENOMENON_TYPE, ',') WITHIN GROUP (ORDER BY dp.PHENOMENON_TYPE) AS PHENOMENA
        FROM METAR_REPORTS mr
        LEFT JOIN DUST_PHENOMENA dp ON mr.REPORT_ID = dp.REPORT_ID
        WHERE mr.STATION_CODE = :station
        AND TRUNC(mr.OBSERVATION_TIME) = TO_DATE(:date, 'YYYY-MM-DD')
        GROUP BY mr.REPORT_ID, mr.STATION_CODE, mr.OBSERVATION_TIME, 
                 mr.TEMPERATURE, mr.DEW_POINT, mr.WIND_DIRECTION, 
                 mr.WIND_SPEED, mr.VISIBILITY, mr.WEATHER_CODES, mr.RAW_METAR
        ORDER BY mr.OBSERVATION_TIME DESC
    ) LOOP
        apex_json.open_object;
        apex_json.write('report_id', rec.REPORT_ID);
        apex_json.write('station', rec.STATION_CODE);
        apex_json.write('time', TO_CHAR(rec.OBSERVATION_TIME, 'YYYY-MM-DD HH24:MI'));
        apex_json.write('temperature', rec.TEMPERATURE);
        apex_json.write('dew_point', rec.DEW_POINT);
        apex_json.write('wind_direction', rec.WIND_DIRECTION);
        apex_json.write('wind_speed', rec.WIND_SPEED);
        apex_json.write('visibility', rec.VISIBILITY);
        apex_json.write('weather_codes', rec.WEATHER_CODES);
        apex_json.write('metar', rec.RAW_METAR);
        apex_json.write('phenomena', rec.PHENOMENA);
        apex_json.close_object;
    END LOOP;
    
    apex_json.close_array;
END;
```

---

## 🔐 تأمين Oracle APEX REST API

### الخطوة 1: إنشاء OAuth Client

```sql
BEGIN
    OAUTH.CREATE_CLIENT(
        p_name            => 'METAR_CLIENT',
        p_grant_type      => 'client_credentials',
        p_owner           => 'METAR System',
        p_description     => 'OAuth client for METAR integration',
        p_support_email   => 'your-email@ncm.gov.sa',
        p_privilege_names => 'METAR_PRIV'
    );
END;
```

### الخطوة 2: حفظ Client Credentials

بعد التنفيذ، سيعطيك APEX:
- `Client ID`
- `Client Secret`

**احفظ هذه البيانات بشكل آمن!**

---

## 💻 تعديل كود النظام لإرسال البيانات

سأنشئ لك API جديد في نظام METAR لإرسال البيانات تلقائياً!

### الملف: `src/oracle-api.ts`

انظر الملف التالي...

---

## 📝 ملخص الخطوات

1. ✅ إنشاء الجداول في Oracle
2. ✅ إنشاء REST API في APEX
3. ✅ تأمين API بـ OAuth
4. ✅ تعديل كود النظام
5. ✅ اختبار التكامل
6. ✅ النشر

---

**التكلفة:** مجانية تماماً إذا كنت تستخدم Oracle APEX Free Tier!
