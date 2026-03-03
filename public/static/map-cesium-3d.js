// 🌍 Advanced 3D Globe Map Generator with Cesium.js
// Free, no API token needed, stunning 3D visualization

class CesiumGlobeMapGenerator {
    constructor() {
        this.viewer = null;
        this.markers = [];
        this.isRotating = false;
        this.rotationInterval = null;
        
        // Station coordinates [longitude, latitude]
        this.stationCoordinates = {
            // Saudi Arabia
            'OERK': [46.6986, 24.9576], // Riyadh
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
        
        // Weather phenomenon colors
        this.phenomenonColors = {
            'BLDU': { r: 255, g: 107, b: 107, a: 1.0 }, // Red - Blowing Dust
            'BLSA': { r: 255, g: 160, b: 122, a: 1.0 }, // Light Salmon - Blowing Sand
            'DU': { r: 255, g: 215, b: 0, a: 1.0 },     // Gold - Dust
            'SA': { r: 244, g: 164, b: 96, a: 1.0 },    // Sandy Brown - Sand
            'SS': { r: 220, g: 20, b: 60, a: 1.0 },     // Crimson - Sandstorm
            'DS': { r: 139, g: 0, b: 0, a: 1.0 },       // Dark Red - Duststorm
        };
    }

    // Initialize Cesium viewer
    async initializeViewer(containerId) {
        console.log('🌍 Initializing Cesium 3D Globe...');
        
        try {
            // Use OpenStreetMap as base layer (completely free, no token needed)
            this.viewer = new Cesium.Viewer(containerId, {
                // Use OpenStreetMap imagery (free)
                baseLayer: new Cesium.ImageryLayer(
                    new Cesium.OpenStreetMapImageryProvider({
                        url: 'https://a.tile.openstreetmap.org/'
                    })
                ),
                
                // Use Ellipsoid terrain (no token needed, still 3D globe)
                terrainProvider: new Cesium.EllipsoidTerrainProvider(),
                
                // UI options
                baseLayerPicker: false,
                geocoder: false,
                homeButton: true,
                sceneModePicker: true,
                navigationHelpButton: false,
                animation: false,
                timeline: false,
                fullscreenButton: true,
                vrButton: false,
                
                // Scene options
                scene3DOnly: false,
                orderIndependentTranslucency: false,
                contextOptions: {
                    webgl: {
                        alpha: false
                    }
                }
            });
            
            // Enable lighting
            this.viewer.scene.globe.enableLighting = true;
            
            // Set initial camera position (Middle East view)
            this.viewer.camera.setView({
                destination: Cesium.Cartesian3.fromDegrees(45.0, 25.0, 3000000),
                orientation: {
                    heading: Cesium.Math.toRadians(0),
                    pitch: Cesium.Math.toRadians(-45),
                    roll: 0.0
                }
            });
            
            // Add atmosphere effects
            this.viewer.scene.skyAtmosphere.show = true;
            
            // Enable depth testing
            this.viewer.scene.globe.depthTestAgainstTerrain = true;
            
            console.log('✅ Cesium Globe initialized successfully');
            return this.viewer;
            
        } catch (error) {
            console.error('❌ Failed to initialize Cesium:', error);
            throw error;
        }
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

    // Get Cesium Color from phenomenon
    getPhenomenonColor(phenomenon) {
        const color = this.phenomenonColors[phenomenon] || this.phenomenonColors['DU'];
        return new Cesium.Color(color.r / 255, color.g / 255, color.b / 255, color.a);
    }

    // Add 3D marker for station
    addStation3DMarker(stationCode, stationData) {
        const coords = this.stationCoordinates[stationCode];
        
        if (!coords) {
            console.warn(`Coordinates not found for station: ${stationCode}`);
            return null;
        }
        
        const [lon, lat] = coords;
        
        // Determine dominant phenomenon
        const phenomena = this.extractPhenomena(stationData);
        const dominant = phenomena[0] || 'DU';
        const color = this.getPhenomenonColor(dominant);
        
        // Calculate intensity based on number of records
        const intensity = Math.min(stationData.length / 20, 1.0);
        const height = 50000 + (intensity * 100000); // 50km to 150km height
        
        // Add pulsating cylinder marker
        const marker = this.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(lon, lat, height / 2),
            cylinder: {
                length: height,
                topRadius: 20000,
                bottomRadius: 20000,
                material: color.withAlpha(0.7),
                outline: true,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2
            },
            description: this.createStationDescription(stationCode, stationData, phenomena)
        });
        
        // Add point at base for better visibility
        this.viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(lon, lat, 0),
            point: {
                pixelSize: 15,
                color: color,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 3
            },
            label: {
                text: stationCode,
                font: '14px Cairo, sans-serif',
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -20)
            }
        });
        
        this.markers.push(marker);
        return marker;
    }

    // Create station description HTML
    createStationDescription(stationCode, stationData, phenomena) {
        const reportCount = stationData.length;
        
        // Calculate visibility range
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
            <div style="font-family: 'Cairo', sans-serif; direction: rtl; min-width: 300px;">
                <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 20px; border-bottom: 3px solid #3498db; padding-bottom: 8px;">
                    📍 ${stationCode}
                </h3>
                <div style="font-size: 15px; line-height: 2;">
                    <p style="margin: 8px 0; background: #3498db; color: white; padding: 8px; border-radius: 8px;">
                        <strong>📊 عدد البلاغات:</strong> 
                        <span style="font-size: 18px; font-weight: bold;">${reportCount}</span>
                    </p>
                    <p style="margin: 8px 0; padding: 8px; background: #ecf0f1; border-radius: 8px;">
                        <strong>👁️ الرؤية:</strong> ${minVis === 10000 ? 'N/A' : minVis + '-' + maxVis} م
                    </p>
                    <p style="margin: 8px 0; padding: 8px; background: #ecf0f1; border-radius: 8px;">
                        <strong>💨 الرياح:</strong> ${minWind === 999 ? 'N/A' : minWind + '-' + maxWind} عقدة
                    </p>
                    <p style="margin: 8px 0; padding: 8px; background: #ecf0f1; border-radius: 8px;">
                        <strong>🧭 الاتجاه:</strong> ${avgDir}°/${dirText}
                    </p>
                    <p style="margin: 8px 0; padding: 8px; background: #e74c3c; color: white; border-radius: 8px;">
                        <strong>⚠️ الظواهر:</strong> ${phenomena.join(', ')}
                    </p>
                </div>
            </div>
        `;
    }

    // Get direction text in Arabic
    getDirectionText(degrees) {
        const dirs = ['ش', 'ش-ش-ق', 'ش-ق', 'ق-ش-ق', 'ق', 'ق-ج-ق', 'ج-ق', 'ج-ج-ق', 'ج', 'ج-ج-غ', 'ج-غ', 'غ-ج-غ', 'غ', 'غ-ش-غ', 'ش-غ', 'ش-ش-غ'];
        const index = Math.round(degrees / 22.5) % 16;
        return dirs[index];
    }

    // Start auto rotation
    startAutoRotation() {
        if (this.isRotating) return;
        
        this.isRotating = true;
        console.log('🔄 Auto-rotation started');
        
        const rotateSpeed = 0.1; // degrees per frame
        
        this.rotationInterval = setInterval(() => {
            if (!this.viewer || !this.isRotating) return;
            
            const camera = this.viewer.camera;
            const heading = camera.heading + Cesium.Math.toRadians(rotateSpeed);
            
            camera.setView({
                orientation: {
                    heading: heading,
                    pitch: camera.pitch,
                    roll: camera.roll
                }
            });
        }, 16); // ~60fps
    }

    // Stop auto rotation
    stopAutoRotation() {
        this.isRotating = false;
        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
            this.rotationInterval = null;
        }
        console.log('⏸️ Auto-rotation stopped');
    }

    // Toggle auto rotation
    toggleAutoRotation() {
        if (this.isRotating) {
            this.stopAutoRotation();
        } else {
            this.startAutoRotation();
        }
    }

    // Fly to station with smooth animation
    flyToStation(stationCode) {
        const coords = this.stationCoordinates[stationCode];
        
        if (!coords) {
            console.warn(`Station ${stationCode} not found`);
            return;
        }
        
        const [lon, lat] = coords;
        
        this.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(lon, lat, 500000),
            orientation: {
                heading: Cesium.Math.toRadians(0),
                pitch: Cesium.Math.toRadians(-45),
                roll: 0.0
            },
            duration: 3
        });
        
        console.log(`✈️ Flying to ${stationCode}`);
    }

    // Fit camera to show all markers
    fitBounds() {
        if (this.markers.length === 0) return;
        
        try {
            this.viewer.zoomTo(this.viewer.entities, {
                offset: new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-45), 3000000)
            });
        } catch (error) {
            console.error('Error fitting bounds:', error);
        }
    }

    // Reset view to initial position
    resetView() {
        this.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(45.0, 25.0, 3000000),
            orientation: {
                heading: Cesium.Math.toRadians(0),
                pitch: Cesium.Math.toRadians(-45),
                roll: 0.0
            },
            duration: 2
        });
    }

    // Clear all markers
    clearMarkers() {
        this.viewer.entities.removeAll();
        this.markers = [];
    }

    // Destroy viewer
    destroy() {
        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
        }
        if (this.viewer) {
            this.viewer.destroy();
            this.viewer = null;
        }
    }
}

// Export for use in app.js
window.CesiumGlobeMapGenerator = CesiumGlobeMapGenerator;

console.log('✅ Cesium Globe Map Generator loaded');
