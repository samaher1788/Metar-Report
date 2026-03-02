# ربط نظام التقارير مع Oracle APEX Database
# Integration with Oracle APEX Database

## نظرة عامة:

سنربط نظام التقارير مع قاعدة بيانات Oracle APEX لحفظ:
- بيانات METAR الخام
- التقارير المُحللة
- الإحصائيات اليومية
- سجل العمليات

---

## المتطلبات:

### من Oracle APEX:
1. **REST API Endpoint** (ORDS)
2. **Database Credentials**
3. **Table Structure**

### من التطبيق:
1. **Oracle Client** (node-oracledb أو REST API)
2. **Cron Job** للتشغيل التلقائي
3. **Error Handling**

---

## 📊 بنية قاعدة البيانات المقترحة:

### 1. جدول METAR_RAW_DATA
```sql
CREATE TABLE METAR_RAW_DATA (
    ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    STATION_CODE VARCHAR2(10) NOT NULL,
    VALID_TIME TIMESTAMP NOT NULL,
    RAW_METAR CLOB,
    TEMPERATURE NUMBER(5,1),
    DEWPOINT NUMBER(5,1),
    WIND_DIRECTION NUMBER(3),
    WIND_SPEED NUMBER(5,1),
    VISIBILITY NUMBER(10,2),
    PRESENT_WEATHER VARCHAR2(100),
    LATITUDE NUMBER(10,6),
    LONGITUDE NUMBER(10,6),
    COUNTRY_CODE VARCHAR2(5),
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT UK_METAR_STATION_TIME UNIQUE (STATION_CODE, VALID_TIME)
);

-- Indexes
CREATE INDEX IDX_METAR_STATION ON METAR_RAW_DATA(STATION_CODE);
CREATE INDEX IDX_METAR_TIME ON METAR_RAW_DATA(VALID_TIME);
CREATE INDEX IDX_METAR_WEATHER ON METAR_RAW_DATA(PRESENT_WEATHER);
```

### 2. جدول DUST_EVENTS
```sql
CREATE TABLE DUST_EVENTS (
    ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    EVENT_DATE DATE NOT NULL,
    STATION_CODE VARCHAR2(10) NOT NULL,
    COUNTRY_CODE VARCHAR2(5),
    EVENT_TYPE VARCHAR2(20), -- BLDU, DU, DS, SS
    EVENT_SEVERITY VARCHAR2(20), -- NORMAL, SEVERE
    VISIBILITY_MIN NUMBER(10,2),
    WIND_SPEED_MAX NUMBER(5,1),
    DURATION_MINUTES NUMBER(10),
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IDX_DUST_DATE ON DUST_EVENTS(EVENT_DATE);
CREATE INDEX IDX_DUST_STATION ON DUST_EVENTS(STATION_CODE);
CREATE INDEX IDX_DUST_TYPE ON DUST_EVENTS(EVENT_TYPE);
```

### 3. جدول DAILY_STATISTICS
```sql
CREATE TABLE DAILY_STATISTICS (
    ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    REPORT_DATE DATE NOT NULL,
    NETWORK_CODE VARCHAR2(20),
    TOTAL_REPORTS NUMBER(10),
    DUST_REPORTS NUMBER(10),
    BLOWING_DUST NUMBER(10),
    SUSPENDED_DUST NUMBER(10),
    DUST_STORMS NUMBER(10),
    SANDSTORMS NUMBER(10),
    COUNTRIES_AFFECTED NUMBER(5),
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT UK_DAILY_STATS UNIQUE (REPORT_DATE, NETWORK_CODE)
);
```

### 4. جدول STATION_INFO
```sql
CREATE TABLE STATION_INFO (
    ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    STATION_CODE VARCHAR2(10) UNIQUE NOT NULL,
    STATION_NAME VARCHAR2(100),
    COUNTRY_CODE VARCHAR2(5),
    COUNTRY_NAME VARCHAR2(50),
    LATITUDE NUMBER(10,6),
    LONGITUDE NUMBER(10,6),
    ELEVATION NUMBER(10,2),
    NETWORK_CODE VARCHAR2(20),
    IS_ACTIVE NUMBER(1) DEFAULT 1,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔌 الطريقة 1: استخدام Oracle REST API (ORDS)

### خطوات الإعداد في Oracle APEX:

#### 1. تفعيل REST API:

في Oracle APEX SQL Workshop:

```sql
-- Enable REST for tables
BEGIN
    ORDS.ENABLE_SCHEMA(
        p_enabled             => TRUE,
        p_schema              => 'YOUR_SCHEMA_NAME',
        p_url_mapping_type    => 'BASE_PATH',
        p_url_mapping_pattern => 'api',
        p_auto_rest_auth      => FALSE
    );
    
    -- Enable REST for METAR_RAW_DATA table
    ORDS.ENABLE_OBJECT(
        p_enabled      => TRUE,
        p_schema       => 'YOUR_SCHEMA_NAME',
        p_object       => 'METAR_RAW_DATA',
        p_object_type  => 'TABLE',
        p_object_alias => 'metar_data',
        p_auto_rest_auth => FALSE
    );
    
    COMMIT;
END;
/
```

#### 2. إنشاء REST Endpoint للإدراج:

```sql
-- Create REST handler for bulk insert
BEGIN
    ORDS.DEFINE_MODULE(
        p_module_name    => 'dust_reports',
        p_base_path      => '/dust/',
        p_items_per_page => 25
    );

    ORDS.DEFINE_TEMPLATE(
        p_module_name    => 'dust_reports',
        p_pattern        => 'metar/batch'
    );

    ORDS.DEFINE_HANDLER(
        p_module_name    => 'dust_reports',
        p_pattern        => 'metar/batch',
        p_method         => 'POST',
        p_source_type    => ORDS.source_type_plsql,
        p_source         => 
'DECLARE
    v_data CLOB := :body_text;
BEGIN
    -- Parse JSON and insert
    FOR rec IN (
        SELECT 
            jt.station,
            TO_TIMESTAMP(jt.valid, ''YYYY-MM-DD HH24:MI'') as valid_time,
            jt.tmpf,
            jt.dwpf,
            jt.drct,
            jt.sknt,
            jt.vsby,
            jt.wxcodes,
            jt.lat,
            jt.lon
        FROM JSON_TABLE(
            v_data, ''$.data[*]''
            COLUMNS (
                station VARCHAR2(10) PATH ''$.station'',
                valid VARCHAR2(30) PATH ''$.valid'',
                tmpf NUMBER PATH ''$.tmpf'',
                dwpf NUMBER PATH ''$.dwpf'',
                drct NUMBER PATH ''$.drct'',
                sknt NUMBER PATH ''$.sknt'',
                vsby NUMBER PATH ''$.vsby'',
                wxcodes VARCHAR2(100) PATH ''$.wxcodes'',
                lat NUMBER PATH ''$.lat'',
                lon NUMBER PATH ''$.lon''
            )
        ) jt
    ) LOOP
        INSERT INTO METAR_RAW_DATA (
            STATION_CODE, VALID_TIME, TEMPERATURE, DEWPOINT,
            WIND_DIRECTION, WIND_SPEED, VISIBILITY, 
            PRESENT_WEATHER, LATITUDE, LONGITUDE
        ) VALUES (
            rec.station, rec.valid_time, rec.tmpf, rec.dwpf,
            rec.drct, rec.sknt, rec.vsby,
            rec.wxcodes, rec.lat, rec.lon
        );
    END LOOP;
    
    COMMIT;
    
    :status := 201;
    :message := ''Data inserted successfully'';
END;'
    );
    
    COMMIT;
END;
/
```

---

## 💻 كود JavaScript للربط:

### ملف: src/services/oracle-apex.ts

```typescript
// Oracle APEX Database Service
export class OracleApexService {
    private baseUrl: string;
    private apiKey: string;
    
    constructor(baseUrl: string, apiKey?: string) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey || '';
    }
    
    /**
     * حفظ بيانات METAR
     */
    async saveMetarData(reports: any[]): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/dust/metar/batch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
                },
                body: JSON.stringify({ data: reports })
            });
            
            if (!response.ok) {
                throw new Error(`Oracle APEX Error: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error saving to Oracle APEX:', error);
            throw error;
        }
    }
    
    /**
     * حفظ أحداث الغبار
     */
    async saveDustEvents(events: any[]): Promise<any> {
        const response = await fetch(`${this.baseUrl}/dust/events/batch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
            },
            body: JSON.stringify({ events })
        });
        
        return await response.json();
    }
    
    /**
     * حفظ الإحصائيات اليومية
     */
    async saveDailyStatistics(stats: any): Promise<any> {
        const response = await fetch(`${this.baseUrl}/dust/statistics`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
            },
            body: JSON.stringify(stats)
        });
        
        return await response.json();
    }
}
```

---

## 🔄 إضافة الحفظ التلقائي في Backend:

### تعديل src/index.tsx:

```typescript
import { OracleApexService } from './services/oracle-apex'

// Initialize Oracle APEX service
const oracleService = new OracleApexService(
    Deno.env.get('ORACLE_APEX_URL') || 'https://apex.oracle.com/pls/apex/your_workspace',
    Deno.env.get('ORACLE_APEX_KEY')
);

// Modify existing analyze endpoint
app.post('/api/analyze-dust', async (c) => {
  try {
    const { csvData } = await c.req.json()
    
    const rows = parseCSV(csvData)
    const dustReports = filterDustReports(rows)
    const analysis = analyzeDustData(dustReports)

    // حفظ في Oracle APEX تلقائياً
    try {
        await oracleService.saveMetarData(dustReports);
        await oracleService.saveDailyStatistics(analysis);
        console.log('✅ Data saved to Oracle APEX');
    } catch (oracleError) {
        console.error('⚠️ Failed to save to Oracle APEX:', oracleError);
        // لا نوقف العملية إذا فشل الحفظ
    }

    return c.json({
      success: true,
      analysis: analysis,
      total_reports: rows.length,
      dust_reports: dustReports.length,
      saved_to_db: true
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})
```

---

## ⏰ جدولة تلقائية (Cron Job):

### خيار 1: استخدام Cloudflare Workers Cron Triggers

في wrangler.toml:

```toml
[triggers]
crons = ["0 */6 * * *"]  # كل 6 ساعات
```

### خيار 2: استخدام GitHub Actions

```yaml
# .github/workflows/fetch-metar-data.yml
name: Fetch METAR Data Daily

on:
  schedule:
    - cron: '0 0,6,12,18 * * *'  # كل 6 ساعات
  workflow_dispatch:  # يدوي أيضاً

jobs:
  fetch-and-save:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Fetch METAR Data
        run: |
          curl -X POST "https://your-app.pages.dev/api/fetch-and-save" \
            -H "Authorization: Bearer ${{ secrets.API_KEY }}"
```

---

## 🔐 متغيرات البيئة:

في Cloudflare Pages، أضف:

```
ORACLE_APEX_URL=https://apex.oracle.com/pls/apex/your_workspace/api
ORACLE_APEX_KEY=your_api_key_here
```

---

## 📝 ملخص الخطوات:

1. ✅ إنشاء الجداول في Oracle APEX
2. ✅ تفعيل REST API (ORDS)
3. ✅ إنشاء Endpoints للإدراج
4. ✅ إضافة كود الربط في التطبيق
5. ✅ إعداد المتغيرات البيئية
6. ✅ جدولة التشغيل التلقائي

---

**هل لديك حساب Oracle APEX جاهز؟ سأساعدك في الإعداد خطوة بخطوة!**
