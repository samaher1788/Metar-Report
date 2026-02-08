// PDF Generation Module using jsPDF from CDN
// Requires: jsPDF and jspdf-autotable loaded via CDN

class DustReportPDFGenerator {
    constructor() {
        this.doc = null;
        this.pageWidth = 210; // A4 width in mm
        this.pageHeight = 297; // A4 height in mm
        this.margin = 20;
        this.currentY = 20;
        
        // Colors
        this.colors = {
            primary: [41, 128, 185],    // Blue
            secondary: [52, 73, 94],    // Dark Blue
            danger: [231, 76, 60],      // Red
            warning: [243, 156, 18],    // Orange
            success: [46, 204, 113],    // Green
            text: [44, 62, 80],         // Dark Gray
            lightGray: [236, 240, 241]  // Light Gray
        };
    }

    initialize() {
        // Access jsPDF from window (loaded via CDN)
        const { jsPDF } = window.jspdf;
        this.doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        this.currentY = this.margin;
    }

    // Add Header with Logo and Title
    addHeader(reportDate) {
        const dateObj = new Date(reportDate);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = days[dateObj.getDay()];
        const formattedDate = `${dayName} - (${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()})`;

        // White background for header
        this.doc.setFillColor(255, 255, 255);
        this.doc.rect(0, 0, this.pageWidth, 50, 'F');

        // Add logo (left side)
        try {
            const logoImg = document.getElementById('ncm-logo-img');
            if (logoImg && logoImg.complete) {
                this.doc.addImage(logoImg, 'PNG', 10, 8, 30, 30);
            }
        } catch (e) {
            console.warn('Logo not loaded:', e);
        }

        // Title (center)
        this.doc.setTextColor(41, 69, 144); // Dark blue
        this.doc.setFontSize(18);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('المركز الإقليمي للعواصف الغبارية والرملية', this.pageWidth / 2, 18, { align: 'center' });
        
        this.doc.setFontSize(14);
        this.doc.setTextColor(0, 0, 0);
        this.doc.text('Sand and Dust Storm Regional Center', this.pageWidth / 2, 25, { align: 'center' });

        // Report title
        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(41, 128, 185);
        this.doc.text('Dust and Sandstorm Events Report', this.pageWidth / 2, 34, { align: 'center' });

        // Date
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(100, 100, 100);
        this.doc.text(`Start Date: ${formattedDate}`, this.pageWidth / 2, 42, { align: 'center' });

        // Blue line separator
        this.doc.setDrawColor(41, 128, 185);
        this.doc.setLineWidth(0.5);
        this.doc.line(this.margin, 48, this.pageWidth - this.margin, 48);

        this.currentY = 55;
    }

    // Add Summary Section
    addSummary(analysis, activeCountries) {
        this.doc.setTextColor(...this.colors.text);
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'normal');

        const summaryText = `On this day, dust activity was reported in limited areas across the region.`;
        this.doc.text(summaryText, this.margin, this.currentY);
        this.currentY += 10;

        if (activeCountries.length > 0) {
            this.doc.text('Dust activity was confined to:', this.margin, this.currentY);
            this.currentY += 7;

            activeCountries.forEach(country => {
                this.doc.setFontSize(10);
                this.doc.text(`• ${country}`, this.margin + 5, this.currentY);
                this.currentY += 6;
            });
        } else {
            this.doc.text('No dust activity was observed in any country.', this.margin, this.currentY);
            this.currentY += 7;
        }

        this.currentY += 5;

        // Phenomena Distribution
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Distribution of weather phenomena:', this.margin, this.currentY);
        this.currentY += 7;

        const phenomena = [
            { name: 'BLDU (Blowing Dust)', value: analysis.byType.blowing, dominant: analysis.byType.blowing > 5 },
            { name: 'DU (Dust)', value: analysis.byType.suspended, dominant: false },
            { name: 'DS/SS (Storms)', value: analysis.byType.storm, dominant: false },
            { name: 'Severe (+DS/+SS)', value: analysis.byType.severe, dominant: false }
        ];

        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(10);
        phenomena.forEach(p => {
            const status = p.value > 0 ? (p.dominant ? 'dominant' : `${p.value} reports`) : '0 reports';
            this.doc.text(`• ${p.name}: ${status}`, this.margin + 5, this.currentY);
            this.currentY += 6;
        });

        this.currentY += 10;
    }

    // Add Country Summary Table
    addCountrySummaryTable(countrySummary) {
        this.doc.setFontSize(14);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...this.colors.secondary);
        this.doc.text('Summary of Dust Events by Country', this.pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += 10;

        const tableData = countrySummary.map(c => [
            c.country,
            c.bldu.toString(),
            c.blsa.toString(),
            c.du.toString(),
            c.sa.toString(),
            c.ds.toString(),
            c.ss.toString(),
            c.total.toString()
        ]);

        this.doc.autoTable({
            startY: this.currentY,
            head: [['Country', 'BLDU', 'BLSA', 'DU', 'SA', 'DS', 'SS', 'Total']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: this.colors.primary,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center',
                fontSize: 9
            },
            bodyStyles: {
                textColor: this.colors.text,
                halign: 'center',
                fontSize: 8
            },
            alternateRowStyles: {
                fillColor: this.colors.lightGray
            },
            margin: { left: this.margin, right: this.margin }
        });

        this.currentY = this.doc.lastAutoTable.finalY + 15;
    }

    // Add Station Details
    addStationDetails(station) {
        // Check if we need a new page
        if (this.currentY > this.pageHeight - 60) {
            this.doc.addPage();
            this.currentY = this.margin;
        }

        // Station Header
        this.doc.setFillColor(...this.colors.primary);
        this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 8, 'F');
        
        this.doc.setTextColor(255, 255, 255);
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(`Station ${station.station}`, this.margin + 3, this.currentY + 5.5);
        this.currentY += 12;

        // Station Statistics
        this.doc.setTextColor(...this.colors.text);
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');

        const stats = [
            `Wind: ${station.minWind || 0}-${station.maxWind || 0} kt`,
            `Direction: ${station.avgDirection || 'N/A'}`,
            `Min Visibility: ${station.minVsby < 9999 ? Math.round(station.minVsby * 1609) + ' m' : 'N/A'}`,
            `Phenomena: ${station.phenomena || 'N/A'}`
        ];

        stats.forEach(stat => {
            this.doc.text(stat, this.margin + 3, this.currentY);
            this.currentY += 5;
        });

        this.currentY += 3;

        // METAR Reports Table
        if (station.reports && station.reports.length > 0) {
            const tableData = station.reports.slice(0, 15).map(r => {
                // Convert Fahrenheit to Celsius
                const tempC = r.tmpf && r.tmpf !== 'M' ? Math.round((parseFloat(r.tmpf) - 32) * 5/9) : 'M';
                const dewC = r.dwpf && r.dwpf !== 'M' ? Math.round((parseFloat(r.dwpf) - 32) * 5/9) : 'M';
                
                // Convert visibility from miles to meters
                const visMi = r.vsby && r.vsby !== 'M' ? Math.round(parseFloat(r.vsby) * 1609) : 'M';
                
                return [
                    r.valid ? r.valid.substring(11, 16) + 'Z' : 'N/A',
                    `${tempC}/${dewC}`,
                    r.sknt || 'M',
                    r.drct || 'M',
                    visMi === 'M' ? 'M' : visMi + 'm',
                    r.wxcodes || '-'
                ];
            });

            this.doc.autoTable({
                startY: this.currentY,
                head: [['Time (UTC)', 'Temp/Dew (°C)', 'Wind (kt)', 'Dir (°)', 'Visibility', 'Phenomena']],
                body: tableData,
                theme: 'striped',
                headStyles: {
                    fillColor: this.colors.secondary,
                    textColor: [255, 255, 255],
                    fontSize: 8,
                    fontStyle: 'bold'
                },
                bodyStyles: {
                    fontSize: 7,
                    textColor: this.colors.text
                },
                margin: { left: this.margin, right: this.margin },
                columnStyles: {
                    0: { cellWidth: 22 },
                    1: { cellWidth: 25 },
                    2: { cellWidth: 18 },
                    3: { cellWidth: 18 },
                    4: { cellWidth: 25 },
                    5: { cellWidth: 30 }
                }
            });

            this.currentY = this.doc.lastAutoTable.finalY + 10;
        }
    }

    // Add Wind Rose Diagram
    addWindRose(windData) {
        if (this.currentY > this.pageHeight - 80) {
            this.doc.addPage();
            this.currentY = this.margin;
        }

        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...this.colors.secondary);
        this.doc.text('Wind Rose Diagram', this.pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += 10;

        const centerX = this.pageWidth / 2;
        const centerY = this.currentY + 30;
        const radius = 25;

        // Draw circles with percentages
        this.doc.setDrawColor(200, 200, 200);
        this.doc.setLineWidth(0.3);
        [0.25, 0.5, 0.75, 1.0].forEach((fraction, i) => {
            const r = radius * fraction;
            this.doc.circle(centerX, centerY, r);
            
            // Add percentage labels
            this.doc.setFontSize(6);
            this.doc.setTextColor(150, 150, 150);
            const percentage = Math.round(fraction * 100);
            this.doc.text(`${percentage}%`, centerX + r + 2, centerY);
        });

        // Draw direction lines and labels
        const directions = [
            { name: 'N', angle: 0 },
            { name: 'NE', angle: 45 },
            { name: 'E', angle: 90 },
            { name: 'SE', angle: 135 },
            { name: 'S', angle: 180 },
            { name: 'SW', angle: 225 },
            { name: 'W', angle: 270 },
            { name: 'NW', angle: 315 }
        ];

        this.doc.setDrawColor(200, 200, 200);
        this.doc.setLineWidth(0.2);
        
        directions.forEach(dir => {
            const angle = (dir.angle - 90) * Math.PI / 180;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            this.doc.line(centerX, centerY, x, y);
            
            // Add labels
            const labelX = centerX + (radius + 6) * Math.cos(angle);
            const labelY = centerY + (radius + 6) * Math.sin(angle);
            this.doc.setFontSize(9);
            this.doc.setFont('helvetica', 'bold');
            this.doc.setTextColor(...this.colors.text);
            this.doc.text(dir.name, labelX, labelY, { align: 'center' });
        });

        // Draw wind frequency bars
        if (windData && windData.length > 0) {
            const maxFreq = Math.max(...windData.map(d => d.frequency));
            
            windData.forEach(data => {
                const angle = (data.direction - 90) * Math.PI / 180;
                const normalizedFreq = data.frequency / maxFreq;
                const length = radius * normalizedFreq * 0.9;
                
                // Draw wedge/bar
                const x1 = centerX + 2 * Math.cos(angle - 0.2);
                const y1 = centerY + 2 * Math.sin(angle - 0.2);
                const x2 = centerX + 2 * Math.cos(angle + 0.2);
                const y2 = centerY + 2 * Math.sin(angle + 0.2);
                const x3 = centerX + length * Math.cos(angle + 0.2);
                const y3 = centerY + length * Math.sin(angle + 0.2);
                const x4 = centerX + length * Math.cos(angle - 0.2);
                const y4 = centerY + length * Math.sin(angle - 0.2);
                
                this.doc.setFillColor(...this.colors.primary);
                this.doc.setDrawColor(...this.colors.primary);
                this.doc.setLineWidth(0.5);
                
                // Draw filled polygon
                this.doc.triangle(x1, y1, x2, y2, centerX + length * Math.cos(angle), centerY + length * Math.sin(angle), 'F');
            });
        }

        this.currentY += 70;
    }

    // Add Summary Statistics Box
    addStatisticsBox(analysis) {
        this.doc.setFillColor(245, 247, 250);
        this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 25, 'F');
        
        this.doc.setTextColor(...this.colors.secondary);
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Total Reports Summary', this.margin + 3, this.currentY + 6);
        
        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(...this.colors.text);
        
        const stats = [
            `BLDU (Blowing Dust): ${analysis.byType.blowing}`,
            `BLSA (Blowing Sand): 0`,
            `DU (Dust): ${analysis.byType.suspended}`,
            `SA (Sand): 0`,
            `SS (Sandstorm): ${analysis.byType.storm}`,
            `DS (Duststorm): ${analysis.byType.storm}`,
            `PO (Dust Whirls): 0`
        ];
        
        let x = this.margin + 3;
        let y = this.currentY + 12;
        const colWidth = 60;
        
        stats.forEach((stat, i) => {
            if (i > 0 && i % 3 === 0) {
                x = this.margin + 3;
                y += 5;
            }
            this.doc.text(stat, x, y);
            x += colWidth;
        });
        
        this.currentY += 30;
    }

    // Add Footer
    addFooter() {
        const pageCount = this.doc.internal.getNumberOfPages();
        
        for (let i = 1; i <= pageCount; i++) {
            this.doc.setPage(i);
            
            // Footer line
            this.doc.setDrawColor(...this.colors.lightGray);
            this.doc.setLineWidth(0.5);
            this.doc.line(this.margin, this.pageHeight - 15, this.pageWidth - this.margin, this.pageHeight - 15);
            
            // Footer text
            this.doc.setTextColor(100, 100, 100);
            this.doc.setFontSize(7);
            this.doc.setFont('helvetica', 'italic');
            
            const footerText = 'Note: This report provides a preliminary analysis of past weather data. It is not final and should be reviewed by a certified meteorologist for accuracy and context.';
            const splitText = this.doc.splitTextToSize(footerText, this.pageWidth - 2 * this.margin);
            
            this.doc.text(splitText, this.pageWidth / 2, this.pageHeight - 10, { align: 'center' });
            
            // Page number
            this.doc.setFont('helvetica', 'normal');
            this.doc.setFontSize(8);
            this.doc.text(`Page ${i} of ${pageCount}`, this.pageWidth - this.margin, this.pageHeight - 5, { align: 'right' });
        }
    }

    // Generate Complete Report
    generateReport(reportData, reportDate) {
        this.initialize();
        
        // Page 1: Header and Summary
        this.addHeader(reportDate);
        this.addSummary(reportData.analysis, reportData.activeCountries);
        
        // Add Statistics Box
        this.addStatisticsBox(reportData.analysis);
        
        // Add new page for tables
        this.doc.addPage();
        this.currentY = this.margin;
        
        // Country Summary Table
        this.addCountrySummaryTable(reportData.countrySummary);
        
        // Station Details
        if (reportData.analysis.byStation && reportData.analysis.byStation.length > 0) {
            reportData.analysis.byStation.forEach(station => {
                this.addStationDetails(station);
            });
        }
        
        // Wind Rose (if data available)
        if (reportData.windRoseData && reportData.windRoseData.length > 0) {
            this.addWindRose(reportData.windRoseData);
        }
        
        // Add footers to all pages
        this.addFooter();
        
        return this.doc;
    }

    // Save PDF
    save(filename) {
        if (this.doc) {
            this.doc.save(filename);
        }
    }

    // Get PDF as Blob
    getBlob() {
        if (this.doc) {
            return this.doc.output('blob');
        }
        return null;
    }
}

// Make available globally
window.DustReportPDFGenerator = DustReportPDFGenerator;
