// Oracle APEX Database Integration Service
// خدمة ربط قاعدة بيانات Oracle APEX

export interface MetarRecord {
  station: string;
  valid: string;
  tmpf?: number;
  dwpf?: number;
  drct?: number;
  sknt?: number;
  vsby?: number;
  wxcodes?: string;
  lat?: number;
  lon?: number;
}

export interface DustEvent {
  eventDate: string;
  stationCode: string;
  countryCode: string;
  eventType: string;
  eventSeverity: string;
  visibilityMin?: number;
  windSpeedMax?: number;
}

export interface DailyStats {
  reportDate: string;
  networkCode: string;
  totalReports: number;
  dustReports: number;
  blowingDust: number;
  suspendedDust: number;
  dustStorms: number;
  sandStorms: number;
  countriesAffected: number;
}

export class OracleApexService {
  private baseUrl: string;
  private apiKey: string;
  
  constructor(baseUrl: string, apiKey?: string) {
    // إزالة الشرطة المائلة في النهاية إن وُجدت
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey || '';
  }
  
  /**
   * حفظ بيانات METAR الخام
   */
  async saveMetarData(reports: MetarRecord[]): Promise<{ success: boolean; inserted: number; errors?: string[] }> {
    try {
      console.log(`📤 Saving ${reports.length} METAR records to Oracle APEX...`);
      
      const response = await fetch(`${this.baseUrl}/dust/metar/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({ data: reports })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Oracle APEX Error (${response.status}): ${errorText}`);
      }
      
      const result = await response.json();
      console.log(`✅ Saved ${reports.length} records successfully`);
      
      return {
        success: true,
        inserted: reports.length,
        ...result
      };
    } catch (error) {
      console.error('❌ Error saving to Oracle APEX:', error);
      return {
        success: false,
        inserted: 0,
        errors: [error.message]
      };
    }
  }
  
  /**
   * حفظ أحداث الغبار
   */
  async saveDustEvents(events: DustEvent[]): Promise<{ success: boolean; inserted: number }> {
    try {
      console.log(`📤 Saving ${events.length} dust events...`);
      
      const response = await fetch(`${this.baseUrl}/dust/events/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({ events })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      console.log(`✅ Saved ${events.length} dust events`);
      return { success: true, inserted: events.length };
    } catch (error) {
      console.error('❌ Error saving dust events:', error);
      return { success: false, inserted: 0 };
    }
  }
  
  /**
   * حفظ الإحصائيات اليومية
   */
  async saveDailyStatistics(stats: DailyStats): Promise<{ success: boolean }> {
    try {
      console.log(`📤 Saving daily statistics for ${stats.reportDate}...`);
      
      const response = await fetch(`${this.baseUrl}/dust/statistics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify(stats)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      console.log(`✅ Saved daily statistics`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error saving statistics:', error);
      return { success: false };
    }
  }
  
  /**
   * جلب البيانات من Oracle APEX
   */
  async getMetarData(startDate: string, endDate: string, station?: string): Promise<MetarRecord[]> {
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        ...(station && { station })
      });
      
      const response = await fetch(`${this.baseUrl}/dust/metar?${params}`, {
        headers: {
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('❌ Error fetching from Oracle APEX:', error);
      return [];
    }
  }
  
  /**
   * اختبار الاتصال
   */
  async testConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/dust/health`, {
        headers: {
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      });
      
      if (response.ok) {
        return { connected: true, message: 'Connected to Oracle APEX successfully' };
      } else {
        return { connected: false, message: `HTTP ${response.status}: ${response.statusText}` };
      }
    } catch (error) {
      return { connected: false, message: error.message };
    }
  }
}

// مثال الاستخدام:
// const oracle = new OracleApexService(
//   'https://apex.oracle.com/pls/apex/your_workspace/api',
//   'your_api_key'
// );
// await oracle.saveMetarData(reports);
