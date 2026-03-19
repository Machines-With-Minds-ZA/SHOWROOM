#!/usr/bin/env python3
"""
QUICK START: Upload Thembisa Images

This script guides you through the entire process.
"""

import os
import sys

def print_header(text):
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}\n")

def main():
    print_header("🚀 THEMBISA ALBUM UPLOAD - QUICK START")
    
    print("You have 454 images on Google Drive to upload.")
    print("Here are your options:\n")
    
    print("┌─ METHOD 1: FULLY AUTOMATED (Recommended for 450+ images)")
    print("│")
    print("│  Command:")
    print("│  python drive_to_imgbb.py")
    print("│")
    print("│  ✓ Pros: Fully automatic, no download needed")
    print("│  ✗ Cons: Requires Drive API access")
    print("│")
    print("│  Time: ~8 minutes for 454 images")
    print()
    
    print("├─ METHOD 2: LOCALLY FROM FOLDER (Most Reliable)")
    print("│")
    print("│  Step 1: Download from Google Drive as ZIP")
    print("│  Step 2: Extract to tools/Add images/Thembisa/")
    print("│  Step 3: Run command")
    print("│  python local_folder_to_imgbb.py")
    print("│")
    print("│  ✓ Pros: Always works, can resume if interrupted")
    print("│  ✗ Cons: Requires manual download (~200MB)")
    print("│")
    print("│  Time: ~1 hour for downloading + 8 minutes for uploading")
    print()
    
    print("└─ PREREQUISITES (For Both Methods)")
    print()
    print("   1. ImgBB API Key (FREE):")
    print("      → https://api.imgbb.com/")
    print("      → Sign up and get your API key")
    print()
    print("   2. Already installed:")
    print("      ✓ Python 3.14+")
    print("      ✓ requests library")
    print()
    
    print_header("STEP-BY-STEP: RECOMMENDED SETUP")
    
    print("METHOD 2 IS RECOMMENDED (More reliable)\n")
    print("Step 1: Go to Google Drive folder")
    print("  URL: https://drive.google.com/drive/folders/184zK77hemG6yhMGjwGDFoN5OgYGk93gn")
    print("  → Select all (Ctrl+A)")
    print("  → Download as ZIP")
    print("  → Save: tools/Add images/Thembisa.zip")
    print("  → Extract to: tools/Add images/Thembisa/\n")
    
    print("Step 2: Run upload script")
    print("  Command: cd tools/Add images")
    print("  Command: python local_folder_to_imgbb.py\n")
    
    print("Step 3: Wait for uploads (8 minutes)")
    print("  ✓ Script uploads all 454 images")
    print("  ✓ Automatically adds 'Thembisa' album to data.json\n")
    
    print("Step 4: View your gallery!")
    print("  → Open: gallery.html")
    print("  → Click: Thembisa album\n")
    
    print_header("FULL AUTOMATION SETUP (METHOD 1)")
    
    print("If you want to try full automation:\n")
    print("1. Edit: drive_to_imgbb.py")
    print("   Find these lines (around line 16-18):")
    print("   DRIVE_FOLDER_ID = \"...(your folder ID)\"")
    print("   IMGBB_API_KEY = \"...(your API key)\"")
    print("   ALBUM_TITLE = \"Thembisa\"\n")
    
    print("2. Replace with YOUR values:")
    print("   - DRIVE_FOLDER_ID: 184zK77hemG6yhMGjwGDFoN5OgYGk93gn")
    print("   - IMGBB_API_KEY: (from https://api.imgbb.com/)\n")
    
    print("3. Run: python drive_to_imgbb.py\n")
    
    print_header("TROUBLESHOOTING")
    
    print("Q: Where do I get ImgBB API key?")
    print("A: https://api.imgbb.com/ → Sign up → Get API key (free!)\n")
    
    print("Q: I don't want to download 200MB locally")
    print("A: Try METHOD 1 (drive_to_imgbb.py)\n")
    
    print("Q: Script fails midway?")
    print("A: Just run again - it will continue from where it stopped\n")
    
    print("Q: How long will it take?")
    print("A: ~8 minutes for 454 images (1 image/second)\n")
    
    print("="*60)
    print("  Ready? Start with Step 1 above!")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
