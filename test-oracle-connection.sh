#!/bin/bash
# =====================================================
# 🧪 سكريبت اختبار ربط Oracle APEX
# =====================================================

echo "🧪 اختبار الربط مع Oracle APEX"
echo "=================================="
echo ""

# =====================================================
# ⚠️ عدّل هذه المعلومات حسب قاعدة بياناتك:
# =====================================================
ORACLE_URL="https://apex.oracle.com/pls/apex/YOUR_WORKSPACE/test/data/"
# مثال: https://apex.oracle.com/pls/apex/ncm_metar/test/data/

echo "📍 Oracle API URL: $ORACLE_URL"
echo ""

# =====================================================
# 1️⃣ اختبار GET (قراءة البيانات)
# =====================================================
echo "1️⃣ اختبار GET (قراءة البيانات)..."
echo "-----------------------------------"

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$ORACLE_URL")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" == "200" ]; then
    echo "✅ نجح! Status: $HTTP_STATUS"
    echo "📊 البيانات المسترجعة:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
else
    echo "❌ فشل! Status: $HTTP_STATUS"
    echo "📄 الرد:"
    echo "$BODY"
fi

echo ""
echo ""

# =====================================================
# 2️⃣ اختبار POST (إدراج بيانات)
# =====================================================
echo "2️⃣ اختبار POST (إدراج بيانات)..."
echo "-----------------------------------"

TEST_DATA='{
  "station": "TEST',
  "time": "'$(date '+%Y-%m-%d %H:%M')'",
  "temp": 27.5,
  "weather": "BLDU"
}'

echo "📤 البيانات المرسلة:"
echo "$TEST_DATA" | python3 -m json.tool 2>/dev/null || echo "$TEST_DATA"
echo ""

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST "$ORACLE_URL" \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" == "201" ] || [ "$HTTP_STATUS" == "200" ]; then
    echo "✅ نجح! Status: $HTTP_STATUS"
    echo "📊 الرد:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
else
    echo "❌ فشل! Status: $HTTP_STATUS"
    echo "📄 الرد:"
    echo "$BODY"
fi

echo ""
echo ""

# =====================================================
# 3️⃣ التحقق من الإدراج (GET مرة أخرى)
# =====================================================
echo "3️⃣ التحقق من الإدراج..."
echo "-----------------------------------"

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$ORACLE_URL")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" == "200" ]; then
    echo "✅ نجح! Status: $HTTP_STATUS"
    echo "📊 البيانات المسترجعة (يجب أن تحتوي على السجل الجديد):"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
else
    echo "❌ فشل! Status: $HTTP_STATUS"
fi

echo ""
echo ""

# =====================================================
# 📊 النتيجة النهائية
# =====================================================
echo "=================================="
echo "📊 النتيجة النهائية:"
echo "=================================="

if [ "$HTTP_STATUS" == "200" ]; then
    echo "✅ الربط يشتغل 100%!"
    echo "✅ جاهز للتطبيق على الجداول الحقيقية"
    echo ""
    echo "🎯 الخطوة التالية:"
    echo "  1. طبّق الجداول الكاملة (oracle_tables.sql)"
    echo "  2. أنشئ REST API الكامل"
    echo "  3. اربط النظام بالـ API"
else
    echo "❌ يوجد مشكلة في الربط"
    echo ""
    echo "🔍 استكشاف الأخطاء:"
    echo "  1. تحقق من رابط API صحيح"
    echo "  2. تأكد من وجود الجدول TEST_METAR"
    echo "  3. تأكد من وجود REST API: test_api"
    echo "  4. تحقق من تفعيل RESTful Services"
fi

echo ""
