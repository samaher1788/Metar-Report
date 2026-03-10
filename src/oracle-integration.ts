// =============================================================================
// Oracle APEX Integration - Auto Data Sync
// =============================================================================

/**
 * هذا الملف يحتوي على الدوال المطلوبة لإرسال بيانات METAR تلقائياً
 * إلى قاعدة بيانات Oracle APEX
 */

// =========================
// Oracle APEX Configuration
// =========================

interface OracleConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  workspace: string;
}

// سيتم تخزين هذه المعلومات في Cloudflare Environment Variables
const getOracleConfig = (env: any): OracleConfig => {
  return {
    baseUrl: env.ORACLE_APEX_URL || '',
    clientId: env.ORACLE_CLIENT_ID || '',
    clientSecret: env.ORACLE_CLIENT_SECRET || '',
    workspace: env.ORACLE_WORKSPACE || 'METAR'
  };
};

// =========================
// OAuth Token Management
// =========================

interface OAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
}

let cachedToken: OAuthToken | null = null;

/**
 * الحصول على OAuth Token من Oracle APEX
 */
async function getOAuthToken(config: OracleConfig): Promise<string> {
  // التحقق من وجود token صالح في الذاكرة
  if (cachedToken && Date.now() < cachedToken.expires_at) {
    return cachedToken.access_token;
  }

  try {
    const credentials = btoa(`${config.clientId}:${config.clientSecret}`);
    
    const response = await fetch(`${config.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      throw new Error(`OAuth failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // حفظ Token مع وقت انتهائه
    cachedToken = {
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
      expires_at: Date.now() + (data.expires_in * 1000) - 60000 // -1 minute buffer
    };

    return cachedToken.access_token;
  } catch (error) {
    console.error('OAuth Token Error:', error);
    throw error;
  }
}

// =========================
// Data Transformation
// =========================

/**
 * تحويل سجل METAR إلى الشكل المطلوب لـ Oracle
 */
function transformMetarRecord(record: any, network: string): any {
  return {
    station: record.station,
    valid: record.valid,
    lat: parseFloat(record.lat) || null,
    lon: parseFloat(record.lon) || null,
    tmpf: parseFloat(record.tmpf) || null,
    dwpf: parseFloat(record.dwpf) || null,
    drct: parseInt(record.drct) || null,
    sknt: parseFloat(record.sknt) || null,
    vsby: parseFloat(record.vsby) || null,
    mslp: parseFloat(record.mslp) || null,
    wxcodes: record.wxcodes || '',
    metar: record.metar || '',
    network: network
  };
}

// =========================
// API Integration Functions
// =========================

/**
 * إرسال سجل واحد إلى Oracle APEX
 */
async function sendReportToOracle(
  record: any,
  config: OracleConfig,
  token: string
): Promise<{ success: boolean; report_id?: number; error?: string }> {
  try {
    const response = await fetch(`${config.baseUrl}/metar/reports/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(record)
    });

    if (response.status === 409) {
      // Duplicate - already exists
      return { success: true, report_id: -1 }; // تم تخطيه
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || response.statusText);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Send to Oracle failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * إرسال مجموعة سجلات دفعة واحدة (Batch)
 */
async function sendBatchToOracle(
  records: any[],
  network: string,
  config: OracleConfig
): Promise<{
  total: number;
  sent: number;
  skipped: number;
  failed: number;
  errors: string[];
}> {
  const results = {
    total: records.length,
    sent: 0,
    skipped: 0,
    failed: 0,
    errors: [] as string[]
  };

  if (records.length === 0) {
    return results;
  }

  try {
    // الحصول على Token
    const token = await getOAuthToken(config);

    // إرسال السجلات بشكل متوازي (max 10 في نفس الوقت)
    const batchSize = 10;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      const promises = batch.map(record => {
        const transformed = transformMetarRecord(record, network);
        return sendReportToOracle(transformed, config, token);
      });

      const batchResults = await Promise.all(promises);

      batchResults.forEach((result, index) => {
        if (result.success) {
          if (result.report_id === -1) {
            results.skipped++;
          } else {
            results.sent++;
          }
        } else {
          results.failed++;
          results.errors.push(`Record ${i + index}: ${result.error}`);
        }
      });
    }

    return results;
  } catch (error: any) {
    console.error('Batch send failed:', error);
    results.failed = records.length;
    results.errors.push(`Batch error: ${error.message}`);
    return results;
  }
}

/**
 * جلب إحصائيات من Oracle
 */
async function getStatisticsFromOracle(
  date: string,
  config: OracleConfig
): Promise<any[]> {
  try {
    const token = await getOAuthToken(config);
    
    const response = await fetch(
      `${config.baseUrl}/metar/statistics/${date}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch statistics: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get statistics failed:', error);
    return [];
  }
}

/**
 * جلب تقارير محطة معينة من Oracle
 */
async function getStationReportsFromOracle(
  station: string,
  date: string,
  config: OracleConfig
): Promise<any[]> {
  try {
    const token = await getOAuthToken(config);
    
    const response = await fetch(
      `${config.baseUrl}/metar/reports/${station}/${date}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch reports: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get station reports failed:', error);
    return [];
  }
}

// =========================
// Export
// =========================

export {
  getOracleConfig,
  getOAuthToken,
  transformMetarRecord,
  sendReportToOracle,
  sendBatchToOracle,
  getStatisticsFromOracle,
  getStationReportsFromOracle
};

export type { OracleConfig, OAuthToken };
