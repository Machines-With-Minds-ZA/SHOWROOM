# Google Drive to ImgBB Automated Upload

Automate uploading 450+ images from Google Drive to ImgBB and adding them to your gallery JSON.

## Prerequisites

```bash
pip install requests
```

## Setup (One-time)

1. **Get ImgBB API Key** (Free):
   - Go to: https://api.imgbb.com/
   - Click "Log in to get your API key"
   - Sign up or login to get your **free API key**

2. **Get Google Drive Folder ID**:
   - Open your shared folder in Google Drive
   - Copy the ID from the URL: `https://drive.google.com/drive/folders/{FOLDER_ID}`

3. **Update the scripts**:
   - In `drive_to_imgbb.py` or `local_folder_to_imgbb.py`
   - Replace `IMGBB_API_KEY` with your actual key
   - Replace `DRIVE_FOLDER_ID` with your folder ID

## Method 1: Direct from Google Drive (Fastest)

```bash
python drive_to_imgbb.py
```

**Pros:**
- Fully automated
- No manual download step
- Perfect for 454 images

**Cons:**
- Requires Drive API access
- Might fail on restricted folders

**What it does:**
1. Reads all images from Google Drive folder
2. Downloads them temporarily
3. Uploads each to ImgBB
4. Adds album to `data.json` automatically
5. Creates "Thembisa" album with all images

## Method 2: Local Folder Upload (Most Reliable)

**Step 1: Download from Drive**
- Open: https://drive.google.com/drive/folders/184zK77hemG6yhMGjwGDFoN5OgYGk93gn
- Select all images (Ctrl+A)
- Click Download (as ZIP)
- Extract to: `tools/Add images/Thembisa/`

**Step 2: Run upload script**
```bash
python local_folder_to_imgbb.py
```

Press Enter to use default folder, or enter custom path.

**Pros:**
- Always works
- Can resume if interrupted
- Full control over files

**Cons:**
- Requires manual download
- Takes up disk space temporarily

## Method 3: Manual (If scripts fail)

1. Download images to `tools/Add images/Thembisa/`
2. Manually upload batch to ImgBB using their web interface
3. Copy the BBCode links to `Thembisa.txt`
4. Format example:
```
[url=https://ibb.co/xxx][img]https://i.ibb.co/imageid/file.webp[/img][/url]
[url=https://ibb.co/yyy][img]https://i.ibb.co/imageid/file2.webp[/img][/url]
```
5. Run existing script: `python add_album.py`

## Performance & Limits

- **Upload Speed**: ~1 image per second
- **454 images ≈ 7-8 minutes**
- **ImgBB Rate Limit**: No stated limit, but safe to upload ~1 per second
- **Free Tier**: Unlimited free uploads

## Troubleshooting

### "ModuleNotFoundError: No module named 'requests'"
```bash
pip install requests
```

### "403 Forbidden" accessing Google Drive
- Try Method 2 (Local Folder) instead
- Download manually from Drive web interface

### "ImgBB error: Bad Request"
- Check API key is correct
- Verify image format is supported (.jpg, .png, .webp, etc.)

### ISome uploads fail, some succeed
- The script is resilient - it logs failures
- Rerun to retry failed images
- Uploaded images won't be duplicated (they're checked in data.json)

### Script stops midway
- Just run again - it will continue from where it left off
- Already uploaded images are logged in data.json

## Next Steps

After successful upload:

1. **Check gallery**: Open `gallery.html` in browser
2. **Verify album**: Click "Thembisa" to see all 454 images
3. **Share**: Album is now live on your website!

## Questions?

- **Google Drive API Issues**: Contact Google Support
- **ImgBB Issues**: https://imgbb.com/
- **Script Issues**: Check error messages in console

---

**Created**: March 2026  
**For**: glow-website-hub gallery automation
