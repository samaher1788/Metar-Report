// Enhanced PDF Generator - Matches Reference Report Format
// Based on Dust_Detailed_Report_20260112_2359.pdf

class ReferenceDustReportPDFGenerator {
    constructor() {
        this.doc = null;
        this.pageWidth = 210; // A4 width in mm
        this.pageHeight = 297; // A4 height in mm
        this.margin = 20;
        this.currentY = 20;
        
        // Weather phenomenon codes
        this.weatherCodes = {
            'BLDU': 'Blowing Dust',
            'BLSA': 'Blowing Sand',
            'DU': 'Dust',
            'SA': 'Sand',
            'SS': 'Sandstorm',
            'DS': 'Duststorm',
            'PO': 'Dust Whirls'
        };
        
        // Colors matching reference report
        this.colors = {
            primary: [41, 128, 185],    // Blue
            darkBlue: [41, 69, 144],    // NCM Dark Blue
            text: [0, 0, 0],            // Black text
            gray: [100, 100, 100],      // Gray for secondary text
            lightGray: [240, 240, 240], // Light gray for table backgrounds
            tableHeader: [41, 69, 144]  // Table header color
        };
        
        // Countries list (matching reference report order)
        this.countries = [
            { name: 'Saudi Arabia', nameAr: 'السعودية', code: 'SA', prefix: 'OE' },
            { name: 'Kuwait', nameAr: 'الكويت', code: 'KW', prefix: 'OK' },
            { name: 'Bahrain', nameAr: 'البحرين', code: 'BH', prefix: 'OB' },
            { name: 'Qatar', nameAr: 'قطر', code: 'QA', prefix: 'OT' },
            { name: 'UAE', nameAr: 'الإمارات', code: 'AE', prefix: 'OM' },
            { name: 'Oman', nameAr: 'عمان', code: 'OM', prefix: 'OO' },
            { name: 'Yemen', nameAr: 'اليمن', code: 'YE', prefix: 'OY' },
            { name: 'Jordan', nameAr: 'الأردن', code: 'JO', prefix: 'OJ' },
            { name: 'Iraq', nameAr: 'العراق', code: 'IQ', prefix: 'OR' },
            { name: 'Syria', nameAr: 'سوريا', code: 'SY', prefix: 'OS' },
            { name: 'Lebanon', nameAr: 'لبنان', code: 'LB', prefix: 'OL' },
            { name: 'Iran', nameAr: 'إيران', code: 'IR', prefix: 'OI' }
        ];
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

    // Add NCM Logo Header (Top Left)
    addLogoHeader() {
        try {
            const logoImg = document.getElementById('ncm-logo-img');
            if (logoImg && logoImg.complete) {
                // Add logo in top left corner (matching reference report)
                // Increased size: 80mm width × 20mm height (larger and more visible)
                this.doc.addImage(logoImg, 'PNG', 10, 10, 80, 20);
            }
        } catch (e) {
            console.warn('Logo not loaded:', e);
        }
    }

    // Add Title Page
    addTitlePage(reportDate, analysis) {
        this.addLogoHeader();
        
        const dateObj = new Date(reportDate);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = days[dateObj.getDay()];
        const formattedDate = `${dayName} - (${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()})`;

        // Title
        this.currentY = 40;
        this.doc.setFontSize(7);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(0, 0, 0);
        this.doc.text('Dust and Sandstorm Events in Saudi Arabia and the Region', this.margin, this.currentY);
        
        // Date
        this.currentY += 4;
        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(`Start Date: ${formattedDate}`, this.margin, this.currentY);
        
        // Summary paragraph
        this.currentY += 4;
        this.doc.setFontSize(7);
        this.doc.setFont('helvetica', 'normal');
        
        const summary = this.generateSummaryText(analysis);
        const splitSummary = this.doc.splitTextToSize(summary, this.pageWidth - (2 * this.margin));
        
        for (const line of splitSummary) {
            if (this.currentY > this.pageHeight - this.margin) {
                this.doc.addPage();
                this.addLogoHeader();
                this.currentY = 30;
            }
            this.doc.text(line, this.margin, this.currentY);
            this.currentY += 6;
        }
        
        this.currentY += 5;
    }

    // Generate summary text based on analysis
    generateSummaryText(analysis) {
        const { byCountry, byType, stationData } = analysis;
        
        // Count active countries
        const activeCountries = Object.entries(byCountry)
            .filter(([country, count]) => count > 0)
            .map(([country, count]) => {
                const countryInfo = this.countries.find(c => c.code === country);
                return countryInfo ? countryInfo.name : country;
            });
        
        // Determine dominant phenomenon
        let dominantPhenomenon = 'BLDU';
        let maxCount = 0;
        for (const [code, count] of Object.entries(byType)) {
            if (count > maxCount) {
                maxCount = count;
                dominantPhenomenon = code;
            }
        }
        
        let summary = 'On this day, ';
        
        if (activeCountries.length === 0) {
            summary += 'no dust activity was reported across the region.';
        } else {
            summary += `dust activity was reported in limited areas across the region, while no dust activity was observed over `;
            
            const inactiveCountries = this.countries
                .filter(c => !activeCountries.includes(c.name))
                .map(c => c.name);
            
            if (inactiveCountries.length > 0) {
                if (inactiveCountries.length === 1) {
                    summary += `${inactiveCountries[0]}.`;
                } else if (inactiveCountries.length === 2) {
                    summary += `${inactiveCountries[0]} or ${inactiveCountries[1]}.`;
                } else {
                    const lastCountry = inactiveCountries.pop();
                    summary += `${inactiveCountries.join(', ')}, or ${lastCountry}.`;
                }
            }
            
            summary += `\n\nDust activity was confined to ${activeCountries.length === 1 ? 'one country' : `${activeCountries.length} countries`} only:\n`;
            activeCountries.forEach(country => {
                summary += `• ${country}\n`;
            });
            
            summary += `\nThe distribution of weather phenomena was as follows:\n`;
            summary += `• ${this.weatherCodes[dominantPhenomenon]}: dominant\n`;
            
            // List other phenomena
            for (const [code, count] of Object.entries(byType)) {
                if (code !== dominantPhenomenon && count > 0) {
                    summary += `• ${this.weatherCodes[code]}: ${count === 1 ? 'limited' : count + ' reports'}\n`;
                }
            }
            
            // List zero phenomena
            const zeroCodes = Object.keys(this.weatherCodes).filter(code => !byType[code] || byType[code] === 0);
            if (zeroCodes.length > 0) {
                summary += `• ${zeroCodes.join(' / ')}: 0 reports\n`;
            }
        }
        
        return summary;
    }

    // Add station description (matching reference format)
    addStationDescription(countryName, stationCodes, analysis) {
        if (this.currentY > this.pageHeight - 40) {
            this.doc.addPage();
            this.addLogoHeader();
            this.currentY = 30;
        }
        
        this.doc.setFontSize(7);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(0, 0, 0);
        
        const stationText = `${countryName} – Station${stationCodes.length > 1 ? 's' : ''} ${stationCodes.join(', ')}`;
        this.doc.text(stationText, this.margin, this.currentY);
        this.currentY += 4;
        
        // General characteristics
        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'normal');
        
        const characteristics = this.calculateStationCharacteristics(stationCodes, analysis);
        
        if (characteristics.recordedActivity) {
            this.doc.text(`${countryName} recorded dust activity${characteristics.dominant ? ', dominated by ' + this.weatherCodes[characteristics.dominant] + ' events' : ''}.`, this.margin, this.currentY);
            this.currentY += 7;
            
            this.doc.text(`General characteristics across ${countryName === 'UAE' ? countryName : countryName + 'n'} stations:`, this.margin, this.currentY);
            this.currentY += 6;
            
            // Visibility
            this.doc.text(`• Visibility: ranged between ${characteristics.minVis}–${characteristics.maxVis} m${characteristics.minVis < 5000 ? ', with a minimum visibility of ' + characteristics.minVis + ' m' : ''}.`, this.margin + 5, this.currentY);
            this.currentY += 6;
            
            // Wind speed
            this.doc.text(`• Wind speed: ranged between ${characteristics.minWind}–${characteristics.maxWind} kt${characteristics.maxWind > 20 ? ', with stronger winds observed during peak events' : ''}.`, this.margin + 5, this.currentY);
            this.currentY += 6;
            
            // Wind direction
            this.doc.text(`• Wind direction: ${characteristics.windDirection}.`, this.margin + 5, this.currentY);
            this.currentY += 6;
            
            // Phenomena
            this.doc.text(`• Phenomena: ${characteristics.phenomena.join(', ')}.`, this.margin + 5, this.currentY);
            this.currentY += 5;
        } else {
            this.doc.text(`Limited dust activity was reported over ${countryName}.`, this.margin, this.currentY);
            this.currentY += 5;
        }
    }

    // Calculate station characteristics from METAR data
    calculateStationCharacteristics(stationCodes, analysis) {
        const stationData = analysis.stationData.filter(s => 
            stationCodes.some(code => s.station.startsWith(code))
        );
        
        if (stationData.length === 0) {
            return { recordedActivity: false };
        }
        
        let minVis = 10000, maxVis = 0;
        let minWind = 100, maxWind = 0;
        const directions = [];
        const phenomena = new Set();
        const phenomenonCounts = {};
        
        stationData.forEach(record => {
            // Visibility
            const vis = parseInt(record.visibility) || 9999;
            if (vis < 9999) {
                minVis = Math.min(minVis, vis);
                maxVis = Math.max(maxVis, vis);
            }
            
            // Wind speed
            const windMatch = record.metar.match(/(\d{3})(\d{2,3})(G(\d{2,3}))?KT/);
            if (windMatch) {
                const speed = parseInt(windMatch[2]);
                const gust = windMatch[4] ? parseInt(windMatch[4]) : speed;
                minWind = Math.min(minWind, speed);
                maxWind = Math.max(maxWind, gust);
                
                const dir = parseInt(windMatch[1]);
                directions.push(dir);
            }
            
            // Weather phenomena
            for (const code of Object.keys(this.weatherCodes)) {
                if (record.metar.includes(code)) {
                    phenomena.add(code);
                    phenomenonCounts[code] = (phenomenonCounts[code] || 0) + 1;
                }
            }
        });
        
        // Determine dominant phenomenon
        let dominant = null;
        let maxCount = 0;
        for (const [code, count] of Object.entries(phenomenonCounts)) {
            if (count > maxCount) {
                maxCount = count;
                dominant = code;
            }
        }
        
        // Calculate average wind direction and range
        const avgDir = Math.round(directions.reduce((a, b) => a + b, 0) / directions.length);
        const windDirection = this.getWindDirectionDescription(avgDir, Math.min(...directions), Math.max(...directions));
        
        return {
            recordedActivity: true,
            minVis: minVis === 10000 ? 5000 : minVis,
            maxVis: maxVis === 0 ? 5000 : maxVis,
            minWind,
            maxWind,
            windDirection,
            phenomena: Array.from(phenomena),
            dominant
        };
    }

    // Convert direction degrees to descriptive text
    getWindDirectionDescription(avgDir, minDir, maxDir) {
        const directions = {
            0: 'North', 45: 'Northeast', 90: 'East', 135: 'Southeast',
            180: 'South', 225: 'Southwest', 270: 'West', 315: 'Northwest'
        };
        
        // Find closest direction
        let closest = 0;
        let minDiff = 360;
        for (const deg of Object.keys(directions).map(Number)) {
            const diff = Math.abs(avgDir - deg);
            if (diff < minDiff) {
                minDiff = diff;
                closest = deg;
            }
        }
        
        const dirName = directions[closest];
        
        // Add range if significant variation
        if (maxDir - minDir > 30) {
            return `predominantly ${dirName.toLowerCase()} to ${directions[Math.round(maxDir / 45) * 45] || 'varying'} (${minDir}°–${maxDir}°)`;
        } else {
            return `predominantly ${dirName.toLowerCase()} (${minDir}°–${maxDir}°)`;
        }
    }

    // Add summary table (matching reference format exactly)
    addSummaryTable(analysis) {
        if (this.currentY > this.pageHeight - 100) {
            this.doc.addPage();
            this.addLogoHeader();
            this.currentY = 30;
        }
        
        this.doc.setFontSize(7);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Summary of Dust and Sandstorm Events in Saudi Arabia and the Region:', this.margin, this.currentY);
        this.currentY += 4;
        
        // Prepare table data
        const tableData = [];
        const codeOrder = ['BLDU', 'BLSA', 'DU', 'SA', 'SS', 'DS', 'PO'];
        
        let totalInSaudi = 0;
        let totalInRegion = 0;
        const totalsByCode = {};
        codeOrder.forEach(code => totalsByCode[code] = 0);
        
        this.countries.forEach(country => {
            const countryCode = country.code;
            const countryCounts = this.getCountryWeatherCounts(countryCode, analysis);
            
            const row = [country.name];
            let countryTotal = 0;
            
            codeOrder.forEach(code => {
                const count = countryCounts[code] || 0;
                row.push(count.toString());
                countryTotal += count;
                totalsByCode[code] += count;
            });
            
            row.push(countryTotal.toString());
            tableData.push(row);
            
            if (countryCode === 'SA') {
                totalInSaudi = countryTotal;
            }
            totalInRegion += countryTotal;
        });
        
        // Create table
        this.doc.autoTable({
            startY: this.currentY,
            head: [['Country', ...codeOrder, 'Total']],
            body: tableData,
            theme: 'grid',
            styles: {
                fontSize: 9,
                cellPadding: 2,
                halign: 'center'
            },
            headStyles: {
                fillColor: [41, 69, 144],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { halign: 'left', fontStyle: 'bold' }
            },
            margin: { left: this.margin, right: this.margin }
        });
        
        this.currentY = this.doc.lastAutoTable.finalY + 10;
        
        // Add totals summary
        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(`Total Reports in Saudi Arabia: ${totalInSaudi}`, this.margin, this.currentY);
        this.currentY += 6;
        this.doc.text(`Total Reports in the Region: ${totalInRegion}`, this.margin, this.currentY);
        this.currentY += 4;
        
        // Add breakdown by phenomenon
        this.doc.setFont('helvetica', 'normal');
        codeOrder.forEach(code => {
            this.doc.text(`${this.weatherCodes[code]}: ${totalsByCode[code]}`, this.margin, this.currentY);
            this.currentY += 6;
        });
        
        this.currentY += 5;
    }

    // Get weather code counts for a country
    getCountryWeatherCounts(countryCode, analysis) {
        const countryInfo = this.countries.find(c => c.code === countryCode);
        if (!countryInfo) return {};
        
        const stationData = analysis.stationData.filter(s => 
            s.station.startsWith(countryInfo.prefix)
        );
        
        const counts = {};
        Object.keys(this.weatherCodes).forEach(code => counts[code] = 0);
        
        stationData.forEach(record => {
            Object.keys(this.weatherCodes).forEach(code => {
                if (record.metar.includes(code)) {
                    counts[code]++;
                }
            });
        });
        
        return counts;
    }

    // Add station detailed data page
    addStationDetailPage(stationCode, stationName, analysis) {
        this.doc.addPage();
        this.addLogoHeader();
        this.currentY = 30;
        
        const stationRecords = analysis.stationData.filter(s => s.station === stationCode);
        
        if (stationRecords.length === 0) {
            return;
        }
        
        // Station header
        this.doc.setFontSize(7);
        this.doc.setFont('helvetica', 'bold');
        const countryInfo = this.getCountryFromStation(stationCode);
        this.doc.text(`${countryInfo?.name || 'Unknown'} - Station ${stationCode}`, this.margin, this.currentY);
        this.currentY += 5;
        
        // METAR section
        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('METAR:', this.margin, this.currentY);
        this.currentY += 6;
        
        // Display raw METAR observations
        this.doc.setFont('courier', 'normal');
        this.doc.setFontSize(7);
        
        stationRecords.slice(0, 15).forEach(record => {
            if (this.currentY > this.pageHeight - 20) {
                this.doc.addPage();
                this.addLogoHeader();
                this.currentY = 30;
            }
            
            const timeMatch = record.metar.match(/\d{6}Z/);
            const time = timeMatch ? timeMatch[0].substring(2, 4) + timeMatch[0].substring(4, 6) + 'Z' : '';
            
            this.doc.text(`${time} ${record.metar}`, this.margin, this.currentY);
            this.currentY += 5;
        });
        
        this.currentY += 5;
        
        // Weather codes reported
        const codes = new Set();
        stationRecords.forEach(record => {
            Object.keys(this.weatherCodes).forEach(code => {
                if (record.metar.includes(code)) {
                    codes.add(code);
                }
            });
        });
        
        this.doc.setFont('helvetica', 'normal');
        this.doc.setFontSize(8);
        this.doc.text(`Reported Weather Codes (wxcodes):`, this.margin, this.currentY);
        this.currentY += 6;
        
        Array.from(codes).forEach(code => {
            this.doc.text(`- ${code}`, this.margin + 5, this.currentY);
            this.currentY += 5;
        });
        
        this.currentY += 5;
        
        // Detailed table
        this.addStationDetailTable(stationRecords);
        
        // Summary line
        const summary = this.calculateStationSummary(stationRecords);
        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(`Wind: ${summary.windRange} kt | Dir: ${summary.directionRange} | Min vis: ${summary.minVis} m | Phenomena: ${summary.phenomena}`, 
            this.margin, this.currentY);
        this.currentY += 5;
    }

    // Add detailed METAR table for station
    addStationDetailTable(records) {
        const tableData = [];
        
        records.slice(0, 15).forEach(record => {
            // Parse METAR
            const timeMatch = record.metar.match(/\d{2}(\d{2})(\d{2})Z/);
            const time = timeMatch ? timeMatch[1] + timeMatch[2] : '';
            
            // Temperature and dewpoint (convert from F to C if needed)
            let temp = record.tmpf ? Math.round((record.tmpf - 32) * 5 / 9) : 'N/A';
            let dewpoint = record.dwpf ? Math.round((record.dwpf - 32) * 5 / 9) : 'N/A';
            
            // Wind
            const windMatch = record.metar.match(/(\d{3})(\d{2,3})(G(\d{2,3}))?KT/);
            let wind = 'N/A', windKmh = '', direction = 'N/A', dirText = '';
            if (windMatch) {
                wind = windMatch[2];
                windKmh = Math.round(parseInt(wind) * 1.852);
                direction = windMatch[1] + '°';
                dirText = this.getDirectionText(parseInt(windMatch[1]));
            }
            
            // Visibility (convert from miles to meters if needed)
            let vis = record.visibility || 'N/A';
            if (vis !== 'N/A' && !isNaN(vis)) {
                vis = Math.round(parseFloat(vis) * 1609.34); // miles to meters
            }
            
            // Weather codes
            const codes = [];
            Object.keys(this.weatherCodes).forEach(code => {
                if (record.metar.includes(code)) {
                    codes.push(code);
                }
            });
            
            tableData.push([
                time,
                `${temp}/${dewpoint}`,
                `${wind}/${windKmh}`,
                `${direction}/${dirText}`,
                vis.toString(),
                codes.join(', ')
            ]);
        });
        
        if (this.currentY > this.pageHeight - 60) {
            this.doc.addPage();
            this.addLogoHeader();
            this.currentY = 30;
        }
        
        this.doc.autoTable({
            startY: this.currentY,
            head: [['Time (UTC)', 'Temp/Dew (°C)', 'Wind (kt/kmh)', 'Direction', 'Visibility (m)', 'wxcodes']],
            body: tableData,
            theme: 'grid',
            styles: {
                fontSize: 9,
                cellPadding: 2,
                halign: 'center'
            },
            headStyles: {
                fillColor: [41, 69, 144],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            margin: { left: this.margin, right: this.margin }
        });
        
        this.currentY = this.doc.lastAutoTable.finalY + 8;
    }

    // Get direction text from degrees
    getDirectionText(deg) {
        const directions = ['North', 'NNE', 'NE', 'ENE', 'East', 'ESE', 'SE', 'SSE',
                          'South', 'SSW', 'SW', 'WSW', 'West', 'WNW', 'NW', 'NNW'];
        const index = Math.round((deg % 360) / 22.5);
        return directions[index % 16];
    }

    // Calculate station summary
    calculateStationSummary(records) {
        let minWind = 100, maxWind = 0;
        let minDir = 360, maxDir = 0;
        let minVis = 10000;
        const phenomena = new Set();
        
        records.forEach(record => {
            // Wind
            const windMatch = record.metar.match(/(\d{3})(\d{2,3})(G(\d{2,3}))?KT/);
            if (windMatch) {
                const speed = parseInt(windMatch[2]);
                const gust = windMatch[4] ? parseInt(windMatch[4]) : speed;
                minWind = Math.min(minWind, speed);
                maxWind = Math.max(maxWind, gust);
                
                const dir = parseInt(windMatch[1]);
                minDir = Math.min(minDir, dir);
                maxDir = Math.max(maxDir, dir);
            }
            
            // Visibility
            const vis = parseInt(record.visibility) || 9999;
            if (vis < 9999) {
                minVis = Math.min(minVis, Math.round(vis * 1609.34));
            }
            
            // Phenomena
            Object.keys(this.weatherCodes).forEach(code => {
                if (record.metar.includes(code)) {
                    phenomena.add(code);
                }
            });
        });
        
        return {
            windRange: `${minWind}-${maxWind}`,
            directionRange: `${minDir}°/${this.getDirectionText(minDir)}`,
            minVis: minVis === 10000 ? 5000 : minVis,
            phenomena: Array.from(phenomena).join(', ')
        };
    }

    // Get country info from station code
    getCountryFromStation(stationCode) {
        return this.countries.find(c => stationCode.startsWith(c.prefix));
    }

    // Add disclaimer (matching reference report)
    // Add wind rose page for station
    async addWindRosePage(stationCode, stationName, windRoseData) {
        this.doc.addPage();
        this.addLogoHeader();
        this.currentY = 30;
        
        // Station header
        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(`Wind Rose - Station ${stationCode}`, this.pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += 6;
        
        // Add wind rose image if available
        if (windRoseData && windRoseData.imageBase64) {
            const imgWidth = 150;
            const imgHeight = 150;
            const x = (this.pageWidth - imgWidth) / 2;
            
            this.doc.addImage(windRoseData.imageBase64, 'PNG', x, this.currentY, imgWidth, imgHeight);
            this.currentY += imgHeight + 10;
        } else {
            this.doc.setFontSize(8);
            this.doc.setFont('helvetica', 'normal');
            this.doc.text('Wind rose data not available for this station.', this.pageWidth / 2, this.currentY, { align: 'center' });
        }
    }

    // Main generate function - ORIGINAL REFERENCE SEQUENCE
    async generateReport(metarData, analysis, windRoseData = {}) {
        this.initialize();
        
        console.log('🔄 Starting PDF generation (Original Reference Sequence)...');
        
        // ===== PAGE 1: Title page + Station descriptions =====
        console.log('📄 Page 1: Title and station descriptions');
        this.addTitlePage(metarData.startDate, analysis);
        
        // Add station descriptions (all on page 1)
        const stationsByCountry = this.groupStationsByCountry(analysis);
        for (const [countryCode, stations] of Object.entries(stationsByCountry)) {
            if (stations.length > 0) {
                const country = this.countries.find(c => c.code === countryCode);
                if (country) {
                    this.addStationDescription(country.name, stations.map(s => s.station), analysis);
                }
            }
        }
        
        // ===== PAGE 2: Summary table (not wind rose!) =====
        console.log('📄 Page 2: Summary table');
        this.doc.addPage();
        this.addLogoHeader();
        this.currentY = 30;
        this.addSummaryTable(analysis);
        
        // ===== PAGE 3+: Station detail pages (METAR tables) =====
        console.log('📄 Pages 3+: Station details (METAR tables)');
        const processedStations = new Set();
        analysis.stationData.forEach(record => {
            if (!processedStations.has(record.station)) {
                processedStations.add(record.station);
                console.log(`  ➜ Adding METAR details for ${record.station}`);
                this.addStationDetailPage(record.station, record.station, analysis);
            }
        });
        
        // ===== LAST PAGES: Wind roses for ALL stations (at the END only) =====
        console.log('📄 Last pages: Wind roses for all stations');
        const windRoseStations = [];
        analysis.stationData.forEach(record => {
            if (!windRoseStations.includes(record.station) && windRoseData[record.station]) {
                windRoseStations.push(record.station);
            }
        });
        
        if (windRoseStations.length > 0) {
            console.log(`  ➜ Adding ${windRoseStations.length} wind roses at the end`);
            for (const stationCode of windRoseStations) {
                await this.addWindRosePage(
                    stationCode,
                    stationCode,
                    windRoseData[stationCode]
                );
            }
        }
        
        // Save PDF
        const dateStr = new Date(metarData.startDate).toISOString().split('T')[0].replace(/-/g, '');
        console.log(`✅ Saving PDF: Dust_Detailed_Report_${dateStr}.pdf`);
        this.doc.save(`Dust_Detailed_Report_${dateStr}.pdf`);
    }

    // Group stations by country
    groupStationsByCountry(analysis) {
        const grouped = {};
        
        this.countries.forEach(country => {
            grouped[country.code] = [];
        });
        
        const processedStations = new Set();
        
        analysis.stationData.forEach(record => {
            if (!processedStations.has(record.station)) {
                processedStations.add(record.station);
                const country = this.getCountryFromStation(record.station);
                if (country && grouped[country.code]) {
                    grouped[country.code].push(record);
                }
            }
        });
        
        return grouped;
    }
}

// Export for use in main app
window.ReferenceDustReportPDFGenerator = ReferenceDustReportPDFGenerator;
