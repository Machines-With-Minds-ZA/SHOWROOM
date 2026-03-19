"""
Automated Google Drive to ImgBB to JSON Pipeline
Reads images from Google Drive shared folder, uploads to ImgBB, adds to data.json
"""

import os
import json
import uuid
import requests
import time
from pathlib import Path
from io import BytesIO
import sys

# Configuration
DRIVE_FOLDER_ID = "184zK77hemG6yhMGjwGDFoN5OgYGk93gn"
IMGBB_API_KEY = "4bd352e268193eafeb258a1985de560c"
ALBUM_TITLE = "Thembisa"

# Rate limiting for ImgBB API (they have limits)
UPLOAD_DELAY = 0.5  # seconds between uploads

class GoogleDriveDownloader:
    """Download images directly from Google Drive shared folder"""
    
    @staticmethod
    def get_direct_download_url(file_id):
        """Convert Google Drive file ID to direct download URL"""
        return f"https://drive.google.com/uc?export=download&id={file_id}"
    
    @staticmethod
    def download_file(drive_url, file_name):
        """Download a file from Google Drive directly"""
        try:
            response = requests.get(drive_url, timeout=30)
            response.raise_for_status()
            return BytesIO(response.content)
        except Exception as e:
            print(f"  ✗ Failed to download {file_name}: {str(e)}")
            return None


class ImgBBUploader:
    """Upload images to ImgBB and get hosting URLs"""
    
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.imgbb.com/1/upload"
    
    def upload_image(self, image_data, image_name):
        """Upload image to ImgBB and return hosted URL"""
        try:
            files = {'image': image_data}
            data = {'key': self.api_key}
            
            response = requests.post(self.base_url, data=data, files=files, timeout=60)
            response.raise_for_status()
            
            result = response.json()
            if result.get('success'):
                hosted_url = result['data']['url']
                # Convert to optimized ImgBB CDN format if possible
                if 'ibb.co' in hosted_url:
                    # ImgBB URLs can be optimized - extract the ID
                    return hosted_url
                return hosted_url
            else:
                print(f"  ✗ ImgBB error: {result.get('error', {}).get('message', 'Unknown error')}")
                return None
                
        except Exception as e:
            print(f"  ✗ Upload failed for {image_name}: {str(e)}")
            return None


class GoogleDriveFolderReader:
    """Read files from Google Drive shared folder using public API"""
    
    @staticmethod
    def list_files_from_folder(folder_id):
        """
        Get list of files from a Google Drive folder
        Uses a workaround since full API requires OAuth
        """
        print(f"\n📂 Reading files from Google Drive folder...")
        
        # This endpoint allows listing shared folders without authentication
        url = f"https://www.googleapis.com/drive/v3/files?q=%27{folder_id}%27%20in%20parents&key=AIzaSyDiR7UswK9hKJHaqkn5EBWJFqSYX5r7Qjc"
        
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 403:
                print("\n⚠️  Google Drive API key needed. Using alternative method...\n")
                return GoogleDriveFolderReader.get_files_from_shared_link(folder_id)
            
            result = response.json()
            files = result.get('files', [])
            return files
        except Exception as e:
            print(f"⚠️  Could not use Drive API directly: {str(e)}")
            print("Using alternative method...")
            return None
    
    @staticmethod
    def get_files_from_shared_link(folder_id):
        """
        Alternative: Download folder files using rclone or manual method
        For now, returns empty list with instructions
        """
        print("\n" + "="*60)
        print("ALTERNATIVE METHOD - Download via Google Drive Web Interface:")
        print("="*60)
        print(f"\n1. Open: https://drive.google.com/drive/folders/{folder_id}")
        print("2. Select ALL images (Ctrl+A)")
        print("3. Download as ZIP")
        print("4. Extract to: tools/Add images/Thembisa/")
        print("5. Run this script again or use add_album.py")
        print("="*60 + "\n")
        return []


class AlbumGenerator:
    """Generate album JSON and add to data.json"""
    
    def __init__(self, json_path):
        self.json_path = json_path
    
    def add_album(self, album_data):
        """Add new album to data.json"""
        try:
            with open(self.json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Check if album already exists
            if any(a['title'] == album_data['title'] for a in data['albums']):
                print(f"\n⚠️  Album '{album_data['title']}' already exists!")
                return False
            
            data['albums'].append(album_data)
            
            with open(self.json_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            print(f"✓ Album added to data.json!")
            return True
        except Exception as e:
            print(f"✗ Failed to add album to JSON: {str(e)}")
            return False


def main():
    print("\n" + "="*60)
    print("🚀 Google Drive → ImgBB → JSON Pipeline")
    print("="*60)
    
    # Paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_file = os.path.join(script_dir, '..', '..', 'assets', 'json', 'data.json')
    json_file = os.path.abspath(json_file)
    
    print(f"\n📝 Album Title: {ALBUM_TITLE}")
    print(f"🔑 ImgBB API Key: {IMGBB_API_KEY[:10]}...")
    print(f"📂 Drive Folder ID: {DRIVE_FOLDER_ID}")
    print(f"💾 Target JSON: {json_file}\n")
    
    # Step 1: Try to list files from Drive
    print("Step 1: Reading Google Drive folder...")
    drive_reader = GoogleDriveFolderReader()
    files = drive_reader.list_files_from_folder(DRIVE_FOLDER_ID)
    
    if not files:
        print("\n⚠️  Could not access Google Drive folder directly.")
        print("\nDue to Google Drive API restrictions, here are your options:\n")
        print("OPTION 1 (Fastest): Download folder locally")
        print("  - Download images from Drive as ZIP")
        print("  - Extract to: tools/Add images/Thembisa/")
        print("  - Run: python add_album.py with Thembisa folder\n")
        
        print("OPTION 2 (Recommended): Use rclone")
        print("  - Install rclone: https://rclone.org/install/")
        print("  - Setup Google Drive: rclone config")
        print("  - Then modify this script to use rclone sync\n")
        
        print("OPTION 3 (Manual): Create text file")
        print("  - Create Thembisa.txt")
        print("  - Paste ImgBB links in BBCode format:")
        print("  - [url=https://ibb.co/xxx][img]https://i.ibb.co/xxx.webp[/img][/url]")
        print("  - Run: python add_album.py\n")
        
        return
    
    print(f"\n✓ Found {len(files)} files in folder")
    
    # Filter for image files
    image_files = [f for f in files if f.get('mimeType', '').startswith('image/')]
    print(f"✓ Found {len(image_files)} image files\n")
    
    if not image_files:
        print("✗ No image files found in folder!")
        return
    
    # Step 2: Upload to ImgBB
    print(f"Step 2: Uploading {len(image_files)} images to ImgBB...")
    print("(This may take a few minutes for 454 images)\n")
    
    imgbb = ImgBBUploader(IMGBB_API_KEY)
    uploaded_urls = []
    failed_uploads = []
    
    for idx, file_info in enumerate(image_files, 1):
        file_id = file_info['id']
        file_name = file_info['name']
        
        print(f"  [{idx}/{len(image_files)}] Uploading {file_name}...", end='', flush=True)
        
        # Download from Drive
        drive_url = GoogleDriveDownloader.get_direct_download_url(file_id)
        image_data = GoogleDriveDownloader.download_file(drive_url, file_name)
        
        if not image_data:
            failed_uploads.append(file_name)
            print(" ✗")
            continue
        
        # Upload to ImgBB
        hosted_url = imgbb.upload_image(image_data, file_name)
        
        if hosted_url:
            uploaded_urls.append(hosted_url)
            print(f" ✓")
            time.sleep(UPLOAD_DELAY)  # Rate limiting
        else:
            failed_uploads.append(file_name)
            print(" ✗")
    
    print(f"\n✓ Successfully uploaded {len(uploaded_urls)} images")
    if failed_uploads:
        print(f"✗ Failed to upload {len(failed_uploads)} images")
    
    # Step 3: Create album and add to JSON
    if uploaded_urls:
        print(f"\nStep 3: Adding album to JSON...")
        
        album = {
            "id": str(uuid.uuid4())[:8],
            "title": ALBUM_TITLE,
            "cover": uploaded_urls[0],
            "images": uploaded_urls
        }
        
        generator = AlbumGenerator(json_file)
        if generator.add_album(album):
            print(f"\n✓ Album '{ALBUM_TITLE}' added successfully!")
            print(f"  - ID: {album['id']}")
            print(f"  - Images: {len(uploaded_urls)}")
            print(f"\n✓ DONE! Visit gallery.html to see your new album.\n")
        else:
            print("\n⚠️  Album could not be added to JSON")
    else:
        print("\n✗ No images were uploaded!")


if __name__ == "__main__":
    main()
