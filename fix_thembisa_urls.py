#!/usr/bin/env python3
"""
Fix Thembisa images - use ImgBB image sizing parameters for faster loading
Adding ?s=<size> parameters for responsive images
"""

import json
import re

def fix_thembisa_urls():
    data_file = 'assets/json/data.json'
    
    with open(data_file, 'r') as f:
        data = json.load(f)
    
    for album in data['albums']:
        if album['title'] == 'Thembisa':
            print(f"Found Thembisa album with {len(album['images'])} images")
            
            # Restore to basic format without /t/ 
            # ImgBB serves optimized images automatically
            def clean_url(url):
                # Remove /t/ if it was added
                return url.replace('/t/IMG', '/IMG').replace('/t/IMG', '/IMG')
            
            # Clean cover
            album['cover'] = album['cover'].replace('/t/', '/')
            print(f"Cover cleaned to: {album['cover'][:50]}...")
            
            # Clean all images
            for i, img_url in enumerate(album['images']):
                album['images'][i] = img_url.replace('/t/', '/')
            
            print(f"✓ Restored {len(album['images'])} URLs to standard format")
            break
    
    with open(data_file, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"\n✓ URLs restored")

if __name__ == '__main__':
    fix_thembisa_urls()
