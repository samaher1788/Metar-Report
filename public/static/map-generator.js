// Map Generator for Dust Storm Reports
// Uses Leaflet.js for interactive maps

class DustStormMapGenerator {
    constructor() {
        this.map = null;
        this.markers = [];
        
        // Station coordinates (approximate locations for major stations)
        this.stationCoordinates = {
            // Saudi Arabia
            'OERK': [24.9576, 46.6986], // Riyadh
            'OEJN': [21.6796, 39.1565], // Jeddah
            'OEDF': [26.2656, 50.1520], // Dammam
            'OEMA': [24.5534, 39.7050], // Madinah
            'OETB': [28.3655, 36.6189], // Tabuk
            'OEHL': [27.4379, 41.6861], // Hail
            'OEGT': [28.3356, 36.6111], // Gurayat
            'OESK': [25.4249, 49.4879], // Hofuf
            'OEGS': [26.3015, 43.7743], // Gassim
            'OEPA': [20.2961, 41.6372], // Abha
            'OEBH': [27.9082, 35.4309], // Bisha
            'OESH': [17.4676, 44.2266], // Sharurah
            'OEWD': [21.5027, 39.7007], // Wadi Dawasir
            
            // Kuwait
            'OKBK': [29.2267, 47.9689], // Kuwait City
            
            // Bahrain
            'OBBI': [26.2708, 50.6336], // Bahrain
            
            // Qatar
            'OTHH': [25.2731, 51.6080], // Doha
            
            // UAE
            'OMDB': [25.2532, 55.3657], // Dubai
            'OMAA': [24.4330, 54.6511], // Abu Dhabi
            'OMSJ': [25.3280, 55.5174], // Sharjah
            'OMAL': [24.2617, 55.6092], // Al Ain
            'OMDW': [25.2378, 55.6725], // Al Dhafra
            
            // Oman
            'OOMS': [23.5933, 58.2844], // Muscat
            'OOSA': [17.0387, 54.0914], // Salalah
            
            // Yemen
            'OYAA': [15.4764, 44.2195], // Sanaa
            'OYSY': [12.8306, 45.0286], // Aden
            
            // Jordan
            'OJAI': [31.7225, 35.9916], // Amman - Queen Alia
            'OJAM': [31.9723, 35.9917], // Amman - Marka
            'OJAQ': [29.6117, 35.0181], // Aqaba
            
            // Iraq
            'ORBI': [33.2625, 44.2346], // Baghdad
            'ORMM': [36.3058, 43.1474], // Mosul
            'ORBB': [30.5491, 47.6618], // Basra
            
            // Syria
            'OSDI': [33.4114, 36.5156], // Damascus
            'OSAP': [36.1807, 37.2244], // Aleppo
            
            // Lebanon
            'OLBA': [33.8208, 35.4884], // Beirut
            
            // Iran
            'OIKB': [35.6892, 51.3131], // Tehran
            'OIIE': [32.7486, 51.8611]  // Isfahan
        };
        
        // Weather phenomenon colors
        this.phenomenonColors = {
            'BLDU': '#FF6B6B', // Red - Blowing Dust
            'BLSA': '#FFA07A', // Light Salmon - Blowing Sand
            'DU': '#FFD700',   // Gold - Dust
            'SA': '#F4A460',   // Sandy Brown - Sand
            'SS': '#DC143C',   // Crimson - Sandstorm
            'DS': '#8B0000',   // Dark Red - Duststorm
            'PO': '#FF4500'    // Orange Red - Dust Whirls
        };
    }

    // Initialize map
    initializeMap(containerId) {
        // Remove existing map if any
        if (this.map) {
            console.log('🧹 Removing existing map...');
            this.map.remove();
            this.map = null;
            this.markers = [];
        }
        
        // Center on Middle East
        this.map = L.map(containerId).setView([25.0, 45.0], 5);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(this.map);
        
        console.log('✅ Map initialized successfully');
        return this.map;
    }

    // Get station coordinates
    getStationCoordinates(stationCode) {
        return this.stationCoordinates[stationCode] || null;
    }

    // Add station marker to map
    addStationMarker(stationCode, stationData) {
        const coords = this.getStationCoordinates(stationCode);
        
        if (!coords) {
            console.warn(`Coordinates not found for station: ${stationCode}`);
            return null;
        }
        
        // Determine dominant phenomenon
        const phenomena = this.extractPhenomena(stationData);
        const dominant = phenomena[0] || 'DU';
        const color = this.phenomenonColors[dominant] || '#FFD700';
        
        // Create marker
        const marker = L.circleMarker(coords, {
            radius: 10,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(this.map);
        
        // Create popup content
        const popupContent = this.createPopupContent(stationCode, stationData, phenomena);
        marker.bindPopup(popupContent);
        
        this.markers.push(marker);
        return marker;
    }

    // Extract phenomena from station data
    extractPhenomena(stationData) {
        const phenomena = new Set();
        
        stationData.forEach(record => {
            const metar = record.metar || '';
            
            // Check for each phenomenon
            Object.keys(this.phenomenonColors).forEach(code => {
                if (metar.includes(code)) {
                    phenomena.add(code);
                }
            });
        });
        
        return Array.from(phenomena);
    }

    // Create popup content
    createPopupContent(stationCode, stationData, phenomena) {
        const reportCount = stationData.length;
        
        // Get visibility and wind ranges
        let minVis = 10000;
        let maxVis = 0;
        let minWind = 999;
        let maxWind = 0;
        
        stationData.forEach(record => {
            const metar = record.metar || '';
            
            // Extract visibility
            const visMatch = metar.match(/\s(\d{4})\s/);
            if (visMatch) {
                const vis = parseInt(visMatch[1]);
                minVis = Math.min(minVis, vis);
                maxVis = Math.max(maxVis, vis);
            }
            
            // Extract wind
            const windMatch = metar.match(/(\d{3})(\d{2,3})KT/);
            if (windMatch) {
                const wind = parseInt(windMatch[2]);
                minWind = Math.min(minWind, wind);
                maxWind = Math.max(maxWind, wind);
            }
        });
        
        // Country info
        const countryInfo = this.getCountryFromStation(stationCode);
        const countryName = countryInfo ? countryInfo.nameAr : 'Unknown';
        
        return `
            <div style="min-width: 200px;">
                <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 16px; font-weight: bold;">
                    ${stationCode}
                </h3>
                <div style="font-size: 14px; color: #34495e;">
                    <p style="margin: 5px 0;"><strong>الدولة:</strong> ${countryName}</p>
                    <p style="margin: 5px 0;"><strong>عدد التقارير:</strong> ${reportCount}</p>
                    <p style="margin: 5px 0;"><strong>الظواهر:</strong> ${phenomena.join(', ')}</p>
                    ${minVis < 10000 ? `<p style="margin: 5px 0;"><strong>الرؤية:</strong> ${minVis}-${maxVis} م</p>` : ''}
                    ${maxWind > 0 ? `<p style="margin: 5px 0;"><strong>الرياح:</strong> ${minWind}-${maxWind} عقدة</p>` : ''}
                </div>
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;">
                    ${phenomena.map(p => `
                        <span style="display: inline-block; margin: 2px; padding: 3px 8px; 
                                     background: ${this.phenomenonColors[p]}; color: white; 
                                     border-radius: 3px; font-size: 11px;">
                            ${p}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // Get country from station code
    getCountryFromStation(stationCode) {
        const countries = [
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
        
        return countries.find(c => stationCode.startsWith(c.prefix));
    }

    // Generate map from analysis data
    generateMap(containerId, analysis) {
        console.log('🗺️ Generating dust storm map...');
        
        // Initialize map
        this.initializeMap(containerId);
        
        // Group station data
        const stationGroups = {};
        analysis.stationData.forEach(record => {
            if (!stationGroups[record.station]) {
                stationGroups[record.station] = [];
            }
            stationGroups[record.station].push(record);
        });
        
        // Add markers for each station
        let addedCount = 0;
        Object.keys(stationGroups).forEach(stationCode => {
            const marker = this.addStationMarker(stationCode, stationGroups[stationCode]);
            if (marker) addedCount++;
        });
        
        console.log(`✅ Added ${addedCount} station markers to map`);
        
        // Add legend
        this.addLegend();
        
        return this.map;
    }

    // Add legend to map
    addLegend() {
        const legend = L.control({ position: 'bottomright' });
        
        legend.onAdd = () => {
            const div = L.DomUtil.create('div', 'map-legend');
            div.style.backgroundColor = 'white';
            div.style.padding = '10px';
            div.style.borderRadius = '5px';
            div.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
            
            let html = '<h4 style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">رموز الطقس</h4>';
            
            const labels = {
                'BLDU': 'غبار عالق',
                'BLSA': 'رمال عالقة',
                'DU': 'غبار',
                'SA': 'رمال',
                'SS': 'عاصفة رملية',
                'DS': 'عاصفة غبارية',
                'PO': 'دوامات غبارية'
            };
            
            Object.keys(labels).forEach(code => {
                html += `
                    <div style="margin: 5px 0;">
                        <span style="display: inline-block; width: 15px; height: 15px; 
                                     background: ${this.phenomenonColors[code]}; 
                                     border-radius: 50%; margin-right: 5px; 
                                     vertical-align: middle;"></span>
                        <span style="font-size: 12px; vertical-align: middle;">${labels[code]} (${code})</span>
                    </div>
                `;
            });
            
            div.innerHTML = html;
            return div;
        };
        
        legend.addTo(this.map);
    }

    // Clear all markers
    clearMarkers() {
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers = [];
    }

    // Fit map to show all markers
    fitBounds() {
        if (this.markers.length > 0) {
            const group = new L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds().pad(0.1));
        }
    }
}

// Export for use in main app
window.DustStormMapGenerator = DustStormMapGenerator;
