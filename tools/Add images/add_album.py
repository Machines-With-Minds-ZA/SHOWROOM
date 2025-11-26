import json
import re
import sys
import os
import uuid
import tkinter as tk
from tkinter import filedialog

def parse_image_links(file_path):
    """Extracts image URLs from BBCode formatted text file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Regex to find content between [img] and [/img] tags
    # This handles the format: [url=...][img]IMAGE_URL[/img][/url]
    # or just [img]IMAGE_URL[/img]
    pattern = r'\[img\](.*?)\[/img\]'
    matches = re.findall(pattern, content)
    
    # Clean up whitespace
    return [url.strip() for url in matches if url.strip()]

def add_album_to_json(txt_file_path):
    # Determine path to data.json relative to this script
    # Script is in tools/Add images/
    # data.json is in assets/json/
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_file_path = os.path.join(script_dir, '..', '..', 'assets', 'json', 'data.json')
    json_file_path = os.path.abspath(json_file_path)

    # 1. Get Album Details from Filename
    filename = os.path.basename(txt_file_path)
    title = os.path.splitext(filename)[0]
    display_title = title.replace('_', ' ').replace('-', ' ').title()
    
    # 2. Extract Images
    images = parse_image_links(txt_file_path)
    
    if not images:
        print(f"No images found in {txt_file_path}. Make sure they are wrapped in [img] tags.")
        return

    # 3. Create Album Object
    new_album = {
        "id": str(uuid.uuid4())[:8], # Short unique ID
        "title": display_title,
        "cover": images[0], # First image is cover
        "images": images
    }

    # 4. Update JSON File
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        if 'albums' not in data:
            data['albums'] = []
            
        data['albums'].append(new_album)
        
        with open(json_file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
            
        print(f"Successfully added album '{display_title}' with {len(images)} images.")
        print(f"Album ID: {new_album['id']}")
        
    except FileNotFoundError:
        print(f"Error: Could not find {json_file_path}")
    except json.JSONDecodeError:
        print(f"Error: {json_file_path} is not valid JSON")

if __name__ == "__main__":
    # Initialize Tkinter and hide the main window
    root = tk.Tk()
    root.withdraw()

    # Set initial directory to the script's directory
    initial_dir = os.path.dirname(os.path.abspath(__file__))

    print("Opening file picker...")
    file_path = filedialog.askopenfilename(
        initialdir=initial_dir,
        title="Select Album Text File",
        filetypes=(("Text files", "*.txt"), ("All files", "*.*"))
    )

    if file_path:
        add_album_to_json(file_path)
        # Keep window open briefly to show result if run from double-click
        input("Press Enter to exit...")
    else:
        print("No file selected.")
