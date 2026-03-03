// Enhanced PDF Generator - Matches Reference Report Format Exactly
// Based on Dust_Detailed_Report_20260112_2359.pdf

class ReferenceDustReportPDFGenerator {
    constructor() {
        this.doc = null;
        this.pageWidth = 210;
        this.pageHeight = 297;
        this.margin = 20;
        this.currentY = 20;
        
        this.colors = {
            primary: [0, 51, 102],      // Dark Blue
            secondary: [51, 102, 153],  // Medium Blue
            text: [0, 0, 0],            // Black
            gray: [128, 128, 128],      // Gray
            lightGray: [240, 240, 240]  // Light Gray
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

    // Page 1: Title and Summary (exactly like reference)
    async addTitlePage(reportDate, analysis, activeCountries) {
        // Main Title
        this.doc.setFontSize(18);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text('Dust and Sandstorm Events in Saudi Arabia and the Region', this.margin, this.currentY);
        this.currentY += 12;

        // Date
        const dateObj = new Date(reportDate);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = days[dateObj.getDay()];
        const formattedDate = `${dayName} - (${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()})`;
        
        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(`Start Date: ${formattedDate}`, this.margin, this.currentY);
        this.currentY += 10;

        // Summary paragraph
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(...this.colors.text);
        
        const countriesWithNoDust = activeCountries.filter(c => c.count === 0).map(c => c.name);
        const countriesWithDust = activeCountries.filter(c => c.count > 0).map(c => c.name);
        
        let summaryText = '';
        if (countriesWithDust.length === 0) {
            summaryText = 'On this day, no dust activity was reported across the region.';
        } else if (countriesWithDust.length === 1) {
            summaryText = `On this day, dust activity was reported in limited areas across the region, while no dust activity was observed over ${countriesWithNoDust.join(', ')}.`;
        } else {
            summaryText = `On this day, dust activity was reported in limited areas across the region.`;
        }
        
        const lines = this.doc.splitTextToSize(summaryText, this.pageWidth - 2 * this.margin);
        this.doc.text(lines, this.margin, this.currentY);
        this.currentY += lines.length * 5 + 5;

        // Countries with dust (bullet points)
        if (countriesWithDust.length > 0) {
            this.doc.text(`Dust activity was confined to ${countriesWithDust.length === 1 ? 'one country' : countriesWithDust.length + ' countries'} only:`, this.margin, this.currentY);
            this.currentY += 7;
            
            countriesWithDust.forEach(country => {
                this.doc.text(`• ${country}`, this.margin + 5, this.currentY);
                this.currentY += 6;
            });
            this.currentY += 3;
        }

        // Distribution of phenomena
        this.doc.text('The distribution of weather phenomena was as follows:', this.margin, this.currentY);
        this.currentY += 7;
        
        const phenomena = [
            { label: 'BLDU (Blowing Dust)', count: analysis.byType.blowing },
            { label: 'DU (Dust)', count: analysis.byType.suspended },
            { label: 'DS/SS (Storms)', count: analysis.byType.storm },
            { label: 'Severe (+DS/+SS)', count: analysis.byType.severe }
        ];
        
        phenomena.forEach(p => {
            const status = p.count > 0 ? (p.count > 10 ? 'dominant' : 'limited') : '0 reports';
            this.doc.text(`• ${p.label}: ${status}`, this.margin + 5, this.currentY);
            this.currentY += 6;
        });
        
        this.currentY += 5;

        // Country-specific summaries
        const stationsWithDust = analysis.byStation.filter(s => s.count > 0);
        const stationsByCountry = {};
        
        stationsWithDust.forEach(station => {
            const country = this.getCountryFromStation(station.station);
            if (!stationsByCountry[country]) {
                stationsByCountry[country] = [];
            }
            stationsByCountry[country].push(station);
        });

        for (const [country, stations] of Object.entries(stationsByCountry)) {
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(`${country} – Stations ${stations.map(s => s.station).join(', ')}`, this.margin, this.currentY);
            this.currentY += 7;
            
            this.doc.setFont('helvetica', 'normal');
            this.doc.text(`${country} recorded ${stations.length > 1 ? 'significant' : 'limited'} dust activity.`, this.margin, this.currentY);
            this.currentY += 7;
            
            // General characteristics
            this.doc.text('General characteristics across stations:', this.margin, this.currentY);
            this.currentY += 6;
            
            const minVis = Math.min(...stations.map(s => s.minVsby || 9999)) * 1609;
            const maxVis = Math.max(...stations.map(s => s.minVsby || 0)) * 1609;
            const minWind = Math.min(...stations.map(s => s.minWind || 0));
            const maxWind = Math.max(...stations.map(s => s.maxWind || 0));
            
            this.doc.text(`• Visibility: ranged between ${Math.round(minVis)}–${Math.round(maxVis)} m`, this.margin + 5, this.currentY);
            this.currentY += 6;
            this.doc.text(`• Wind speed: ranged between ${minWind}–${maxWind} kt`, this.margin + 5, this.currentY);
            this.currentY += 6;
            this.doc.text(`• Phenomena: ${stations[0].phenomena || 'BLDU, DU'}`, this.margin + 5, this.currentY);
            this.currentY += 8;
        }
    }

    // Page 2: Wind Rose (exactly like reference - page 2 is wind rose)
    async addWindRosePage(station, metarRecords) {
        this.doc.addPage();
        this.currentY = this.margin;

        // Title
        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text('Wind Rose Diagram', this.pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += 15;

        // Generate wind rose (call Python API)
        try {
            const response = await fetch('/api/generate-wind-rose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    station_code: station.station,
                    station_name: station.station,
                    metar_records: metarRecords.filter(r => r.station === station.station)
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.image_base64) {
                    // Large centered wind rose (140mm x 140mm)
                    const roseSize = 140;
                    const roseX = (this.pageWidth - roseSize) / 2;
                    
                    this.doc.addImage(
                        `data:image/png;base64,${data.image_base64}`,
                        'PNG',
                        roseX,
                        this.currentY,
                        roseSize,
                        roseSize
                    );
                    this.currentY += roseSize + 10;
                }
            }
        } catch (error) {
            console.error('Error generating wind rose:', error);
        }

        // Note at bottom
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'italic');
        this.doc.setTextColor(...this.colors.gray);
        const note = 'Note: This report provides a preliminary analysis of past weather data. It is not final and should be reviewed by a certified meteorologist for accuracy and context.';
        const noteLines = this.doc.splitTextToSize(note, this.pageWidth - 2 * this.margin);
        this.doc.text(noteLines, this.margin, this.pageHeight - 20);
    }

    // Page 3: Summary Table (exactly like reference)
    addSummaryTable(analysis, activeCountries) {
        this.doc.addPage();
        this.currentY = this.margin;

        // Title
        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text('Summary of Dust and Sandstorm Events in Saudi Arabia and the Region:', this.margin, this.currentY);
        this.currentY += 10;

        // Country table
        const tableData = [];
        const countries = ['Saudi Arabia', 'Kuwait', 'Bahrain', 'Qatar', 'UAE', 'Oman', 'Yemen', 'Jordan', 'Iraq', 'Syria', 'Lebanon', 'Iran'];
        
        countries.forEach(country => {
            const countryData = activeCountries.find(c => c.name === country) || { bldu: 0, blsa: 0, du: 0, sa: 0, ss: 0, ds: 0, po: 0 };
            const total = (countryData.bldu || 0) + (countryData.du || 0) + (countryData.ds || 0) + (countryData.ss || 0);
            
            tableData.push([
                country,
                countryData.bldu || 0,
                countryData.blsa || 0,
                countryData.du || 0,
                countryData.sa || 0,
                countryData.ss || 0,
                countryData.ds || 0,
                countryData.po || 0,
                total
            ]);
        });

        this.doc.autoTable({
            startY: this.currentY,
            head: [['Country', 'BLDU', 'BLSA', 'DU', 'SA', 'SS', 'DS', 'PO', 'Total']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [211, 211, 211],
                textColor: [0, 0, 0],
                fontSize: 10,
                fontStyle: 'bold',
                halign: 'center'
            },
            bodyStyles: {
                fontSize: 9,
                halign: 'center'
            },
            columnStyles: {
                0: { halign: 'left' }
            },
            margin: { left: this.margin, right: this.margin }
        });

        this.currentY = this.doc.lastAutoTable.finalY + 10;

        // Summary statistics
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'bold');
        
        const stats = [
            `Total Reports in Saudi Arabia: ${analysis.saudiTotal || 0}`,
            `Total Reports in the Region: ${analysis.totalReports}`,
            '',
            `BLDU (Blowing Dust): ${analysis.byType.blowing}`,
            `BLSA (Blowing Sand): 0`,
            `DU (Dust): ${analysis.byType.suspended}`,
            `SA (Sand): 0`,
            `SS (Sandstorm): ${analysis.byType.storm}`,
            `DS (Duststorm): 0`,
            `PO (Dust Whirls): 0`
        ];

        stats.forEach(stat => {
            if (stat === '') {
                this.currentY += 3;
            } else {
                this.doc.text(stat, this.margin, this.currentY);
                this.currentY += 6;
            }
        });
    }

    // Pages 4+: Station Details (exactly like reference format)
    addStationDetails(station) {
        this.doc.addPage();
        this.currentY = this.margin;

        const country = this.getCountryFromStation(station.station);

        // Station header
        this.doc.setFontSize(13);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text(`${country} - Station ${station.station}`, this.margin, this.currentY);
        this.currentY += 10;

        // METAR raw data
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('METAR:', this.margin, this.currentY);
        this.currentY += 6;

        this.doc.setFont('courier', 'normal');
        this.doc.setFontSize(8);
        
        if (station.reports && station.reports.length > 0) {
            station.reports.slice(0, 10).forEach(report => {
                if (report.metar) {
                    const metarLines = this.doc.splitTextToSize(report.metar, this.pageWidth - 2 * this.margin);
                    this.doc.text(metarLines, this.margin, this.currentY);
                    this.currentY += metarLines.length * 4;
                }
            });
        }

        this.currentY += 5;

        // Reported Weather Codes
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(10);
        this.doc.text('Reported Weather Codes (wxcodes):', this.margin, this.currentY);
        this.currentY += 6;

        this.doc.setFont('helvetica', 'normal');
        const codes = [...new Set(station.reports.map(r => r.wxcodes).filter(w => w))];
        codes.forEach(code => {
            this.doc.text(`- ${code}`, this.margin + 5, this.currentY);
            this.currentY += 5;
        });

        this.currentY += 5;

        // Detailed table (like reference)
        const tableData = station.reports.slice(0, 10).map(r => {
            const tempC = r.tmpf && r.tmpf !== 'M' ? Math.round((parseFloat(r.tmpf) - 32) * 5/9) : 'M';
            const dewC = r.dwpf && r.dwpf !== 'M' ? Math.round((parseFloat(r.dwpf) - 32) * 5/9) : 'M';
            const windKt = r.sknt || 'M';
            const windKmh = windKt !== 'M' ? Math.round(windKt * 1.852) : 'M';
            const visMeter = r.vsby && r.vsby !== 'M' ? Math.round(parseFloat(r.vsby) * 1609) : 'M';
            
            // Direction with compass
            let dirText = r.drct || 'M';
            if (dirText !== 'M') {
                const deg = parseInt(dirText);
                const compass = this.getCompassDirection(deg);
                dirText = `${deg}°/${compass}`;
            }

            return [
                r.valid ? r.valid.substring(11, 16) : 'M',
                `${tempC}/${dewC}`,
                `${windKt}/${windKmh}`,
                dirText,
                visMeter === 'M' ? 'M' : visMeter,
                r.wxcodes || '-'
            ];
        });

        this.doc.autoTable({
            startY: this.currentY,
            head: [['Time (UTC)', 'Temp/Dew (°C)', 'Wind (kt/kmh)', 'Direction', 'Visibility (m)', 'wxcodes']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [211, 211, 211],
                textColor: [0, 0, 0],
                fontSize: 9,
                fontStyle: 'bold'
            },
            bodyStyles: {
                fontSize: 8
            },
            margin: { left: this.margin, right: this.margin }
        });

        this.currentY = this.doc.lastAutoTable.finalY + 7;

        // Summary line (like reference)
        const minWind = Math.min(...station.reports.map(r => r.sknt || 999).filter(w => w !== 'M'));
        const maxWind = Math.max(...station.reports.map(r => r.sknt || 0).filter(w => w !== 'M'));
        const avgDir = Math.round(station.avgDirection || 0);
        const compass = this.getCompassDirection(avgDir);
        const minVis = Math.round(station.minVsby * 1609);
        
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFontSize(10);
        this.doc.text(`Wind: ${minWind}-${maxWind} kt | Dir: ${avgDir}°/${compass} | Min vis: ${minVis} m | Phenomena: ${station.phenomena || 'BLDU, DU'}`, this.margin, this.currentY);
    }

    // Helper: Get compass direction from degrees
    getCompassDirection(degrees) {
        const directions = ['North', 'North-Northeast', 'Northeast', 'East-Northeast', 'East', 'East-Southeast', 'Southeast', 'South-Southeast', 'South', 'South-Southwest', 'Southwest', 'West-Southwest', 'West', 'West-Northwest', 'Northwest', 'North-Northwest'];
        const index = Math.round(degrees / 22.5) % 16;
        return directions[index];
    }

    // Helper: Get country from station code
    getCountryFromStation(stationCode) {
        const countryMap = {
            'OE': 'Saudi Arabia',
            'OK': 'Kuwait',
            'OB': 'Bahrain',
            'OT': 'Qatar',
            'OM': 'UAE',
            'OO': 'Oman',
            'OY': 'Yemen',
            'OJ': 'Jordan',
            'OR': 'Iraq',
            'OS': 'Syria',
            'OL': 'Lebanon',
            'OI': 'Iran'
        };
        
        const prefix = stationCode.substring(0, 2);
        return countryMap[prefix] || 'Unknown';
    }

    // Main generation method
    async generateReport(analysis, metarRecords, reportDate, activeCountries) {
        this.initialize();

        // Page 1: Title and Summary
        await this.addTitlePage(reportDate, analysis, activeCountries);

        // Page 2: Wind Rose for first station
        const stationsWithDust = analysis.byStation.filter(s => s.count > 0);
        if (stationsWithDust.length > 0) {
            await this.addWindRosePage(stationsWithDust[0], metarRecords);
        }

        // Page 3: Summary Table
        this.addSummaryTable(analysis, activeCountries);

        // Pages 4+: Station Details
        stationsWithDust.forEach(station => {
            this.addStationDetails(station);
        });

        return this.doc;
    }

    save(filename) {
        this.doc.save(filename);
    }
}

// Export
window.ReferenceDustReportPDFGenerator = ReferenceDustReportPDFGenerator;
