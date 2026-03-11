/**
 * 🔄 Oracle APEX Auto-Sync Integration
 * ====================================
 * 
 * هذا الملف يربط نظام METAR مع قاعدة بيانات Oracle APEX تلقائياً
 * 
 * الميزات:
 * - حفظ تلقائي بعد تحليل البيانات
 * - دعم الحفظ الفردي والجماعي
 * - معالجة الأخطاء والتكرار
 * - إشعارات النجاح/الفشل
 * 
 * @author Dust Storm Reporter Team
 * @version 1.0.0
 */

// =========================
// Configuration
// =========================

const ORACLE_CONFIG = {
    // Oracle APEX Base URL
    BASE_URL: 'http://193.122.89.34/ncmapp/dustws/metar',
    
    // API Endpoints
    ENDPOINTS: {
        SAVE_SINGLE: '/save/',      // حفظ سجل واحد
        SAVE_BATCH: '/save-batch/', // حفظ مجموعة سجلات
        GET_STATS: '/stats/',       // إحصائيات
        CHECK_HEALTH: '/health/'    // التحقق من الاتصال
    },
    
    // Auto-sync settings
    AUTO_SYNC_ENABLED: true,        // تفعيل الحفظ التلقائي
    BATCH_SIZE: 50,                 // عدد السجلات لكل دفعة
    RETRY_ATTEMPTS: 3,              // عدد محاولات إعادة المحاولة
    RETRY_DELAY: 1000               // التأخير بين المحاولات (ms)
};

// =========================
// State Management
// =========================

let syncState = {
    isSyncing: false,
    lastSyncTime: null,
    totalSynced: 0,
    errors: []
};

// =========================
// Core Functions
// =========================

/**
 * حفظ سجل واحد في Oracle
 * @param {Object} record - بيانات المحطة
 * @returns {Promise<Object>} نتيجة الحفظ
 */
async function saveToOracle(record) {
    const url = ORACLE_CONFIG.BASE_URL + ORACLE_CONFIG.ENDPOINTS.SAVE_SINGLE;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(record)
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ تم حفظ السجل:', record.station);
        } else {
            console.warn('⚠️ فشل حفظ السجل:', record.station, result.error);
        }
        
        return result;
        
    } catch (error) {
        console.error('❌ خطأ في الاتصال:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * حفظ مجموعة سجلات في Oracle (Batch Insert)
 * @param {Array} records - مصفوفة من السجلات
 * @returns {Promise<Object>} نتيجة الحفظ
 */
async function saveBatchToOracle(records) {
    const url = ORACLE_CONFIG.BASE_URL + ORACLE_CONFIG.ENDPOINTS.SAVE_BATCH;
    
    console.log(`🔄 جاري حفظ ${records.length} سجل...`);
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ records })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log(`✅ تم حفظ ${result.saved} سجل بنجاح`);
            if (result.errors > 0) {
                console.warn(`⚠️ فشل حفظ ${result.errors} سجل`);
            }
        }
        
        return result;
        
    } catch (error) {
        console.error('❌ خطأ في الحفظ الجماعي:', error);
        return {
            success: false,
            saved: 0,
            errors: records.length,
            error: error.message
        };
    }
}

/**
 * حفظ تلقائي بعد تحليل البيانات
 * @param {Object} analysis - نتائج التحليل
 * @param {Array} rawData - البيانات الخام
 * @returns {Promise<Object>} نتيجة الحفظ
 */
async function autoSyncAfterAnalysis(analysis, rawData) {
    // التحقق من التفعيل
    if (!ORACLE_CONFIG.AUTO_SYNC_ENABLED) {
        console.log('⏸️ الحفظ التلقائي معطل');
        return { success: false, message: 'Auto-sync disabled' };
    }
    
    // التحقق من حالة المزامنة
    if (syncState.isSyncing) {
        console.log('⏳ جاري المزامنة بالفعل...');
        return { success: false, message: 'Sync already in progress' };
    }
    
    syncState.isSyncing = true;
    
    try {
        console.log('🔄 بدء الحفظ التلقائي...');
        console.log(`📊 إجمالي السجلات: ${analysis.totalReports}`);
        
        // تحويل البيانات إلى صيغة Oracle
        const records = prepareRecordsForOracle(rawData, analysis);
        
        if (records.length === 0) {
            console.log('⚠️ لا توجد بيانات للحفظ');
            return { success: true, saved: 0 };
        }
        
        // تقسيم إلى دفعات
        const batches = chunkArray(records, ORACLE_CONFIG.BATCH_SIZE);
        console.log(`📦 تقسيم إلى ${batches.length} دفعة`);
        
        let totalSaved = 0;
        let totalErrors = 0;
        
        // حفظ كل دفعة
        for (let i = 0; i < batches.length; i++) {
            console.log(`📤 دفعة ${i + 1}/${batches.length}`);
            
            const result = await saveBatchToOracle(batches[i]);
            
            if (result.success) {
                totalSaved += result.saved || 0;
                totalErrors += result.errors || 0;
            } else {
                totalErrors += batches[i].length;
            }
            
            // تأخير بسيط بين الدفعات
            if (i < batches.length - 1) {
                await sleep(500);
            }
        }
        
        // تحديث الحالة
        syncState.lastSyncTime = new Date();
        syncState.totalSynced += totalSaved;
        
        // عرض النتيجة
        const summary = {
            success: totalSaved > 0,
            saved: totalSaved,
            errors: totalErrors,
            timestamp: syncState.lastSyncTime
        };
        
        console.log('📊 ملخص الحفظ:', summary);
        
        // إشعار المستخدم
        if (totalSaved > 0) {
            showNotification('success', `تم حفظ ${totalSaved} سجل في قاعدة البيانات`);
        }
        
        if (totalErrors > 0) {
            showNotification('warning', `فشل حفظ ${totalErrors} سجل`);
        }
        
        return summary;
        
    } catch (error) {
        console.error('❌ خطأ في الحفظ التلقائي:', error);
        syncState.errors.push({
            timestamp: new Date(),
            error: error.message
        });
        return {
            success: false,
            error: error.message
        };
        
    } finally {
        syncState.isSyncing = false;
    }
}

/**
 * تحضير البيانات لحفظها في Oracle
 * @param {String} csvData - البيانات بصيغة CSV
 * @param {Object} analysis - نتائج التحليل
 * @returns {Array} مصفوفة من السجلات الجاهزة
 */
function prepareRecordsForOracle(csvData, analysis) {
    const lines = csvData.trim().split('\n');
    if (lines.length <= 1) return [];
    
    const headers = lines[0].split(',');
    const records = [];
    
    // تخطي الصف الأول (العناوين)
    for (let i = 1; i < lines.length; i++) {
        try {
            const values = lines[i].split(',');
            const record = {};
            
            // تحويل CSV إلى Object
            headers.forEach((header, index) => {
                record[header.trim()] = values[index]?.trim() || null;
            });
            
            // تصفية: فقط السجلات التي تحتوي على ظواهر غبارية
            const wxcodes = record.wxcodes || record.weather_codes || '';
            if (wxcodes && hasDustPhenomena(wxcodes)) {
                records.push({
                    station: record.station,
                    valid: record.valid,
                    tmpf: parseFloat(record.tmpf) || null,
                    dwpf: parseFloat(record.dwpf) || null,
                    sknt: parseFloat(record.sknt) || null,
                    drct: parseFloat(record.drct) || null,
                    vsby: parseFloat(record.vsby) || null,
                    alti: parseFloat(record.alti) || null,
                    wxcodes: wxcodes,
                    skyc1: record.skyc1 || null,
                    metar: record.metar || null,
                    lat: parseFloat(record.lat) || null,
                    lon: parseFloat(record.lon) || null
                });
            }
            
        } catch (error) {
            console.warn(`⚠️ تخطي السطر ${i}:`, error.message);
        }
    }
    
    return records;
}

/**
 * التحقق من وجود ظواهر غبارية
 * @param {String} wxcodes - رموز الطقس
 * @returns {Boolean}
 */
function hasDustPhenomena(wxcodes) {
    const dustCodes = ['DS', 'SS', '+DS', '+SS', 'BLDU', 'BLSA', 'DU', 'SA', 'HZ'];
    return dustCodes.some(code => wxcodes.includes(code));
}

/**
 * تقسيم المصفوفة إلى دفعات
 * @param {Array} array - المصفوفة الأصلية
 * @param {Number} size - حجم كل دفعة
 * @returns {Array} مصفوفة من الدفعات
 */
function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

/**
 * انتظار لمدة محددة
 * @param {Number} ms - المدة بالميلي ثانية
 * @returns {Promise}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * عرض إشعار للمستخدم
 * @param {String} type - نوع الإشعار (success, warning, error)
 * @param {String} message - نص الرسالة
 */
function showNotification(type, message) {
    const colors = {
        success: 'bg-green-600',
        warning: 'bg-yellow-600',
        error: 'bg-red-600'
    };
    
    const icons = {
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle',
        error: 'fa-times-circle'
    };
    
    const notification = document.createElement('div');
    notification.className = `fixed top-4 left-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in`;
    notification.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas ${icons[type]} text-xl"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('animate-fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * التحقق من صحة الاتصال مع Oracle
 * @returns {Promise<Boolean>}
 */
async function checkOracleConnection() {
    try {
        const response = await fetch(ORACLE_CONFIG.BASE_URL + ORACLE_CONFIG.ENDPOINTS.CHECK_HEALTH);
        return response.ok;
    } catch (error) {
        console.error('❌ فشل الاتصال بـ Oracle:', error);
        return false;
    }
}

/**
 * الحصول على إحصائيات الحفظ
 * @returns {Object}
 */
function getSyncStats() {
    return {
        ...syncState,
        autoSyncEnabled: ORACLE_CONFIG.AUTO_SYNC_ENABLED
    };
}

// =========================
// Export
// =========================

// تصدير الدوال للاستخدام في app.js
window.OracleSync = {
    saveToOracle,
    saveBatchToOracle,
    autoSyncAfterAnalysis,
    checkOracleConnection,
    getSyncStats,
    config: ORACLE_CONFIG
};

console.log('✅ Oracle Auto-Sync Module Loaded');
