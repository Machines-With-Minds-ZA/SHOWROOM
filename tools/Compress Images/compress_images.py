import os
import json
import subprocess
import tkinter as tk
from tkinter import filedialog, messagebox, ttk
import concurrent.futures

CONFIG_FILE = 'ffmpeg_config.json'

def get_ffmpeg_path():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(script_dir, CONFIG_FILE)
    
    if os.path.exists(config_path):
        with open(config_path, 'r') as f:
            config = json.load(f)
            if 'ffmpeg_path' in config and os.path.exists(config['ffmpeg_path']):
                return config['ffmpeg_path']
    
    # Not found, ask user
    root = tk.Tk()
    root.withdraw()
    messagebox.showinfo("FFmpeg Setup", "Please locate your ffmpeg.exe file.")
    ffmpeg_path = filedialog.askopenfilename(title="Select ffmpeg.exe", filetypes=[("Executable", "*.exe"), ("All files", "*.*")])
    
    if ffmpeg_path:
        with open(config_path, 'w') as f:
            json.dump({'ffmpeg_path': ffmpeg_path}, f)
        return ffmpeg_path
    return None

def compress_image(ffmpeg_path, input_path, output_dir):
    filename = os.path.basename(input_path)
    name, ext = os.path.splitext(filename)
    
    # Change extension to .webp as per user request
    output_path = os.path.join(output_dir, f"{name}.webp")
    
    # Command based on user request:
    # ffmpeg -i input -qscale 80 output.webp
    # Note: For WebP in ffmpeg, -q:v 80 is the standard flag for quality 80.
    # Added -compression_level 2 (range 0-6, default 4). Lower is faster.
    # Added -threads 1 to ensure each process only uses one core, letting us manage load via max_workers.
    cmd = [ffmpeg_path, '-i', input_path, '-q:v', '80', '-compression_level', '2', '-threads', '1', '-y', output_path]
    
    try:
        # Run ffmpeg, suppressing output unless error
        subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        # print(f"Compressed: {filename} -> {os.path.basename(output_path)}") # Suppress output for speed/cleanliness
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error compressing {filename}: {e}")
        return False

def main():
    ffmpeg_path = get_ffmpeg_path()
    if not ffmpeg_path:
        print("FFmpeg path not provided. Exiting.")
        return

    root = tk.Tk()
    root.withdraw()

    print("Select images to compress...")
    input_files = filedialog.askopenfilenames(title="Select Images", filetypes=[("Images", "*.jpg *.jpeg *.png *.webp")])
    
    if not input_files:
        print("No images selected.")
        return

    print("Select output directory...")
    output_dir = filedialog.askdirectory(title="Select Output Directory")
    
    if not output_dir:
        print("No output directory selected.")
        return

    # Setup Progress Window
    progress_win = tk.Toplevel(root)
    progress_win.title("Compressing Images")
    progress_win.geometry("400x150")
    progress_win.resizable(False, False)
    
    # Center the window
    screen_width = progress_win.winfo_screenwidth()
    screen_height = progress_win.winfo_screenheight()
    x = (screen_width - 400) // 2
    y = (screen_height - 150) // 2
    progress_win.geometry(f"400x150+{x}+{y}")

    lbl_status = tk.Label(progress_win, text="Starting compression...", font=("Arial", 10))
    lbl_status.pack(pady=(20, 10))
    
    progress_bar = ttk.Progressbar(progress_win, orient="horizontal", length=350, mode="determinate")
    progress_bar.pack(pady=10)
    progress_bar['maximum'] = len(input_files)
    progress_bar['value'] = 0
    
    lbl_count = tk.Label(progress_win, text=f"0 / {len(input_files)}", font=("Arial", 9))
    lbl_count.pack(pady=5)

    progress_win.update()

    print(f"Processing {len(input_files)} images with parallel processing...")
    
    # Use ThreadPoolExecutor for parallel processing
    # User requested 40% of available cores to prevent system overload.
    cpu_count = os.cpu_count() or 4
    max_workers = max(1, int(cpu_count * 0.4))
    
    print(f"System has {cpu_count} cores. Using {max_workers} concurrent workers (40%).")
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(compress_image, ffmpeg_path, f, output_dir) for f in input_files]
        
        completed_count = 0
        for future in concurrent.futures.as_completed(futures):
            completed_count += 1
            progress_bar['value'] = completed_count
            lbl_status.config(text=f"Compressing... ({completed_count}/{len(input_files)})")
            lbl_count.config(text=f"{completed_count} / {len(input_files)}")
            progress_win.update() # Force UI update
            
    progress_win.destroy()
    messagebox.showinfo("Done", f"Compression complete! Processed {len(input_files)} images.")

if __name__ == "__main__":
    main()
