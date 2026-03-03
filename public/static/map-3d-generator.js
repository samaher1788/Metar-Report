// 🗺️ Advanced 3D Map Generator with Terrain Visualization
// Uses Mapbox GL JS for stunning 3D terrain visualization

class DustStorm3DMapGenerator {
    constructor() {
        this.map = null;
        this.markers = [];
        this.animationFrame = null;
        this.isRotating = false;
        
        // Mapbox access token (you'll need to add your own)
        // For production, use your own token from https://mapbox.com
        this.mapboxToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
        
        // Station coordinates (same as 2D map)
        this.stationCoordinates = {
            // Saudi Arabia
            'OERK': [46.6986, 24.9576], // Riyadh [lng, lat] for Mapbox
            'OEJN': [39.1565, 21.6796], // Jeddah
            'OEDF': [50.1520, 26.2656], // Dammam
            'OEMA': [39.7050, 24.5534], // Madinah
            'OETB': [36.6189, 28.3655], // Tabuk
            'OEHL': [41.6861, 27.4379], // Hail
            'OEGT': [36.6111, 28.3356], // Gurayat
            'OESK': [49.4879, 25.4249], // Hofuf
            'OEGS': [43.7743, 26.3015], // Gassim
            'OEPA': [36.8149, 27.9009], // Arar
            'OEWD': [43.6834, 26.4653], // Wadi Al-Dawasir
            'OEAO': [42.5833, 27.9017], // Al Qaisumah
            'OESH': [36.4750, 27.4833], // Sharurah
            
            // UAE
            'OMAA': [54.6508, 24.4330], // Abu Dhabi
            'OMDB': [55.3644, 25.2528], // Dubai
            'OMSJ': [55.5167, 25.3286], // Sharjah
            'OMAL': [55.6092, 24.2617], // Al Ain
            'OMRK': [55.9389, 25.6136], // Ras Al Khaimah
            
            // Kuwait
            'OKBK': [47.9689, 29.2267], // Kuwait International
            'OKAJ': [48.2833, 28.9333], // Al Jahra
            
            // Bahrain
            'OBBI': [50.6339, 26.2708], // Bahrain International
            
            // Qatar
            'OTHH': [51.6081, 25.2608], // Doha
            
            // Oman
            'OOMS': [58.2844, 23.5933], // Muscat
            'OOSA': [54.0911, 17.0389], // Salalah
            
            // Yemen
            'OYSN': [44.2194, 15.4764], // Sanaa
            'OYAA': [45.0289, 12.8306], // Aden
            
            // Jordan
            'OJAI': [35.9916, 31.7225], // Amman - Queen Alia
            'OJAM': [35.9917, 31.9723], // Amman - Marka
            'OJAQ': [35.0181, 29.6117], // Aqaba
            
            // Iraq
            'ORBI': [44.2346, 33.2625], // Baghdad
            'ORMM': [43.1474, 36.3058], // Mosul
            'ORBB': [47.6618, 30.5491], // Basra
            
            // Syria
            'OSDI': [36.5156, 33.4114], // Damascus
            'OSAP': [37.2244, 36.1807], // Aleppo
            
            // Lebanon
            'OLBA': [35.4884, 33.8208], // Beirut
            
            // Iran
            'OIKB': [51.3131, 35.6892], // Tehran
            'OIIE': [51.8611, 32.7486]  // Isfahan
        };
        
        // Weather phenomenon colors with opacity for 3D
        this.phenomenonColors = {
            'BLDU': 'rgba(255, 107, 107, 0.9)', // Red - Blowing Dust
            'BLSA': 'rgba(255, 160, 122, 0.9)', // Light Salmon - Blowing Sand
            'DU': 'rgba(255, 215, 0, 0.9)',     // Gold - Dust
            'SA': 'rgba(244, 164, 96, 0.9)',    // Sandy Brown - Sand
            'SS': 'rgba(220, 20, 60, 0.9)',     // Crimson - Sandstorm
            'DS': 'rgba(139, 0, 0, 0.9)',       // Dark Red - Duststorm
        };
        
        // Animation settings
        this.rotationSpeed = 0.2;
        this.pulseSpeed = 0.05;
    }

    // Initialize 3D map with terrain
    async initializeMap(containerId) {
        if (!mapboxgl) {
            console.error('Mapbox GL JS not loaded!');
            return null;
        }
        
        mapboxgl.accessToken = this.mapboxToken;
        
        // Create map with 3D terrain
        this.map = new mapboxgl.Map({
            container: containerId,
            style: 'mapbox://styles/mapbox/satellite-streets-v12', // Satellite with streets
            center: [45.0, 25.0], // Center of Middle East
            zoom: 4.5,
            pitch: 60, // 3D view angle (0-85)
            bearing: 0, // Rotation angle
            antialias: true, // Smooth rendering
            projection: 'globe' // Globe projection
        });
        
        // Add navigation controls
        this.map.addControl(new mapboxgl.NavigationControl({
            visualizePitch: true
        }), 'top-right');
        
        // Add fullscreen control
        this.map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
        
        // Add scale
        this.map.addControl(new mapboxgl.ScaleControl({
            maxWidth: 200,
            unit: 'metric'
        }), 'bottom-left');
        
        // Wait for map to load
        await new Promise((resolve) => {
            this.map.on('load', () => {
                console.log('✅ 3D Map loaded successfully');
                
                // Add 3D terrain
                this.map.addSource('mapbox-dem', {
                    'type': 'raster-dem',
                    'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
                    'tileSize': 512,
                    'maxzoom': 14
                });
                
                this.map.setTerrain({ 
                    'source': 'mapbox-dem', 
                    'exaggeration': 1.5 // Make terrain more dramatic
                });
                
                // Add sky layer for realistic atmosphere
                this.map.addLayer({
                    'id': 'sky',
                    'type': 'sky',
                    'paint': {
                        'sky-type': 'atmosphere',
                        'sky-atmosphere-sun': [0.0, 90.0],
                        'sky-atmosphere-sun-intensity': 15
                    }
                });
                
                console.log('✅ 3D Terrain enabled with exaggeration: 1.5x');
                resolve();
            });
        });
        
        return this.map;
    }

    // Add 3D marker with custom styling
    addStation3DMarker(stationCode, stationData) {
        const coords = this.stationCoordinates[stationCode];
        
        if (!coords) {
            console.warn(`Coordinates not found for station: ${stationCode}`);
            return null;
        }
        
        // Determine dominant phenomenon
        const phenomena = this.extractPhenomena(stationData);
        const dominant = phenomena[0] || 'DU';
        const color = this.phenomenonColors[dominant] || 'rgba(255, 215, 0, 0.9)';
        
        // Create custom 3D marker element
        const markerEl = document.createElement('div');
        markerEl.className = 'dust-marker-3d';
        markerEl.style.cssText = `
            width: 30px;
            height: 30px;
            background: ${color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 20px ${color}, 0 0 40px ${color};
            cursor: pointer;
            animation: pulse-3d 2s ease-in-out infinite;
            transition: transform 0.3s ease;
        `;
        
        // Hover effect
        markerEl.addEventListener('mouseenter', () => {
            markerEl.style.transform = 'scale(1.5)';
        });
        
        markerEl.addEventListener('mouseleave', () => {
            markerEl.style.transform = 'scale(1)';
        });
        
        // Create popup content
        const popupContent = this.createPopupContent(stationCode, stationData, phenomena);
        
        // Create popup
        const popup = new mapboxgl.Popup({
            offset: 25,
            closeButton: true,
            closeOnClick: false,
            maxWidth: '350px'
        }).setHTML(popupContent);
        
        // Create marker
        const marker = new mapboxgl.Marker({
            element: markerEl,
            anchor: 'center'
        })
        .setLngLat(coords)
        .setPopup(popup)
        .addTo(this.map);
        
        this.markers.push(marker);
        return marker;
    }

    // Extract phenomena from station data
    extractPhenomena(stationData) {
        const phenomena = new Set();
        
        stationData.forEach(record => {
            const metar = record.metar || '';
            
            Object.keys(this.phenomenonColors).forEach(code => {
                if (metar.includes(code)) {
                    phenomena.add(code);
                }
            });
        });
        
        return Array.from(phenomena);
    }

    // Create popup content with enhanced styling
    createPopupContent(stationCode, stationData, phenomena) {
        const reportCount = stationData.length;
        
        // Get visibility and wind ranges
        let minVis = 10000, maxVis = 0;
        let minWind = 999, maxWind = 0;
        let directions = [];
        
        stationData.forEach(record => {
            const metar = record.metar || '';
            
            // Extract visibility
            const visMatch = metar.match(/\s(\d{4})\s/);
            if (visMatch) {
                const vis = parseInt(visMatch[1]);
                if (vis < minVis) minVis = vis;
                if (vis > maxVis) maxVis = vis;
            }
            
            // Extract wind speed
            const windMatch = metar.match(/(\d{3})(\d{2,3})(?:G(\d{2,3}))?KT/);
            if (windMatch) {
                const dir = parseInt(windMatch[1]);
                const speed = parseInt(windMatch[2]);
                directions.push(dir);
                if (speed < minWind) minWind = speed;
                if (speed > maxWind) maxWind = speed;
            }
        });
        
        // Calculate average direction
        const avgDir = directions.length > 0 
            ? Math.round(directions.reduce((a, b) => a + b, 0) / directions.length) 
            : 0;
        
        const dirText = this.getDirectionText(avgDir);
        
        return `
            <div style="font-family: 'Segoe UI', Tahoma, sans-serif; direction: rtl;">
                <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 18px; border-bottom: 2px solid #3498db; padding-bottom: 5px;">
                    📍 ${stationCode}
                </h3>
                <div style="font-size: 14px; line-height: 1.8;">
                    <p style="margin: 5px 0;">
                        <strong>📊 عدد البلاغات:</strong> 
                        <span style="background: #3498db; color: white; padding: 2px 8px; border-radius: 10px;">${reportCount}</span>
                    </p>
                    <p style="margin: 5px 0;">
                        <strong>👁️ الرؤية:</strong> ${minVis === 10000 ? 'N/A' : minVis + '-' + maxVis} م
                    </p>
                    <p style="margin: 5px 0;">
                        <strong>💨 الرياح:</strong> ${minWind === 999 ? 'N/A' : minWind + '-' + maxWind} عقدة
                    </p>
                    <p style="margin: 5px 0;">
                        <strong>🧭 الاتجاه:</strong> ${avgDir}°/${dirText}
                    </p>
                    <p style="margin: 5px 0;">
                        <strong>🌪️ الظواهر:</strong> 
                        <span style="color: #e74c3c; font-weight: bold;">${phenomena.join(', ')}</span>
                    </p>
                </div>
            </div>
        `;
    }

    // Get direction text from degrees
    getDirectionText(degrees) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                          'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(degrees / 22.5) % 16;
        return directions[index];
    }

    // Auto-rotate map (innovative feature!)
    startAutoRotation() {
        if (this.isRotating) return;
        
        this.isRotating = true;
        let bearing = this.map.getBearing();
        
        const rotate = () => {
            if (!this.isRotating) return;
            
            bearing += this.rotationSpeed;
            this.map.setBearing(bearing);
            
            this.animationFrame = requestAnimationFrame(rotate);
        };
        
        rotate();
        console.log('🔄 Auto-rotation started');
    }

    // Stop auto-rotation
    stopAutoRotation() {
        this.isRotating = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        console.log('⏸️ Auto-rotation stopped');
    }

    // Toggle auto-rotation
    toggleAutoRotation() {
        if (this.isRotating) {
            this.stopAutoRotation();
        } else {
            this.startAutoRotation();
        }
    }

    // Fly to station with smooth animation
    flyToStation(stationCode, zoom = 10) {
        const coords = this.stationCoordinates[stationCode];
        
        if (!coords) {
            console.warn(`Station ${stationCode} not found`);
            return;
        }
        
        this.map.flyTo({
            center: coords,
            zoom: zoom,
            pitch: 70,
            bearing: 45,
            duration: 3000,
            essential: true
        });
        
        console.log(`✈️ Flying to ${stationCode}`);
    }

    // Fit map to show all markers
    fitBounds() {
        if (this.markers.length === 0) return;
        
        const bounds = new mapboxgl.LngLatBounds();
        
        this.markers.forEach(marker => {
            bounds.extend(marker.getLngLat());
        });
        
        this.map.fitBounds(bounds, {
            padding: { top: 50, bottom: 50, left: 50, right: 50 },
            pitch: 60,
            duration: 2000
        });
    }

    // Clear all markers
    clearMarkers() {
        this.markers.forEach(marker => marker.remove());
        this.markers = [];
    }

    // Add heatmap layer (innovative!)
    addHeatmapLayer(stationData) {
        // Prepare data for heatmap
        const features = stationData.map(station => ({
            type: 'Feature',
            properties: {
                intensity: station.records.length
            },
            geometry: {
                type: 'Point',
                coordinates: this.stationCoordinates[station.station]
            }
        })).filter(f => f.geometry.coordinates);
        
        // Add source
        if (!this.map.getSource('dust-heatmap')) {
            this.map.addSource('dust-heatmap', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: features
                }
            });
            
            // Add heatmap layer
            this.map.addLayer({
                id: 'dust-heatmap-layer',
                type: 'heatmap',
                source: 'dust-heatmap',
                paint: {
                    'heatmap-weight': [
                        'interpolate',
                        ['linear'],
                        ['get', 'intensity'],
                        0, 0,
                        10, 1
                    ],
                    'heatmap-intensity': 1,
                    'heatmap-color': [
                        'interpolate',
                        ['linear'],
                        ['heatmap-density'],
                        0, 'rgba(33,102,172,0)',
                        0.2, 'rgb(103,169,207)',
                        0.4, 'rgb(209,229,240)',
                        0.6, 'rgb(253,219,199)',
                        0.8, 'rgb(239,138,98)',
                        1, 'rgb(178,24,43)'
                    ],
                    'heatmap-radius': 50,
                    'heatmap-opacity': 0.7
                }
            }, 'waterway-label');
            
            console.log('🔥 Heatmap layer added');
        }
    }

    // Toggle heatmap visibility
    toggleHeatmap() {
        const visibility = this.map.getLayoutProperty('dust-heatmap-layer', 'visibility');
        
        if (visibility === 'visible') {
            this.map.setLayoutProperty('dust-heatmap-layer', 'visibility', 'none');
            console.log('🔥 Heatmap hidden');
        } else {
            this.map.setLayoutProperty('dust-heatmap-layer', 'visibility', 'visible');
            console.log('🔥 Heatmap shown');
        }
    }

    // Destroy map
    destroy() {
        this.stopAutoRotation();
        this.clearMarkers();
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse-3d {
        0%, 100% {
            box-shadow: 0 0 20px currentColor, 0 0 40px currentColor;
            transform: scale(1);
        }
        50% {
            box-shadow: 0 0 30px currentColor, 0 0 60px currentColor;
            transform: scale(1.1);
        }
    }
    
    .dust-marker-3d:hover {
        z-index: 1000 !important;
    }
    
    .mapboxgl-popup-content {
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        padding: 15px;
    }
    
    .mapboxgl-popup-close-button {
        font-size: 24px;
        padding: 5px;
        color: #e74c3c;
    }
`;
document.head.appendChild(style);

console.log('✅ DustStorm3DMapGenerator loaded successfully');
