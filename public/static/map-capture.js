// Map Capture Utility for PDF Generation
// Captures the Leaflet map as an image for inclusion in PDF reports

class MapCaptureUtil {
    constructor() {
        this.mapContainer = null;
        this.captureMap = null;
    }

    // Create a temporary hidden map for capture
    async captureStationMap(stationData, reportDate) {
        return new Promise((resolve, reject) => {
            try {
                // Create temporary container
                const tempContainer = document.createElement('div');
                tempContainer.id = 'temp-map-capture';
                tempContainer.style.width = '800px';
                tempContainer.style.height = '600px';
                tempContainer.style.position = 'absolute';
                tempContainer.style.left = '-9999px';
                document.body.appendChild(tempContainer);

                // Initialize map
                const map = L.map('temp-map-capture', {
                    zoomControl: false,
                    attributionControl: false
                }).setView([25, 45], 5);

                // Add OpenStreetMap tile layer
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: ''
                }).addTo(map);

                // Add markers for stations with dust activity
                stationData.forEach(record => {
                    const coords = this.getStationCoordinates(record.station);
                    if (coords) {
                        const marker = L.circleMarker([coords.lat, coords.lon], {
                            radius: 8,
                            fillColor: '#ff0000',
                            color: '#8b0000',
                            weight: 2,
                            opacity: 1,
                            fillOpacity: 0.8
                        }).addTo(map);
                        
                        marker.bindPopup(`<b>${record.station}</b><br>Reports: ${record.count || 1}`);
                    }
                });

                // Wait for tiles to load
                setTimeout(() => {
                    // Capture map as image using leaflet-image or domtoimage
                    this.captureMapImage(map, tempContainer)
                        .then(imageData => {
                            // Cleanup
                            map.remove();
                            document.body.removeChild(tempContainer);
                            resolve(imageData);
                        })
                        .catch(error => {
                            map.remove();
                            document.body.removeChild(tempContainer);
                            reject(error);
                        });
                }, 2000);

            } catch (error) {
                reject(error);
            }
        });
    }

    // Capture map as image using html2canvas
    async captureMapImage(map, container) {
        return new Promise((resolve, reject) => {
            if (typeof html2canvas !== 'undefined') {
                html2canvas(container, {
                    useCORS: true,
                    allowTaint: true,
                    logging: false
                }).then(canvas => {
                    const imageData = canvas.toDataURL('image/png');
                    resolve(imageData);
                }).catch(reject);
            } else {
                // Fallback: use leaflet-image if available
                if (typeof leafletImage !== 'undefined') {
                    leafletImage(map, (err, canvas) => {
                        if (err) {
                            reject(err);
                        } else {
                            const imageData = canvas.toDataURL('image/png');
                            resolve(imageData);
                        }
                    });
                } else {
                    reject(new Error('No image capture library available'));
                }
            }
        });
    }

    // Get station coordinates (same as in map-generator.js)
    getStationCoordinates(station) {
        const coords = {
            // Saudi Arabia
            'OERK': { lat: 24.9576, lon: 46.6986 },
            'OEJN': { lat: 21.6796, lon: 39.1565 },
            'OEDF': { lat: 26.2656, lon: 50.1520 },
            'OEMA': { lat: 24.5534, lon: 39.7050 },
            'OETB': { lat: 28.3655, lon: 36.6189 },
            'OEHL': { lat: 27.4379, lon: 41.6861 },
            'OEGT': { lat: 31.4119, lon: 37.2795 },
            'OESK': { lat: 25.2833, lon: 49.4833 },
            'OEGS': { lat: 26.3015, lon: 43.7743 },
            'OEPA': { lat: 30.9066, lon: 41.1382 },
            'OEWD': { lat: 20.5043, lon: 45.1996 },
            'OEAO': { lat: 28.3354, lon: 46.1250 },
            'OESH': { lat: 17.4669, lon: 47.1214 },
            
            // UAE
            'OMAA': { lat: 24.4330, lon: 54.6508 },
            'OMDB': { lat: 25.2528, lon: 55.3644 },
            'OMSJ': { lat: 25.3286, lon: 55.5167 },
            'OMAL': { lat: 24.2617, lon: 55.6092 },
            'OMRK': { lat: 25.6136, lon: 55.9389 },
            
            // Kuwait
            'OKBK': { lat: 29.2267, lon: 47.9689 },
            
            // Bahrain
            'OBBI': { lat: 26.2708, lon: 50.6339 },
            
            // Qatar
            'OTHH': { lat: 25.2608, lon: 51.6081 },
            
            // Oman
            'OOMS': { lat: 23.5933, lon: 58.2844 },
            'OOSA': { lat: 17.0389, lon: 54.0911 },
            
            // Yemen
            'OYSN': { lat: 15.4764, lon: 44.2194 },
            'OYAA': { lat: 12.8306, lon: 45.0286 },
            
            // Jordan
            'OJAI': { lat: 31.7226, lon: 35.9916 },
            'OJAM': { lat: 31.9726, lon: 35.9916 },
            'OJAQ': { lat: 29.6117, lon: 35.0181 },
            
            // Iraq
            'ORBB': { lat: 33.2625, lon: 44.2346 },
            'ORMM': { lat: 36.2358, lon: 43.1478 },
            'ORBI': { lat: 30.5489, lon: 47.6622 },
            
            // Iran
            'OIKB': { lat: 35.6892, lon: 51.3131 },
            'OIIE': { lat: 32.7486, lon: 51.8611 }
        };
        
        return coords[station] || null;
    }
}

console.log('✅ Map Capture Utility loaded');
