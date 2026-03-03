#!/usr/bin/env python3
"""
Wind Rose Generator for Dust Storm Reports
Generates wind rose diagrams for stations with dust events
"""

import matplotlib.pyplot as plt
import numpy as np
from windrose import WindroseAxes
import pandas as pd
from matplotlib import cm
import io
import base64

def create_wind_rose(wind_data, station_name, output_path=None):
    """
    Create a large, colorful wind rose diagram for a station
    
    Parameters:
    -----------
    wind_data : dict
        Dictionary containing:
        - 'speed': list of wind speeds in knots
        - 'direction': list of wind directions in degrees
    station_name : str
        Name of the weather station
    output_path : str, optional
        Path to save the image (PNG). If None, returns base64 string
    
    Returns:
    --------
    str : base64 encoded image if output_path is None
    """
    
    # Create figure with large size
    fig = plt.figure(figsize=(12, 12), dpi=150)
    ax = WindroseAxes.from_ax(fig=fig)
    
    # Extract data
    speeds = wind_data['speed']
    directions = wind_data['direction']
    
    # Define wind speed bins (in knots)
    bins = [0, 5, 10, 15, 20, 25, 50]
    
    # Create wind rose with colorful bars
    ax.bar(
        directions, 
        speeds, 
        bins=bins,
        normed=True,
        opening=0.8,
        edgecolor='white',
        cmap=cm.get_cmap('RdYlGn_r'),  # Red-Yellow-Green reversed (Red = high speed)
        nsector=16  # 16 directions for detailed view
    )
    
    # Customize appearance
    ax.set_title(
        f'Wind Rose - {station_name}\nDust Event Analysis',
        fontsize=18,
        fontweight='bold',
        pad=20
    )
    
    # Add legend
    ax.set_legend(
        title='Wind Speed (knots)',
        loc='upper left',
        bbox_to_anchor=(1.05, 1),
        fontsize=11,
        title_fontsize=12
    )
    
    # Set radial grid
    ax.set_yticks(np.arange(5, 31, 5))
    ax.set_yticklabels([f'{i}%' for i in range(5, 31, 5)])
    
    plt.tight_layout()
    
    if output_path:
        # Save to file
        plt.savefig(output_path, bbox_inches='tight', dpi=150)
        plt.close()
        return output_path
    else:
        # Return as base64 string
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight', dpi=150)
        buf.seek(0)
        img_base64 = base64.b64encode(buf.read()).decode('utf-8')
        plt.close()
        return img_base64


def create_wind_rose_from_metar(metar_records, station_code):
    """
    Create wind rose from METAR records for a specific station
    
    Parameters:
    -----------
    metar_records : list of dict
        List of METAR records with wind data
    station_code : str
        Station identifier (e.g., 'OERK')
    
    Returns:
    --------
    str : base64 encoded wind rose image
    """
    
    # Filter records for this station
    station_records = [r for r in metar_records if r.get('station') == station_code]
    
    if not station_records:
        return None
    
    # Extract wind data
    speeds = []
    directions = []
    
    for record in station_records:
        # Get wind direction (drct) and speed (sknt)
        direction = record.get('drct')
        speed = record.get('sknt')
        
        # Skip missing or invalid data
        if direction and speed and direction != 'M' and speed != 'M':
            try:
                dir_val = float(direction)
                spd_val = float(speed)
                
                # Skip calm winds (direction 0 or 360)
                if 0 < dir_val <= 360 and spd_val > 0:
                    directions.append(dir_val)
                    speeds.append(spd_val)
            except (ValueError, TypeError):
                continue
    
    if not speeds or not directions:
        return None
    
    # Create wind rose
    wind_data = {
        'speed': speeds,
        'direction': directions
    }
    
    station_name = record.get('station_name', station_code)
    
    return create_wind_rose(wind_data, station_name)


def generate_sample_wind_rose():
    """
    Generate a sample wind rose for testing
    """
    # Generate sample data
    np.random.seed(42)
    
    # Simulate wind predominantly from NW (315°) and SW (225°)
    directions_nw = np.random.normal(315, 15, 100)
    directions_sw = np.random.normal(225, 15, 80)
    directions_other = np.random.uniform(0, 360, 20)
    
    directions = np.concatenate([directions_nw, directions_sw, directions_other])
    directions = directions % 360  # Ensure 0-360 range
    
    # Speeds: higher for NW winds (dust storms)
    speeds_nw = np.random.gamma(3, 8, 100)
    speeds_sw = np.random.gamma(2.5, 6, 80)
    speeds_other = np.random.gamma(2, 4, 20)
    
    speeds = np.concatenate([speeds_nw, speeds_sw, speeds_other])
    
    wind_data = {
        'speed': speeds.tolist(),
        'direction': directions.tolist()
    }
    
    img_base64 = create_wind_rose(wind_data, 'OERK - Riyadh (Sample)')
    
    return img_base64


if __name__ == '__main__':
    # Test the wind rose generator
    print("Generating sample wind rose...")
    img_base64 = generate_sample_wind_rose()
    print(f"Generated wind rose image (base64 length: {len(img_base64)} chars)")
    print("Success! ✅")
