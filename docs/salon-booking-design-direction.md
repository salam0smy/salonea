# Salon Booking — Design Direction & Philosophy

**Purpose:** A reference guide for making design decisions throughout development. Not a spec — a compass.
**Date:** February 28, 2026

---

## 1. The Core Design Bet

The salon booking market is split between two extremes: **complex management suites** that look like enterprise software (Salonist, Glamera, Vagaro) and **polished global tools** that ignore the Arabic-speaking market (GlossGenius, Boulevard, Fresha).

Our bet is that there is a massive gap for something that feels **premium, warm, and effortless** — designed from the ground up for Arabic-speaking women in Saudi Arabia, not retrofitted from an English product.

**The product should feel like walking into a well-designed salon: calm, inviting, and confident — not like logging into software.**

---

## 2. Who We're Designing For

Before any design decision, remember these two people:

**The salon owner** — She is not a tech person. She might manage her salon from an iPad behind the reception desk or from her phone while at home. She's used to WhatsApp and Instagram. She doesn't want to "learn a system." If something looks complicated, she won't try it. If something looks beautiful and familiar, she'll tap around and figure it out herself.

**The customer** — She's finding the booking link on Instagram or WhatsApp. She's on her phone. She has 30 seconds of attention. She wants to pick a service, pick a time, pay, and get a confirmation. If the page loads slow, looks cheap, or asks her to create an account — she's going back to WhatsApp to book the old way.

---

## 3. Design Principles

### 3.1 — Arabic is not a translation, it's the origin

This is the single most important principle. Do not design in English and then flip to RTL. **Design in Arabic first.**

What this means practically:
- Start every mockup, wireframe, and prototype in Arabic RTL. English is the adaptation, not the other way around.
- Arabic characters are shorter and wider than Latin characters. Design your spacing, font sizes, and containers around Arabic text, not English.
- Never use bold for Arabic body text — it reduces legibility. Use font weight to create hierarchy through size and color instead.
- Italics don't exist in Arabic typography. Don't rely on them for emphasis.
- Minimum Arabic font size: 16px for body text on mobile. 14px is too small for Arabic on screens.
- Line height for Arabic: 1.5–1.7 (more generous than Latin text, Arabic needs the vertical breathing room).

**Font direction:**
- Use CSS logical properties (`margin-inline-start` instead of `margin-left`) from day one. This prevents a painful rewrite later.
- Set `<html lang="ar" dir="rtl">` as the default.
- Numbers, phone numbers, and prices are displayed left-to-right even in RTL layouts — this is standard Arabic convention. Don't force them RTL.

**Font choices to explore:**
- **IBM Plex Arabic** — clean, modern, excellent for UI. Good weight range.
- **Noto Sans Arabic** — Google's recommendation, widest language support, very reliable.
- **Tajawal** — designed specifically for Saudi/Gulf audiences, slightly more personality.
- **Cairo** — friendly, rounded, works well for headings.
- Avoid: Droid Arabic, Arial Arabic, or any system default that looks like a government form.

### 3.2 — Calm confidence, not flashy

The aesthetic enemy is not "ugly" — it's "noisy." Most salon software looks like it's screaming at you: bright colors, gradients, stock photos of smiling women, cluttered dashboards with 15 metrics.

**Our visual tone: clean, warm, quiet confidence.**

Think of the feeling of walking into a high-end salon in Riyadh. Neutral tones. Soft lighting. Everything in its place. You feel taken care of without being overwhelmed.

This translates to:
- **Lots of white space.** Let elements breathe. If it feels empty, it's probably right.
- **Muted, warm color palette.** Not stark white and blue (that's a SaaS dashboard). Think warm whites, soft beiges, dusty rose, muted gold, with one accent color for CTAs.
- **No stock photos.** Zero. Use abstract shapes, subtle patterns, or iconography instead. If you need imagery, use photography that feels Saudi — not American salon stock photos.
- **Subtle shadows and elevation** instead of heavy borders or colored backgrounds to separate sections.
- **Rounded corners** — generous but not cartoonish. 12-16px border radius feels approachable. Sharp corners feel corporate.

### 3.3 — Three taps or less

The customer booking flow has a ruthless constraint: **a customer should go from landing on the page to confirming a booking in three taps (plus payment).**

1. Tap a service
2. Tap a time
3. Tap "confirm & pay"

Everything else is either optional or should get out of the way. Staff selection? Optional accordion, not a mandatory step. Contact info? One field (phone number) — pre-filled if possible. Category browsing? Horizontal scrollable pills, not a separate page.

**Never add a step. Compress steps. Combine steps. Remove steps.**

### 3.4 — The salon's brand, not ours

The booking page is an extension of the salon's identity, not our platform's identity. This means:
- The salon's logo is prominent. Our brand is a small footnote ("Powered by [name]").
- The salon's brand color is the accent color throughout the booking page.
- The salon's name is in the page title and URL.
- No generic "Welcome to our booking system" — the page should feel like it belongs to the salon.

For MVP, this can be as simple as: logo upload + one brand color picker in the admin settings. That's enough to make each salon page feel owned.

### 3.5 — Familiar patterns over clever ones

Saudi women are heavy Instagram and WhatsApp users. They shop on Shein, Temu, Namshi, and noon.com. They use Careem and HungerStation. These are the mental models they bring.

**Design with patterns they already know:**
- Horizontal scrollable cards for browsing (Instagram stories pattern)
- Bottom sheet modals for selection (Google Maps / Careem pattern)
- Sticky bottom CTA bar on mobile (every Saudi e-commerce app)
- Progress dots for multi-step flows (onboarding pattern)
- WhatsApp green for messaging-related actions (universal in Saudi Arabia)

**Avoid patterns that feel foreign:**
- Desktop-style dropdown menus on mobile
- Sidebar navigation on mobile
- Pagination instead of scrolling
- "Create an account" as a mandatory step for anything
- Modals that require closing before you can do anything else

---

## 4. Page-by-Page Direction

Not full designs — just the philosophy for each key surface.

### 4.1 — Customer Booking Page (Mobile)

**The most important page in the entire product.**

This is what gets shared on Instagram and WhatsApp. This is the first impression. If this page is beautiful, the salon owner will show it to every salon owner she knows.

**Feel:** Like a high-end digital menu at a nice restaurant. Clean, scrollable, everything visible.

**Structure direction:**
- **Top:** Salon logo, name, and one-line description. Maybe a subtle hero pattern or color wash — not a photo slider.
- **Services:** Grouped by category using horizontal pill filters. Each service card shows name, price, and duration. Tappable. No clutter.
- **Time selection:** Calendar strip (horizontal scrollable dates like a flight booking app), then time slots as tappable pills below. Only available slots shown. No grayed-out unavailable times littering the screen.
- **Confirmation:** A clean summary card. Total price prominent. Payment method selection. One big CTA button.
- **Post-booking:** Confetti? No. A calm confirmation with a checkmark, the details, and a "Share on WhatsApp" button plus "Add to Calendar." That's it.

### 4.2 — Admin Dashboard

**Feel:** Like a well-organized planner, not a cockpit.

The salon owner opens this and the first thing she sees is **today's schedule.** Not metrics. Not charts. Not a welcome message. Today's appointments, in a clean timeline.

**Structure direction:**
- **Default view:** Today's calendar. Each appointment as a card on a timeline. Color-coded by service or staff member.
- **Navigation:** Maximum 5 items. Something like: Calendar / Bookings / Services / Staff / Settings. Tab bar on mobile, sidebar on desktop.
- **Service management:** Dead simple cards. Service name, price, duration, category. Edit inline or in a half-sheet modal. No multi-page forms.
- **Settings:** One page. Salon info at top. Working hours. Booking rules. Payment config. That's the whole thing.

### 4.3 — Payment Flow

**Feel:** Secure and fast. Like Apple Pay.

- Moyasar's payment form should feel integrated, not like a redirect to another world.
- Show the total clearly before payment. No surprises.
- After successful payment, the transition back to the confirmation should feel instant and celebratory (but subtly — a checkmark animation, not fireworks).
- Failed payment: kind, clear message. "Payment didn't go through. Try again or choose a different method." Not an error code.

---

## 5. Color Direction

Don't pick the final palette now. But here's the direction to explore:

**Primary backgrounds:** Warm off-white (#FAFAF7 range) or very light warm gray. Never pure white (#FFFFFF) — it's too harsh and feels clinical.

**Text:** Near-black with warmth (#1A1A2E or #2D2D3A range). Never pure black (#000000).

**Accent (platform default):** Something that feels luxurious and feminine without being a cliché. Explore: dusty rose, warm terracotta, soft sage green, or muted gold. Avoid: hot pink, bright purple, generic teal. Each salon overrides this with their own brand color on the booking page.

**Functional colors:** Green for success/confirmed, soft red for errors/cancellations, amber for pending/warnings. Keep these muted — not neon traffic lights.

**A useful exercise:** Screenshot 10 Saudi female salon Instagram pages. Look at the color palettes they already use for their branding. That's your target audience's visual taste. Design to complement that, not compete with it.

---

## 6. Typography Scale

Keep it tight. Three sizes max for most screens:

- **Heading:** 24-28px (bold weight for Latin, semi-bold or medium for Arabic)
- **Body / Service cards:** 16-18px (regular weight)
- **Secondary / metadata (duration, time):** 13-14px (lighter color, not smaller font)

For Arabic, favor using color/opacity to create hierarchy rather than weight. A 16px regular Arabic line at 60% opacity reads as "secondary" more naturally than bolding a heading does.

---

## 7. Micro-Interactions & Motion

Less is more. But these small touches make the difference between "this feels like a template" and "this feels crafted":

- **Selecting a time slot:** Subtle scale + fill animation. The pill grows slightly and fills with the accent color.
- **Adding a service:** Smooth slide-up of the booking summary bar at the bottom.
- **Calendar date change:** Horizontal slide transition, like swiping between days.
- **Successful booking:** Checkmark that draws itself (lottie animation). One second. Then the confirmation details fade in.
- **Loading states:** Skeleton screens with a soft shimmer, not spinners. Spinners feel broken. Skeletons feel like things are loading.

**What to avoid:**
- Bouncy/elastic animations (feels childish)
- Parallax scrolling (feels dated)
- Auto-playing anything
- Transitions longer than 300ms (feels sluggish)

---

## 8. What NOT to Do — The AI Slop Checklist

This section exists because AI-generated designs have a very specific "look" that screams template. Avoid all of the following:

❌ **Gradient hero sections** with a blurred photo behind white text
❌ **Icon + heading + 3 lines of text** in a 3-column grid ("Our Features" section)
❌ **Testimonial carousels** with stock photos of smiling people
❌ **Blue-and-white SaaS aesthetic** (you're not building Slack)
❌ **"Get Started Free" floating buttons** that follow you down the page
❌ **Illustration characters** (Humaaans, unDraw, etc.) — these scream "startup template"
❌ **Card grids with hover effects** that serve no functional purpose
❌ **Dashboard with 8 stat cards** across the top showing numbers nobody checks
❌ **Notification bells with red badges** that are always empty
❌ **Hamburger menus hiding 15 navigation items** on mobile
❌ **"Welcome back, [Name]!" headers** taking up premium screen space
❌ **Over-rounded "pill" everything** — buttons, cards, avatars, inputs all with max border radius
❌ **Purple-to-blue gradients** on buttons (the Stripe effect — everyone copies it)
❌ **Glassmorphism / frosted glass cards** — dated trend
❌ **Dark mode as the default** — wrong audience for this product

**Instead, when in doubt:** look at how premium Saudi e-commerce brands (Ounass, Namshi) or Saudi bank apps (SNB, Riyad Bank) design their interfaces. Clean, professional, warm, with Arabic text that actually looks considered.

---

## 9. Responsive Strategy

**Customer booking page:** Mobile-first. This is 90%+ of the traffic. Design at 375px width first, then scale up. On desktop, center the booking flow in a narrow column (max-width 480px) — don't spread it across a wide screen. It should feel like a mobile page that happens to be on desktop.

**Admin dashboard:** Desktop-first (1280px), but must work on iPad (1024px) and phone (375px). The calendar view is the one that needs the most thought at different breakpoints. On phone, it should collapse to a list view of today's appointments.

---

## 10. References to Study

These aren't salon apps to copy — they're products whose design philosophy is worth studying for specific reasons:

**Fresha's booking page** — Study the service selection and time picker flow. It's clean and proven. Note how they group services and show just enough info per card.

**GlossGenius** — The gold standard for "beauty industry software that actually feels like beauty." Their entire brand feels premium. Study their typography choices, their use of white space, and how their booking pages feel like the salon's brand, not GlossGenius's brand.

**Boulevard** — Modern SaaS that doesn't look like SaaS. Their dashboard design shows how calendar-first admin views can feel clean instead of cluttered.

**Cal.com's booking page** — The simplest, cleanest date/time picker in any booking product. Study the flow: pick a date, see times, confirm. Three steps, zero clutter.

**Careem app** — Not a salon app, but the UX patterns are what Saudi women use daily. Bottom sheets, step-by-step flows, clean Arabic typography. This is the interaction vocabulary your users already speak.

**Ounass.com** — Saudi luxury e-commerce. Their Arabic typography, spacing, and color palette are a masterclass in designing for premium Saudi audiences.

---

*The goal of this document is to make sure that every design decision — from the color of a button to the animation on a confirmation screen — serves the same feeling: calm, beautiful, effortless. If anything you're building doesn't pass that gut check, step back and simplify.*
