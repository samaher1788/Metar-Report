#!/bin/bash

# 🧪 Test Oracle APEX POST Handler
# اختبار POST Handler لإضافة بيانات جديدة

echo "🚀 اختبار POST Handler..."
echo "================================"
echo ""

# Oracle APEX API URL
API_URL="http://193.122.89.34/ncmapp/dustws/test/data/"

echo "📡 إرسال POST Request إلى:"
echo "$API_URL"
echo ""

# إرسال POST request
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "station": "OEJN",
    "time": "2026-03-10 16:00",
    "temperature": 28.5,
    "weather": "BLDU+SS"
  }')

# فصل الـ response body عن status code
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

echo "📊 النتيجة:"
echo "Status Code: $http_code"
echo ""
echo "Response Body:"
echo "$body" | jq . 2>/dev/null || echo "$body"
echo ""

if [ "$http_code" = "201" ] || [ "$http_code" = "200" ]; then
    echo "✅ نجح! تم إضافة البيانات بنجاح"
    echo ""
    echo "🔍 التحقق من البيانات الجديدة..."
    echo "================================"
    echo ""
    
    # GET request للتحقق
    get_response=$(curl -s "$API_URL")
    echo "📋 جميع السجلات في القاعدة:"
    echo "$get_response" | jq . 2>/dev/null || echo "$get_response"
    
    # عد السجلات
    count=$(echo "$get_response" | jq '. | length' 2>/dev/null)
    if [ ! -z "$count" ]; then
        echo ""
        echo "📊 عدد السجلات الكلي: $count"
    fi
else
    echo "❌ فشل! Status Code: $http_code"
    echo "الرجاء التحقق من POST Handler في Oracle APEX"
fi

echo ""
echo "================================"
echo "✅ انتهى الاختبار"
