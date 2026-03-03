import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// =========================
// API Routes
// =========================

// Fetch METAR data from IEM
app.get('/api/fetch-metar', async (c) => {
  try {
    const network = c.req.query('network') || 'SA__ASOS'
    const startDate = c.req.query('start_date') || getYesterdayDate()
    const endDate = c.req.query('end_date') || getTodayDate()

    const url = 'https://mesonet.agron.iastate.edu/cgi-bin/request/asos.py'
    const params = new URLSearchParams({
      network: network,
      data: 'all',
      year1: startDate.split('-')[0],
      month1: startDate.split('-')[1],
      day1: startDate.split('-')[2],
      year2: endDate.split('-')[0],
      month2: endDate.split('-')[1],
      day2: endDate.split('-')[2],
      tz: 'Etc/UTC',
      format: 'onlycomma',
      latlon: 'yes',
      missing: 'M',
      trace: 'T',
      direct: 'yes',
      report_type: '3'
    })

    const response = await fetch(`${url}?${params}`)
    const csvText = await response.text()

    return c.json({
      success: true,
      data: csvText,
      network: network,
      start_date: startDate,
      end_date: endDate
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

// Process and analyze dust data
app.post('/api/analyze-dust', async (c) => {
  try {
    const { csvData } = await c.req.json()
    
    const rows = parseCSV(csvData)
    const dustReports = filterDustReports(rows)
    const analysis = analyzeDustData(dustReports)

    return c.json({
      success: true,
      analysis: analysis,
      total_reports: rows.length,
      dust_reports: dustReports.length
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

// Available networks
app.get('/api/networks', (c) => {
  const networks = [
    { code: 'SA__ASOS', name: 'Saudi Arabia', region: 'GCC' },
    { code: 'AE__ASOS', name: 'United Arab Emirates', region: 'GCC' },
    { code: 'KW__ASOS', name: 'Kuwait', region: 'GCC' },
    { code: 'BH__ASOS', name: 'Bahrain', region: 'GCC' },
    { code: 'QA__ASOS', name: 'Qatar', region: 'GCC' },
    { code: 'OM__ASOS', name: 'Oman', region: 'GCC' },
    { code: 'JO__ASOS', name: 'Jordan', region: 'Middle East' },
    { code: 'IQ__ASOS', name: 'Iraq', region: 'Middle East' },
    { code: 'SY__ASOS', name: 'Syria', region: 'Middle East' },
    { code: 'YE__ASOS', name: 'Yemen', region: 'Middle East' },
    { code: 'IR__ASOS', name: 'Iran', region: 'Middle East' }
  ]
  return c.json({ networks })
})

// Generate wind rose for analysis data
// Note: Actual wind rose generation requires Python backend
// This endpoint prepares data and returns placeholder
app.post('/api/generate-wind-rose', async (c) => {
  try {
    const { analysis } = await c.req.json()
    
    // Group stations and prepare data for wind rose generation
    const stationGroups = {}
    
    if (analysis && analysis.stationData) {
      analysis.stationData.forEach(record => {
        const station = record.station
        if (!stationGroups[station]) {
          stationGroups[station] = []
        }
        stationGroups[station].push(record)
      })
    }
    
    // In production, this would call Python backend via subprocess or separate service
    // For now, return structure indicating wind roses should be generated client-side
    return c.json({
      success: true,
      message: 'Wind rose data prepared. Generate using Python backend or client-side library.',
      stations: Object.keys(stationGroups),
      stationData: stationGroups,
      note: 'Use wind_rose_generator_enhanced.py for actual generation'
    })
    
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

// =========================
// Main Route
// =========================
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>مولد تقارير العواصف الغبارية والرملية</title>
        <link rel="icon" type="image/svg+xml" href="/static/favicon.svg">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <!-- Leaflet CSS for maps -->
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
              integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
              crossorigin=""/>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
          body {
            font-family: 'Cairo', sans-serif;
          }
          .loading {
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .report-content {
            line-height: 1.8;
          }
          .station-card {
            transition: all 0.3s ease;
          }
          .station-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          #dustMap {
            height: 600px;
            width: 100%;
            border-radius: 12px;
            z-index: 1;
          }
        </style>
    </head>
    <body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <!-- Header -->
        <header class="bg-white shadow-lg border-b-4 border-blue-600">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <!-- Logo -->
                    <div class="flex items-center gap-4">
                        <img src="/static/ncm-logo.png" alt="المركز الوطني للأرصاد" class="h-20 md:h-24 w-auto">
                    </div>
                    <!-- Title -->
                    <div class="text-center flex-1">
                        <h1 class="text-2xl md:text-3xl font-bold text-blue-900">المركز الإقليمي للعواصف الغبارية والرملية</h1>
                        <p class="text-blue-700 text-base md:text-lg font-semibold mt-1">Sand and Dust Storm Regional Center</p>
                        <p class="text-gray-600 text-sm mt-2">مولد تقارير تحليل بيانات METAR اليومية</p>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="container mx-auto px-4 py-8">
            <!-- Control Panel -->
            <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <i class="fas fa-sliders-h text-blue-600"></i>
                    إعدادات التقرير
                </h2>
                
                <div class="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">تاريخ البداية</label>
                        <input type="date" id="startDate" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">تاريخ النهاية</label>
                        <input type="date" id="endDate" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">الشبكة</label>
                        <select id="networkSelect" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="SA__ASOS">السعودية (SA__ASOS)</option>
                            <option value="AE__ASOS">الإمارات (AE__ASOS)</option>
                            <option value="KW__ASOS">الكويت (KW__ASOS)</option>
                            <option value="BH__ASOS">البحرين (BH__ASOS)</option>
                            <option value="QA__ASOS">قطر (QA__ASOS)</option>
                            <option value="OM__ASOS">عمان (OM__ASOS)</option>
                            <option value="JO__ASOS">الأردن (JO__ASOS)</option>
                            <option value="IQ__ASOS">العراق (IQ__ASOS)</option>
                            <option value="YE__ASOS">اليمن (YE__ASOS)</option>
                        </select>
                    </div>
                </div>

                <button id="generateBtn" class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg">
                    <i class="fas fa-file-pdf mr-2"></i>
                    توليد التقرير
                </button>
            </div>

            <!-- Loading Indicator -->
            <div id="loading" class="hidden bg-white rounded-xl shadow-lg p-8 text-center">
                <div class="loading mx-auto mb-4"></div>
                <p class="text-gray-600 font-semibold">جاري تحليل البيانات...</p>
            </div>

            <!-- Interactive Map -->
            <div id="mapContainer" class="hidden bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 class="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <i class="fas fa-map-marked-alt text-blue-600"></i>
                    خريطة توزيع الحالات
                </h2>
                <p class="text-gray-600 mb-4 text-sm">
                    <i class="fas fa-info-circle text-blue-500 mr-1"></i>
                    اضغط على أي محطة لمشاهدة التفاصيل
                </p>
                <div id="dustMap" class="shadow-inner"></div>
            </div>

            <!-- Report Output -->
            <div id="reportOutput" class="hidden bg-white rounded-xl shadow-lg p-8">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <i class="fas fa-file-alt text-blue-600"></i>
                        التقرير التفصيلي
                    </h2>
                    <button id="downloadBtn" class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-md">
                        <i class="fas fa-download mr-2"></i>
                        تحميل PDF
                    </button>
                </div>
                <div id="reportContent" class="report-content text-gray-700"></div>
            </div>

            <!-- Statistics Cards -->
            <div id="statsCards" class="hidden grid md:grid-cols-4 gap-4 mb-8">
                <div class="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl shadow-lg p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-red-100 text-sm">عواصف شديدة</p>
                            <p id="severeCount" class="text-3xl font-bold">0</p>
                        </div>
                        <i class="fas fa-exclamation-triangle text-4xl opacity-50"></i>
                    </div>
                </div>
                <div class="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-orange-100 text-sm">عواصف عادية</p>
                            <p id="stormCount" class="text-3xl font-bold">0</p>
                        </div>
                        <i class="fas fa-wind text-4xl opacity-50"></i>
                    </div>
                </div>
                <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl shadow-lg p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-yellow-100 text-sm">غبار متطاير</p>
                            <p id="blowingCount" class="text-3xl font-bold">0</p>
                        </div>
                        <i class="fas fa-smog text-4xl opacity-50"></i>
                    </div>
                </div>
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-blue-100 text-sm">غبار عالق</p>
                            <p id="suspendedCount" class="text-3xl font-bold">0</p>
                        </div>
                        <i class="fas fa-cloud text-4xl opacity-50"></i>
                    </div>
                </div>
            </div>
        </main>

        <!-- Hidden images for PDF generation -->
        <img id="ncm-logo-img" src="/static/ncm-logo.png" style="display:none;" crossorigin="anonymous">
        <img id="ncm-logo-banner" src="/static/ncm-logo.png" style="display:none;" crossorigin="anonymous">

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js"></script>
        <!-- Leaflet JS for maps -->
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
                integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
                crossorigin=""></script>
        <!-- Map Generator -->
        <script src="/static/map-generator.js"></script>
        <!-- Map Capture Utility for PDF -->
        <script src="/static/map-capture.js"></script>
        <!-- Original PDF Generator -->
        <script src="/static/pdf-generator.js"></script>
        <!-- Enhanced PDF Generator (matches reference report) -->
        <script src="/static/pdf-generator-reference.js"></script>
        <!-- Simple Wind Rose Generator (Client-Side Canvas) -->
        <script src="/static/wind-rose-simple.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

// =========================
// Helper Functions
// =========================

function getYesterdayDate() {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return date.toISOString().split('T')[0]
}

function getTodayDate() {
  const date = new Date()
  return date.toISOString().split('T')[0]
}

function parseCSV(csvText) {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []
  
  const headers = lines[0].split(',').map(h => h.trim())
  const rows = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',')
    const row = {}
    headers.forEach((header, index) => {
      row[header] = values[index] ? values[index].trim() : ''
    })
    rows.push(row)
  }
  
  return rows
}

function filterDustReports(rows) {
  const DUST_CODES = ['DU', 'SA', 'BLDU', 'BLSA', 'DS', 'SS', '+DS', '+SS', 'TSBLDU', 'TSBLSA', 'TSDS', 'TSSS', 'PO']
  
  return rows.filter(row => {
    if (!row.wxcodes) return false
    const codes = row.wxcodes.split(/[\s,]+/).filter(c => c.length > 0)
    return codes.some(code => DUST_CODES.includes(code))
  })
}

function analyzeDustData(dustReports) {
  const byStation = {}
  const byType = {
    severe: 0,
    storm: 0,
    blowing: 0,
    suspended: 0
  }
  
  dustReports.forEach(report => {
    const station = report.station || 'Unknown'
    if (!byStation[station]) {
      byStation[station] = {
        station: station,
        reports: [],
        count: 0,
        minVsby: 9999,
        maxWind: 0
      }
    }
    
    byStation[station].reports.push(report)
    byStation[station].count++
    
    if (report.vsby && report.vsby !== 'M') {
      const vsby = parseFloat(report.vsby)
      if (!isNaN(vsby)) {
        byStation[station].minVsby = Math.min(byStation[station].minVsby, vsby)
      }
    }
    
    if (report.sknt && report.sknt !== 'M') {
      const wind = parseFloat(report.sknt)
      if (!isNaN(wind)) {
        byStation[station].maxWind = Math.max(byStation[station].maxWind, wind)
      }
    }
    
    // Categorize by type
    const codes = (report.wxcodes || '').split(/[\s,]+/)
    if (codes.some(c => ['+DS', '+SS', 'TSDS', 'TSSS'].includes(c))) {
      byType.severe++
    } else if (codes.some(c => ['DS', 'SS'].includes(c))) {
      byType.storm++
    } else if (codes.some(c => ['BLDU', 'BLSA', 'TSBLDU', 'TSBLSA'].includes(c))) {
      byType.blowing++
    } else if (codes.some(c => ['DU', 'SA'].includes(c))) {
      byType.suspended++
    }
  })
  
  // Enhance dust reports with METAR string for PDF generator
  const enhancedReports = dustReports.map(report => {
    // Create METAR string from report fields
    const metar = report.metar || constructMetarString(report)
    return {
      ...report,
      metar: metar,
      visibility: report.vsby || '9999'
    }
  })
  
  return {
    byStation: Object.values(byStation).sort((a, b) => b.count - a.count),
    byType: byType,
    totalReports: dustReports.length,
    stationData: enhancedReports, // Enhanced with METAR strings
    byCountry: {}, // Placeholder - will be calculated in PDF generator
  }
}

// Helper function to construct METAR string from report fields
function constructMetarString(report) {
  const parts = []
  
  // Station
  if (report.station) parts.push(report.station)
  
  // Time
  if (report.valid) {
    const date = new Date(report.valid)
    const day = date.getUTCDate().toString().padStart(2, '0')
    const hour = date.getUTCHours().toString().padStart(2, '0')
    const minute = date.getUTCMinutes().toString().padStart(2, '0')
    parts.push(`${day}${hour}${minute}Z`)
  }
  
  // Wind
  if (report.drct && report.sknt) {
    const dir = report.drct.toString().padStart(3, '0')
    const speed = Math.round(report.sknt).toString().padStart(2, '0')
    if (report.gust_sknt && report.gust_sknt > report.sknt) {
      const gust = Math.round(report.gust_sknt).toString().padStart(2, '0')
      parts.push(`${dir}${speed}G${gust}KT`)
    } else {
      parts.push(`${dir}${speed}KT`)
    }
  }
  
  // Visibility
  if (report.vsby) {
    const vis = Math.round(parseFloat(report.vsby) * 1609.34) // miles to meters
    parts.push(vis.toString())
  }
  
  // Weather codes
  if (report.wxcodes) {
    parts.push(report.wxcodes)
  }
  
  // Temperature/Dewpoint
  if (report.tmpf && report.dwpf) {
    const temp = Math.round((report.tmpf - 32) * 5 / 9)
    const dew = Math.round((report.dwpf - 32) * 5 / 9)
    parts.push(`${temp}/${dew}`)
  }
  
  // Pressure
  if (report.mslp) {
    const pressure = Math.round(report.mslp)
    parts.push(`Q${pressure}`)
  }
  
  return parts.join(' ')
}

export default app
