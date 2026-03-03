// Enhanced PDF Generator with Large Wind Roses and NCM Logo
// Integrates Python-generated wind roses for each dust station

class EnhancedDustReportPDFGenerator {
    constructor() {
        this.doc = null;
        this.pageWidth = 210;
        this.pageHeight = 297;
        this.margin = 20;
        this.currentY = 20;
        
        this.colors = {
            primary: [41, 128, 185],
            secondary: [52, 73, 94],
            danger: [231, 76, 60],
            warning: [243, 156, 18],
            success: [46, 204, 113],
            text: [44, 62, 80],
            lightGray: [236, 240, 241]
        };
    }

    initialize() {
        const { jsPDF } = window.jspdf;
        this.doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        this.currentY = this.margin;
    }

    // Enhanced header with NCM logo (larger and centered)
    async addEnhancedHeader(reportDate) {
        // Add NCM Logo - larger and centered
        try {
            const logoImg = document.getElementById('ncm-logo-img');
            if (logoImg && logoImg.complete) {
                // Center logo at top with larger size
                const logoWidth = 80;  // Larger logo
                const logoHeight = 30;
                const logoX = (this.pageWidth - logoWidth) / 2;
                
                this.doc.addImage(logoImg, 'PNG', logoX, this.currentY, logoWidth, logoHeight);
                this.currentY += logoHeight + 5;
            }
        } catch (e) {
            console.warn('Logo not loaded:', e);
        }

        // Bilingual title
        this.doc.setFontSize(18);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text('Sand and Dust Storm Regional Center', this.pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += 7;

        this.doc.setFontSize(16);
        this.doc.text('المركز الإقليمي للعواصف الغبارية والرملية', this.pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += 10;

        // Report title
        this.doc.setFontSize(16);
        this.doc.setTextColor(...this.colors.secondary);
        this.doc.text('Dust and Sandstorm Events Report', this.pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += 7;
        
        this.doc.setFontSize(14);
        this.doc.text('تقرير أحداث العواصف الغبارية والرملية', this.pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += 10;

        // Date
        const dateObj = new Date(reportDate);
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        });
        
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(100, 100, 100);
        this.doc.text(`Report Date: ${formattedDate}`, this.pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += 10;

        // Separator line
        this.doc.setDrawColor(...this.colors.primary);
        this.doc.setLineWidth(0.5);
        this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
        this.currentY += 7;
    }

    // Add wind rose for a specific station (LARGE)
    async addLargeWindRose(station, metar_records) {
        // Start new page for each station with wind rose
        this.doc.addPage();
        this.currentY = this.margin;

        // Add small NCM logo in header
        try {
            const logoImg = document.getElementById('ncm-logo-img');
            if (logoImg && logoImg.complete) {
                this.doc.addImage(logoImg, 'PNG', this.pageWidth - 50, 10, 40, 15);
            }
        } catch (e) {
            console.warn('Logo not loaded:', e);
        }

        // Station header
        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...this.colors.secondary);
        this.doc.text(`Station: ${station.station}`, this.margin, this.currentY);
        this.currentY += 7;

        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(...this.colors.text);
        this.doc.text(`Code: ${station.station}`, this.margin, this.currentY);
        this.currentY += 5;
        this.doc.text(`Dust Reports: ${station.count}`, this.margin, this.currentY);
        this.currentY += 10;

        // Generate wind rose via Python API
        try {
            console.log(`Generating wind rose for station ${station.station}...`);
            
            const response = await fetch('/api/generate-wind-rose', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    station_code: station.station,
                    station_name: station.station,
                    metar_records: metar_records.filter(r => r.station === station.station)
                })
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.image_base64) {
                    // Add wind rose image - LARGE (140mm x 140mm)
                    const roseSize = 140;
                    const roseX = (this.pageWidth - roseSize) / 2;
                    const roseY = this.currentY;

                    this.doc.addImage(
                        `data:image/png;base64,${data.image_base64}`,
                        'PNG',
                        roseX,
                        roseY,
                        roseSize,
                        roseSize
                    );

                    this.currentY += roseSize + 10;
                } else {
                    this.doc.setFontSize(10);
                    this.doc.setTextColor(150, 150, 150);
                    this.doc.text('Wind data not available for this station', this.pageWidth / 2, this.currentY, { align: 'center' });
                    this.currentY += 10;
                }
            } else {
                throw new Error('Failed to generate wind rose');
            }
        } catch (error) {
            console.error('Error generating wind rose:', error);
            this.doc.setFontSize(10);
            this.doc.setTextColor(200, 100, 100);
            this.doc.text('Error: Could not generate wind rose', this.pageWidth / 2, this.currentY, { align: 'center' });
            this.currentY += 10;
        }

        // Add METAR table below wind rose
        await this.addStationDetails(station);
    }

    // Generate full report with wind roses
    async generateReport(analysis, metar_records, reportDate) {
        this.initialize();

        // Page 1: Title and Summary
        await this.addEnhancedHeader(reportDate);
        this.addSummary(analysis);

        // Page 2+: Wind roses for each station with dust
        const stationsWithDust = analysis.byStation.filter(s => s.count > 0);

        for (const station of stationsWithDust) {
            await this.addLargeWindRose(station, metar_records);
        }

        // Final page: Country summary
        this.addCountrySummary(analysis);
        this.addFooter();

        return this.doc;
    }

    addSummary(analysis) {
        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...this.colors.secondary);
        this.doc.text('Summary Statistics', this.margin, this.currentY);
        this.currentY += 10;

        const stats = [
            `Total Dust Reports: ${analysis.totalReports}`,
            `Severe Storms (+DS/+SS): ${analysis.byType.severe}`,
            `Dust Storms (DS/SS): ${analysis.byType.storm}`,
            `Blowing Dust (BLDU): ${analysis.byType.blowing}`,
            `Suspended Dust (DU): ${analysis.byType.suspended}`,
            `Active Stations: ${analysis.byStation.length}`
        ];

        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(...this.colors.text);

        stats.forEach(stat => {
            this.doc.text(stat, this.margin + 5, this.currentY);
            this.currentY += 6;
        });

        this.currentY += 10;
    }

    async addStationDetails(station) {
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...this.colors.secondary);
        this.doc.text('Detailed METAR Observations', this.margin, this.currentY);
        this.currentY += 7;

        if (station.reports && station.reports.length > 0) {
            const tableData = station.reports.slice(0, 10).map(r => [
                r.valid ? r.valid.substring(11, 16) + 'Z' : 'N/A',
                r.wxcodes || '-',
                `${r.drct || 'M'}° @ ${r.sknt || 'M'}kt`,
                r.vsby && r.vsby !== 'M' ? Math.round(parseFloat(r.vsby) * 1609) + 'm' : 'M'
            ]);

            this.doc.autoTable({
                startY: this.currentY,
                head: [['Time (UTC)', 'Weather', 'Wind', 'Visibility']],
                body: tableData,
                theme: 'striped',
                headStyles: {
                    fillColor: this.colors.secondary,
                    textColor: [255, 255, 255],
                    fontSize: 10
                },
                bodyStyles: {
                    fontSize: 9
                },
                margin: { left: this.margin, right: this.margin }
            });

            this.currentY = this.doc.lastAutoTable.finalY + 5;
        }
    }

    addCountrySummary(analysis) {
        // Implementation for country summary table
        // Similar to existing code
    }

    addFooter() {
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'italic');
        this.doc.setTextColor(120, 120, 120);
        const disclaimer = 'Note: This report provides preliminary analysis. Review by certified meteorologist recommended.';
        this.doc.text(disclaimer, this.pageWidth / 2, this.pageHeight - 10, { align: 'center' });
    }

    save(filename) {
        this.doc.save(filename);
    }
}

// Export for use in app.js
window.EnhancedDustReportPDFGenerator = EnhancedDustReportPDFGenerator;
