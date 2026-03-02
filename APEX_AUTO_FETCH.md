# جلب البيانات تلقائياً إلى Oracle APEX
# Automatic Data Fetching to Oracle APEX

## الطريقة 1: استخدام APEX_WEB_SERVICE (داخل APEX نفسه)

### الخطوة 1: إنشاء الجدول

في SQL Workshop → SQL Commands:

```sql
-- جدول بيانات METAR
CREATE TABLE METAR_DATA (
    ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    STATION VARCHAR2(10),
    VALID_TIME TIMESTAMP,
    TEMPERATURE NUMBER(5,1),
    DEWPOINT NUMBER(5,1),
    WIND_DIRECTION NUMBER(3),
    WIND_SPEED NUMBER(5,1),
    VISIBILITY NUMBER(10,2),
    WEATHER_CODES VARCHAR2(200),
    LATITUDE NUMBER(10,6),
    LONGITUDE NUMBER(10,6),
    COUNTRY VARCHAR2(50),
    FETCH_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IDX_METAR_STATION ON METAR_DATA(STATION);
CREATE INDEX IDX_METAR_TIME ON METAR_DATA(VALID_TIME);
CREATE INDEX IDX_METAR_FETCH ON METAR_DATA(FETCH_DATE);
```

---

### الخطوة 2: إنشاء Procedure لجلب البيانات

```sql
CREATE OR REPLACE PROCEDURE FETCH_METAR_DATA (
    p_network IN VARCHAR2 DEFAULT 'SA__ASOS',
    p_start_date IN VARCHAR2 DEFAULT NULL,
    p_end_date IN VARCHAR2 DEFAULT NULL
) AS
    l_url VARCHAR2(4000);
    l_response CLOB;
    l_start_date VARCHAR2(10);
    l_end_date VARCHAR2(10);
    l_year1 VARCHAR2(4);
    l_month1 VARCHAR2(2);
    l_day1 VARCHAR2(2);
    l_year2 VARCHAR2(4);
    l_month2 VARCHAR2(2);
    l_day2 VARCHAR2(2);
BEGIN
    -- تحديد التواريخ (أمس واليوم إذا لم تُحدد)
    l_start_date := NVL(p_start_date, TO_CHAR(SYSDATE - 1, 'YYYY-MM-DD'));
    l_end_date := NVL(p_end_date, TO_CHAR(SYSDATE, 'YYYY-MM-DD'));
    
    -- تقسيم التاريخ
    l_year1 := SUBSTR(l_start_date, 1, 4);
    l_month1 := SUBSTR(l_start_date, 6, 2);
    l_day1 := SUBSTR(l_start_date, 9, 2);
    
    l_year2 := SUBSTR(l_end_date, 1, 4);
    l_month2 := SUBSTR(l_end_date, 6, 2);
    l_day2 := SUBSTR(l_end_date, 9, 2);
    
    -- بناء URL
    l_url := 'https://mesonet.agron.iastate.edu/cgi-bin/request/asos.py' ||
             '?network=' || p_network ||
             '&data=all' ||
             '&year1=' || l_year1 ||
             '&month1=' || l_month1 ||
             '&day1=' || l_day1 ||
             '&year2=' || l_year2 ||
             '&month2=' || l_month2 ||
             '&day2=' || l_day2 ||
             '&tz=Etc/UTC' ||
             '&format=onlycomma' ||
             '&latlon=yes' ||
             '&missing=M' ||
             '&trace=T' ||
             '&direct=yes' ||
             '&report_type=3';
    
    -- جلب البيانات
    l_response := APEX_WEB_SERVICE.MAKE_REST_REQUEST(
        p_url => l_url,
        p_http_method => 'GET'
    );
    
    -- حفظ البيانات من CSV
    FOR rec IN (
        SELECT 
            REGEXP_SUBSTR(line, '[^,]+', 1, 1) as station,
            REGEXP_SUBSTR(line, '[^,]+', 1, 2) as valid,
            TO_NUMBER(REGEXP_SUBSTR(line, '[^,]+', 1, 3)) as tmpf,
            TO_NUMBER(REGEXP_SUBSTR(line, '[^,]+', 1, 4)) as dwpf,
            TO_NUMBER(REGEXP_SUBSTR(line, '[^,]+', 1, 6)) as drct,
            TO_NUMBER(REGEXP_SUBSTR(line, '[^,]+', 1, 7)) as sknt,
            TO_NUMBER(REGEXP_SUBSTR(line, '[^,]+', 1, 11)) as vsby,
            REGEXP_SUBSTR(line, '[^,]+', 1, 24) as wxcodes,
            TO_NUMBER(REGEXP_SUBSTR(line, '[^,]+', 1, 33)) as lat,
            TO_NUMBER(REGEXP_SUBSTR(line, '[^,]+', 1, 34)) as lon
        FROM (
            SELECT REGEXP_SUBSTR(l_response, '[^' || CHR(10) || ']+', 1, LEVEL) as line
            FROM dual
            CONNECT BY LEVEL <= REGEXP_COUNT(l_response, CHR(10)) + 1
        )
        WHERE line IS NOT NULL
        AND line NOT LIKE 'station,valid%'  -- تخطي السطر الأول (Header)
    ) LOOP
        BEGIN
            INSERT INTO METAR_DATA (
                STATION, VALID_TIME, TEMPERATURE, DEWPOINT,
                WIND_DIRECTION, WIND_SPEED, VISIBILITY,
                WEATHER_CODES, LATITUDE, LONGITUDE
            ) VALUES (
                rec.station,
                TO_TIMESTAMP(rec.valid, 'YYYY-MM-DD HH24:MI'),
                rec.tmpf,
                rec.dwpf,
                rec.drct,
                rec.sknt,
                rec.vsby,
                rec.wxcodes,
                rec.lat,
                rec.lon
            );
        EXCEPTION
            WHEN OTHERS THEN
                -- تخطي الأسطر الخاطئة
                NULL;
        END;
    END LOOP;
    
    COMMIT;
    
    DBMS_OUTPUT.PUT_LINE('تم جلب البيانات بنجاح');
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('خطأ: ' || SQLERRM);
        ROLLBACK;
END FETCH_METAR_DATA;
/
```

---

### الخطوة 3: جدولة تلقائية (كل 6 ساعات)

```sql
-- إنشاء Job للتشغيل التلقائي
BEGIN
    DBMS_SCHEDULER.CREATE_JOB (
        job_name        => 'FETCH_METAR_JOB',
        job_type        => 'PLSQL_BLOCK',
        job_action      => 'BEGIN FETCH_METAR_DATA(''SA__ASOS''); END;',
        start_date      => SYSTIMESTAMP,
        repeat_interval => 'FREQ=HOURLY; INTERVAL=6',  -- كل 6 ساعات
        enabled         => TRUE,
        comments        => 'جلب بيانات METAR كل 6 ساعات'
    );
END;
/
```

---

### الخطوة 4: اختبار يدوي

```sql
-- تشغيل يدوي للاختبار
BEGIN
    FETCH_METAR_DATA(
        p_network => 'SA__ASOS',
        p_start_date => '2026-02-25',
        p_end_date => '2026-02-26'
    );
END;
/

-- التحقق من البيانات
SELECT COUNT(*) as total_records FROM METAR_DATA;
SELECT * FROM METAR_DATA WHERE ROWNUM <= 10;
```

---

### الخطوة 5: إنشاء Interactive Report في APEX

1. **أنشئ صفحة جديدة:**
   - App Builder → Create Page
   - Interactive Report
   - اختر METAR_DATA

2. **أضف Filters:**
   - STATION
   - VALID_TIME (Date Range)
   - WEATHER_CODES (Contains)

3. **أضف زر "جلب بيانات جديدة":**
   - Create Button
   - في Button Action:
   ```sql
   BEGIN
       FETCH_METAR_DATA('SA__ASOS');
   END;
   ```

---

### الخطوة 6: إنشاء Dashboard

```sql
-- View للإحصائيات
CREATE OR REPLACE VIEW METAR_STATISTICS AS
SELECT 
    TRUNC(VALID_TIME) as REPORT_DATE,
    COUNT(*) as TOTAL_REPORTS,
    SUM(CASE WHEN WEATHER_CODES LIKE '%BLDU%' THEN 1 ELSE 0 END) as BLOWING_DUST,
    SUM(CASE WHEN WEATHER_CODES LIKE '%DU%' AND WEATHER_CODES NOT LIKE '%BLDU%' THEN 1 ELSE 0 END) as SUSPENDED_DUST,
    SUM(CASE WHEN WEATHER_CODES LIKE '%DS%' THEN 1 ELSE 0 END) as DUST_STORM,
    SUM(CASE WHEN WEATHER_CODES LIKE '%SS%' THEN 1 ELSE 0 END) as SAND_STORM,
    COUNT(DISTINCT STATION) as STATIONS_COUNT
FROM METAR_DATA
GROUP BY TRUNC(VALID_TIME)
ORDER BY REPORT_DATE DESC;
```

في APEX:
- Create Page → Dashboard
- أضف Chart (Bar/Line) من METAR_STATISTICS
- أضف Cards للأرقام الرئيسية

---

## 📊 إضافة جدول للدول

```sql
-- جدول الدول (لربطها بالمحطات)
CREATE TABLE NETWORK_COUNTRIES (
    NETWORK_CODE VARCHAR2(20) PRIMARY KEY,
    COUNTRY_NAME VARCHAR2(50),
    COUNTRY_NAME_AR VARCHAR2(50)
);

INSERT INTO NETWORK_COUNTRIES VALUES ('SA__ASOS', 'Saudi Arabia', 'السعودية');
INSERT INTO NETWORK_COUNTRIES VALUES ('AE__ASOS', 'United Arab Emirates', 'الإمارات');
INSERT INTO NETWORK_COUNTRIES VALUES ('KW__ASOS', 'Kuwait', 'الكويت');
INSERT INTO NETWORK_COUNTRIES VALUES ('JO__ASOS', 'Jordan', 'الأردن');
INSERT INTO NETWORK_COUNTRIES VALUES ('OM__ASOS', 'Oman', 'عمان');
INSERT INTO NETWORK_COUNTRIES VALUES ('BH__ASOS', 'Bahrain', 'البحرين');
INSERT INTO NETWORK_COUNTRIES VALUES ('QA__ASOS', 'Qatar', 'قطر');
COMMIT;

-- Procedure لجلب بيانات كل الدول
CREATE OR REPLACE PROCEDURE FETCH_ALL_COUNTRIES AS
BEGIN
    FOR country IN (SELECT NETWORK_CODE FROM NETWORK_COUNTRIES) LOOP
        FETCH_METAR_DATA(country.NETWORK_CODE);
    END LOOP;
    COMMIT;
END;
/
```

---

## ⏰ التشغيل التلقائي الشامل

```sql
-- Job لجلب بيانات كل الدول
BEGIN
    DBMS_SCHEDULER.CREATE_JOB (
        job_name        => 'FETCH_ALL_METAR_JOB',
        job_type        => 'PLSQL_BLOCK',
        job_action      => 'BEGIN FETCH_ALL_COUNTRIES; END;',
        start_date      => SYSTIMESTAMP,
        repeat_interval => 'FREQ=HOURLY; INTERVAL=6',
        enabled         => TRUE
    );
END;
/

-- عرض الـ Jobs
SELECT job_name, enabled, state, run_count, last_start_date, next_run_date
FROM USER_SCHEDULER_JOBS
WHERE job_name LIKE 'FETCH%';

-- إيقاف Job
-- EXEC DBMS_SCHEDULER.DISABLE('FETCH_ALL_METAR_JOB');

-- حذف Job
-- EXEC DBMS_SCHEDULER.DROP_JOB('FETCH_ALL_METAR_JOB');
```

---

## 🎨 تحسين الواجهة

### 1. صفحة Dashboard رئيسية:

Components:
- **Today's Summary** (Cards)
- **Weekly Trend** (Chart)
- **Top 10 Stations** (Report)
- **Latest Updates** (Timeline)

### 2. صفحة البحث والفلترة:

- بحث بالمحطة
- فلترة بالتاريخ
- فلترة بنوع الظاهرة الجوية
- تصدير Excel/PDF

### 3. صفحة الإحصائيات:

- Pie Chart للتوزيع
- Map للمحطات (إذا أمكن)
- Heatmap للأيام

---

## ✅ Checklist التنفيذ:

- [ ] إنشاء جدول METAR_DATA
- [ ] إنشاء Procedure FETCH_METAR_DATA
- [ ] اختبار الجلب اليدوي
- [ ] إنشاء Job للتشغيل التلقائي
- [ ] إنشاء Interactive Report
- [ ] إنشاء Dashboard
- [ ] إضافة جدول الدول
- [ ] تفعيل الجلب لجميع الدول
- [ ] اختبار النظام 24 ساعة

---

## 📞 الدعم:

إذا واجهتِ أي مشكلة:
1. تحققي من APEX_WEB_SERVICE permissions
2. تحققي من الـ Job status
3. راجعي DBMS_OUTPUT للأخطاء

---

**الآن البيانات ستُجلب تلقائياً كل 6 ساعات وتظهر في واجهتك في APEX! ✅**
