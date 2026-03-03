"""
Enhanced PDF Generator with Wind Rose and NCM Logo
Integrates Python wind rose generation with PDF report
"""

import json
import sys
from datetime import datetime
import subprocess
import tempfile
import os

def generate_pdf_with_wind_rose(dust_data, output_path):
    """
    Generate PDF report with NCM logo and wind roses for each dust station
    
    Parameters:
    -----------
    dust_data : dict
        Dictionary containing:
        - 'stations': list of stations with dust events
        - 'start_date': report start date
        - 'end_date': report end date
        - 'metar_records': list of all METAR records
    output_path : str
        Path to save the PDF file
    """
    
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import cm
    from reportlab.pdfgen import canvas
    from reportlab.lib import colors
    from reportlab.platypus import Table, TableStyle
    from PIL import Image
    import wind_rose_generator as wrg
    
    # Create canvas
    c = canvas.Canvas(output_path, pagesize=A4)
    width, height = A4
    
    # Page 1: Title Page with NCM Logo
    # Add NCM Logo at top
    logo_path = 'public/static/ncm-logo.png'
    if os.path.exists(logo_path):
        # Center logo at top
        logo_width = 8 * cm
        logo_height = 3 * cm
        logo_x = (width - logo_width) / 2
        logo_y = height - 4 * cm
        
        c.drawImage(
            logo_path,
            logo_x,
            logo_y,
            width=logo_width,
            height=logo_height,
            preserveAspectRatio=True,
            mask='auto'
        )
    
    # Title - bilingual
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(width / 2, height - 6 * cm, "Dust and Sandstorm Events Report")
    
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(width / 2, height - 7 * cm, "تقرير أحداث العواصف الغبارية والرملية")
    
    # Date range
    c.setFont("Helvetica", 14)
    start_date = dust_data.get('start_date', '')
    end_date = dust_data.get('end_date', '')
    c.drawCentredString(width / 2, height - 9 * cm, f"Period: {start_date} to {end_date}")
    
    # Summary statistics
    c.setFont("Helvetica-Bold", 16)
    c.drawString(3 * cm, height - 12 * cm, "Summary Statistics")
    
    y_pos = height - 13.5 * cm
    stats = dust_data.get('summary', {})
    
    c.setFont("Helvetica", 12)
    for key, value in stats.items():
        c.drawString(4 * cm, y_pos, f"{key}: {value}")
        y_pos -= 0.7 * cm
    
    # Footer with disclaimer
    c.setFont("Helvetica-Oblique", 9)
    disclaimer = "Note: This report provides a preliminary analysis. Review by certified meteorologist recommended."
    c.drawString(2 * cm, 2 * cm, disclaimer)
    
    c.showPage()
    
    # Page 2+: Wind Roses for each station with dust
    stations = dust_data.get('stations', [])
    metar_records = dust_data.get('metar_records', [])
    
    for idx, station in enumerate(stations):
        station_code = station.get('code')
        station_name = station.get('name', station_code)
        dust_count = station.get('dust_reports', 0)
        
        if dust_count == 0:
            continue  # Skip stations without dust
        
        # Add NCM logo on each page
        if os.path.exists(logo_path):
            c.drawImage(
                logo_path,
                width - 6 * cm,
                height - 2.5 * cm,
                width=4 * cm,
                height=1.5 * cm,
                preserveAspectRatio=True,
                mask='auto'
            )
        
        # Station header
        c.setFont("Helvetica-Bold", 18)
        c.drawString(2 * cm, height - 3 * cm, f"Station: {station_name}")
        
        c.setFont("Helvetica", 12)
        c.drawString(2 * cm, height - 4 * cm, f"Code: {station_code}")
        c.drawString(2 * cm, height - 4.7 * cm, f"Dust Reports: {dust_count}")
        
        # Generate wind rose
        try:
            wind_rose_base64 = wrg.create_wind_rose_from_metar(metar_records, station_code)
            
            if wind_rose_base64:
                # Decode base64 and save to temp file
                import base64
                img_data = base64.b64decode(wind_rose_base64)
                
                with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp_file:
                    tmp_file.write(img_data)
                    tmp_path = tmp_file.name
                
                # Add wind rose image (large)
                rose_width = 14 * cm
                rose_height = 14 * cm
                rose_x = (width - rose_width) / 2
                rose_y = height - 20 * cm
                
                c.drawImage(
                    tmp_path,
                    rose_x,
                    rose_y,
                    width=rose_width,
                    height=rose_height,
                    preserveAspectRatio=True
                )
                
                # Clean up temp file
                os.unlink(tmp_path)
            else:
                # No wind data available
                c.setFont("Helvetica-Oblique", 12)
                c.drawString(4 * cm, height - 10 * cm, "Wind data not available for this station")
        
        except Exception as e:
            c.setFont("Helvetica-Oblique", 10)
            c.drawString(4 * cm, height - 10 * cm, f"Error generating wind rose: {str(e)}")
        
        # Add detailed METAR table
        c.setFont("Helvetica-Bold", 14)
        c.drawString(2 * cm, height - 22 * cm, "METAR Observations")
        
        # Filter METAR for this station with dust
        station_metar = [
            r for r in metar_records 
            if r.get('station') == station_code and r.get('has_dust', False)
        ]
        
        # Table data
        table_data = [['Time (UTC)', 'Weather', 'Wind', 'Visibility']]
        
        for record in station_metar[:10]:  # Limit to 10 records per page
            time_str = record.get('valid', '')[:16]
            weather = record.get('wxcodes', 'N/A')
            wind_dir = record.get('drct', 'N/A')
            wind_spd = record.get('sknt', 'N/A')
            wind_str = f"{wind_dir}° @ {wind_spd}kt"
            visibility = record.get('vsby', 'N/A')
            
            table_data.append([time_str, weather, wind_str, visibility])
        
        # Create table
        table = Table(table_data, colWidths=[4*cm, 4*cm, 4*cm, 3*cm])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
        ]))
        
        # Draw table
        table.wrapOn(c, width, height)
        table.drawOn(c, 2 * cm, height - 26 * cm - len(table_data) * 0.5 * cm)
        
        c.showPage()
    
    # Save PDF
    c.save()
    print(f"✅ PDF generated successfully: {output_path}")


if __name__ == '__main__':
    # Sample test data
    sample_data = {
        'start_date': '2026-03-02',
        'end_date': '2026-03-02',
        'summary': {
            'Total Stations': 5,
            'Stations with Dust': 2,
            'Total Dust Reports': 15,
            'BLDU Events': 8,
            'DU Events': 5,
            'DS Events': 2
        },
        'stations': [
            {
                'code': 'OERK',
                'name': 'King Khaled International Airport - Riyadh',
                'dust_reports': 8
            },
            {
                'code': 'OEJN',
                'name': 'King Abdulaziz International Airport - Jeddah',
                'dust_reports': 7
            }
        ],
        'metar_records': []  # Would contain actual METAR data
    }
    
    output = '/tmp/test_dust_report_with_roses.pdf'
    generate_pdf_with_wind_rose(sample_data, output)
    print(f"Test PDF saved to: {output}")
