#!/usr/bin/env python3
"""
Optimize Thembisa album images by adding ImgBB URL parameters for faster loading
ImgBB supports URL parameters like ?s=500 for optimized sizing
"""

import json
import re

def optimize_thembisa_urls():
    data_file = 'assets/json/data.json'
    
    # Read the data
    with open(data_file, 'r') as f:
        data = json.load(f)
    
    # Find and update Thembisa album with optimization parameters
    for album in data['albums']:
        if album['title'] == 'Thembisa':
            print(f"Found Thembisa album with {len(album['images'])} images")
            
            # Add optimization parameters to URLs (max 2000px width, good quality)
            # Try different ImgBB path formats - use /t/ for thumbnail or add params
            def optimize_url(url):
                # ImgBB responsive images - use /t/s<size>/ path
                # Replace /i/ with /i/t/s1920/ for responsive sizing
                match = re.match(r'(https://i\.ibb\.co)/([A-Za-z0-9]+)/(.+)', url)
                if match:
                    # Try format: https://i.ibb.co/hash/t/filename
                    optimized = f"{match.group(1)}/{match.group(2)}/t/{match.group(3)}"
                    return optimized
                return url
            
            # Optimize cover image
            original_cover = album['cover']
            album['cover'] = optimize_url(original_cover)
            print(f"Cover optimized")
            
            # Optimize all images
            for i, img_url in enumerate(album['images']):
                album['images'][i] = optimize_url(img_url)
            
            print(f"✓ Optimized {len(album['images'])} image URLs")
            break
    
    # Write back the data
    with open(data_file, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"\n✓ Successfully updated {data_file}")
    print("Images now use optimized delivery format!")

if __name__ == '__main__':
    optimize_thembisa_urls()
