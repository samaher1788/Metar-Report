#!/bin/bash

# 🧪 اختبار الربط الكامل مع Oracle APEX
# ==========================================

echo "🚀 اختبار ربط نظام METAR مع Oracle APEX"
echo "=========================================="
echo ""

# Oracle APEX API URL
API_URL="http://193.122.89.34/ncmapp/dustws/metar"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# =========================
# Test 1: Health Check
# =========================
echo "📡 Test 1: التحقق من الاتصال بـ Oracle"
echo "----------------------------------------"

health_response=$(curl -s -w "\n%{http_code}" "$API_URL/health/" 2>/dev/null)
health_code=$(echo "$health_response" | tail -n1)

if [ "$health_code" = "200" ] || [ "$health_code" = "404" ]; then
    echo -e "${GREEN}✅ الاتصال بـ Oracle يعمل${NC}"
else
    echo -e "${RED}❌ فشل الاتصال بـ Oracle${NC}"
    echo "Status Code: $health_code"
fi
echo ""

# =========================
# Test 2: Save Single Record
# =========================
echo "📤 Test 2: حفظ سجل واحد"
echo "----------------------------------------"

single_response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/save/" \
  -H "Content-Type: application/json" \
  -d '{
    "station": "TEST_AUTO",
    "valid": "2026-03-11 08:00",
    "tmpf": 85.5,
    "dwpf": 45.2,
    "sknt": 25,
    "drct": 270,
    "vsby": 3.5,
    "alti": 29.92,
    "wxcodes": "BLDU DS",
    "metar": "TEST_AUTO 110800Z 27025KT 5600 BLDU DS 30/07 Q1015"
  }' 2>/dev/null)

single_code=$(echo "$single_response" | tail -n1)
single_body=$(echo "$single_response" | head -n-1)

echo "Status Code: $single_code"
echo "Response:"
echo "$single_body" | jq . 2>/dev/null || echo "$single_body"

if [ "$single_code" = "201" ] || [ "$single_code" = "200" ]; then
    echo -e "${GREEN}✅ نجح حفظ السجل${NC}"
else
    echo -e "${RED}❌ فشل حفظ السجل${NC}"
fi
echo ""

# =========================
# Test 3: Save Batch Records
# =========================
echo "📦 Test 3: حفظ مجموعة سجلات"
echo "----------------------------------------"

batch_response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/save-batch/" \
  -H "Content-Type: application/json" \
  -d '{
    "records": [
      {
        "station": "OERK",
        "valid": "2026-03-11 08:00",
        "tmpf": 75.2,
        "wxcodes": "BLDU",
        "sknt": 15,
        "drct": 270,
        "vsby": 5.0,
        "alti": 29.92
      },
      {
        "station": "OEDF",
        "valid": "2026-03-11 08:00",
        "tmpf": 82.5,
        "wxcodes": "DS",
        "sknt": 20,
        "drct": 290,
        "vsby": 2.5,
        "alti": 29.88
      },
      {
        "station": "OEJN",
        "valid": "2026-03-11 08:00",
        "tmpf": 78.0,
        "wxcodes": "BLSA",
        "sknt": 18,
        "drct": 280,
        "vsby": 4.0,
        "alti": 29.90
      }
    ]
  }' 2>/dev/null)

batch_code=$(echo "$batch_response" | tail -n1)
batch_body=$(echo "$batch_response" | head -n-1)

echo "Status Code: $batch_code"
echo "Response:"
echo "$batch_body" | jq . 2>/dev/null || echo "$batch_body"

if [ "$batch_code" = "201" ] || [ "$batch_code" = "200" ]; then
    saved=$(echo "$batch_body" | jq -r '.saved' 2>/dev/null)
    echo -e "${GREEN}✅ نجح حفظ ${saved} سجل${NC}"
else
    echo -e "${RED}❌ فشل الحفظ الجماعي${NC}"
fi
echo ""

# =========================
# Test 4: Verify Data
# =========================
echo "🔍 Test 4: التحقق من البيانات المحفوظة"
echo "----------------------------------------"

# Note: هذا يتطلب GET endpoint في Oracle
# إذا لم يكن موجود، استخدم Oracle APEX SQL Commands:
echo "للتحقق، شغّل هذا SQL في Oracle APEX:"
echo ""
echo "SELECT * FROM METAR_DATA WHERE CREATED_AT > SYSDATE - 1/24 ORDER BY CREATED_AT DESC;"
echo ""

# =========================
# Summary
# =========================
echo "=========================================="
echo "📊 ملخص الاختبار"
echo "=========================================="
echo ""
echo "الاختبارات المكتملة:"
echo "  - اتصال Oracle: $([ "$health_code" = "200" ] || [ "$health_code" = "404" ] && echo "✅" || echo "❌")"
echo "  - حفظ سجل واحد: $([ "$single_code" = "201" ] || [ "$single_code" = "200" ] && echo "✅" || echo "❌")"
echo "  - حفظ مجموعة: $([ "$batch_code" = "201" ] || [ "$batch_code" = "200" ] && echo "✅" || echo "❌")"
echo ""
echo "الخطوة التالية:"
echo "  1. تحقق من البيانات في Oracle APEX"
echo "  2. جرّب الواجهة: https://metars-report.pages.dev/"
echo "  3. راقب Console (F12) للتأكد من Auto-sync"
echo ""
echo "✅ انتهى الاختبار"
