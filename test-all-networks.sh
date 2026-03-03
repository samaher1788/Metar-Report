#!/bin/bash
echo "🧪 Testing Dust Storm Reporter - All Networks & Dates"
echo "======================================================"

# Test networks
networks=(
  "SA__ASOS|Saudi Arabia"
  "AE__ASOS|UAE"
  "KW__ASOS|Kuwait"
  "BH__ASOS|Bahrain"
  "QA__ASOS|Qatar"
  "OM__ASOS|Oman"
  "JO__ASOS|Jordan"
  "IQ__ASOS|Iraq"
  "YE__ASOS|Yemen"
  "IR__ASOS|Iran"
)

# Test date ranges
dates=(
  "2026-02-01|2026-02-02"
  "2026-02-15|2026-02-16"
  "2026-03-01|2026-03-02"
)

echo ""
echo "📋 Testing ${#networks[@]} networks with ${#dates[@]} date ranges..."
echo ""

success=0
failed=0

for network_data in "${networks[@]}"; do
  IFS='|' read -r network name <<< "$network_data"
  
  for date_range in "${dates[@]}"; do
    IFS='|' read -r start_date end_date <<< "$date_range"
    
    echo "Testing: $name ($network) | $start_date to $end_date"
    
    response=$(curl -s "http://localhost:3000/api/fetch-metar?network=$network&startDate=$start_date&endDate=$end_date")
    
    if echo "$response" | grep -q '"success":true'; then
      stations=$(echo "$response" | grep -o 'station' | wc -l)
      echo "  ✅ Success - $stations station records"
      ((success++))
    else
      echo "  ❌ Failed"
      ((failed++))
    fi
    
    sleep 0.5
  done
  echo ""
done

echo "======================================================"
echo "📊 Test Results:"
echo "  ✅ Successful: $success"
echo "  ❌ Failed: $failed"
echo "  📈 Success Rate: $(( success * 100 / (success + failed) ))%"
echo "======================================================"
