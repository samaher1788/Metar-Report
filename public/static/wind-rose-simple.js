// Simple Wind Rose Generator (Client-Side Canvas)
// Creates wind rose visualization using HTML5 Canvas

class SimpleWindRoseGenerator {
    constructor() {
        this.canvas = null;
        this.ctx = null;
    }

    // Generate wind rose from METAR data
    generateWindRose(stationCode, metarRecords) {
        // Parse wind data
        const windData = this.parseWindData(metarRecords);
        
        if (windData.length === 0) {
            return null;
        }

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');

        // White background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw wind rose
        this.drawWindRose(ctx, windData, canvas.width, canvas.height);

        // Add station name
        ctx.fillStyle = '#000';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Wind Rose - Station ${stationCode}`, canvas.width / 2, 40);

        // Add statistics
        const stats = this.calculateStats(windData);
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Observations: ${stats.count}`, 20, canvas.height - 60);
        ctx.fillText(`Avg Speed: ${stats.avgSpeed.toFixed(1)} kt`, 20, canvas.height - 40);
        ctx.fillText(`Max Speed: ${stats.maxSpeed} kt`, 20, canvas.height - 20);

        // Convert to base64
        return canvas.toDataURL('image/png');
    }

    // Parse wind data from METAR records
    parseWindData(records) {
        const data = [];
        
        records.forEach(record => {
            const metar = record.metar || '';
            
            // Parse wind: 25032G43KT or 25032KT
            const windMatch = metar.match(/(\d{3})(\d{2,3})(G(\d{2,3}))?KT/);
            
            if (windMatch) {
                const direction = parseInt(windMatch[1]);
                const speed = parseInt(windMatch[2]);
                const gust = windMatch[4] ? parseInt(windMatch[4]) : speed;
                
                data.push({
                    direction: direction,
                    speed: gust // Use gust for better representation
                });
            }
        });
        
        return data;
    }

    // Draw wind rose diagram
    drawWindRose(ctx, windData, width, height) {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 100;

        // 16 directions
        const directions = 16;
        const angleStep = (2 * Math.PI) / directions;

        // Speed bins
        const bins = [0, 5, 10, 15, 20, 25, 50];
        const colors = ['#90EE90', '#ADFF2F', '#FFD700', '#FFA500', '#FF6347', '#DC143C'];

        // Count observations per direction and speed bin
        const directionBins = new Array(directions).fill(0).map(() => new Array(bins.length - 1).fill(0));
        
        windData.forEach(w => {
            const dirIndex = Math.floor(((w.direction + 11.25) % 360) / 22.5);
            for (let i = 0; i < bins.length - 1; i++) {
                if (w.speed >= bins[i] && w.speed < bins[i + 1]) {
                    directionBins[dirIndex][i]++;
                    break;
                }
            }
        });

        // Find max for scaling
        let maxCount = 0;
        directionBins.forEach(dir => {
            const total = dir.reduce((a, b) => a + b, 0);
            maxCount = Math.max(maxCount, total);
        });

        // Draw concentric circles (grid)
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        for (let i = 1; i <= 4; i++) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, (radius / 4) * i, 0, 2 * Math.PI);
            ctx.stroke();
        }

        // Draw direction lines and labels
        ctx.strokeStyle = '#ccc';
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const directionLabels = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

        for (let i = 0; i < directions; i++) {
            const angle = i * angleStep - Math.PI / 2;
            
            // Direction line
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + Math.cos(angle) * radius,
                centerY + Math.sin(angle) * radius
            );
            ctx.stroke();

            // Direction label
            const labelX = centerX + Math.cos(angle) * (radius + 30);
            const labelY = centerY + Math.sin(angle) * (radius + 30);
            ctx.fillText(directionLabels[i], labelX, labelY);
        }

        // Draw wind rose bars
        for (let dir = 0; dir < directions; dir++) {
            const angle = dir * angleStep - Math.PI / 2;
            const nextAngle = angle + angleStep;

            let currentRadius = 0;

            for (let bin = 0; bin < bins.length - 1; bin++) {
                const count = directionBins[dir][bin];
                if (count === 0) continue;

                const barLength = (count / maxCount) * radius;
                const nextRadius = currentRadius + barLength;

                // Draw bar segment
                ctx.fillStyle = colors[bin];
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, currentRadius, angle, nextAngle);
                ctx.arc(centerX, centerY, nextRadius, nextAngle, angle, true);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = 'white';
                ctx.lineWidth = 1;
                ctx.stroke();

                currentRadius = nextRadius;
            }
        }

        // Draw legend
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        const legendX = width - 150;
        let legendY = 100;

        ctx.fillStyle = '#000';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Wind Speed (kt)', legendX, legendY);
        legendY += 25;

        for (let i = 0; i < bins.length - 1; i++) {
            ctx.fillStyle = colors[i];
            ctx.fillRect(legendX, legendY, 20, 15);
            ctx.strokeStyle = '#666';
            ctx.strokeRect(legendX, legendY, 20, 15);

            ctx.fillStyle = '#000';
            ctx.font = '12px Arial';
            ctx.fillText(`${bins[i]}-${bins[i + 1]}`, legendX + 25, legendY + 7);
            legendY += 20;
        }
    }

    // Calculate statistics
    calculateStats(windData) {
        if (windData.length === 0) {
            return { count: 0, avgSpeed: 0, maxSpeed: 0, minSpeed: 0 };
        }

        const speeds = windData.map(w => w.speed);
        const sum = speeds.reduce((a, b) => a + b, 0);

        return {
            count: windData.length,
            avgSpeed: sum / windData.length,
            maxSpeed: Math.max(...speeds),
            minSpeed: Math.min(...speeds)
        };
    }
}

// Export for use
window.SimpleWindRoseGenerator = SimpleWindRoseGenerator;
