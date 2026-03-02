# الحل المختصر - جلب تلقائي لـ Oracle APEX
# Short Solution - Auto Fetch for Oracle APEX

## 🎯 ما تحتاجينه فقط (10 دقائق):

### 1. الجدول (نسخ ولصق في SQL Commands):

```sql
CREATE TABLE METAR_DATA (
    ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    STATION VARCHAR2(10),
    VALID_TIME TIMESTAMP,
    TEMPERATURE NUMBER,
    WIND_SPEED NUMBER,
    VISIBILITY NUMBER,
    WEATHER VARCHAR2(200),
    FETCH_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 2. الـ Procedure (نسخ ولصق):

```sql
CREATE OR REPLACE PROCEDURE FETCH_METAR AS
    l_url VARCHAR2(4000);
    l_csv CLOB;
BEGIN
    -- رابط IEM API
    l_url := 'https://mesonet.agron.iastate.edu/cgi-bin/request/asos.py' ||
             '?network=SA__ASOS' ||
             '&data=all' ||
             '&year1=' || TO_CHAR(SYSDATE-1, 'YYYY') ||
             '&month1=' || TO_CHAR(SYSDATE-1, 'MM') ||
             '&day1=' || TO_CHAR(SYSDATE-1, 'DD') ||
             '&year2=' || TO_CHAR(SYSDATE, 'YYYY') ||
             '&month2=' || TO_CHAR(SYSDATE, 'MM') ||
             '&day2=' || TO_CHAR(SYSDATE, 'DD') ||
             '&tz=Etc/UTC&format=onlycomma&latlon=yes&direct=yes';
    
    -- جلب البيانات
    l_csv := APEX_WEB_SERVICE.MAKE_REST_REQUEST(
        p_url => l_url,
        p_http_method => 'GET'
    );
    
    -- حفظ البيانات (parsing بسيط)
    FOR rec IN (
        SELECT 
            REGEXP_SUBSTR(line, '[^,]+', 1, 1) as station,
            REGEXP_SUBSTR(line, '[^,]+', 1, 2) as valid,
            REGEXP_SUBSTR(line, '[^,]+', 1, 7) as sknt,
            REGEXP_SUBSTR(line, '[^,]+', 1, 11) as vsby,
            REGEXP_SUBSTR(line, '[^,]+', 1, 24) as wx
        FROM (
            SELECT REGEXP_SUBSTR(l_csv, '[^'||CHR(10)||']+', 1, LEVEL) line
            FROM dual
            CONNECT BY LEVEL <= 1000
        )
        WHERE line NOT LIKE 'station,%'
        AND line IS NOT NULL
    ) LOOP
        INSERT INTO METAR_DATA (STATION, VALID_TIME, WIND_SPEED, VISIBILITY, WEATHER)
        VALUES (rec.station, TO_TIMESTAMP(rec.valid,'YYYY-MM-DD HH24:MI'), 
                TO_NUMBER(rec.sknt), TO_NUMBER(rec.vsby), rec.wx);
    END LOOP;
    COMMIT;
END;
/
```

---

### 3. اختبار (شغليه يدوياً):

```sql
BEGIN
    FETCH_METAR;
END;
/

-- شوفي البيانات
SELECT * FROM METAR_DATA ORDER BY FETCH_DATE DESC;
```

---

### 4. تشغيل تلقائي (كل 6 ساعات):

```sql
BEGIN
    DBMS_SCHEDULER.CREATE_JOB (
        job_name => 'AUTO_FETCH_METAR',
        job_type => 'PLSQL_BLOCK',
        job_action => 'BEGIN FETCH_METAR; END;',
        start_date => SYSTIMESTAMP,
        repeat_interval => 'FREQ=HOURLY; INTERVAL=6',
        enabled => TRUE
    );
END;
/
```

---

### 5. في APEX - أنشئي Interactive Report:

1. App Builder → Create Page
2. اختاري Interactive Report
3. Table/View: **METAR_DATA**
4. Run!

✅ **خلاص! البيانات تنجلب تلقائياً كل 6 ساعات**

---

## 🔍 التحقق:

```sql
-- شوفي الـ Job شغال؟
SELECT job_name, enabled, last_start_date, next_run_date
FROM USER_SCHEDULER_JOBS
WHERE job_name = 'AUTO_FETCH_METAR';

-- كم سطر موجود؟
SELECT COUNT(*) FROM METAR_DATA;

-- آخر تحديث؟
SELECT MAX(FETCH_DATE) FROM METAR_DATA;
```

---

## ⚠️ إذا ما اشتغل:

### مشكلة: "ORA-24247: network access denied"
```sql
-- الحل:
BEGIN
    DBMS_NETWORK_ACL_ADMIN.APPEND_HOST_ACE(
        host => 'mesonet.agron.iastate.edu',
        ace => xs$ace_type(
            privilege_list => xs$name_list('http'),
            principal_name => 'YOUR_SCHEMA_NAME',
            principal_type => xs_acl.ptype_db
        )
    );
END;
/
```

---

## ✅ النتيجة:

- البيانات تنجلب من IEM تلقائياً
- تنحفظ في Oracle APEX
- تشوفينها في واجهتك
- كل 6 ساعات تتحدث

**خلاص! 🎉**
