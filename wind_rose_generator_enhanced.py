#!/usr/bin/env python3
"""
Enhanced Wind Rose Generator - Matches Reference Report Format
Creates large, full-page wind roses for each station with dust reports
"""

import matplotlib
matplotlib.use('Agg')  # Non-interactive backend

import matplotlib.pyplot as plt
import numpy as np
from windrose import WindroseAxes
import base64
from io import BytesIO
from PIL import Image
import sys
import json

def parse_metar_wind(metar_string):
    """Extract wind direction and speed from METAR string"""
    import re
    
    # Pattern: 25032G43KT or 25032KT
    pattern = r'(\d{3})(\d{2,3})(G(\d{2,3}))?KT'
    match = re.search(pattern, metar_string)
    
    if match:
        direction = int(match.group(1))
        speed = int(match.group(2))
        gust = int(match.group(4)) if match.group(4) else speed
        
        # Use gust speed if available for better representation
        return direction, gust
    
    return None, None

def create_large_wind_rose(station_code, metar_records, logo_path=None):
    """
    Create a large, full-page wind rose matching reference report style
    
    Parameters:
    - station_code: Station ICAO code
    - metar_records: List of dicts with 'metar' field
    - logo_path: Path to NCM logo (optional)
    
    Returns:
    - Base64 encoded PNG image
    """
    
    # Parse wind data from METAR records
    directions = []
    speeds = []
    
    for record in metar_records:
        direction, speed = parse_metar_wind(record.get('metar', ''))
        if direction is not None and speed is not None:
            directions.append(direction)
            speeds.append(speed)
    
    if len(directions) == 0:
        print(f"⚠️ No valid wind data for station {station_code}", file=sys.stderr)
        return None
    
    # Convert to numpy arrays
    directions = np.array(directions)
    speeds = np.array(speeds)
    
    # Create large figure (matching reference report - full page size)
    fig = plt.figure(figsize=(11, 11), dpi=150)  # 11x11 inches at 150 DPI = ~1650x1650 px
    
    # Create wind rose axes
    ax = WindroseAxes.from_ax(fig=fig)
    
    # Define speed bins (matching reference report style)
    # 0-5, 5-10, 10-15, 15-20, 20-25, 25-50 kt
    bins = [0, 5, 10, 15, 20, 25, 50]
    
    # Colors (warm to cool - red for high winds, green for low)
    # Must be exactly nbins (len(bins)) elements
    colors = ['#46e7c4', '#7fdb6a', '#b4d93c', '#ffd32a', '#ff9f1a', '#ff6347', '#cc0000']
    
    # Create wind rose with 16 directions
    ax.bar(directions, speeds, 
           bins=bins,
           opening=0.85,
           edgecolor='white',
           linewidth=0.5,
           cmap=plt.cm.RdYlGn_r,  # Use colormap instead of fixed colors
           nsector=16)  # 16 cardinal directions
    
    # Customize appearance
    ax.set_legend(title='Wind Speed (kt)',
                  bbox_to_anchor=(1.15, 0.5),
                  loc='center left',
                  fontsize=10,
                  title_fontsize=11,
                  frameon=True)
    
    # Add title
    fig.suptitle(f'Wind Rose - Station {station_code}', 
                 fontsize=16, 
                 fontweight='bold',
                 y=0.98)
    
    # Add statistics
    stats_text = f'Observations: {len(directions)}\n'
    stats_text += f'Avg Speed: {np.mean(speeds):.1f} kt\n'
    stats_text += f'Max Speed: {np.max(speeds):.0f} kt\n'
    stats_text += f'Min Speed: {np.min(speeds):.0f} kt'
    
    plt.figtext(0.02, 0.02, stats_text, 
                fontsize=9,
                bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.3))
    
    # Add NCM logo if provided
    if logo_path:
        try:
            logo = Image.open(logo_path)
            # Resize logo to fit
            logo_width = int(fig.get_figwidth() * fig.dpi * 0.15)
            logo_height = int(logo_width * logo.size[1] / logo.size[0])
            logo = logo.resize((logo_width, logo_height), Image.Resampling.LANCZOS)
            
            # Add logo to top right
            from matplotlib.offsetbox import OffsetImage, AnnotationBbox
            imagebox = OffsetImage(logo, zoom=1)
            ab = AnnotationBbox(imagebox, (0.95, 0.95), 
                              frameon=False,
                              xycoords='figure fraction',
                              boxcoords="figure fraction",
                              pad=0)
            fig.add_artist(ab)
        except Exception as e:
            print(f"⚠️ Could not load logo: {e}", file=sys.stderr)
    
    # Tight layout
    plt.tight_layout(rect=[0, 0.03, 1, 0.97])
    
    # Save to BytesIO
    buf = BytesIO()
    plt.savefig(buf, format='png', dpi=150, bbox_inches='tight', facecolor='white')
    plt.close(fig)
    
    # Convert to base64
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    
    return f"data:image/png;base64,{img_base64}"

def generate_wind_roses_for_all_stations(analysis_data, logo_path=None):
    """
    Generate wind roses for all stations in analysis
    
    Parameters:
    - analysis_data: Dict with 'stationData' field containing records
    - logo_path: Path to NCM logo
    
    Returns:
    - Dict mapping station codes to base64 image data
    """
    
    # Group records by station
    stations = {}
    for record in analysis_data.get('stationData', []):
        station = record.get('station', 'UNKNOWN')
        if station not in stations:
            stations[station] = []
        stations[station].append(record)
    
    # Generate wind rose for each station
    wind_roses = {}
    
    print(f"🌪️ Generating wind roses for {len(stations)} stations...", file=sys.stderr)
    
    for station_code, records in stations.items():
        print(f"  Processing {station_code} ({len(records)} records)...", file=sys.stderr)
        
        img_data = create_large_wind_rose(station_code, records, logo_path)
        
        if img_data:
            wind_roses[station_code] = {
                'imageBase64': img_data,
                'recordCount': len(records)
            }
            print(f"  ✅ Generated wind rose for {station_code}", file=sys.stderr)
        else:
            print(f"  ⚠️ Failed to generate wind rose for {station_code}", file=sys.stderr)
    
    return wind_roses

def main():
    """Main function for testing"""
    
    # Sample METAR data (Jordan stations from reference report)
    sample_data = {
        'stationData': [
            {'station': 'OJAI', 'metar': 'OJAI 122200Z 25032G43KT 2000 BLDU NSC 09/02 Q1012 NOSIG'},
            {'station': 'OJAI', 'metar': 'OJAI 122100Z 26032KT 2000 BLDU NSC 09/02 Q1012 NOSIG'},
            {'station': 'OJAI', 'metar': 'OJAI 122000Z 26025KT 2000 BLDU SCT035 09/03 Q1012 NOSIG'},
            {'station': 'OJAI', 'metar': 'OJAI 121900Z 25017KT 3000 BLDU NSC 09/03 Q1013 NOSIG'},
            {'station': 'OJAI', 'metar': 'OJAI 121800Z 26016KT 3000 BLDU NSC 09/03 Q1013 NOSIG'},
            {'station': 'OJAM', 'metar': 'OJAM 122100Z 24023KT 3000 BLDU NSC 09/02 Q1012 NOSIG'},
            {'station': 'OJAM', 'metar': 'OJAM 122000Z 25024KT 3000 BLDU NSC 09/02 Q1012 NOSIG'},
            {'station': 'OJAQ', 'metar': 'OJAQ 122200Z 30016KT 5000 BLDU NSC 17/01 Q1017 NOSIG'},
            {'station': 'OMDW', 'metar': 'OMDW 120530Z 14004KT 5000 DU NSC 18/12 Q1023 BECMG 7000 NSW'}
        ]
    }
    
    logo_path = '/home/user/webapp/public/static/ncm-logo.png'
    
    wind_roses = generate_wind_roses_for_all_stations(sample_data, logo_path)
    
    print("\n✅ Generated wind roses:", file=sys.stderr)
    for station, data in wind_roses.items():
        print(f"  - {station}: {data['recordCount']} records", file=sys.stderr)
    
    # Output as JSON for integration
    output = {
        'success': True,
        'windRoses': wind_roses
    }
    
    print(json.dumps(output, indent=2))

if __name__ == '__main__':
    main()
