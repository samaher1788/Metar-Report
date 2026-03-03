// State
let currentData = null;
let currentAnalysis = null;

// Initialize dates
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    document.getElementById('startDate').valueAsDate = yesterday;
    document.getElementById('endDate').valueAsDate = today;
});

// Generate Report Button
document.getElementById('generateBtn').addEventListener('click', async () => {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const network = document.getElementById('networkSelect').value;
    
    if (!startDate || !endDate) {
        alert('الرجاء اختيار التواريخ');
        return;
    }
    
    // Show loading
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('reportOutput').classList.add('hidden');
    document.getElementById('statsCards').classList.add('hidden');
    
    try {
        // Fetch METAR data
        const fetchResponse = await axios.get('/api/fetch-metar', {
            params: { network, start_date: startDate, end_date: endDate }
        });
        
        if (!fetchResponse.data.success) {
            throw new Error('فشل في جلب البيانات');
        }
        
        currentData = fetchResponse.data;
        
        // Analyze dust data
        const analyzeResponse = await axios.post('/api/analyze-dust', {
            csvData: fetchResponse.data.data
        });
        
        if (!analyzeResponse.data.success) {
            throw new Error('فشل في تحليل البيانات');
        }
        
        currentAnalysis = analyzeResponse.data.analysis;
        
        // Display report
        displayReport(currentData, currentAnalysis, startDate);
        
    } catch (error) {
        console.error('Error:', error);
        alert('حدث خطأ: ' + error.message);
    } finally {
        document.getElementById('loading').classList.add('hidden');
    }
});

// Display Report
function displayReport(data, analysis, reportDate) {
    const reportContent = document.getElementById('reportContent');
    const networkName = getNetworkName(data.network);
    const formattedDate = formatDate(reportDate);
    
    // Update statistics cards
    document.getElementById('severeCount').textContent = analysis.byType.severe;
    document.getElementById('stormCount').textContent = analysis.byType.storm;
    document.getElementById('blowingCount').textContent = analysis.byType.blowing;
    document.getElementById('suspendedCount').textContent = analysis.byType.suspended;
    document.getElementById('statsCards').classList.remove('hidden');
    
    // Display interactive map
    displayMap(analysis);
    
    let html = `
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">تقرير العواصف الغبارية والرملية</h1>
            <p class="text-lg text-gray-600 mb-1"><strong>المنطقة:</strong> ${networkName}</p>
            <p class="text-lg text-gray-600 mb-1"><strong>التاريخ:</strong> ${formattedDate}</p>
            <p class="text-lg text-gray-600"><strong>إجمالي التقارير:</strong> ${analysis.totalReports} تقرير غبار</p>
        </div>
        
        <div class="mb-8 p-6 bg-blue-50 rounded-lg border-r-4 border-blue-600">
            <h2 class="text-xl font-bold text-gray-800 mb-3">
                <i class="fas fa-chart-pie text-blue-600 ml-2"></i>
                ملخص الظواهر الجوية
            </h2>
            <div class="grid md:grid-cols-2 gap-4">
                <div>
                    <p class="text-gray-700"><strong>عواصف شديدة (+DS/+SS/TSDS/TSSS):</strong> ${analysis.byType.severe}</p>
                    <p class="text-gray-700"><strong>عواصف عادية (DS/SS):</strong> ${analysis.byType.storm}</p>
                </div>
                <div>
                    <p class="text-gray-700"><strong>غبار متطاير (BLDU/BLSA):</strong> ${analysis.byType.blowing}</p>
                    <p class="text-gray-700"><strong>غبار عالق (DU/SA):</strong> ${analysis.byType.suspended}</p>
                </div>
            </div>
        </div>
    `;
    
    if (analysis.totalReports === 0) {
        html += `
            <div class="p-6 bg-green-50 rounded-lg border-r-4 border-green-600">
                <p class="text-lg text-gray-700">
                    <i class="fas fa-check-circle text-green-600 ml-2"></i>
                    <strong>لم يتم رصد أي نشاط غبار في ${networkName} خلال هذا اليوم</strong>
                </p>
            </div>
        `;
    } else {
        html += `<h2 class="text-2xl font-bold text-gray-800 mb-4 mt-8">
            <i class="fas fa-map-marker-alt text-red-600 ml-2"></i>
            المحطات المتأثرة
        </h2>`;
        
        analysis.byStation.forEach((station, index) => {
            const severity = getSeverityColor(station.minVsby, station.maxWind);
            html += `
                <div class="station-card mb-4 p-6 bg-white rounded-lg border-r-4 ${severity.border} shadow-sm">
                    <h3 class="text-xl font-bold ${severity.text} mb-3">
                        ${index + 1}. المحطة ${station.station}
                    </h3>
                    <div class="grid md:grid-cols-3 gap-4">
                        <div class="bg-gray-50 p-3 rounded">
                            <p class="text-sm text-gray-600">عدد التقارير</p>
                            <p class="text-2xl font-bold text-gray-800">${station.count}</p>
                        </div>
                        <div class="bg-gray-50 p-3 rounded">
                            <p class="text-sm text-gray-600">أقل رؤية</p>
                            <p class="text-2xl font-bold text-gray-800">${station.minVsby < 9999 ? station.minVsby.toFixed(1) + ' ميل' : 'غير متوفر'}</p>
                        </div>
                        <div class="bg-gray-50 p-3 rounded">
                            <p class="text-sm text-gray-600">أقصى رياح</p>
                            <p class="text-2xl font-bold text-gray-800">${station.maxWind > 0 ? station.maxWind + ' عقدة' : 'غير متوفر'}</p>
                        </div>
                    </div>
                    
                    <div class="mt-4">
                        <button onclick="toggleDetails('station-${index}')" class="text-blue-600 hover:text-blue-800 font-semibold">
                            <i class="fas fa-chevron-down ml-1"></i>
                            عرض التفاصيل
                        </button>
                        <div id="station-${index}" class="hidden mt-3 bg-gray-50 p-4 rounded">
                            <table class="w-full text-sm">
                                <thead>
                                    <tr class="border-b border-gray-300">
                                        <th class="text-right py-2">الوقت (UTC)</th>
                                        <th class="text-right py-2">الظاهرة</th>
                                        <th class="text-right py-2">الرؤية</th>
                                        <th class="text-right py-2">الرياح</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${station.reports.map(r => `
                                        <tr class="border-b border-gray-200">
                                            <td class="py-2">${r.valid || 'N/A'}</td>
                                            <td class="py-2">${r.wxcodes || 'N/A'}</td>
                                            <td class="py-2">${r.vsby || 'N/A'}</td>
                                            <td class="py-2">${r.sknt || 'N/A'} عقدة</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        });
    }
    
    reportContent.innerHTML = html;
    document.getElementById('reportOutput').classList.remove('hidden');
}

// Toggle station details
window.toggleDetails = function(id) {
    const element = document.getElementById(id);
    element.classList.toggle('hidden');
}

// Download PDF (Enhanced Version - Matches Reference Report)
document.getElementById('downloadBtn').addEventListener('click', async () => {
    if (!currentAnalysis || !currentData) {
        alert('لا توجد بيانات لتوليد التقرير');
        return;
    }

    try {
        // Show loading
        document.getElementById('downloadBtn').innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> جاري التوليد...';
        document.getElementById('downloadBtn').disabled = true;

        // Prepare data for PDF
        const reportDate = document.getElementById('startDate').value;
        const network = document.getElementById('networkSelect').value;
        
        // Prepare METAR data in expected format
        const metarData = {
            startDate: reportDate,
            network: network,
            rawData: currentData.data
        };
        
        // Generate wind roses (client-side or prepare for Python backend)
        const windRoseData = await generateWindRoses(currentAnalysis);

        // Generate PDF using enhanced generator
        const pdfGen = new window.ReferenceDustReportPDFGenerator();
        await pdfGen.generateReport(metarData, currentAnalysis, windRoseData);

        // Reset button
        document.getElementById('downloadBtn').innerHTML = '<i class="fas fa-download mr-2"></i> تحميل PDF';
        document.getElementById('downloadBtn').disabled = false;

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('حدث خطأ في توليد PDF: ' + error.message);
        document.getElementById('downloadBtn').innerHTML = '<i class="fas fa-download mr-2"></i> تحميل PDF';
        document.getElementById('downloadBtn').disabled = false;
    }
});

// Helper function to get active countries
function getActiveCountries(analysis) {
    const active = [];
    if (analysis.totalReports > 0) {
        // Extract unique countries from station codes
        const stations = analysis.byStation.map(s => s.station);
        const countries = new Set();
        
        stations.forEach(station => {
            if (station.startsWith('OJ')) countries.add('Jordan');
            else if (station.startsWith('OM')) countries.add('United Arab Emirates');
            else if (station.startsWith('OE')) countries.add('Saudi Arabia');
            else if (station.startsWith('OK')) countries.add('Kuwait');
            else if (station.startsWith('OB')) countries.add('Bahrain');
            else if (station.startsWith('OO')) countries.add('Oman');
            else if (station.startsWith('OY')) countries.add('Yemen');
            else if (station.startsWith('OR')) countries.add('Iraq');
            else if (station.startsWith('OS')) countries.add('Syria');
        });
        
        return Array.from(countries);
    }
    return active;
}

// Helper function to get country summary
function getCountrySummary(analysis, selectedNetwork) {
    const countries = [
        'Saudi Arabia', 'Kuwait', 'Bahrain', 'Qatar', 'UAE',
        'Oman', 'Yemen', 'Jordan', 'Iraq', 'Syria', 'Lebanon', 'Iran'
    ];
    
    const summary = countries.map(country => ({
        country: country,
        bldu: 0,
        blsa: 0,
        du: 0,
        sa: 0,
        ds: 0,
        ss: 0,
        total: 0
    }));

    // Count by type
    analysis.byStation.forEach(station => {
        let countryIndex = -1;
        
        if (station.station.startsWith('OJ')) countryIndex = 7; // Jordan
        else if (station.station.startsWith('OM')) countryIndex = 4; // UAE
        else if (station.station.startsWith('OE')) countryIndex = 0; // Saudi Arabia
        
        if (countryIndex >= 0) {
            station.reports.forEach(report => {
                const codes = (report.wxcodes || '').split(/[\s,]+/);
                codes.forEach(code => {
                    if (code === 'BLDU') summary[countryIndex].bldu++;
                    else if (code === 'BLSA') summary[countryIndex].blsa++;
                    else if (code === 'DU') summary[countryIndex].du++;
                    else if (code === 'SA') summary[countryIndex].sa++;
                    else if (code.includes('DS')) summary[countryIndex].ds++;
                    else if (code.includes('SS')) summary[countryIndex].ss++;
                });
                summary[countryIndex].total++;
            });
        }
    });

    return summary;
}

// Helper function to calculate wind rose data
function calculateWindRose(analysis) {
    const directions = {};
    
    analysis.byStation.forEach(station => {
        station.reports.forEach(report => {
            if (report.drct && report.drct !== 'M') {
                const dir = Math.round(parseFloat(report.drct) / 45) * 45;
                directions[dir] = (directions[dir] || 0) + 1;
            }
        });
    });

    const total = Object.values(directions).reduce((a, b) => a + b, 0);
    
    return Object.entries(directions).map(([dir, count]) => ({
        direction: parseInt(dir),
        frequency: (count / total) * 100
    }));
}

// Helper function to enhance station data
function enhanceStationData(stations) {
    return stations.map(station => {
        const winds = [];
        const directions = [];
        const phenomena = new Set();

        station.reports.forEach(report => {
            if (report.sknt && report.sknt !== 'M') {
                winds.push(parseFloat(report.sknt));
            }
            if (report.drct && report.drct !== 'M') {
                directions.push(parseFloat(report.drct));
            }
            if (report.wxcodes) {
                report.wxcodes.split(/[\s,]+/).forEach(c => phenomena.add(c));
            }
        });

        return {
            ...station,
            minWind: winds.length > 0 ? Math.min(...winds) : 0,
            maxWind: winds.length > 0 ? Math.max(...winds) : 0,
            avgDirection: directions.length > 0 ? 
                getDirectionName(directions.reduce((a, b) => a + b, 0) / directions.length) : 'N/A',
            phenomena: Array.from(phenomena).join(', ')
        };
    });
}

// Get direction name from degrees
function getDirectionName(degrees) {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return `${Math.round(degrees)}°/${dirs[index]}`;
}

// Helper Functions
function getNetworkName(code) {
    const networks = {
        'SA__ASOS': 'المملكة العربية السعودية',
        'AE__ASOS': 'الإمارات العربية المتحدة',
        'KW__ASOS': 'الكويت',
        'BH__ASOS': 'البحرين',
        'QA__ASOS': 'قطر',
        'OM__ASOS': 'عمان',
        'JO__ASOS': 'الأردن',
        'IQ__ASOS': 'العراق',
        'YE__ASOS': 'اليمن',
        'IR__ASOS': 'إيران',
        'SY__ASOS': 'سوريا'
    };
    return networks[code] || code;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    return `${days[date.getDay()]} - ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function getSeverityColor(vsby, wind) {
    if (vsby < 1 || wind > 30) {
        return { border: 'border-red-600', text: 'text-red-700' };
    } else if (vsby < 3 || wind > 20) {
        return { border: 'border-orange-500', text: 'text-orange-700' };
    } else {
        return { border: 'border-yellow-500', text: 'text-yellow-700' };
    }
}

// Generate wind roses for all stations
// Client-side generation using Canvas
async function generateWindRoses(analysis) {
    console.log('📊 Generating wind roses...');
    
    const windRoseData = {};
    
    try {
        // Use simple client-side generator
        const generator = new window.SimpleWindRoseGenerator();
        
        // Group records by station
        const stationRecords = {};
        analysis.stationData.forEach(record => {
            const station = record.station;
            if (!stationRecords[station]) {
                stationRecords[station] = [];
            }
            stationRecords[station].push(record);
        });
        
        // Generate wind rose for each station
        for (const [station, records] of Object.entries(stationRecords)) {
            console.log(`  Processing ${station} (${records.length} records)...`);
            
            const imageBase64 = generator.generateWindRose(station, records);
            
            if (imageBase64) {
                windRoseData[station] = {
                    imageBase64: imageBase64,
                    recordCount: records.length
                };
                console.log(`  ✅ Generated wind rose for ${station}`);
            }
        }
        
        console.log(`✅ Generated ${Object.keys(windRoseData).length} wind roses`);
        return windRoseData;
        
    } catch (error) {
        console.error('❌ Wind rose generation failed:', error);
        return {};
    }
}

// Display Interactive Map
function displayMap(analysis) {
    console.log('🗺️ Displaying interactive map...');
    
    try {
        const mapContainer = document.getElementById('mapContainer');
        const mapElement = document.getElementById('dustMap');
        
        // Show map container
        mapContainer.classList.remove('hidden');
        
        // Clear any existing map
        mapElement.innerHTML = '';
        
        // Check if we have station data
        if (!analysis.stationData || analysis.stationData.length === 0) {
            mapElement.innerHTML = '<div class="flex items-center justify-center h-full bg-gray-100 rounded-lg"><p class="text-gray-500">لا توجد بيانات محطات لعرضها على الخريطة</p></div>';
            return;
        }
        
        // Initialize map generator
        const mapGenerator = new DustStormMapGenerator();
        mapGenerator.generateMap('dustMap', analysis);
        
        // Fit map to show all markers
        setTimeout(() => {
            mapGenerator.fitBounds();
        }, 500);
        
        console.log('✅ Map displayed successfully');
        
        // Also display 3D map
        display3DMap(analysis);
        
    } catch (error) {
        console.error('❌ Map display failed:', error);
        const mapElement = document.getElementById('dustMap');
        mapElement.innerHTML = `
            <div class="flex items-center justify-center h-full bg-red-50 rounded-lg border border-red-200">
                <p class="text-red-600">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    حدث خطأ في عرض الخريطة: ${error.message}
                </p>
            </div>
        `;
    }
}

// Display 3D Interactive Globe with Cesium
let cesiumGlobeGenerator = null;

async function display3DMap(analysis) {
    console.log('🌍 Displaying Cesium 3D Globe...');
    
    try {
        const map3DContainer = document.getElementById('map3DContainer');
        const map3DElement = document.getElementById('dustMap3D');
        
        // Show 3D map container
        map3DContainer.classList.remove('hidden');
        
        // Clear any existing map
        map3DElement.innerHTML = '';
        
        // Check if Cesium is loaded
        if (typeof Cesium === 'undefined') {
            console.error('❌ Cesium JS not loaded');
            map3DElement.innerHTML = `
                <div class="flex items-center justify-center h-full bg-yellow-50 rounded-lg border border-yellow-200">
                    <p class="text-yellow-700">
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        لم يتم تحميل Cesium JS. يرجى تحديث الصفحة.
                    </p>
                </div>
            `;
            return;
        }
        
        // Check if we have station data
        if (!analysis.stationData || analysis.stationData.length === 0) {
            map3DElement.innerHTML = '<div class="flex items-center justify-center h-full bg-gray-100 rounded-lg"><p class="text-gray-500">لا توجد بيانات محطات لعرضها على الخريطة</p></div>';
            return;
        }
        
        // Convert stationData to grouped format for 3D map
        console.log('📊 Converting station data for 3D globe...');
        const stationRecords = {};
        analysis.stationData.forEach(record => {
            const station = record.station;
            if (!stationRecords[station]) {
                stationRecords[station] = [];
            }
            stationRecords[station].push(record);
        });
        
        // Create grouped station data
        const groupedStationData = Object.entries(stationRecords).map(([station, records]) => ({
            station: station,
            records: records
        }));
        
        console.log(`✅ Converted ${groupedStationData.length} stations with records`);
        
        // Show loading indicator
        map3DElement.innerHTML = `
            <div class="flex items-center justify-center h-full bg-gray-50 rounded-lg">
                <div class="text-center">
                    <div class="loading mx-auto mb-4"></div>
                    <p class="text-gray-600">جاري تحميل الكرة الأرضية ثلاثية الأبعاد...</p>
                    <p class="text-gray-500 text-sm mt-2">Powered by Cesium - Free & Open Source</p>
                </div>
            </div>
        `;
        
        // Initialize Cesium globe generator
        cesiumGlobeGenerator = new CesiumGlobeMapGenerator();
        
        // Initialize viewer
        await cesiumGlobeGenerator.initializeViewer('dustMap3D');
        
        // Add station markers
        console.log('📍 Adding station markers...');
        groupedStationData.forEach(station => {
            if (station.records && station.records.length > 0) {
                cesiumGlobeGenerator.addStation3DMarker(station.station, station.records);
            }
        });
        
        // Fit camera to show all markers
        setTimeout(() => {
            cesiumGlobeGenerator.fitBounds();
        }, 1000);
        
        // Start auto-rotation
        setTimeout(() => {
            cesiumGlobeGenerator.startAutoRotation();
        }, 2000);
        
        // Setup control buttons
        setup3DMapControls();
        
        console.log('✅ Cesium 3D Globe displayed successfully');
        
    } catch (error) {
        console.error('❌ 3D Globe display failed:', error);
        const map3DElement = document.getElementById('dustMap3D');
        map3DElement.innerHTML = `
            <div class="flex items-center justify-center h-full bg-red-50 rounded-lg border border-red-200">
                <p class="text-red-600">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    حدث خطأ في عرض الكرة الأرضية ثلاثية الأبعاد: ${error.message}
                </p>
            </div>
        `;
    }
}
}

// Setup 3D Globe Control Buttons
function setup3DMapControls() {
    // Toggle rotation button
    const toggleRotationBtn = document.getElementById('toggleRotationBtn');
    if (toggleRotationBtn) {
        toggleRotationBtn.addEventListener('click', () => {
            if (cesiumGlobeGenerator) {
                cesiumGlobeGenerator.toggleAutoRotation();
                const icon = toggleRotationBtn.querySelector('i');
                if (cesiumGlobeGenerator.isRotating) {
                    toggleRotationBtn.classList.add('bg-green-600');
                    toggleRotationBtn.classList.remove('bg-blue-600');
                    icon.classList.add('fa-spin');
                } else {
                    toggleRotationBtn.classList.remove('bg-green-600');
                    toggleRotationBtn.classList.add('bg-blue-600');
                    icon.classList.remove('fa-spin');
                }
            }
        });
    }
    
    // Reset view button
    const resetViewBtn = document.getElementById('resetViewBtn');
    if (resetViewBtn) {
        resetViewBtn.addEventListener('click', () => {
            if (cesiumGlobeGenerator) {
                cesiumGlobeGenerator.resetView();
            }
        });
    }
}
    const resetViewBtn = document.getElementById('resetViewBtn');
    if (resetViewBtn) {
        resetViewBtn.addEventListener('click', () => {
            if (map3DGenerator) {
                map3DGenerator.fitBounds();
                console.log('🔄 View reset to default');
            }
        });
    }
    
    console.log('✅ 3D Map controls setup complete');
}
