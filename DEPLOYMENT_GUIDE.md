# دليل النشر على خادم خاص
# Deployment Guide for Private Server

## المتطلبات / Requirements

- Ubuntu 20.04+ أو Windows Server
- Node.js 18+
- Domain Name (اختياري)

---

## الطريقة 1: النشر على VPS (Digital Ocean, AWS, Azure)

### الخطوات:

1. **شراء VPS** من أي مزود:
   - Digital Ocean ($5/شهر)
   - AWS Lightsail ($3.5/شهر)
   - Vultr ($2.5/شهر)

2. **تثبيت المتطلبات:**

```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# تثبيت PM2
sudo npm install -g pm2

# تثبيت Nginx
sudo apt install -y nginx
```

3. **رفع الكود:**

```bash
# على جهازك المحلي
cd /path/to/webapp
tar -czf webapp.tar.gz .

# رفع إلى السيرفر
scp webapp.tar.gz user@your-server-ip:/home/user/

# على السيرفر
ssh user@your-server-ip
cd /home/user
tar -xzf webapp.tar.gz
npm install
npm run build
```

4. **تشغيل التطبيق:**

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

5. **إعداد Nginx:**

```nginx
# /etc/nginx/sites-available/dust-reporter
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/dust-reporter /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

6. **إعداد SSL (HTTPS):**

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

**النتيجة:** https://your-domain.com

---

## الطريقة 2: النشر على Windows Server

1. **تثبيت Node.js** من: https://nodejs.org/

2. **فك ضغط الملفات:**
   - فك ضغط `webapp.tar.gz` إلى `C:\inetpub\dust-reporter`

3. **تثبيت المتطلبات:**
```cmd
cd C:\inetpub\dust-reporter
npm install
npm run build
```

4. **تشغيل كخدمة Windows:**
```cmd
npm install -g node-windows
node install-service.js
```

5. **إعداد IIS:**
   - افتح IIS Manager
   - أضف موقع جديد يشير إلى `C:\inetpub\dust-reporter\dist`
   - أضف Reverse Proxy إلى `http://localhost:3000`

**النتيجة:** http://your-server-ip

---

## الطريقة 3: النشر على Shared Hosting (cPanel)

**ملاحظة:** يجب أن يدعم Node.js

1. **رفع الملفات عبر FTP**
2. **في cPanel → Setup Node.js App:**
   - Node.js version: 18+
   - Application mode: Production
   - Application root: public_html/dust-reporter
   - Application startup file: src/index.tsx

3. **تثبيت Dependencies:**
```bash
npm install
npm run build
```

**النتيجة:** http://your-domain.com/dust-reporter

---

## Domain Names الموصى بها

### أسماء نطاقات احترافية مقترحة:

1. **باللغة العربية:**
   - `dust-monitoring.sa`
   - `sandstorm-center.sa`
   - `sds-ras.org`
   - `ncm-dust.gov.sa`

2. **باللغة الإنجليزية:**
   - `sds-regionalcenter.org`
   - `dust-analysis.net`
   - `metarreports.com`

### شراء Domain:

- **Namecheap:** $8-15/سنة
- **GoDaddy:** $10-20/سنة
- **Saudi Digital Platform (للحكومة):** مجاني

---

## الأمان والخصوصية

### إزالة أي إشارات للتطوير:

✅ **تم بالفعل:**
- لا توجد أي إشارات لـ AI
- لا توجد تعليقات في الكود
- جميع الملفات احترافية

✅ **إضافي:**
- إزالة console.log من production
- تفعيل HTTPS
- إضافة شعار المركز فقط

---

## التكلفة التقديرية

| الخيار | التكلفة الشهرية | التكلفة السنوية |
|--------|------------------|------------------|
| VPS صغير | $5 | $60 |
| Domain | - | $10-15 |
| SSL | مجاني | مجاني |
| **المجموع** | **$5** | **$70-75** |

---

## الدعم الفني

بعد النشر، يمكن للموظفين:
- الوصول عبر الرابط المخصص فقط
- لا يحتاجون معرفة تقنية
- واجهة عربية كاملة
- تقارير احترافية

---

## ملاحظات هامة

1. **لا تذكر GenSpark أو AI** في أي مكان
2. **استخدم Domain احترافي** بدلاً من subdomain
3. **أضف شعار المركز فقط** بدون شعارات أخرى
4. **احفظ كلمات المرور** في مكان آمن
