# 🚀 دليل سريع: ربط Oracle APEX بنظام METAR

---

## 📋 الخطوات المطلوبة منك

### 1️⃣ في Oracle APEX:

#### أ) إنشاء الجداول (SQL Workshop):

```sql
-- نفّذ هذا السكريبت في SQL Commands

-- جدول التقارير الرئيسي
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

CREATE SEQUENCE METAR_REPORTS_SEQ START WITH 1;
CREATE INDEX IDX_METAR_STATION ON METAR_REPORTS(STATION_CODE);
CREATE INDEX IDX_METAR_TIME ON METAR_REPORTS(OBSERVATION_TIME);
```

#### ب) إنشاء REST API:

1. اذهب إلى **SQL Workshop** → **RESTful Services**
2. اضغط **Create Module**
   - Module Name: `metar_api`
   - Base Path: `/metar/`
3. أنشئ Resource Template:
   - URI Template: `reports/`
   - Method: `POST`
4. الصق PL/SQL Handler من الملف `ORACLE_APEX_INTEGRATION_GUIDE.md`

#### ج) تفعيل OAuth:

1. اذهب إلى **SQL Workshop** → **RESTful Services** → **OAuth Clients**
2. اضغط **Create Client**
   - Name: `METAR_CLIENT`
   - Grant Type: `Client Credentials`
3. احفظ Client ID و Client Secret

---

### 2️⃣ في Cloudflare (البيئة):

#### أ) حفظ المفاتيح كـ Secrets:

```bash
# من جهازك المحلي أو Sandbox
cd /home/user/webapp

# حفظ Oracle APEX URL
npx wrangler pages secret put ORACLE_APEX_URL --project-name metar-reports
# أدخل: https://apex.oracle.com/pls/apex/your_workspace

# حفظ Client ID
npx wrangler pages secret put ORACLE_CLIENT_ID --project-name metar-reports
# أدخل: client_id_from_apex

# حفظ Client Secret
npx wrangler pages secret put ORACLE_CLIENT_SECRET --project-name metar-reports
# أدخل: client_secret_from_apex

# حفظ Workspace Name
npx wrangler pages secret put ORACLE_WORKSPACE --project-name metar-reports
# أدخل: METAR
```

---

### 3️⃣ في الكود (تم):

✅ تم إنشاء `src/oracle-integration.ts`  
✅ يحتوي على جميع الدوال المطلوبة  
✅ جاهز للاستخدام بعد إضافة API routes

---

## 🔄 كيف يعمل النظام تلقائياً؟

### السيناريو الحالي (بدون Oracle):
```
1. المستخدم يختار التاريخ والشبكة
2. النظام يجلب بيانات METAR
3. يحلل البيانات
4. يعرض التقرير
5. المستخدم يحمّل PDF
❌ لا يتم حفظ البيانات
```

### السيناريو الجديد (مع Oracle):
```
1. المستخدم يختار التاريخ والشبكة
2. النظام يجلب بيانات METAR
3. يحلل البيانات
4. ✅ يرسل البيانات تلقائياً إلى Oracle APEX
5. يعرض التقرير
6. المستخدم يحمّل PDF
✅ البيانات محفوظة في قاعدة البيانات!
```

---

## 📊 API Endpoints الجديدة

بعد التطبيق، ستحصل على:

### 1️⃣ إرسال بيانات لـ Oracle:
```
POST /api/sync-to-oracle
Body: {
  "records": [...],
  "network": "SA__ASOS"
}
```

### 2️⃣ جلب إحصائيات من Oracle:
```
GET /api/oracle-stats?date=2026-03-10
```

### 3️⃣ جلب تقارير محطة من Oracle:
```
GET /api/oracle-reports?station=OERK&date=2026-03-10
```

---

## 🎯 الخطوة التالية

**هل تريدني أن:**

### الخيار أ: أكمل التطبيق الكامل؟
- إضافة API routes في `index.tsx`
- تعديل Frontend لإرسال البيانات تلقائياً
- إضافة UI لعرض حالة المزامنة

### الخيار ب: تطبيق تدريجي؟
- أولاً: API لإرسال البيانات يدوياً (زر في الواجهة)
- ثانياً: جعله تلقائي بعد الاختبار

### الخيار ج: تعطيني معلومات Oracle أولاً؟
- رابط Oracle APEX workspace
- هل لديك حساب جاهز؟
- هل تريد مساعدة في إنشاء الـ REST API؟

---

**أخبرني ماذا تريد وسأكمل! 🚀**
