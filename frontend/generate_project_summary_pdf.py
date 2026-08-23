import os
import shutil
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

PDF_FILENAME = "TravelNepal_Project_Summary_Guide.pdf"
OUTPUT_DIR = r"C:\Users\hp\.gemini\antigravity-ide\brain\52b3e349-f137-4738-abe6-377e6b44f71f"
SCRATCH_DIR = os.path.join(OUTPUT_DIR, "scratch")
os.makedirs(SCRATCH_DIR, exist_ok=True)
PDF_PATH = os.path.join(OUTPUT_DIR, PDF_FILENAME)

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header (pages 2+)
        if self._pageNumber > 1:
            self.drawString(54, 11 * 72 - 36, "TravelNepal — Complete Project Architecture & Working Summary")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, 11 * 72 - 42, 8.5 * 72 - 54, 11 * 72 - 42)
            
        # Footer
        footer_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * 72 - 54, 32, footer_text)
        self.drawString(54, 32, "Confidential — Minor Project Documentation | Powered by Autonomous AI")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 44, 8.5 * 72 - 54, 44)
        self.restoreState()

def build_pdf():
    doc = SimpleDocTemplate(
        PDF_PATH,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#059669")    # Emerald 600
    dark_color = colors.HexColor("#0f172a")       # Slate 900
    accent_color = colors.HexColor("#f59e0b")     # Amber 500
    text_muted = colors.HexColor("#475569")       # Slate 600
    bg_light = colors.HexColor("#f8fafc")         # Slate 50
    border_color = colors.HexColor("#e2e8f0")

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=24,
        leading=28,
        textColor=dark_color,
        spaceAfter=6,
    )

    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=primary_color,
        spaceAfter=14,
    )

    h1_style = ParagraphStyle(
        "SectionH1",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=15,
        leading=19,
        textColor=dark_color,
        spaceBefore=14,
        spaceAfter=8,
    )

    h2_style = ParagraphStyle(
        "SectionH2",
        parent=styles["Heading3"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=15,
        textColor=primary_color,
        spaceBefore=10,
        spaceAfter=4,
    )

    body_style = ParagraphStyle(
        "DocBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#1e293b"),
        spaceAfter=6,
    )

    bullet_style = ParagraphStyle(
        "DocBullet",
        parent=body_style,
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=4,
    )

    callout_style = ParagraphStyle(
        "DocCallout",
        parent=body_style,
        fontName="Helvetica-Oblique",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#047857"),
    )

    qa_q_style = ParagraphStyle(
        "QAQuestion",
        parent=body_style,
        fontName="Helvetica-Bold",
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=6,
        spaceAfter=2,
    )

    qa_a_style = ParagraphStyle(
        "QAAnswer",
        parent=body_style,
        leftIndent=10,
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155"),
        spaceAfter=6,
    )

    story = []

    # =========================================================================
    # COVER / HEADER BLOCK
    # =========================================================================
    story.append(Paragraph("TRAVELNEPAL", ParagraphStyle("BrandPre", fontName="Helvetica-Bold", fontSize=10, textColor=accent_color, spaceAfter=2)))
    story.append(Paragraph("AI-Powered Tourism Platform — Project Guide & Architecture Summary", title_style))
    story.append(Paragraph("A Complete, Simple Explanation of How the Entire System Works Under the Hood", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceBefore=0, spaceAfter=12))

    # Meta Info Table
    meta_data = [
        [
            Paragraph("<b>Project:</b> TravelNepal (Minor Project)", body_style),
            Paragraph("<b>Stack:</b> Next.js 16 + FastAPI + LangGraph", body_style),
        ],
        [
            Paragraph("<b>Database:</b> PostgreSQL (Neon DB) + Drizzle ORM", body_style),
            Paragraph("<b>Payment & Media:</b> Khalti / eSewa + Cloudinary", body_style),
        ],
        [
            Paragraph("<b>AI Engine:</b> Google Gemini 2.5 + Edge TTS Voice", body_style),
            Paragraph("<b>Emergency:</b> 1-Click SOS with Offline SMS Relay", body_style),
        ]
    ]
    meta_table = Table(meta_data, colWidths=[240, 260])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), bg_light),
        ('BOX', (0, 0), (-1, -1), 1, border_color),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))

    # =========================================================================
    # 1. EXECUTIVE SUMMARY (WHAT IS TRAVELNEPAL?)
    # =========================================================================
    story.append(Paragraph("1. Executive Summary — What is TravelNepal?", h1_style))
    story.append(Paragraph(
        "<b>TravelNepal</b> is an all-in-one digital tourism ecosystem built for travelers exploring Nepal and local tourism service providers (Hotels, Restaurants, Tour Guides). Unlike basic static travel directories, TravelNepal merges an <b>autonomous multi-agent AI voice assistant</b>, <b>verified live database grounding</b>, <b>Human-In-The-Loop (HITL) safe action execution</b>, <b>role-based business workspaces</b>, <b>natural voice expense tracking</b>, and a <b>zero-internet 1-Click SOS emergency protocol</b>.",
        body_style
    ))
    story.append(Paragraph(
        "In simple terms: A traveler can talk or type to plan a trip, get verified hotel and food recommendations, book rooms using Khalti, log daily expenses via voice, and trigger emergency alerts in remote mountain trails without internet access.",
        body_style
    ))
    story.append(Spacer(1, 8))

    # =========================================================================
    # 2. SYSTEM ARCHITECTURE & DATA FLOW
    # =========================================================================
    story.append(Paragraph("2. High-Level System Architecture", h1_style))
    story.append(Paragraph(
        "The application is structured into three clean, interconnected tiers:",
        body_style
    ))

    arch_data = [
        [
            Paragraph("<b>Frontend Tier (Next.js 16)</b>", body_style),
            Paragraph("Full-stack Next.js App Router with TypeScript, Tailwind CSS, Shadcn UI components, Web Speech API (continuous voice), and Server Actions.", body_style)
        ],
        [
            Paragraph("<b>AI & Agentic Backend (FastAPI + LangGraph)</b>", body_style),
            Paragraph("FastAPI microservice hosting a LangGraph state graph. Coordinates specialized Gemini 2.5 sub-agents (Supervisor, Hotel, Restaurant, Itinerary, Expense).", body_style)
        ],
        [
            Paragraph("<b>Database & Cloud Infrastructure</b>", body_style),
            Paragraph("PostgreSQL database with Drizzle ORM schemas (Users, Hotels, Rooms, Restaurants, Menus, Guides, Bookings, Expenses, SOS Alerts) + Cloudinary CDN.", body_style)
        ]
    ]
    arch_table = Table(arch_data, colWidths=[170, 330])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), bg_light),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(arch_table)
    story.append(Spacer(1, 10))

    # =========================================================================
    # 3. HOW THE CORE FEATURES WORK (STEP-BY-STEP)
    # =========================================================================
    story.append(Paragraph("3. Core Features Explained in Simple Terms", h1_style))

    # 3.1 AI Voice Assistant & Multi-Agent LangGraph
    story.append(Paragraph("A. Autonomous Multi-Agent AI & Voice Assistant", h2_style))
    story.append(Paragraph(
        "When a user asks: <i>'Find verified hotels near Dharan for 4 people'</i> or speaks into the microphone:",
        body_style
    ))
    story.append(Paragraph("• <b>Continuous Speech Recognition:</b> Web Speech API listens to the user. A 3-second silence debounce automatically finishes the speech input without cutting the user off.", bullet_style))
    story.append(Paragraph("• <b>LangGraph Supervisor Routing:</b> The FastAPI backend passes the query to a <i>Supervisor Agent</i> that classifies intent (Hotel Search, Restaurant Discovery, Trip Planning, Expense Logging, or Booking).", bullet_style))
    story.append(Paragraph("• <b>Direct Database Grounding:</b> The specialized agent queries the live PostgreSQL database for real registered listings with accurate prices and IDs.", bullet_style))
    story.append(Paragraph("• <b>Actionable Cards & Voice Narration:</b> The response renders rich UI cards linking directly to <code>/hotels/[id]</code>, Google Maps, and plays natural studio audio voice guidance.", bullet_style))
    story.append(Spacer(1, 6))

    # 3.2 Human-In-The-Loop (HITL)
    story.append(Paragraph("B. Human-In-The-Loop (HITL) Safety Proposals", h2_style))
    story.append(Paragraph(
        "Instead of allowing AI to write blindly to the database, any state-changing action triggers an interactive <b>Action Proposal Card</b>:",
        body_style
    ))
    story.append(Paragraph("• <b>Room & Dish Additions:</b> Hotel and Restaurant owners can add rooms or menu items with editable form fields (Price in NPR, prep time, room type) and Cloudinary photo upload.", bullet_style))
    story.append(Paragraph("• <b>Booking Proposals:</b> When booking a stay, the AI presents a confirmation card with guest count, dates, and total amount before executing the payment.", bullet_style))
    story.append(Paragraph("• <b>User Control:</b> The action is only executed when the user clicks 'Confirm & Execute'.", bullet_style))
    story.append(Spacer(1, 6))

    # 3.3 Multi-Role Business Workspaces
    story.append(Paragraph("C. Multi-Role Workspaces & Role-Based Access (RBAC)", h2_style))
    story.append(Paragraph(
        "TravelNepal provides specialized dashboards based on authenticated user roles:",
        body_style
    ))
    story.append(Paragraph("• <b>Traveler:</b> Destination discovery, interactive itinerary planner, booking history, expense ledger, 1-click SOS.", bullet_style))
    story.append(Paragraph("• <b>Hotel Owner:</b> Room inventory management, nightly rate configuration, guest reservation tracking, verification status.", bullet_style))
    story.append(Paragraph("• <b>Restaurant Owner:</b> Digital food menu management, dish categories, opening/closing switch, dining orders.", bullet_style))
    story.append(Paragraph("• <b>Tour Guide:</b> Trekking tour packages, duration, pricing, verified license credentials.", bullet_style))
    story.append(Paragraph("• <b>Super Admin:</b> Partner KYC identity reviews, platform statistics, company/destination directory, chronological activity alerts.", bullet_style))
    story.append(Spacer(1, 6))

    # 3.4 Expense Tracker
    story.append(Paragraph("D. Voice-Powered Travel Expense Tracker", h2_style))
    story.append(Paragraph(
        "Travelers can manage their trip finances by speaking naturally, e.g. <i>'Add 20 rupees in expense for a drink'</i>:",
        body_style
    ))
    story.append(Paragraph("• <b>Smart NLU Parsing:</b> The regex & LLM parser extracts the amount (<code>NPR 20</code>), item name (<code>Drink</code>), and automatically classifies the category (<code>Food & Dining</code>).", bullet_style))
    story.append(Paragraph("• <b>HITL Proposal:</b> Prompts an inline confirmation card before logging the transaction to the database.", bullet_style))
    story.append(Paragraph("• <b>Analytics Dashboard:</b> Aggregates category spending (Accommodation, Transport, Food, Activities) with visual breakdown charts.", bullet_style))
    story.append(Spacer(1, 6))

    # 3.5 1-Click Offline SOS Emergency Protocol
    story.append(Paragraph("E. 1-Click SOS Emergency Panic System (Offline Resilient)", h2_style))
    story.append(Paragraph(
        "Safety is paramount for Himalayan trekkers. The <code>/emergency</code> page features:",
        body_style
    ))
    story.append(Paragraph("• <b>One-Click Panic Trigger:</b> Instantly acquires device GPS coordinates and plays an emergency warning tone.", bullet_style))
    story.append(Paragraph("• <b>Zero-Internet SMS Relay:</b> Automatically pre-composes and launches a cellular SMS with live Google Maps coordinates to Tourist Police (1144), Nepal Police (100), or custom emergency contacts.", bullet_style))
    story.append(Paragraph("• <b>Toll-Free Hotline Directory:</b> 1-tap phone dialers for Flood Rescue (1155), Red Cross Ambulance (102), and Mountain Helicopter Rescue (+977 1-4444555).", bullet_style))
    story.append(Spacer(1, 10))

    # =========================================================================
    # 4. DIGITAL PAYMENTS & BOOKING LIFECYCLE
    # =========================================================================
    story.append(Paragraph("4. Digital Payment & Reservation Lifecycle", h1_style))
    
    flow_data = [
        ["Step", "Event / Action", "Technical Mechanism"],
        ["1", "Traveler Selects Room / Tour", "Picks dates & guests on /hotels/[id] or via AI Chat proposal."],
        ["2", "Khalti / eSewa Gateway Initiated", "Server creates pending booking record and requests payment URL."],
        ["3", "Digital Wallet Authorization", "User approves payment in Khalti/eSewa secure sandbox."],
        ["4", "Instant Verification Callback", "Webhook verifies transaction ID and confirms booking status."],
        ["5", "Workspace Notification Dispatched", "Hotel owner and Super Admin receive instant chronological alerts."]
    ]
    flow_table = Table(flow_data, colWidths=[35, 205, 260])
    flow_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8.5),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, bg_light]),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(flow_table)
    story.append(Spacer(1, 10))

    # =========================================================================
    # 5. PRESENTATION & VIVA PREPARATION (FAQ)
    # =========================================================================
    story.append(Paragraph("5. Presentation & Viva Q&A Guide", h1_style))
    story.append(Paragraph("Here are simple, high-scoring answers to common questions your examiners or audience may ask:", body_style))

    qas = [
        (
            "Q1: What is the main innovation of your project compared to platforms like Booking.com or TripAdvisor?",
            "A: TravelNepal integrates autonomous multi-agent AI (LangGraph) for natural voice-driven planning with verified database grounding, provides localized role-based partner workspaces with Khalti payments, and includes a zero-internet 1-Click SOS emergency SMS protocol tailored for Nepal's remote trekking geography."
        ),
        (
            "Q2: How does the AI avoid hallucinations when recommending hotels or prices?",
            "A: We use Retrieval-Augmented Generation (RAG) and direct PostgreSQL catalog grounding. The AI query node executes structured database queries for verified hotel/room records and outputs strict entity IDs and links (`/hotels/[id]`)."
        ),
        (
            "Q3: What is Human-In-The-Loop (HITL) and why is it implemented?",
            "A: HITL ensures the AI never performs destructive or financial database writes autonomously. When an action is detected (e.g. adding a room, booking a stay, or logging an expense), the agent displays an editable proposal card that requires explicit user confirmation."
        ),
        (
            "Q4: How does the SOS system work if the user has no internet on a mountain trek?",
            "A: It uses the browser Geolocation API to fetch device GPS coordinates offline and automatically opens the native cellular SMS app with a pre-formatted distress message addressed to Tourist Police (1144) over standard 2G/GSM cellular bands."
        ),
        (
            "Q5: Which database and ORM are used, and how are roles handled?",
            "A: We use PostgreSQL on Neon DB with Drizzle ORM for type-safe schema migrations. User authentication is powered by NextAuth.js with multi-role access control (Traveler, Hotel Owner, Restaurant Owner, Tour Guide, Admin) requiring Admin KYC approval."
        )
    ]

    for q, a in qas:
        story.append(Paragraph(q, qa_q_style))
        story.append(Paragraph(a, qa_a_style))

    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1, color=primary_color, spaceBefore=4, spaceAfter=8))
    story.append(Paragraph("<b>TravelNepal Platform — Complete Project Working Summary & Architecture Reference</b>", ParagraphStyle("DocEnd", fontName="Helvetica-Bold", fontSize=8.5, textColor=primary_color, alignment=1)))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF built successfully: {PDF_PATH}")

if __name__ == "__main__":
    build_pdf()
    
    # Copy to Downloads and project root
    dst_downloads = r"c:\Users\hp\Downloads\TravelNepal_Project_Summary_Guide.pdf"
    dst_workspace = r"d:\nextjs\New folder1\minor-project tourism\minor-project\minorproject\TravelNepal_Project_Summary_Guide.pdf"
    shutil.copy2(PDF_PATH, dst_downloads)
    shutil.copy2(PDF_PATH, dst_workspace)
    print("Copied PDF to:", dst_downloads)
    print("Copied PDF to:", dst_workspace)
