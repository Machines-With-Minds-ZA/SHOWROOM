"""
FAST Google Drive to ImgBB using local files
Optimized with concurrent uploads (10x faster!)

Workflow:
1. Download images from Google Drive as ZIP
2. Extract to a folder
3. This script uploads them all CONCURRENTLY to ImgBB and creates JSON entry
"""

import os
import json
import uuid
import requests
import time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

IMGBB_API_KEY = "4bd352e268193eafeb258a1985de560c"
ALBUM_TITLE = "Thembisa"
MAX_WORKERS = 10  # 10 concurrent uploads (FAST!)

# Thread-safe progress tracking
progress_lock = threading.Lock()
progress_counter = 0
total_images = 0

class ImgBBUploader:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.imgbb.com/1/upload"
    
    def upload_image(self, image_path):
        """Upload image file to ImgBB (thread-safe)"""
        try:
            with open(image_path, 'rb') as f:
                files = {'image': f}
                data = {'key': self.api_key}
                response = requests.post(self.base_url, data=data, files=files, timeout=60)
                response.raise_for_status()
            
            result = response.json()
            if result.get('success'):
                return result['data']['url']
            else:
                return None
        except Exception as e:
            return None


def upload_image_task(uploader, image_path, filename):
    """Upload a single image and report progress"""
    global progress_counter
    
    url = uploader.upload_image(image_path)
    
    with progress_lock:
        progress_counter += 1
        percent = (progress_counter / total_images) * 100
        status = "✓" if url else "✗"
        print(f"  [{progress_counter}/{total_images}] {status} {filename:<40} ({percent:.1f}%)")
    
    return (url, filename) if url else None


def upload_folder_to_imgbb(folder_path, album_title):
    """Upload all images from a folder CONCURRENTLY"""
    global progress_counter, total_images
    
    print("\n" + "="*60)
    print(f"⚡ FAST CONCURRENT UPLOAD")
    print(f"📤 Source: {folder_path}")
    print(f"🚀 Using {MAX_WORKERS} concurrent uploads")
    print("="*60 + "\n")
    
    # Get image files
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'}
    image_files = [
        f for f in os.listdir(folder_path) 
        if os.path.isfile(os.path.join(folder_path, f)) 
        and Path(f).suffix.lower() in image_extensions
    ]
    
    image_files.sort()  # Consistent order
    
    if not image_files:
        print(f"✗ No image files found in {folder_path}")
        return []
    
    total_images = len(image_files)
    progress_counter = 0
    
    print(f"✓ Found {total_images} images")
    print(f"⏱️  Starting concurrent upload...\n")
    
    start_time = time.time()
    uploader = ImgBBUploader(IMGBB_API_KEY)
    uploaded_urls = {}
    failed = []
    
    # Use ThreadPoolExecutor for concurrent uploads
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {}
        
        # Submit all upload tasks
        for filename in image_files:
            file_path = os.path.join(folder_path, filename)
            future = executor.submit(upload_image_task, uploader, file_path, filename)
            futures[future] = filename
        
        # Collect results as they complete
        for future in as_completed(futures):
            result = future.result()
            if result:
                url, filename = result
                uploaded_urls[filename] = url
            else:
                failed.append(futures[future])
    
    # Restore original order
    uploaded_list = [uploaded_urls[f] for f in image_files if f in uploaded_urls]
    
    elapsed = time.time() - start_time
    print(f"\n{'='*60}")
    print(f"✓ Uploaded {len(uploaded_list)} images in {elapsed:.1f}s")
    if failed:
        print(f"✗ Failed: {len(failed)} images")
    print(f"⚡ Speed: {len(uploaded_list) / elapsed:.1f} images/sec")
    print(f"{'='*60}\n")
    
    return uploaded_list


def add_album_to_json(album_title, image_urls):
    """Add album to data.json"""
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, '..', '..', 'assets', 'json', 'data.json')
    json_path = os.path.abspath(json_path)
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if not image_urls:
            print("✗ No images to add!")
            return False
        
        album = {
            "id": str(uuid.uuid4())[:8],
            "title": album_title,
            "cover": image_urls[0],
            "images": image_urls
        }
        
        data['albums'].append(album)
        
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        
        print(f"\n✓ Album '{album_title}' added to data.json!")
        print(f"  ID: {album['id']}")
        print(f"  Images: {len(image_urls)}\n")
        return True
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        return False


if __name__ == "__main__":
    print("\n🚀 Local Folder → ImgBB → JSON (FAST!)\n")
    
    # Try multiple locations for the images
    possible_paths = [
        r"C:\Users\mbofh\OneDrive\Documents\GitHub\glow-website-hub\tools\Thembisa",  # User's specified location
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Thembisa'),  # tools/Thembisa
        os.path.join(os.path.dirname(os.path.abspath(__file__)), ALBUM_TITLE),  # tools/Add images/Thembisa
    ]
    
    default_folder = None
    for path in possible_paths:
        if os.path.isdir(path):
            default_folder = path
            break
    
    if not default_folder:
        default_folder = possible_paths[0]
    
    folder_path = input(f"Enter folder path [{default_folder}]: ").strip() or default_folder
    
    if not os.path.isdir(folder_path):
        print(f"✗ Folder not found: {folder_path}")
        print(f"\nTried:")
        for path in possible_paths:
            exists = "✓" if os.path.isdir(path) else "✗"
            print(f"  {exists} {path}")
        exit(1)
    
    # Upload images
    urls = upload_folder_to_imgbb(folder_path, ALBUM_TITLE)
    
    if urls:
        add_album_to_json(ALBUM_TITLE, urls)
