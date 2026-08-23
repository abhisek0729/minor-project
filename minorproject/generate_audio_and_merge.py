import asyncio
import os
import subprocess
import imageio_ffmpeg
import edge_tts

OUTPUT_DIR = r"C:\Users\hp\.gemini\antigravity-ide\brain\52b3e349-f137-4738-abe6-377e6b44f71f"
SCRATCH_DIR = os.path.join(OUTPUT_DIR, "scratch")
os.makedirs(SCRATCH_DIR, exist_ok=True)

VIDEO_INPUT = os.path.join(OUTPUT_DIR, "travelnepal_demo_video.mp4")
FINAL_VIDEO_OUTPUT = os.path.join(OUTPUT_DIR, "travelnepal_demo_video.mp4")
FINAL_PUBLIC_OUTPUT = r"d:\nextjs\New folder1\minor-project tourism\minor-project\minorproject\public\travelnepal_demo_video.mp4"

VOICE = "en-US-ChristopherNeural"

# 6 Scenes corresponding to 0:00-0:10, 0:10-0:25, 0:25-0:38, 0:38-0:48, 0:48-0:55, 0:55-1:00
SCENES = [
    {
        "id": 1,
        "start": 0.5,
        "text": "Welcome to TravelNepal, the premier AI-powered travel and tourism ecosystem for Nepal, featuring modern discovery modules, verified accommodations, and authentic local dining.",
    },
    {
        "id": 2,
        "start": 10.5,
        "text": "Our AI Voice Assistant leverages Gemini 3.6 Flash NLU to generate custom itineraries, live Google Maps directions, and verified stays with instant Khalti checkout.",
    },
    {
        "id": 3,
        "start": 25.5,
        "text": "Need transit routing? TravelNepal calculates intercity routes, highway travel times, and automatically applies government 45 percent student discounts.",
    },
    {
        "id": 4,
        "start": 38.5,
        "text": "For hotel owners, conversational mutation enables adding new rooms directly through chat, complete with Cloudinary photo uploads and instant database persistence.",
    },
    {
        "id": 5,
        "start": 48.5,
        "text": "Our interactive location canvas allows pinpointing exact coordinates across Nepal with precision reticle badges and tourism hub presets.",
    },
    {
        "id": 6,
        "start": 55.5,
        "text": "Partner workspaces offer total transparency, allowing owners to view room inventory, live metrics, and manage submitted profiles.",
    },
]

async def generate_narration():
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    print("Using ffmpeg:", ffmpeg_exe)
    
    # 1. Generate individual TTS files
    audio_files = []
    for s in SCENES:
        out_file = os.path.join(SCRATCH_DIR, f"scene_{s['id']}.mp3")
        print(f"Synthesizing Scene {s['id']}...")
        communicate = edge_tts.Communicate(s["text"], VOICE, rate="+5%")
        await communicate.save(out_file)
        audio_files.append((out_file, s["start"]))
        print(f"Saved Scene {s['id']} to {out_file}")

    # 2. Build full 60s mixed audio track using ffmpeg filter_complex
    full_audio_path = os.path.join(SCRATCH_DIR, "full_narration_60s.mp3")
    
    # Construct ffmpeg adelay and amix command
    inputs = []
    filter_parts = []
    
    for idx, (fpath, delay_sec) in enumerate(audio_files):
        inputs.extend(["-i", fpath])
        delay_ms = int(delay_sec * 1000)
        filter_parts.append(f"[{idx}]adelay={delay_ms}|{delay_ms}[a{idx}]")
    
    amix_inputs = "".join(f"[a{idx}]" for idx in range(len(audio_files)))
    filter_complex = f"{';'.join(filter_parts)};{amix_inputs}amix=inputs={len(audio_files)}:duration=longest:dropout_transition=2[aout]"
    
    mix_cmd = [
        ffmpeg_exe, "-y",
        *inputs,
        "-filter_complex", filter_complex,
        "-map", "[aout]",
        "-t", "60",
        full_audio_path
    ]
    print("Mixing audio tracks...")
    subprocess.run(mix_cmd, check=True)
    print("Mixed audio created at:", full_audio_path)

    # 3. Merge video with mixed audio track
    temp_video_out = os.path.join(SCRATCH_DIR, "temp_merged_video.mp4")
    
    merge_cmd = [
        ffmpeg_exe, "-y",
        "-i", VIDEO_INPUT,
        "-i", full_audio_path,
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        temp_video_out
    ]
    print("Multiplexing audio and video...")
    subprocess.run(merge_cmd, check=True)
    
    # Replace destination video
    import shutil
    shutil.copy2(temp_video_out, FINAL_VIDEO_OUTPUT)
    shutil.copy2(temp_video_out, FINAL_PUBLIC_OUTPUT)
    print(f"Final Video with Voiceover generated successfully!")
    print(f"Artifact: {FINAL_VIDEO_OUTPUT} ({os.path.getsize(FINAL_VIDEO_OUTPUT)} bytes)")
    print(f"Public: {FINAL_PUBLIC_OUTPUT} ({os.path.getsize(FINAL_PUBLIC_OUTPUT)} bytes)")

if __name__ == "__main__":
    asyncio.run(generate_narration())
