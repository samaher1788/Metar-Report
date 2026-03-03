# 🌹 دليل إضافة وردة الرياح والشعار إلى التقرير

## ✅ ما تم إضافته:

### 1. **مولد وردة الرياح بالبايثون** (`wind_rose_generator.py`)
- إنشاء وردة رياح كبيرة ملونة لكل محطة
- استخدام مكتبة `windrose` و `matplotlib`
- 16 اتجاه رياح تفصيلي
- 6 فئات لسرعة الرياح (بالعقد)
- ألوان: أحمر (سرعة عالية) → أصفر → أخضر (سرعة منخفضة)

### 2. **API Service للوردة** (`wind_rose_api.py`)
- خدمة Flask API على المنفذ 5000
- Endpoint: `/api/generate-wind-rose`
- يستقبل بيانات METAR ويرجع صورة base64

### 3. **مولد PDF محسّن** (`pdf-generator-enhanced.js`)
- إضافة شعار المركز الوطني للأرصاد (كبير في أعلى كل صفحة)
- وردة رياح كبيرة (140mm × 140mm) لكل محطة بها غبار
- تصميم احترافي ثنائي اللغة (عربي/إنجليزي)

---

## 📋 المتطلبات:

### Python Packages:
```bash
pip install windrose matplotlib numpy pandas reportlab pillow flask
```

### JavaScript (CDN):
- jsPDF
- jspdf-autotable

---

## 🚀 طريقة الاستخدام:

### الطريقة 1: استخدام JavaScript + Python API (موصى بها)

#### 1. تشغيل Python API:
```bash
cd /home/user/webapp
python3 wind_rose_api.py
```

سيعمل على: `http://localhost:5000`

#### 2. تحديث ملف HTML:
```html
<!-- بعد pdf-generator.js -->
<script src="/static/pdf-generator-enhanced.js"></script>
```

#### 3. في app.js، استخدم المولد المحسّن:
```javascript
// بدلاً من DustReportPDFGenerator
const pdfGenerator = new EnhancedDustReportPDFGenerator();
await pdfGenerator.generateReport(analysis, metarRecords, selectedDate);
pdfGenerator.save(`Dust_Report_${dateStr}.pdf`);
```

---

### الطريقة 2: استخدام Python فقط

#### 1. تحضير البيانات:
```python
import pdf_generator_enhanced as pdfgen

dust_data = {
    'start_date': '2026-03-02',
    'end_date': '2026-03-02',
    'summary': {
        'Total Stations': 15,
        'Stations with Dust': 5,
        'Total Dust Reports': 42
    },
    'stations': [
        {
            'code': 'OERK',
            'name': 'King Khaled Int\'l Airport - Riyadh',
            'dust_reports': 15
        }
    ],
    'metar_records': [
        {
            'station': 'OERK',
            'drct': '315',
            'sknt': '25',
            'valid': '2026-03-02T12:00:00Z',
            'wxcodes': 'BLDU',
            'vsby': '3.0',
            'has_dust': True
        }
        # ... المزيد
    ]
}

# توليد PDF
pdfgen.generate_pdf_with_wind_rose(dust_data, 'output_report.pdf')
```

---

## 🎨 مثال على وردة الرياح:

```python
# اختبار سريع
import wind_rose_generator as wrg

# توليد نموذج تجريبي
img_base64 = wrg.generate_sample_wind_rose()
print(f"✅ Generated! Length: {len(img_base64)} chars")

# حفظ كملف
with open('test_windrose.png', 'wb') as f:
    import base64
    f.write(base64.b64decode(img_base64))
```

---

## 📊 مواصفات وردة الرياح:

### الحجم:
- **في PDF**: 140mm × 140mm (كبير جداً)
- **الدقة**: 150 DPI
- **الصيغة**: PNG

### الألوان:
- أحمر: > 25 عقدة (عواصف قوية)
- برتقالي: 20-25 عقدة
- أصفر: 15-20 عقدة
- أخضر فاتح: 10-15 عقدة
- أخضر: 5-10 عقدة
- أخضر داكن: 0-5 عقدة

### الاتجاهات:
- 16 اتجاه (N, NNE, NE, ENE, E, ESE, SE, SSE, S, SSW, SW, WSW, W, WNW, NW, NNW)

---

## 🔧 إضافة API endpoint للوردة في Hono:

أضف في `src/index.tsx`:

```typescript
// Python Wind Rose API Proxy
app.post('/api/generate-wind-rose', async (c) => {
  try {
    const body = await c.req.json()
    
    // Call Python API
    const response = await fetch('http://localhost:5000/api/generate-wind-rose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    
    const data = await response.json()
    return c.json(data)
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})
```

---

## 📝 مثال كامل للتقرير:

### الصفحة 1: العنوان والإحصائيات
```
┌─────────────────────────────────────────┐
│                                         │
│     [شعار المركز الوطني - كبير]         │
│                                         │
│   Sand and Dust Storm Regional Center  │
│   المركز الإقليمي للعواصف الغبارية      │
│                                         │
│  Dust and Sandstorm Events Report      │
│  تقرير أحداث العواصف الغبارية           │
│                                         │
│  Report Date: Monday - 02/03/2026       │
│                                         │
├─────────────────────────────────────────┤
│  Summary Statistics:                    │
│  • Total Dust Reports: 42               │
│  • Severe Storms: 5                     │
│  • Blowing Dust: 25                     │
│  • Active Stations: 8                   │
└─────────────────────────────────────────┘
```

### الصفحة 2: وردة الرياح - الرياض
```
┌─────────────────────────────────────────┐
│  [شعار صغير]    Station: OERK          │
│                  Code: OERK             │
│                  Dust Reports: 15       │
│                                         │
│      [وردة رياح كبيرة ملونة]            │
│         140mm × 140mm                   │
│                                         │
│  Detailed METAR Observations:           │
│  ┌─────┬────────┬──────────┬──────────┐│
│  │Time │Weather │Wind      │Visibility││
│  ├─────┼────────┼──────────┼──────────┤│
│  │12:00│BLDU    │315° @25kt│3000m     ││
│  │13:00│DU      │320° @22kt│5000m     ││
│  └─────┴────────┴──────────┴──────────┘│
└─────────────────────────────────────────┘
```

---

## ✅ قائمة التحقق:

- [x] تثبيت Python packages
- [x] إنشاء wind_rose_generator.py
- [x] إنشاء wind_rose_api.py
- [x] إنشاء pdf-generator-enhanced.js
- [ ] تشغيل Python API (flask)
- [ ] إضافة proxy endpoint في Hono
- [ ] تحديث app.js لاستخدام المولد المحسّن
- [ ] اختبار توليد التقرير
- [ ] التحقق من حجم ووضوح وردة الرياح
- [ ] التحقق من ظهور الشعار

---

## 🎯 النتيجة النهائية:

- ✅ تقرير PDF احترافي
- ✅ شعار المركز في كل صفحة
- ✅ وردة رياح كبيرة وملونة لكل محطة
- ✅ بيانات METAR تفصيلية
- ✅ تصميم ثنائي اللغة
- ✅ جاهز للطباعة والمشاركة

---

## 🐛 استكشاف الأخطاء:

### المشكلة: "Module windrose not found"
```bash
pip install windrose matplotlib
```

### المشكلة: "Flask not found"
```bash
pip install flask
```

### المشكلة: "Logo not loading"
- تأكد من وجود `public/static/ncm-logo.png`
- تحقق من صلاحيات الملف
- جرب تحميل الصورة في المتصفح أولاً

### المشكلة: "Python API not responding"
```bash
# تحقق من أن Flask يعمل
curl http://localhost:5000/api/generate-sample-wind-rose

# أعد تشغيل API
pkill -f wind_rose_api
python3 wind_rose_api.py
```

---

**تم إنشاء هذا الدليل:** 2026-03-03
**المشروع:** مولد تقارير العواصف الغبارية والرملية
