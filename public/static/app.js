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

// Download PDF
document.getElementById('downloadBtn').addEventListener('click', () => {
    const reportContent = document.getElementById('reportContent').innerText;
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dust_report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

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
