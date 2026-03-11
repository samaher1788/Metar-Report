# 🔄 دليل الربط التلقائي مع Oracle APEX

## 📋 المحتويات
1. [هيكل النظام](#هيكل-النظام)
2. [خطوات الإعداد](#خطوات-الإعداد)
3. [الربط التلقائي](#الربط-التلقائي)
4. [الاختبار](#الاختبار)

---

## 🎯 هيكل النظام

### **تدفق البيانات:**
```
المستخدم يضغط "إنشاء التقرير"
          ↓
جلب بيانات METAR من IEM
          ↓
تحليل البيانات (Dust Analysis)
          ↓
عرض التقرير في الواجهة
          ↓
🔄 حفظ تلقائي في Oracle Database ✨
```

---

## 🔧 خطوات الإعداد

### **الخطوة 1️⃣: فهم جدول METAR_DATA**

في **Oracle APEX → SQL Workshop → SQL Commands**، شغّل:

```sql
-- عرض جميع الأعمدة
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    DATA_LENGTH,
    NULLABLE
FROM USER_TAB_COLUMNS
WHERE TABLE_NAME = 'METAR_DATA'
ORDER BY COLUMN_ID;
```

**النتيجة المتوقعة:** (مثال)
```
COLUMN_NAME          DATA_TYPE    DATA_LENGTH  NULLABLE
----------------------------------------------------------
ID                   NUMBER       22           N
STATION_CODE         VARCHAR2     10           N
OBSERVATION_TIME     TIMESTAMP    -            Y
TEMPERATURE          NUMBER       5,2          Y
WEATHER_CODES        VARCHAR2     100          Y
WIND_SPEED           NUMBER       5,2          Y
...
```

---

### **الخطوة 2️⃣: إنشاء REST API Handler**

#### **2.1 إنشاء Module:**
1. **SQL Workshop → RESTful Services**
2. **Create Module:**
   - Name: `metar_api`
   - Base Path: `/metar/`

#### **2.2 إنشاء Resource Template:**
1. اضغط على `metar_api`
2. **Create Template:**
   - URI Template: `save/`
   - Full URL: `http://193.122.89.34/ncmapp/dustws/metar/save/`

#### **2.3 إنشاء POST Handler:**

```sql
DECLARE
    v_body_text VARCHAR2(32767);
    v_station VARCHAR2(10);
    v_time VARCHAR2(50);
    v_temp NUMBER;
    v_weather VARCHAR2(100);
    v_wind_speed NUMBER;
    v_wind_dir NUMBER;
    v_visibility NUMBER;
    v_pressure NUMBER;
    v_id NUMBER;
BEGIN
    -- Parse JSON
    v_body_text := utl_raw.cast_to_varchar2(:body);
    apex_json.parse(v_body_text);
    
    -- استخراج القيم من JSON
    v_station := apex_json.get_varchar2('station');
    v_time := apex_json.get_varchar2('valid');
    v_temp := apex_json.get_number('tmpf');
    v_weather := apex_json.get_varchar2('wxcodes');
    v_wind_speed := apex_json.get_number('sknt');
    v_wind_dir := apex_json.get_number('drct');
    v_visibility := apex_json.get_number('vsby');
    v_pressure := apex_json.get_number('alti');
    
    -- إدخال البيانات في METAR_DATA
    INSERT INTO METAR_DATA (
        STATION_CODE,
        OBSERVATION_TIME,
        TEMPERATURE,
        WEATHER_CODES,
        WIND_SPEED,
        WIND_DIRECTION,
        VISIBILITY,
        PRESSURE,
        CREATED_AT
    ) VALUES (
        v_station,
        TO_TIMESTAMP(v_time, 'YYYY-MM-DD HH24:MI'),
        v_temp,
        v_weather,
        v_wind_speed,
        v_wind_dir,
        v_visibility,
        v_pressure,
        SYSTIMESTAMP
    ) RETURNING ID INTO v_id;
    
    COMMIT;
    
    -- رد نجاح
    :status := 201;
    apex_json.open_object;
    apex_json.write('success', TRUE);
    apex_json.write('id', v_id);
    apex_json.write('message', 'تم حفظ البيانات بنجاح');
    apex_json.close_object;
    
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        -- في حالة تكرار البيانات
        ROLLBACK;
        :status := 200;
        apex_json.open_object;
        apex_json.write('success', TRUE);
        apex_json.write('message', 'البيانات موجودة مسبقاً');
        apex_json.close_object;
    WHEN OTHERS THEN
        ROLLBACK;
        :status := 500;
        apex_json.open_object;
        apex_json.write('success', FALSE);
        apex_json.write('error', SQLERRM);
        apex_json.close_object;
END;
```

**ملاحظة:** قد تحتاج لتعديل أسماء الأعمدة حسب جدولك الفعلي!

---

### **الخطوة 3️⃣: إنشاء Batch Handler (حفظ متعدد)**

إنشاء Template جديد: `save-batch/`

```sql
DECLARE
    v_body_text VARCHAR2(32767);
    v_count NUMBER := 0;
    v_errors NUMBER := 0;
BEGIN
    v_body_text := utl_raw.cast_to_varchar2(:body);
    apex_json.parse(v_body_text);
    
    -- معالجة مصفوفة من السجلات
    FOR i IN 1..apex_json.get_count('records') LOOP
        BEGIN
            INSERT INTO METAR_DATA (
                STATION_CODE,
                OBSERVATION_TIME,
                TEMPERATURE,
                WEATHER_CODES,
                CREATED_AT
            ) VALUES (
                apex_json.get_varchar2('records[%d].station', i),
                TO_TIMESTAMP(apex_json.get_varchar2('records[%d].valid', i), 'YYYY-MM-DD HH24:MI'),
                apex_json.get_number('records[%d].tmpf', i),
                apex_json.get_varchar2('records[%d].wxcodes', i),
                SYSTIMESTAMP
            );
            v_count := v_count + 1;
        EXCEPTION
            WHEN DUP_VAL_ON_INDEX THEN
                NULL; -- تجاهل التكرار
            WHEN OTHERS THEN
                v_errors := v_errors + 1;
        END;
    END LOOP;
    
    COMMIT;
    
    :status := 201;
    apex_json.open_object;
    apex_json.write('success', TRUE);
    apex_json.write('saved', v_count);
    apex_json.write('errors', v_errors);
    apex_json.write('message', 'تم حفظ ' || v_count || ' سجل بنجاح');
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
```

---

## 🔗 الربط التلقائي

### **ملف: `public/static/oracle-sync.js`**

سيتم إنشاء هذا الملف تلقائياً ويحتوي على:

```javascript
// Oracle APEX API Configuration
const ORACLE_API = {
    BASE_URL: 'http://193.122.89.34/ncmapp/dustws/metar',
    ENDPOINTS: {
        SAVE_SINGLE: '/save/',
        SAVE_BATCH: '/save-batch/'
    }
};

// حفظ تقرير واحد
async function saveToOracle(record) {
    try {
        const response = await fetch(ORACLE_API.BASE_URL + ORACLE_API.ENDPOINTS.SAVE_SINGLE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record)
        });
        return await response.json();
    } catch (error) {
        console.error('❌ خطأ في الحفظ:', error);
        return { success: false, error: error.message };
    }
}

// حفظ مجموعة تقارير
async function saveBatchToOracle(records) {
    try {
        const response = await fetch(ORACLE_API.BASE_URL + ORACLE_API.ENDPOINTS.SAVE_BATCH, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ records })
        });
        return await response.json();
    } catch (error) {
        console.error('❌ خطأ في الحفظ الجماعي:', error);
        return { success: false, error: error.message };
    }
}

// Auto-sync بعد تحليل البيانات
async function autoSyncAfterAnalysis(analysis) {
    console.log('🔄 بدء الحفظ التلقائي...');
    
    const records = analysis.records.map(record => ({
        station: record.station,
        valid: record.valid,
        tmpf: record.tmpf,
        wxcodes: record.wxcodes,
        sknt: record.sknt,
        drct: record.drct,
        vsby: record.vsby,
        alti: record.alti
    }));
    
    const result = await saveBatchToOracle(records);
    
    if (result.success) {
        console.log('✅ تم حفظ', result.saved, 'سجل في Oracle');
        showSuccessNotification(`تم حفظ ${result.saved} سجل في قاعدة البيانات`);
    } else {
        console.error('❌ فشل الحفظ:', result.error);
    }
    
    return result;
}

// إشعار نجاح
function showSuccessNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 left-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
    notification.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas fa-check-circle text-xl"></i>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
```

---

## 🧪 الاختبار

### **اختبار 1: REST API مباشرة**

```bash
curl -X POST http://193.122.89.34/ncmapp/dustws/metar/save/ \
  -H "Content-Type: application/json" \
  -d '{
    "station": "OERK",
    "valid": "2026-03-10 14:00",
    "tmpf": 75.2,
    "wxcodes": "BLDU",
    "sknt": 15,
    "drct": 270,
    "vsby": 5.0,
    "alti": 29.92
  }'
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "id": 123,
  "message": "تم حفظ البيانات بنجاح"
}
```

---

### **اختبار 2: من الواجهة**

1. افتح: https://metars-report.pages.dev/
2. اختر التواريخ والشبكة
3. اضغط "إنشاء التقرير"
4. راقب Console (F12):
```
🔄 بدء الحفظ التلقائي...
✅ تم حفظ 15 سجل في Oracle
```
5. تحقق من Oracle:
```sql
SELECT COUNT(*) FROM METAR_DATA WHERE CREATED_AT > SYSDATE - 1/24;
```

---

## 📊 مراقبة البيانات

### **عرض آخر السجلات:**
```sql
SELECT 
    STATION_CODE,
    OBSERVATION_TIME,
    TEMPERATURE,
    WEATHER_CODES,
    CREATED_AT
FROM METAR_DATA
ORDER BY CREATED_AT DESC
FETCH FIRST 20 ROWS ONLY;
```

### **إحصائيات يومية:**
```sql
SELECT 
    TRUNC(CREATED_AT) AS DAY,
    COUNT(*) AS TOTAL_RECORDS,
    COUNT(DISTINCT STATION_CODE) AS UNIQUE_STATIONS
FROM METAR_DATA
GROUP BY TRUNC(CREATED_AT)
ORDER BY DAY DESC;
```

---

## 🎯 الخطوات التالية

بعد ما نخلص الإعداد:

1. ✅ **زر "حفظ في Oracle"** في الواجهة
2. ✅ **Auto-sync تلقائي** بعد كل تقرير
3. ✅ **Dashboard إحصائيات** من Oracle
4. ✅ **Export/Import** من Oracle

---

## 🆘 استكشاف الأخطاء

### **خطأ: "ORA-00001: unique constraint violated"**
- **السبب:** البيانات موجودة مسبقاً
- **الحل:** تجاهل أو استخدام `MERGE` بدلاً من `INSERT`

### **خطأ: "PLS-00306: wrong number of arguments"**
- **السبب:** خطأ في `apex_json.parse`
- **الحل:** استخدم `utl_raw.cast_to_varchar2(:body)`

### **خطأ: "Column not found"**
- **السبب:** اسم العمود خطأ
- **الحل:** تحقق من أسماء الأعمدة في جدولك

---

## 📞 الدعم

إذا واجهت أي مشكلة:
1. تحقق من Logs في Oracle APEX
2. افتح Console في المتصفح (F12)
3. شغّل الأوامر التجريبية أعلاه
4. أرسل النتائج للمراجعة

---

**تم الإعداد بنجاح! 🚀**
