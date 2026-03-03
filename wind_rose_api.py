#!/usr/bin/env python3
"""
API Service for Wind Rose Generation
Provides HTTP endpoint to generate wind roses from METAR data
"""

from flask import Flask, request, jsonify
import wind_rose_generator as wrg
import json

app = Flask(__name__)

@app.route('/api/generate-wind-rose', methods=['POST'])
def generate_wind_rose():
    """
    Generate wind rose from METAR data
    
    Request body:
    {
        "station_code": "OERK",
        "station_name": "Riyadh",
        "metar_records": [
            {
                "station": "OERK",
                "drct": "315",
                "sknt": "25",
                ...
            }
        ]
    }
    
    Response:
    {
        "success": true,
        "image_base64": "iVBORw0KGgoAAAANSUhEUg...",
        "station_code": "OERK"
    }
    """
    try:
        data = request.get_json()
        
        station_code = data.get('station_code')
        station_name = data.get('station_name', station_code)
        metar_records = data.get('metar_records', [])
        
        if not station_code or not metar_records:
            return jsonify({
                'success': False,
                'error': 'Missing required fields: station_code, metar_records'
            }), 400
        
        # Generate wind rose
        img_base64 = wrg.create_wind_rose_from_metar(metar_records, station_code)
        
        if not img_base64:
            return jsonify({
                'success': False,
                'error': 'No wind data available for this station'
            }), 404
        
        return jsonify({
            'success': True,
            'image_base64': img_base64,
            'station_code': station_code,
            'station_name': station_name
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/generate-sample-wind-rose', methods=['GET'])
def generate_sample():
    """Generate a sample wind rose for testing"""
    try:
        img_base64 = wrg.generate_sample_wind_rose()
        
        return jsonify({
            'success': True,
            'image_base64': img_base64,
            'station_code': 'SAMPLE',
            'station_name': 'Sample Station'
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    print("🚀 Starting Wind Rose API Server...")
    print("📍 Endpoint: http://localhost:5000/api/generate-wind-rose")
    print("📍 Sample: http://localhost:5000/api/generate-sample-wind-rose")
    app.run(host='0.0.0.0', port=5000, debug=True)
