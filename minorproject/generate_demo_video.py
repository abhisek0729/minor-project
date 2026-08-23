import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import imageio

WIDTH = 1920
HEIGHT = 1080
FPS = 24
TOTAL_DURATION = 60  # seconds
TOTAL_FRAMES = TOTAL_DURATION * FPS

# Output path
OUTPUT_DIR = r"C:\Users\hp\.gemini\antigravity-ide\brain\52b3e349-f137-4738-abe6-377e6b44f71f"
os.makedirs(OUTPUT_DIR, exist_ok=True)
VIDEO_PATH = os.path.join(OUTPUT_DIR, "travelnepal_demo_video.mp4")

# Load fonts
try:
    font_large = ImageFont.truetype("arial.ttf", 46)
    font_title = ImageFont.truetype("arial.ttf", 36)
    font_bold = ImageFont.truetype("arialbd.ttf", 26)
    font_normal = ImageFont.truetype("arial.ttf", 22)
    font_small = ImageFont.truetype("arial.ttf", 18)
    font_mono = ImageFont.truetype("consola.ttf", 20)
except:
    font_large = font_title = font_bold = font_normal = font_small = font_mono = ImageFont.load_default()

def draw_header(draw, timestamp_str, title, subtitle):
    # Top navbar / header
    draw.rectangle([0, 0, WIDTH, 80], fill=(15, 23, 42))
    draw.rectangle([0, 78, WIDTH, 80], fill=(30, 41, 59))
    
    # Logo & Brand
    draw.rounded_rectangle([30, 18, 74, 62], radius=10, fill=(16, 185, 129))
    draw.text((42, 23), "🏔️", font=font_bold, fill=(255, 255, 255))
    draw.text((90, 24), "TravelNepal", font=font_bold, fill=(255, 255, 255))
    draw.text((250, 28), "•  Full Platform Demo", font=font_normal, fill=(148, 163, 184))
    
    # Timestamp indicator badge
    draw.rounded_rectangle([WIDTH - 240, 18, WIDTH - 40, 62], radius=12, fill=(30, 41, 59))
    draw.text((WIDTH - 220, 26), f"⏱️ {timestamp_str}", font=font_bold, fill=(52, 211, 153))

    # Bottom scene header banner
    draw.rectangle([0, HEIGHT - 70, WIDTH, HEIGHT], fill=(15, 23, 42))
    draw.rectangle([0, HEIGHT - 70, WIDTH, HEIGHT - 68], fill=(51, 65, 85))
    draw.text((40, HEIGHT - 52), f"FEATURE: {title}", font=font_bold, fill=(255, 255, 255))
    draw.text((450, HEIGHT - 48), subtitle, font=font_normal, fill=(148, 163, 184))

def render_frame(frame_idx):
    sec = frame_idx / FPS
    img = Image.new("RGB", (WIDTH, HEIGHT), color=(10, 15, 29))
    draw = ImageDraw.Draw(img)

    # 1. SCENE 1 (0:00 - 0:10): Landing Page & Hero Section
    if sec < 10:
        progress = sec / 10.0
        draw_header(draw, f"0:{int(sec):02d} / 0:10", "Landing Page & Module Explorer", "Modern Next.js 15 UI with dynamic travel hubs")
        
        # Hero Container
        draw.rounded_rectangle([100, 120, WIDTH - 100, 480], radius=24, fill=(20, 30, 55), outline=(51, 65, 85), width=2)
        
        # Badge
        draw.rounded_rectangle([140, 150, 460, 190], radius=15, fill=(16, 185, 129, 40), outline=(16, 185, 129), width=1)
        draw.text((155, 160), "✨ Discover Nepal's Untamed Beauty", font=font_normal, fill=(52, 211, 153))
        
        draw.text((140, 210), "Explore Nepal Like Never Before", font=font_large, fill=(255, 255, 255))
        draw.text((140, 275), "AI-Powered Itineraries • Verified Hotel Stays • Local Dining • Khalti Checkout", font=font_title, fill=(148, 163, 184))
        
        # Quick Search Bar in Hero
        draw.rounded_rectangle([140, 360, WIDTH - 140, 440], radius=16, fill=(30, 41, 59), outline=(71, 85, 105), width=2)
        draw.text((170, 385), "🔍 Search hotels in Pokhara, trek packages, or Dharan restaurants...", font=font_normal, fill=(203, 213, 225))
        draw.rounded_rectangle([WIDTH - 350, 372, WIDTH - 160, 428], radius=12, fill=(16, 185, 129))
        draw.text((WIDTH - 310, 387), "Search Platform", font=font_bold, fill=(255, 255, 255))
        
        # Cards Showcase (Destinations)
        cards = [
            ("Pokhara", "Lakeside & Annapurna Views", "NPR 3,500/night", (34, 197, 94)),
            ("Kathmandu", "Thamel & Historic Temples", "NPR 2,800/night", (59, 130, 246)),
            ("Dharan", "Bhanu Chowk & Bhedetar", "NPR 2,200/night", (168, 85, 247)),
            ("Chitwan", "Sauraha Jungle Safari", "NPR 4,000/night", (234, 179, 8)),
        ]
        
        card_w = 380
        for i, (name, desc, price, color) in enumerate(cards):
            x = 100 + i * (card_w + 30)
            y = 520 - int(progress * 15)  # slight scroll effect
            draw.rounded_rectangle([x, y, x + card_w, y + 420], radius=20, fill=(24, 34, 60), outline=(51, 65, 85), width=1)
            # Image placeholder banner
            draw.rounded_rectangle([x, y, x + card_w, y + 200], radius=20, fill=(30, 45, 75))
            draw.rounded_rectangle([x + 15, y + 15, x + 120, y + 50], radius=8, fill=color)
            draw.text((x + 25, y + 22), "Verified", font=font_small, fill=(255, 255, 255))
            
            draw.text((x + 20, y + 220), name, font=font_bold, fill=(255, 255, 255))
            draw.text((x + 20, y + 260), desc, font=font_small, fill=(148, 163, 184))
            draw.text((x + 20, y + 340), price, font=font_bold, fill=(52, 211, 153))

    # 2. SCENE 2 (0:10 - 0:25): AI Voice & Multi-Agent Planning
    elif sec < 25:
        p_sec = sec - 10
        draw_header(draw, f"0:{int(sec):02d} / 0:25", "AI Multi-Agent Trip Planner", "Voice/Text Prompt: 'Plan a 3-day trip to Pokhara under NPR 20,000'")
        
        # Chat Window Container
        draw.rounded_rectangle([150, 110, WIDTH - 150, HEIGHT - 100], radius=24, fill=(18, 26, 48), outline=(51, 65, 85), width=2)
        
        # Chat Header
        draw.rounded_rectangle([150, 110, WIDTH - 150, 180], radius=24, fill=(24, 34, 60))
        draw.text((180, 132), "🤖 TravelNepal AI Specialist", font=font_bold, fill=(255, 255, 255))
        draw.rounded_rectangle([470, 135, 620, 165], radius=8, fill=(16, 185, 129, 50), outline=(16, 185, 129))
        draw.text((485, 140), "Gemini 3.6 NLU", font=font_small, fill=(52, 211, 153))
        
        # User Message
        draw.rounded_rectangle([WIDTH - 750, 210, WIDTH - 190, 270], radius=16, fill=(16, 185, 129))
        draw.text((WIDTH - 720, 228), "Plan a 3-day trip to Pokhara under NPR 20,000", font=font_normal, fill=(255, 255, 255))
        
        # AI Response Card
        draw.rounded_rectangle([190, 300, WIDTH - 220, 750], radius=20, fill=(26, 38, 68), outline=(59, 130, 246, 100), width=1)
        
        # Verification steps badge
        draw.rounded_rectangle([220, 325, 520, 360], radius=8, fill=(30, 41, 59))
        draw.text((235, 332), "✓ 4 Verification Steps Completed", font=font_small, fill=(52, 211, 153))
        
        draw.text((220, 380), "🌟 Custom 3-Day Pokhara Itinerary (Budget: NPR 20,000):", font=font_bold, fill=(255, 255, 255))
        draw.text((220, 420), "• Day 1: Arrive & Check-in at Lakeside Hotel (NPR 3,500/night) • Sunset boat ride on Phewa Lake", font=font_normal, fill=(226, 232, 240))
        draw.text((220, 460), "• Day 2: Sunrise viewpoint at Sarangkot • Visit Peace Pagoda & Davis Falls • Authentic Thakali dinner", font=font_normal, fill=(226, 232, 240))
        draw.text((220, 500), "• Day 3: Gupteshwor Cave & International Mountain Museum • Souvenir shopping at Old Bazaar", font=font_normal, fill=(226, 232, 240))
        
        # Google Maps Card
        draw.rounded_rectangle([220, 560, 680, 710], radius=14, fill=(15, 23, 42), outline=(52, 211, 153), width=1)
        draw.text((240, 580), "📍 Sights in Pokhara (Live Map)", font=font_bold, fill=(52, 211, 153))
        draw.text((240, 615), "Phewa Lake, Sarangkot, World Peace Pagoda", font=font_small, fill=(148, 163, 184))
        draw.text((240, 660), "Open Google Maps & Directions →", font=font_small, fill=(96, 165, 250))
        
        # Hotel RAG Card
        draw.rounded_rectangle([720, 560, WIDTH - 260, 710], radius=14, fill=(15, 23, 42), outline=(59, 130, 246), width=1)
        draw.text((740, 580), "🏨 Verified Stay: Hotel Barahi (Lakeside)", font=font_bold, fill=(96, 165, 250))
        draw.text((740, 615), "Deluxe AC Room with swimming pool & mountain view", font=font_small, fill=(148, 163, 184))
        draw.text((740, 660), "NPR 3,500/night • Instant Khalti Checkout Available", font=font_bold, fill=(52, 211, 153))

        # Dynamic Auto-Expanding Textarea Footer
        draw.rounded_rectangle([190, 780, WIDTH - 190, 870], radius=18, fill=(30, 41, 59), outline=(16, 185, 129), width=2)
        draw.text((240, 810), "🎙️ Voice Input (Auto-Expanding Box): Transcribing multi-line voice request in real time...", font=font_normal, fill=(255, 255, 255))
        draw.rounded_rectangle([WIDTH - 280, 795, WIDTH - 210, 855], radius=12, fill=(16, 185, 129))
        draw.text((WIDTH - 260, 815), "Send", font=font_bold, fill=(255, 255, 255))

    # 3. SCENE 3 (0:25 - 0:38): Transit & Student Routes
    elif sec < 38:
        draw_header(draw, f"0:{int(sec):02d} / 0:38", "Transit Routing & Student Discounts", "Prompt: 'Transit route from Butwal to Dharan for student'")
        
        draw.rounded_rectangle([150, 110, WIDTH - 150, HEIGHT - 100], radius=24, fill=(18, 26, 48), outline=(51, 65, 85), width=2)
        
        # Route Map Visualization
        draw.rounded_rectangle([200, 140, WIDTH - 200, 340], radius=20, fill=(24, 34, 60), outline=(52, 211, 153), width=2)
        draw.text((240, 165), "🚌 Intercity Transit Route: Butwal ➔ Dharan", font=font_large, fill=(255, 255, 255))
        draw.text((240, 230), "Highway: East-West Mahendra Highway (H01)  •  Distance: ~450 km  •  Duration: 10–12 Hours", font=font_title, fill=(52, 211, 153))
        draw.text((240, 285), "Key Stops: Butwal ➔ Narayangarh ➔ Hetauda ➔ Itahari ➔ Dharan (Bhanu Chowk)", font=font_normal, fill=(148, 163, 184))
        
        # Student Discount Highlights Card
        draw.rounded_rectangle([200, 380, 850, 740], radius=20, fill=(30, 41, 59), outline=(245, 158, 11), width=2)
        draw.text((230, 410), "🎓 Government Student Fare Discount (45% OFF)", font=font_bold, fill=(251, 191, 36))
        draw.text((230, 470), "• Standard Deluxe Bus Fare: NPR 1,400", font=font_normal, fill=(226, 232, 240))
        draw.text((230, 520), "• Verified Student Fare (45% OFF): NPR 770", font=font_bold, fill=(52, 211, 153))
        draw.text((230, 570), "• Savings for Student: NPR 630 per ticket", font=font_normal, fill=(226, 232, 240))
        draw.text((230, 620), "• Requirement: Valid College/University Student ID Card", font=font_small, fill=(148, 163, 184))
        draw.text((230, 670), "• Departures: Daily morning & night coaches from Butwal Buspark", font=font_small, fill=(148, 163, 184))
        
        # Arrival Destination Stay Preview (Dharan)
        draw.rounded_rectangle([900, 380, WIDTH - 200, 740], radius=20, fill=(30, 41, 59), outline=(59, 130, 246), width=2)
        draw.text((930, 410), "🏨 Verified Accommodations in Dharan:", font=font_bold, fill=(96, 165, 250))
        draw.text((930, 470), "1. Hotel Gajur Palace (Main Road, Dharan) - NPR 2,500/night", font=font_normal, fill=(255, 255, 255))
        draw.text((930, 530), "2. Hotel Star East (Bhanu Chowk, Dharan) - NPR 1,800/night", font=font_normal, fill=(255, 255, 255))
        draw.text((930, 590), "3. Bhedetar Hill View Resort (Scenic Viewpoint) - NPR 3,200/night", font=font_normal, fill=(255, 255, 255))
        draw.text((930, 670), "💡 Only destination stays in Dharan are presented (zero Butwal stays)", font=font_small, fill=(52, 211, 153))

    # 4. SCENE 4 (0:38 - 0:48): Hotel Owner Room Creation & Cloudinary Upload
    elif sec < 48:
        draw_header(draw, f"0:{int(sec):02d} / 0:48", "Conversational Room Creation + Cloudinary", "Prompt: 'I am a hotel owner, add a room with price Rs. 4,500'")
        
        draw.rounded_rectangle([150, 110, WIDTH - 150, HEIGHT - 100], radius=24, fill=(18, 26, 48), outline=(51, 65, 85), width=2)
        
        # User Message
        draw.rounded_rectangle([WIDTH - 820, 140, WIDTH - 190, 200], radius=16, fill=(16, 185, 129))
        draw.text((WIDTH - 790, 158), "I am a hotel owner, add a room with price Rs. 4,500 per night", font=font_normal, fill=(255, 255, 255))
        
        # HITL Action Proposal Card with Cloudinary Upload
        draw.rounded_rectangle([200, 230, WIDTH - 200, 780], radius=22, fill=(24, 34, 60), outline=(168, 85, 247), width=2)
        
        # Card Header
        draw.text((240, 260), "✨ Human-In-The-Loop: Add Hotel Room Proposal", font=font_large, fill=(192, 132, 252))
        draw.rounded_rectangle([WIDTH - 380, 255, WIDTH - 240, 295], radius=8, fill=(168, 85, 247, 50), outline=(168, 85, 247))
        draw.text((WIDTH - 365, 265), "Needs Approval", font=font_small, fill=(216, 180, 254))
        
        # Room Details Grid
        details = [
            ("Room Number", "#101 Deluxe"),
            ("Room Type", "Double (Twin Bed)"),
            ("Price Per Night", "NPR 4,500 / night"),
            ("Max Capacity", "2 Adults, 1 Child"),
        ]
        for idx, (label, val) in enumerate(details):
            dx = 240 + idx * 360
            draw.rounded_rectangle([dx, 330, dx + 330, 420], radius=14, fill=(15, 23, 42))
            draw.text((dx + 20, 345), label, font=font_small, fill=(148, 163, 184))
            draw.text((dx + 20, 375), val, font=font_bold, fill=(255, 255, 255))

        # Cloudinary Uploader Mock in Card
        draw.rounded_rectangle([240, 450, WIDTH - 240, 650], radius=16, fill=(15, 23, 42), outline=(51, 65, 85), width=1)
        draw.text((270, 475), "📸 Attach Room Photo (Cloudinary CDN Direct Integration)", font=font_bold, fill=(255, 255, 255))
        
        # Thumbnail preview
        draw.rounded_rectangle([270, 520, 430, 620], radius=12, fill=(30, 41, 59), outline=(16, 185, 129), width=2)
        draw.text((290, 555), "🖼️ Room Photo", font=font_small, fill=(52, 211, 153))
        draw.text((290, 585), "✓ Uploaded", font=font_bold, fill=(52, 211, 153))
        
        draw.text((460, 540), "File: deluxe_room_101.jpg (Uploaded via next-cloudinary)", font=font_normal, fill=(226, 232, 240))
        draw.text((460, 580), "Saved to: PostgreSQL roomsTable + roomImagesTable", font=font_small, fill=(148, 163, 184))
        
        # Action Buttons
        draw.rounded_rectangle([240, 690, 560, 750], radius=14, fill=(16, 185, 129))
        draw.text((290, 708), "Confirm & Execute ✓", font=font_bold, fill=(255, 255, 255))
        draw.rounded_rectangle([590, 690, 740, 750], radius=14, fill=(30, 41, 59))
        draw.text((640, 708), "Cancel", font=font_normal, fill=(148, 163, 184))

    # 5. SCENE 5 (0:48 - 0:55): Live Map Canvas & Location Pinpointing
    elif sec < 55:
        draw_header(draw, f"0:{int(sec):02d} / 0:55", "Interactive Map Canvas & City Geocoding", "Onboarding: Sunsari ➔ Dharan (Bhanu Chowk Pinpoint)")
        
        draw.rounded_rectangle([150, 110, WIDTH - 150, HEIGHT - 100], radius=24, fill=(18, 26, 48), outline=(51, 65, 85), width=2)
        
        # Cascading Selectors
        draw.text((200, 140), "Select Province & Municipality:", font=font_bold, fill=(255, 255, 255))
        draw.rounded_rectangle([200, 180, 500, 240], radius=12, fill=(30, 41, 59))
        draw.text((220, 198), "Province: Koshi Province", font=font_normal, fill=(255, 255, 255))
        
        draw.rounded_rectangle([530, 180, 830, 240], radius=12, fill=(30, 41, 59))
        draw.text((550, 198), "District: Sunsari", font=font_normal, fill=(255, 255, 255))
        
        draw.rounded_rectangle([860, 180, 1160, 240], radius=12, fill=(16, 185, 129))
        draw.text((880, 198), "City: Dharan Sub-Metro", font=font_bold, fill=(255, 255, 255))
        
        # Interactive Map Canvas
        draw.rounded_rectangle([200, 270, WIDTH - 200, 750], radius=20, fill=(20, 40, 40), outline=(52, 211, 153), width=2)
        
        # Reticle in center
        cx, cy = (WIDTH // 2), 510
        draw.line([cx - 50, cy, cx + 50, cy], fill=(239, 68, 68), width=3)
        draw.line([cx, cy - 50, cx, cy + 50], fill=(239, 68, 68), width=3)
        draw.ellipse([cx - 20, cy - 20, cx + 20, cy + 20], outline=(239, 68, 68), width=3)
        
        # Badge on reticle
        draw.rounded_rectangle([cx - 220, cy - 100, cx + 220, cy - 50], radius=10, fill=(15, 23, 42), outline=(239, 68, 68))
        draw.text((cx - 200, cy - 88), "📍 Dharan (Bhanu Chowk) • 26.8124° N, 87.2834° E", font=font_small, fill=(255, 255, 255))
        
        # Preset Hub Buttons
        draw.text((240, 680), "Quick Tourism Hubs:", font=font_bold, fill=(255, 255, 255))
        hubs = ["Dharan (Bhanu Chowk)", "Pokhara (Lakeside)", "Kathmandu (Thamel)", "Butwal", "Chitwan"]
        for idx, h in enumerate(hubs):
            hx = 480 + idx * 240
            if hx + 220 < WIDTH - 200:
                draw.rounded_rectangle([hx, 665, hx + 220, 715], radius=10, fill=(30, 41, 59), outline=(52, 211, 153), width=1)
                draw.text((hx + 15, 680), h, font=font_small, fill=(255, 255, 255))

    # 6. SCENE 6 (0:55 - 1:00): Partner Dashboard & Submitted Profile Transparency
    else:
        draw_header(draw, f"0:{int(sec):02d} / 1:00", "Partner Dashboard & Transparency", "Room Inventory, Live Stats & Onboarding Profile Review")
        
        draw.rounded_rectangle([150, 110, WIDTH - 150, HEIGHT - 100], radius=24, fill=(18, 26, 48), outline=(51, 65, 85), width=2)
        
        # Dashboard Stats Cards
        stat_cards = [
            ("Total Rooms", "12 Units Listed", (52, 211, 153)),
            ("Active Bookings", "4 Stays This Week", (59, 130, 246)),
            ("Account Status", "Approval Pending / Verified", (245, 158, 11)),
            ("Khalti Settlement", "NPR 84,500 Total", (168, 85, 247)),
        ]
        
        for idx, (title, val, col) in enumerate(stat_cards):
            sx = 200 + idx * 380
            draw.rounded_rectangle([sx, 140, sx + 350, 260], radius=16, fill=(24, 34, 60), outline=(51, 65, 85), width=1)
            draw.text((sx + 20, 165), title, font=font_normal, fill=(148, 163, 184))
            draw.text((sx + 20, 205), val, font=font_bold, fill=col)

        # Submitted Profile Transparency Card
        draw.rounded_rectangle([200, 300, WIDTH - 200, 750], radius=20, fill=(24, 34, 60), outline=(52, 211, 153), width=2)
        draw.text((240, 330), "🏨 Verified Hotel Profile & Onboarding Registration Details", font=font_title, fill=(255, 255, 255))
        draw.text((240, 390), "Property Name: Hotel Gajur Palace  •  Location: Main Road, Dharan, Sunsari, Koshi Province", font=font_normal, fill=(226, 232, 240))
        draw.text((240, 440), "GPS Coordinates: Lat 26.8124, Lng 87.2834 (Synced with OpenStreetMap & Google Maps)", font=font_normal, fill=(52, 211, 153))
        draw.text((240, 490), "Contact: +977-25-520000  •  Facilities: 12 Standard Amenities Seeded & Active", font=font_normal, fill=(226, 232, 240))
        draw.text((240, 540), "Room Inventory: Deluxe Double (#101), Executive Suite (#201), Standard Single (#301)", font=font_normal, fill=(226, 232, 240))
        
        draw.rounded_rectangle([240, 620, 580, 690], radius=14, fill=(16, 185, 129))
        draw.text((270, 642), "Edit Profile Settings →", font=font_bold, fill=(255, 255, 255))

    return np.array(img)

def main():
    print(f"Generating TravelNepal 60-Second 1080p Demo Video: {VIDEO_PATH}")
    writer = imageio.get_writer(VIDEO_PATH, fps=FPS, codec="libx264", quality=8)
    
    for f in range(TOTAL_FRAMES):
        if f % (FPS * 5) == 0:
            print(f"Rendering frame {f}/{TOTAL_FRAMES} (Time: {f//FPS}s / {TOTAL_DURATION}s)...")
        frame = render_frame(f)
        writer.append_data(frame)
        
    writer.close()
    print("Video generation completed successfully!")

if __name__ == "__main__":
    main()
