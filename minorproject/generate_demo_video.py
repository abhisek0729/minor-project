import os
import asyncio
import math
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import imageio
import imageio_ffmpeg
import edge_tts

WIDTH = 1920
HEIGHT = 1080
FPS = 30
TOTAL_DURATION = 60  # seconds
TOTAL_FRAMES = TOTAL_DURATION * FPS

OUTPUT_DIR = r"C:\Users\hp\.gemini\antigravity-ide\brain\52b3e349-f137-4738-abe6-377e6b44f71f"
SCRATCH_DIR = os.path.join(OUTPUT_DIR, "scratch")
os.makedirs(SCRATCH_DIR, exist_ok=True)
VIDEO_PATH = os.path.join(OUTPUT_DIR, "travelnepal_demo_video.mp4")

# Load system fonts
try:
    font_hero = ImageFont.truetype("arialbd.ttf", 46)
    font_headline = ImageFont.truetype("arialbd.ttf", 34)
    font_subheadline = ImageFont.truetype("arial.ttf", 18)
    font_card_title = ImageFont.truetype("arialbd.ttf", 22)
    font_card_body = ImageFont.truetype("arial.ttf", 16)
    font_card_small = ImageFont.truetype("arial.ttf", 14)
    font_badge = ImageFont.truetype("arialbd.ttf", 13)
    font_mono = ImageFont.truetype("consola.ttf", 16)
    font_button = ImageFont.truetype("arialbd.ttf", 15)
except Exception:
    font_hero = font_headline = font_subheadline = font_card_title = font_card_body = font_card_small = font_badge = font_mono = font_button = ImageFont.load_default()

VOICE = "en-US-ChristopherNeural"
SCENE_SCRIPTS = [
    ("scene_1", "Welcome to Travel Nepal. Experience seamless travel planning with our intelligent AI voice assistant, powered by autonomous LangGraph multi-agent systems and real-time database grounding."),
    ("scene_2", "Instantly discover verified hotels, authentic restaurants, and scenic viewpoints across Nepal, complete with live Google Maps navigation and direct catalog links."),
    ("scene_3", "Execute real actions safely with interactive Human-In-The-Loop approval cards, from one-click Khalti digital reservations to partner catalog updates."),
    ("scene_4", "Empower tourism providers with unified workspaces tailored for hotels, restaurants, licensed guides, and administrators with end-to-end KYC verification."),
    ("scene_5", "Keep your travel budget under control with smart voice expense logging, automated categorization, and real-time ledger analytics."),
    ("scene_6", "Stay protected on every trek with our one-click emergency protocol, broadcasting live GPS telemetry and offline SMS alerts to tourist police and mountain rescue."),
    ("scene_7", "Travel Nepal. Your complete, intelligent tourism platform. Start your journey today.")
]

async def generate_all_audio():
    print("Generating voice narration clips...")
    for tag, text in SCENE_SCRIPTS:
        out_mp3 = os.path.join(SCRATCH_DIR, f"{tag}.mp3")
        if not os.path.exists(out_mp3) or os.path.getsize(out_mp3) == 0:
            communicate = edge_tts.Communicate(text, VOICE, rate="+3%", pitch="+0Hz")
            await communicate.save(out_mp3)
            print(f"Generated {out_mp3}")

    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    offsets = [0.0, 9.0, 18.0, 27.0, 37.0, 46.0, 54.0]
    
    inputs = []
    filter_parts = []
    for idx, (tag, _) in enumerate(SCENE_SCRIPTS):
        inputs.extend(["-i", os.path.join(SCRATCH_DIR, f"{tag}.mp3")])
        delay_ms = int(offsets[idx] * 1000)
        filter_parts.append(f"[{idx}:a]adelay={delay_ms}|{delay_ms}[a{idx}]")
    
    amix_inputs = "".join([f"[a{i}]" for i in range(len(SCENE_SCRIPTS))])
    filter_complex = f"{';'.join(filter_parts)};{amix_inputs}amix=inputs={len(SCENE_SCRIPTS)}:duration=longest:dropout_transition=2[outa]"
    
    merged_audio = os.path.join(SCRATCH_DIR, "full_narration_60s.wav")
    cmd = [ffmpeg_exe, "-y"] + inputs + ["-filter_complex", filter_complex, "-map", "[outa]", "-ar", "44100", "-ac", "2", merged_audio]
    subprocess.run(cmd, check=True)
    print("Audio narration generated successfully.")

# DRAWING HELPERS
def draw_branded_background(draw, sec):
    # Dark modern high-tech gradient background
    bg_top = (10, 14, 23)
    bg_bottom = (5, 7, 12)
    for y in range(0, HEIGHT, 16):
        t = y / HEIGHT
        r = int(bg_top[0] * (1 - t) + bg_bottom[0] * t)
        g = int(bg_top[1] * (1 - t) + bg_bottom[1] * t)
        b = int(bg_top[2] * (1 - t) + bg_bottom[2] * t)
        draw.rectangle([0, y, WIDTH, y + 16], fill=(r, g, b))

    anim_shift = int((sec * 10) % 80)
    
    # Left Top vibrant emerald polygon
    poly_left = [
        (0, 0),
        (360 - anim_shift, 0),
        (100 - anim_shift, 500),
        (0, 400)
    ]
    draw.polygon(poly_left, fill=(16, 185, 129, 60))
    
    poly_left_inner = [
        (30, 0),
        (260 - anim_shift, 0),
        (70 - anim_shift, 400),
        (0, 300)
    ]
    draw.polygon(poly_left_inner, fill=(52, 211, 153))

    # Right Bottom vibrant amber polygon
    poly_right = [
        (WIDTH, HEIGHT - 440 + anim_shift),
        (WIDTH - 220, HEIGHT - 360 + anim_shift),
        (WIDTH - 460, HEIGHT),
        (WIDTH, HEIGHT)
    ]
    draw.polygon(poly_right, fill=(245, 158, 11))
    
    poly_right_inner = [
        (WIDTH, HEIGHT - 340 + anim_shift),
        (WIDTH - 140, HEIGHT - 280 + anim_shift),
        (WIDTH - 340, HEIGHT),
        (WIDTH, HEIGHT)
    ]
    draw.polygon(poly_right_inner, fill=(251, 191, 36))

    # Background subtle grid / speed lines
    for i in range(14):
        x_start = (i * 160 + int(sec * 15)) % (WIDTH + 300) - 150
        draw.line([(x_start, 0), (x_start - 300, HEIGHT)], fill=(255, 255, 255, 10), width=1)

def draw_top_headline(draw, title, subtitle):
    title_bbox = draw.textbbox((0, 0), title, font=font_headline)
    title_w = title_bbox[2] - title_bbox[0]
    title_x = (WIDTH - title_w) // 2
    
    draw.text((title_x + 2, 38), title, font=font_headline, fill=(0, 0, 0, 160))
    draw.text((title_x, 36), title, font=font_headline, fill=(251, 191, 36))

    sub_bbox = draw.textbbox((0, 0), subtitle, font=font_subheadline)
    sub_w = sub_bbox[2] - sub_bbox[0]
    sub_x = (WIDTH - sub_w) // 2
    draw.text((sub_x, 78), subtitle, font=font_subheadline, fill=(203, 213, 225))

def draw_cursor(draw, x, y, is_clicking=False):
    poly = [
        (x, y),
        (x, y + 20),
        (x + 5, y + 15),
        (x + 10, y + 24),
        (x + 13, y + 22),
        (x + 7, y + 14),
        (x + 14, y + 14)
    ]
    draw.polygon(poly, fill=(255, 255, 255), outline=(0, 0, 0), width=1)
    if is_clicking:
        draw.ellipse([x - 10, y - 10, x + 10, y + 10], outline=(16, 185, 129), width=2)

def draw_star(draw, cx, cy, r=7, fill=(245, 158, 11)):
    # Draw clean 5-pointed star
    points = []
    for i in range(10):
        angle = i * math.pi / 5 - math.pi / 2
        radius = r if i % 2 == 0 else r * 0.45
        points.append((cx + radius * math.cos(angle), cy + radius * math.sin(angle)))
    draw.polygon(points, fill=fill)

def render_frame_image(frame_idx):
    sec = frame_idx / FPS
    img = Image.new("RGBA", (WIDTH, HEIGHT), color=(10, 14, 23, 255))
    draw = ImageDraw.Draw(img)

    draw_branded_background(draw, sec)

    # Floating Card Container
    card_x1 = 160
    card_y1 = 125
    card_x2 = WIDTH - 160
    card_y2 = HEIGHT - 50
    
    # Outer drop shadow & card frame
    draw.rounded_rectangle([card_x1 - 4, card_y1 - 4, card_x2 + 4, card_y2 + 4], radius=22, fill=(16, 185, 129, 25))
    draw.rounded_rectangle([card_x1, card_y1, card_x2, card_y2], radius=20, fill=(255, 255, 255), outline=(226, 232, 240), width=2)
    
    # Card Header Bar
    draw.rectangle([card_x1, card_y1, card_x2, card_y1 + 50], fill=(248, 250, 252))
    draw.line([(card_x1, card_y1 + 50), (card_x2, card_y1 + 50)], fill=(226, 232, 240), width=1)
    
    # Window controls & Brand header
    draw.ellipse([card_x1 + 18, card_y1 + 20, card_x1 + 28, card_y1 + 30], fill=(239, 68, 68))
    draw.ellipse([card_x1 + 36, card_y1 + 20, card_x1 + 46, card_y1 + 30], fill=(245, 158, 11))
    draw.ellipse([card_x1 + 54, card_y1 + 20, card_x1 + 64, card_y1 + 30], fill=(16, 185, 129))
    
    draw.text((card_x1 + 80, card_y1 + 15), "TravelNepal Tourism Platform", font=font_button, fill=(15, 23, 42))
    draw.rounded_rectangle([card_x2 - 210, card_y1 + 10, card_x2 - 20, card_y1 + 38], radius=14, fill=(16, 185, 129, 30))
    draw.text((card_x2 - 188, card_y1 + 15), "Live AI Assistant Active", font=font_badge, fill=(16, 185, 129))

    # SCENE 1: AI VOICE & MULTI-AGENT COMPANION (0 - 9s)
    if sec < 9:
        t = sec / 9.0
        draw_top_headline(draw, "AI VOICE & MULTI-AGENT TRAVEL ASSISTANT", "Natural Voice Synthesis • LangGraph Multi-Agent Hierarchy • Real-Time RAG")
        
        # Sidebar
        draw.rectangle([card_x1, card_y1 + 51, card_x1 + 260, card_y2], fill=(241, 245, 249))
        draw.line([(card_x1 + 260, card_y1 + 51), (card_x1 + 260, card_y2)], fill=(226, 232, 240), width=1)
        
        draw.text((card_x1 + 20, card_y1 + 75), "ASSISTANT CAPABILITIES", font=font_badge, fill=(100, 116, 139))
        tabs = [("Voice & Speech Interaction", True), ("Hotel & Stay Finder", False), ("Authentic Dining Discovery", False), ("Intercity Route Planner", False), ("Travel Expense Ledger", False)]
        for i, (tab, active) in enumerate(tabs):
            ty = card_y1 + 105 + i * 44
            if active:
                draw.rounded_rectangle([card_x1 + 15, ty, card_x1 + 245, ty + 36], radius=8, fill=(16, 185, 129, 40))
                draw.text((card_x1 + 25, ty + 9), tab, font=font_button, fill=(5, 150, 105))
            else:
                draw.text((card_x1 + 25, ty + 9), tab, font=font_card_body, fill=(71, 85, 105))

        # Main Chat Area
        content_x = card_x1 + 285
        content_y = card_y1 + 70

        # Welcome Bubble
        draw.rounded_rectangle([content_x, content_y, content_x + 920, content_y + 80], radius=16, fill=(248, 250, 252), outline=(226, 232, 240), width=1)
        draw.text((content_x + 20, content_y + 12), "TravelNepal AI Travel Specialist", font=font_button, fill=(15, 23, 42))
        draw.text((content_x + 20, content_y + 40), "Namaste! Speak or type to search hotels, plan multi-day trips, or book verified stays.", font=font_card_body, fill=(71, 85, 105))

        # User Query Bubble (typing animation)
        full_query = "Find verified hotels in Dharan for 4 guests"
        chars_typed = min(len(full_query), int(t * len(full_query) * 2.2))
        current_query = full_query[:chars_typed]
        
        if chars_typed > 0:
            draw.rounded_rectangle([content_x + 420, content_y + 98, content_x + 920, content_y + 160], radius=16, fill=(16, 185, 129))
            draw.text((content_x + 440, content_y + 112), "[Voice Input] " + current_query, font=font_button, fill=(255, 255, 255))
            draw.text((content_x + 440, content_y + 135), "4 Travelers • Dharan, Sunsari Region", font=font_card_small, fill=(209, 250, 229))

        # Live Verification Steps
        if t > 0.4:
            step_y = content_y + 180
            draw.rounded_rectangle([content_x, step_y, content_x + 920, step_y + 200], radius=16, fill=(241, 245, 249), outline=(203, 213, 225), width=1)
            draw.text((content_x + 20, step_y + 15), "Autonomous Multi-Agent LangGraph Verification:", font=font_button, fill=(15, 23, 42))
            
            steps = [
                "[1] Supervisor Agent: Classified query -> hotel_booking (destination: Dharan)",
                "[2] Hotel Catalog Agent: Queried PostgreSQL database (4 guests, Sunsari)",
                "[3] Web Search Grounding: Retrieved Pindeshwari Temple & Chinde Dada landmarks",
                "[4] Synthesis Agent: Formatted verified recommendations with direct Khalti booking links"
            ]
            for s_idx, s_text in enumerate(steps):
                if t > 0.4 + s_idx * 0.12:
                    draw.text((content_x + 25, step_y + 50 + s_idx * 34), s_text, font=font_card_body, fill=(5, 150, 105))

        # Input Box
        input_y = card_y2 - 75
        draw.rounded_rectangle([content_x, input_y, content_x + 920, input_y + 55], radius=14, fill=(255, 255, 255), outline=(16, 185, 129), width=2)
        draw.text((content_x + 20, input_y + 16), "Voice Listening Active... 'Find verified hotels in Dharan for 4 guests'", font=font_card_body, fill=(5, 150, 105))
        draw.rounded_rectangle([content_x + 820, input_y + 8, content_x + 905, input_y + 47], radius=10, fill=(16, 185, 129))
        draw.text((content_x + 845, input_y + 16), "Send", font=font_button, fill=(255, 255, 255))

        cx = content_x + 860
        cy = input_y + 25
        draw_cursor(draw, cx, cy, is_clicking=(t > 0.35 and t < 0.45))

    # SCENE 2: VERIFIED STAYS & LIVE RECOMMENDATIONS (9 - 18s)
    elif sec < 18:
        t = (sec - 9) / 9.0
        draw_top_headline(draw, "VERIFIED HOTEL & RESTAURANT DISCOVERY", "Live Catalog • Google Maps Integration • Instant Khalti Checkout")
        
        cx = card_x1 + 40
        cy = card_y1 + 65
        
        draw.text((cx, cy), "Recommended Stays in Dharan & Koshi Province", font=font_card_title, fill=(15, 23, 42))
        draw.text((cx, cy + 28), "Verified accommodations with direct catalog links and real-time room booking.", font=font_subheadline, fill=(100, 116, 139))
        
        hotels = [
            ("Hotel Pindeshwari", "Chinde Dada, Sunsari", "NPR 2,500 / night", "4.8 / 5.0", "Near Pindeshwari Mandir & Dharan viewpoint", "/hotels/4"),
            ("Everest Hotel", "Sunsari, Eastern Nepal", "NPR 2,500 / night", "4.8 / 5.0", "Panoramic hill view rooms & authentic local dining", "/hotels/3"),
            ("Soaltee Crowne", "Sankhuwasabha, Koshi", "NPR 3,500 / night", "4.9 / 5.0", "Luxury suites with Himalayan mountain vistas", "/hotels/7"),
            ("Fish Tail Lodge", "Ilam Tea Garden Hills", "NPR 2,800 / night", "4.7 / 5.0", "Serene organic tea estate hospitality", "/hotels/10")
        ]
        
        for i, (name, loc, price, rating, highlights, link_url) in enumerate(hotels):
            row_x = cx + (i % 2) * 620
            row_y = cy + 65 + (i // 2) * 190
            
            draw.rounded_rectangle([row_x, row_y, row_x + 590, row_y + 175], radius=16, fill=(248, 250, 252), outline=(226, 232, 240), width=1)
            
            # Badge
            draw.rounded_rectangle([row_x + 15, row_y + 15, row_x + 85, row_y + 36], radius=8, fill=(16, 185, 129, 30))
            draw.text((row_x + 25, row_y + 17), "HOTEL", font=font_badge, fill=(16, 185, 129))
            
            draw.text((row_x + 95, row_y + 14), name, font=font_card_title, fill=(15, 23, 42))
            
            # Star Rating
            draw_star(draw, row_x + 470, row_y + 24, r=8, fill=(245, 158, 11))
            draw.text((row_x + 485, row_y + 16), rating, font=font_button, fill=(245, 158, 11))
            
            draw.text((row_x + 15, row_y + 48), "Location: " + loc, font=font_card_body, fill=(100, 116, 139))
            draw.text((row_x + 15, row_y + 75), "Highlights: " + highlights, font=font_card_small, fill=(71, 85, 105))
            draw.text((row_x + 15, row_y + 105), "Pricing: " + price, font=font_button, fill=(16, 185, 129))
            
            # Action Button
            btn_highlight = (i == 0 and t > 0.4)
            btn_fill = (16, 185, 129) if btn_highlight else (241, 245, 249)
            btn_text_color = (255, 255, 255) if btn_highlight else (16, 185, 129)
            
            draw.rounded_rectangle([row_x + 15, row_y + 130, row_x + 380, row_y + 165], radius=10, fill=btn_fill, outline=(16, 185, 129), width=1)
            draw.text((row_x + 35, row_y + 138), f"View Hotel Details ({link_url}) ->", font=font_button, fill=btn_text_color)
            
            draw.rounded_rectangle([row_x + 400, row_y + 130, row_x + 570, row_y + 165], radius=10, fill=(255, 255, 255), outline=(203, 213, 225), width=1)
            draw.text((row_x + 420, row_y + 138), "Live Map View", font=font_button, fill=(71, 85, 105))

        cur_x = cx + 240 + int(math.sin(t * 6) * 15)
        cur_y = cy + 205
        draw_cursor(draw, cur_x, cur_y, is_clicking=(t > 0.45 and t < 0.6))

    # SCENE 3: HUMAN-IN-THE-LOOP ACTION PROPOSALS (18 - 27s)
    elif sec < 27:
        t = (sec - 18) / 9.0
        draw_top_headline(draw, "HUMAN-IN-THE-LOOP ACTION PROPOSALS", "Interactive Booking Summaries • Cloudinary Photos • Instant Khalti Checkout")
        
        cx = card_x1 + 50
        cy = card_y1 + 65
        
        draw.text((cx, cy), "AI Action Proposal: Hotel Reservation Confirmation", font=font_card_title, fill=(15, 23, 42))
        draw.text((cx, cy + 28), "Review parameters and confirm booking with instant Khalti digital wallet payment.", font=font_subheadline, fill=(100, 116, 139))
        
        # Proposal Box
        draw.rounded_rectangle([cx, cy + 65, cx + 1160, cy + 395], radius=20, fill=(248, 250, 252), outline=(16, 185, 129), width=2)
        
        draw.rounded_rectangle([cx, cy + 65, cx + 1160, cy + 120], radius=20, fill=(16, 185, 129, 25))
        draw.text((cx + 25, cy + 82), "ACTION PROPOSAL: CREATE_BOOKING (Khalti Digital Gateway)", font=font_card_title, fill=(5, 150, 105))
        
        fields = [
            ("Selected Accommodation", "Hotel Pindeshwari (Dharan, Sunsari)", 0, 0),
            ("Room Category", "Deluxe Double Suite (AC + Mountain View)", 1, 0),
            ("Guests Joining", "4 Adults", 0, 1),
            ("Stay Duration", "3 Days / 2 Nights", 1, 1),
            ("Check-In Schedule", "Tomorrow (2026-08-24)", 0, 2),
            ("Total Payable Amount", "NPR 5,000 (Instant Khalti Checkout)", 1, 2)
        ]
        
        for label, val, col, row in fields:
            fx = cx + 30 + col * 560
            fy = cy + 140 + row * 65
            draw.text((fx, fy), label, font=font_badge, fill=(100, 116, 139))
            draw.rounded_rectangle([fx, fy + 20, fx + 530, fy + 54], radius=8, fill=(255, 255, 255), outline=(203, 213, 225), width=1)
            draw.text((fx + 15, fy + 27), val, font=font_button, fill=(15, 23, 42))

        btn_y = cy + 345
        is_executing = (t > 0.55)
        
        if is_executing:
            draw.rounded_rectangle([cx + 30, btn_y, cx + 380, btn_y + 40], radius=10, fill=(16, 185, 129))
            draw.text((cx + 80, btn_y + 10), "Booking Confirmed & Paid", font=font_button, fill=(255, 255, 255))
            
            draw.rounded_rectangle([card_x2 - 420, card_y1 + 60, card_x2 - 20, card_y1 + 125], radius=12, fill=(15, 23, 42))
            draw.text((card_x2 - 400, card_y1 + 75), "Khalti Payment Initialized!", font=font_button, fill=(52, 211, 153))
            draw.text((card_x2 - 400, card_y1 + 100), "Booking ID: #TK-8842 - Verified", font=font_card_small, fill=(203, 213, 225))
        else:
            draw.rounded_rectangle([cx + 30, btn_y, cx + 380, btn_y + 40], radius=10, fill=(16, 185, 129))
            draw.text((cx + 90, btn_y + 10), "Confirm & Execute Action", font=font_button, fill=(255, 255, 255))
            
        draw.rounded_rectangle([cx + 400, btn_y, cx + 550, btn_y + 40], radius=10, fill=(255, 255, 255), outline=(203, 213, 225), width=1)
        draw.text((cx + 450, btn_y + 10), "Cancel", font=font_button, fill=(100, 116, 139))
        
        draw_cursor(draw, cx + 220, btn_y + 20, is_clicking=(t > 0.45 and t < 0.58))

    # SCENE 4: MULTI-ROLE PARTNER & ADMIN WORKSPACES (27 - 37s)
    elif sec < 37:
        t = (sec - 27) / 10.0
        draw_top_headline(draw, "MULTI-ROLE WORKSPACES & ADMIN OVERSIGHT", "Dedicated Dashboards for Hotels, Restaurants, Licensed Guides & Admins")
        
        cx = card_x1 + 30
        cy = card_y1 + 65
        
        workspaces = [
            ("Hotel Partner Portal", t < 0.35),
            ("Restaurant Menu Portal", t >= 0.35 and t < 0.7),
            ("Licensed Tour Guide", t >= 0.7),
            ("Admin Platform Oversight", False)
        ]
        
        for i, (ws, active) in enumerate(workspaces):
            wx = cx + i * 295
            fill_col = (16, 185, 129) if active else (241, 245, 249)
            txt_col = (255, 255, 255) if active else (71, 85, 105)
            draw.rounded_rectangle([wx, cy, wx + 275, cy + 42], radius=10, fill=fill_col)
            draw.text((wx + 25, cy + 12), ws, font=font_button, fill=txt_col)

        table_y = cy + 60
        draw.rounded_rectangle([cx, table_y, cx + 1200, table_y + 335], radius=16, fill=(248, 250, 252), outline=(226, 232, 240), width=1)
        
        if t < 0.35:
            headers = ["Room Number", "Room Category", "Nightly Rate (NPR)", "Capacity", "Occupancy Status", "Management"]
            for h_idx, h_name in enumerate(headers):
                draw.text((cx + 25 + h_idx * 195, table_y + 15), h_name, font=font_button, fill=(100, 116, 139))
            draw.line([(cx, table_y + 45), (cx + 1200, table_y + 45)], fill=(226, 232, 240), width=1)
            
            room_rows = [
                ("Room #101", "Deluxe Double", "NPR 2,500", "2 Guests", "Available Live", (16, 185, 129)),
                ("Room #102", "Panoramic Suite", "NPR 4,500", "4 Guests", "Available Live", (16, 185, 129)),
                ("Room #103", "Standard Twin", "NPR 1,800", "2 Guests", "Booked / Reserved", (245, 158, 11)),
                ("Room #104", "Family Studio", "NPR 3,200", "4 Guests", "Available Live", (16, 185, 129))
            ]
            for r_idx, (rnum, rtype, rate, cap, st, scol) in enumerate(room_rows):
                ry = table_y + 60 + r_idx * 55
                draw.text((cx + 25, ry), rnum, font=font_card_title, fill=(15, 23, 42))
                draw.text((cx + 220, ry), rtype, font=font_card_body, fill=(15, 23, 42))
                draw.text((cx + 415, ry), rate, font=font_button, fill=(16, 185, 129))
                draw.text((cx + 610, ry), cap, font=font_card_body, fill=(71, 85, 105))
                draw.text((cx + 805, ry), st, font=font_badge, fill=scol)
                draw.rounded_rectangle([cx + 1000, ry - 5, cx + 1080, ry + 25], radius=6, fill=(241, 245, 249), outline=(203, 213, 225), width=1)
                draw.text((cx + 1020, ry), "Edit", font=font_button, fill=(71, 85, 105))
        else:
            headers = ["Dish / Item Name", "Menu Category", "Price (NPR)", "Prep Time", "Cloudinary Photo", "Catalog Status"]
            for h_idx, h_name in enumerate(headers):
                draw.text((cx + 25 + h_idx * 195, table_y + 15), h_name, font=font_button, fill=(100, 116, 139))
            draw.line([(cx, table_y + 45), (cx + 1200, table_y + 45)], fill=(226, 232, 240), width=1)
            
            dish_rows = [
                ("Authentic Thakali Set", "Main Course", "NPR 450", "15 mins", "Attached (Cloudinary)", "Published Live"),
                ("Steamed Buffalo Momo", "Appetizer", "NPR 250", "12 mins", "Attached (Cloudinary)", "Published Live"),
                ("Dharane Thukpa", "Main Course", "NPR 200", "10 mins", "Attached (Cloudinary)", "Published Live"),
                ("Juju Dhau (Curd)", "Dessert", "NPR 120", "5 mins", "Attached (Cloudinary)", "Published Live")
            ]
            for d_idx, (dname, cat, pr, pt, ph, st) in enumerate(dish_rows):
                dy = table_y + 60 + d_idx * 55
                draw.text((cx + 25, dy), dname, font=font_button, fill=(15, 23, 42))
                draw.text((cx + 220, dy), cat, font=font_card_body, fill=(100, 116, 139))
                draw.text((cx + 415, dy), pr, font=font_button, fill=(16, 185, 129))
                draw.text((cx + 610, dy), pt, font=font_card_body, fill=(71, 85, 105))
                draw.text((cx + 805, dy), ph, font=font_badge, fill=(16, 185, 129))
                draw.text((cx + 1000, dy), st, font=font_badge, fill=(15, 23, 42))

        draw_cursor(draw, cx + 320, cy + 20, is_clicking=(t > 0.3 and t < 0.4))

    # SCENE 5: INTELLIGENT TRAVEL EXPENSE TRACKER (37 - 46s)
    elif sec < 46:
        t = (sec - 37) / 9.0
        draw_top_headline(draw, "INTELLIGENT TRAVEL EXPENSE TRACKER", "Natural Language Voice Logging • Instant Category Summaries • Budget Analytics")
        
        cx = card_x1 + 40
        cy = card_y1 + 65
        
        stat_cards = [
            ("Total Logged Spent", "NPR 12,450", "+4 today", (16, 185, 129)),
            ("Accommodation", "NPR 6,500", "52% of budget", (59, 130, 246)),
            ("Food & Dining", "NPR 3,200", "26% of budget", (245, 158, 11)),
            ("Local Transport", "NPR 2,750", "22% of budget", (168, 85, 247))
        ]
        
        for i, (stitle, samt, ssub, scol) in enumerate(stat_cards):
            sx = cx + i * 295
            draw.rounded_rectangle([sx, cy, sx + 275, cy + 95], radius=14, fill=(248, 250, 252), outline=(226, 232, 240), width=1)
            draw.text((sx + 15, cy + 12), stitle, font=font_button, fill=(100, 116, 139))
            draw.text((sx + 15, cy + 40), samt, font=font_card_title, fill=scol)
            draw.text((sx + 15, cy + 70), ssub, font=font_card_small, fill=(148, 163, 184))

        ledger_y = cy + 115
        draw.rounded_rectangle([cx, ledger_y, cx + 700, ledger_y + 275], radius=16, fill=(255, 255, 255), outline=(226, 232, 240), width=1)
        draw.text((cx + 20, ledger_y + 15), "Traveler Expense Transactions Ledger", font=font_card_title, fill=(15, 23, 42))
        
        expenses = [
            ("Thakali Lunch & Refreshments", "Food & Dining", "NPR 450", "Dharan, Sunsari"),
            ("Taxi to Chinde Dada Viewpoint", "Transport", "NPR 500", "Dharan Viewpoint"),
            ("Hotel Pindeshwari Room Stay", "Accommodation", "NPR 2,500", "Pindeshwari Mandir"),
            ("Mineral Water & Tea", "Food & Dining", "NPR 120", "Bhanu Chowk, Dharan")
        ]
        for e_idx, (ename, ecat, eamt, eloc) in enumerate(expenses):
            ey = ledger_y + 55 + e_idx * 52
            draw.text((cx + 20, ey), ename, font=font_button, fill=(15, 23, 42))
            draw.text((cx + 20, ey + 20), f"{ecat} | Location: {eloc}", font=font_card_small, fill=(100, 116, 139))
            draw.text((cx + 570, ey + 8), eamt, font=font_button, fill=(16, 185, 129))
            draw.line([(cx + 20, ey + 46), (cx + 680, ey + 46)], fill=(241, 245, 249), width=1)

        demo_x = cx + 730
        draw.rounded_rectangle([demo_x, ledger_y, demo_x + 450, ledger_y + 275], radius=16, fill=(16, 185, 129, 20), outline=(16, 185, 129), width=2)
        draw.text((demo_x + 20, ledger_y + 20), "AI Voice Expense Logging", font=font_card_title, fill=(5, 150, 105))
        draw.text((demo_x + 20, ledger_y + 55), "Prompt: 'Add 20 rupees in expense for a drink'", font=font_card_body, fill=(15, 23, 42))
        
        draw.rounded_rectangle([demo_x + 20, ledger_y + 95, demo_x + 430, ledger_y + 250], radius=12, fill=(255, 255, 255), outline=(16, 185, 129), width=1)
        draw.text((demo_x + 35, ledger_y + 110), "ACTION PROPOSAL: LOG_EXPENSE", font=font_badge, fill=(16, 185, 129))
        draw.text((demo_x + 35, ledger_y + 135), "Item: Drink", font=font_button, fill=(15, 23, 42))
        draw.text((demo_x + 35, ledger_y + 160), "Amount: NPR 20 | Category: Food & Dining", font=font_card_body, fill=(100, 116, 139))
        draw.rounded_rectangle([demo_x + 35, ledger_y + 195, demo_x + 260, ledger_y + 235], radius=8, fill=(16, 185, 129))
        draw.text((demo_x + 55, ledger_y + 205), "Confirm & Log Action", font=font_button, fill=(255, 255, 255))

        draw_cursor(draw, demo_x + 150, ledger_y + 215, is_clicking=(t > 0.45 and t < 0.6))

    # SCENE 6: 1-CLICK SOS EMERGENCY PANIC SYSTEM (46 - 54s)
    elif sec < 54:
        t = (sec - 46) / 8.0
        draw_top_headline(draw, "1-CLICK SOS EMERGENCY PANIC PROTOCOL", "Real-Time GPS Telemetry • Offline SMS Dispatch • 1144 Police & Rescue")
        
        cx = card_x1 + 40
        cy = card_y1 + 65
        
        draw.rounded_rectangle([cx, cy, cx + 1180, cy + 90], radius=16, fill=(239, 68, 68, 25), outline=(239, 68, 68), width=2)
        draw.text((cx + 25, cy + 18), "Emergency Safety Protocol & Real-Time Telemetry", font=font_card_title, fill=(220, 38, 38))
        draw.text((cx + 25, cy + 50), "Instant one-touch panic dispatch to Nepal Tourist Police (1144), Himalayan Rescue & Emergency Contacts.", font=font_card_body, fill=(127, 29, 29))

        pulse_r = int(12 * math.sin(t * 8))
        btn_center_x = cx + 240
        btn_center_y = cy + 245
        draw.ellipse([btn_center_x - 90 - pulse_r, btn_center_y - 90 - pulse_r, btn_center_x + 90 + pulse_r, btn_center_y + 90 + pulse_r], fill=(239, 68, 68, 35))
        draw.ellipse([btn_center_x - 80, btn_center_y - 80, btn_center_x + 80, btn_center_y + 80], fill=(239, 68, 68))
        draw.text((btn_center_x - 38, btn_center_y - 28), "SOS", font=font_hero, fill=(255, 255, 255))
        draw.text((btn_center_x - 56, btn_center_y + 25), "PRESS FOR PANIC", font=font_badge, fill=(254, 202, 202))

        telemetry_x = cx + 480
        draw.rounded_rectangle([telemetry_x, cy + 110, telemetry_x + 700, cy + 380], radius=16, fill=(248, 250, 252), outline=(226, 232, 240), width=1)
        draw.text((telemetry_x + 25, cy + 130), "Real-Time Location & Dispatch Telemetry:", font=font_card_title, fill=(15, 23, 42))
        
        telemetry_items = [
            ("GPS Coordinates", "26.8124° N, 87.2834° E (Dharan, Nepal)", (15, 23, 42)),
            ("Offline SMS Relay", "Pre-composed: 'EMERGENCY: Need assistance at Dharan Viewpoint'", (220, 38, 38)),
            ("Tourist Police Direct", "Dial 1144 / 100 (Toll Free Nationwide)", (5, 150, 105)),
            ("Mountain Rescue Heli", "Dial +977-1-4445000 / 1144", (217, 119, 6)),
            ("Emergency Contacts", "3 Verified relatives notified with live map coordinate link", (37, 99, 235))
        ]
        for t_idx, (t_label, t_val, t_col) in enumerate(telemetry_items):
            ty = cy + 170 + t_idx * 40
            draw.text((telemetry_x + 25, ty), t_label + ":", font=font_badge, fill=(100, 116, 139))
            draw.text((telemetry_x + 210, ty), t_val, font=font_card_body, fill=t_col)

        draw_cursor(draw, btn_center_x, btn_center_y, is_clicking=(t > 0.35 and t < 0.55))

    # SCENE 7: BRAND OUTRO & CALL TO ACTION (54 - 60s)
    else:
        draw_top_headline(draw, "TRAVELNEPAL - AI-POWERED TOURISM PLATFORM", "Start Exploring Nepal With Confidence Today")
        
        cx = card_x1 + 180
        cy = card_y1 + 55
        draw.rounded_rectangle([cx, cy, cx + 860, cy + 350], radius=24, fill=(15, 23, 42), outline=(16, 185, 129), width=3)
        
        draw.text((cx + 280, cy + 35), "TravelNepal", font=font_hero, fill=(255, 255, 255))
        draw.text((cx + 160, cy + 105), "The Intelligent Platform for Tourism, Stays & Safety", font=font_card_title, fill=(52, 211, 153))
        
        features_summary = [
            "Autonomous Multi-Agent AI Planning & Real-Time RAG Grounding",
            "Verified Accommodations & Restaurants with Khalti Wallet Checkout",
            "Unified Multi-Role Workspaces (Hotels, Guides, Restaurants, Admins)",
            "Smart Voice Expense Tracking & 1-Click SOS Mountain Rescue Telemetry"
        ]
        for f_idx, f_text in enumerate(features_summary):
            draw.text((cx + 120, cy + 155 + f_idx * 32), "[x] " + f_text, font=font_card_body, fill=(226, 232, 240))

        draw.rounded_rectangle([cx + 270, cy + 290, cx + 590, cy + 335], radius=12, fill=(245, 158, 11))
        draw.text((cx + 295, cy + 300), "START YOUR JOURNEY NOW ->", font=font_button, fill=(15, 23, 42))

    return np.array(img.convert("RGB"))

def render_and_encode_video():
    print(f"Rendering {TOTAL_FRAMES} frames ({TOTAL_DURATION}s @ {FPS} FPS)...")
    
    asyncio.run(generate_all_audio())
    
    temp_video = os.path.join(SCRATCH_DIR, "temp_video_raw.mp4")
    writer = imageio.get_writer(temp_video, fps=FPS, codec="libx264", quality=8, pixelformat="yuv420p")
    
    for f in range(TOTAL_FRAMES):
        if f % 300 == 0:
            print(f"Rendering frame {f}/{TOTAL_FRAMES} ({f/FPS:.1f}s)...")
        frame_rgb = render_frame_image(f)
        writer.append_data(frame_rgb)
    writer.close()
    print("Frames rendering complete.")

    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    narration_wav = os.path.join(SCRATCH_DIR, "full_narration_60s.wav")
    
    cmd = [
        ffmpeg_exe, "-y",
        "-i", temp_video,
        "-i", narration_wav,
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        VIDEO_PATH
    ]
    subprocess.run(cmd, check=True)
    print("SUCCESS: Final Demo Video exported to:")
    print(VIDEO_PATH)

if __name__ == "__main__":
    render_and_encode_video()
