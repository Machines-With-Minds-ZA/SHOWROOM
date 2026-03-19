#!/usr/bin/env python3
"""
Convert Thembisa album images from JPG to WebP format in data.json
This improves performance as WebP files are smaller and faster to load.
"""

import json
import os

def convert_thembisa_to_webp():
    data_file = 'assets/json/data.json'
    
    # Read the data
    with open(data_file, 'r') as f:
        data = json.load(f)
    
    # Find and update Thembisa album
    for album in data['albums']:
        if album['title'] == 'Thembisa':
            print(f"Found Thembisa album with {len(album['images'])} images")
            
            # Convert cover image
            original_cover = album['cover']
            album['cover'] = original_cover.replace('.jpg', '.webp')
            print(f"Cover: {original_cover} -> {album['cover']}")
            
            # Convert all images
            for i, img_url in enumerate(album['images']):
                album['images'][i] = img_url.replace('.jpg', '.webp')
            
            print(f"✓ Converted {len(album['images'])} image URLs from JPG to WebP")
            break
    
    # Write back the data
    with open(data_file, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"\n✓ Successfully updated {data_file}")
    print("Images should now load much faster!")

if __name__ == '__main__':
    convert_thembisa_to_webp()
