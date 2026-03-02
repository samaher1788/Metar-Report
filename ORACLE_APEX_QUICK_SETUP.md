# دليل سريع - ربط Oracle APEX
# Quick Guide - Oracle APEX Integration

## 🎯 ما ستحتاجه:

1. ✅ حساب Oracle APEX (مجاني: https://apex.oracle.com)
2. ✅ Workspace في APEX
3. ✅ صلاحيات SQL Workshop

---

## ⚡ خطوات الإعداد السريعة (15 دقيقة):

### 1️⃣ إنشاء الجداول (5 دقائق)

في Oracle APEX → SQL Workshop → SQL Scripts:

```sql
-- الجدول الرئيسي للبيانات
CREATE TABLE METAR_RAW_DATA (
    ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    STATION_CODE VARCHAR2(10) NOT NULL,
    VALID_TIME TIMESTAMP NOT NULL,
    TEMPERATURE NUMBER(5,1),
    WIND_SPEED NUMBER(5,1),
    VISIBILITY NUMBER(10,2),
    PRESENT_WEATHER VARCHAR2(100),
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IDX_METAR_STATION ON METAR_RAW_DATA(STATION_CODE);
CREATE INDEX IDX_METAR_TIME ON METAR_RAW_DATA(VALID_TIME);
```

اضغط **Run** ✅

---

### 2️⃣ تفعيل REST API (3 دقائق)

في SQL Commands:

```sql
BEGIN
    ORDS.ENABLE_SCHEMA(
        p_enabled => TRUE,
        p_schema => USER,  -- استخدام المستخدم الحالي
        p_url_mapping_type => 'BASE_PATH',
        p_url_mapping_pattern => 'api'
    );
    
    ORDS.ENABLE_OBJECT(
        p_enabled => TRUE,
        p_schema => USER,
        p_object => 'METAR_RAW_DATA',
        p_object_type => 'TABLE',
        p_object_alias => 'metar'
    );
    
    COMMIT;
END;
/
```

اضغط **Run** ✅

---

### 3️⃣ إنشاء REST Endpoint للإدراج (5 دقائق)

```sql
BEGIN
    ORDS.DEFINE_MODULE(
        p_module_name => 'dust_api',
        p_base_path => '/dust/'
    );

    ORDS.DEFINE_TEMPLATE(
        p_module_name => 'dust_api',
        p_pattern => 'save'
    );

    ORDS.DEFINE_HANDLER(
        p_module_name => 'dust_api',
        p_pattern => 'save',
        p_method => 'POST',
        p_source_type => ORDS.source_type_plsql,
        p_source => '
BEGIN
    INSERT INTO METAR_RAW_DATA (
        STATION_CODE, VALID_TIME, TEMPERATURE, 
        WIND_SPEED, VISIBILITY, PRESENT_WEATHER
    )
    SELECT 
        jt.station,
        TO_TIMESTAMP(jt.valid_time, ''YYYY-MM-DD HH24:MI:SS''),
        jt.temperature,
        jt.wind_speed,
        jt.visibility,
        jt.weather
    FROM JSON_TABLE(
        :body_text, ''$.data[*]''
        COLUMNS (
            station VARCHAR2(10) PATH ''$.station'',
            valid_time VARCHAR2(30) PATH ''$.valid'',
            temperature NUMBER PATH ''$.tmpf'',
            wind_speed NUMBER PATH ''$.sknt'',
            visibility NUMBER PATH ''$.vsby'',
            weather VARCHAR2(100) PATH ''$.wxcodes''
        )
    ) jt;
    
    COMMIT;
    
    :status := 200;
END;'
    );
    
    COMMIT;
END;
/
```

---

### 4️⃣ الحصول على REST URL

1. في APEX → SQL Workshop → RESTful Services
2. ستجد الـ URL مثل:
   ```
   https://apex.oracle.com/pls/apex/YOUR_WORKSPACE/api/dust/save
   ```
3. **انسخ هذا الرابط** ✅

---

### 5️⃣ إضافة الرابط في Cloudflare

في Cloudflare Pages → Settings → Environment Variables:

```
ORACLE_APEX_URL=https://apex.oracle.com/pls/apex/YOUR_WORKSPACE/api
```

(اختياري) إذا كان لديك API Key:
```
ORACLE_APEX_KEY=your_api_key_here
```

---

### 6️⃣ تفعيل الحفظ التلقائي

الكود جاهز في `src/services/oracle-apex.ts`!

فقط أضف متغير البيئة وسيعمل تلقائياً ✅

---

## 🧪 اختبار الربط:

### من المتصفح:

افتح: `https://your-app.pages.dev/api/test-oracle`

يجب أن يظهر:
```json
{
  "connected": true,
  "message": "Connected to Oracle APEX successfully"
}
```

---

## 📊 عرض البيانات في APEX:

1. اذهب إلى App Builder
2. Create Application
3. Add Page → Interactive Report
4. اختر `METAR_RAW_DATA`
5. Run!

ستشاهد البيانات المحفوظة تلقائياً ✅

---

## 🔄 التشغيل التلقائي:

البيانات ستُحفظ تلقائياً عند:
- ✅ كل مرة يولد المستخدم تقرير
- ✅ يمكن إضافة Cron Job لجلب كل 6 ساعات

---

## ⚠️ ملاحظات مهمة:

1. **لا تشارك ORACLE_APEX_URL** مع أحد
2. **استخدم HTTPS فقط**
3. **اختبر الاتصال أولاً** قبل التشغيل الكامل

---

## 🆘 المشاكل الشائعة:

### مشكلة: "ORA-00942: table does not exist"
**الحل:** تحقق من اسم الجدول واسم المستخدم

### مشكلة: "401 Unauthorized"
**الحل:** تحقق من API Key أو فعّل public access

### مشكلة: "Connection refused"
**الحل:** تحقق من REST URL في APEX

---

## ✅ Checklist:

- [ ] إنشاء الجداول
- [ ] تفعيل REST API
- [ ] إنشاء Endpoints
- [ ] نسخ REST URL
- [ ] إضافة في Cloudflare Environment Variables
- [ ] اختبار الاتصال
- [ ] توليد تقرير اختباري
- [ ] التحقق من الحفظ في APEX

---

**الوقت الكلي: 15-20 دقيقة**

**هل تحتاج مساعدة في أي خطوة؟ أخبرني!** 🚀
