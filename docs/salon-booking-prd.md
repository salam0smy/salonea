# Salon Booking & Payments — MVP Product Requirements Document

**Product Name:** TBD (working name needed)
**Author:** Salam
**Date:** February 28, 2026
**Version:** 1.0 — MVP

---

## 1. Overview

A simple, Arabic-first web application that allows salon customers to browse services, book appointments, and pay online. The salon owner gets a clean dashboard to manage their calendar, services, and bookings.

The first client is a female salon in Saudi Arabia. The product is built with multi-tenancy from day one so it can serve additional salons as a SaaS product after initial delivery.

---

## 2. Problem Statement

Most salons in Saudi Arabia — especially female salons — manage bookings through WhatsApp messages and phone calls. This creates several problems:

**For the salon owner:**
- Double bookings and scheduling conflicts
- No-shows with no way to enforce commitment
- No visibility into daily/weekly schedule at a glance
- Time wasted on back-and-forth booking conversations
- No record of customer history or preferences

**For the customer:**
- Can only book during business hours when someone answers
- No confirmation or reminder system
- No way to see available times without calling
- No easy way to pay in advance

---

## 3. Target User

**Primary — Salon Owner / Manager (Admin)**
- Female salon owner or manager in Saudi Arabia
- May not be highly technical — needs a simple, intuitive interface
- Likely manages 1-10 staff members
- Currently uses WhatsApp and phone calls for bookings
- Wants to look professional and modern to her clients

**Secondary — Salon Customer (End User)**
- Women in Saudi Arabia booking beauty services
- Primarily mobile users
- Comfortable with online payments (mada, Apple Pay)
- Expects Arabic language support
- Used to booking via WhatsApp — any new system must be simpler, not harder

---

## 4. Success Metrics (MVP)

- First salon live and accepting bookings within 2 weeks of development start
- Salon owner can independently manage services and schedule without developer help
- At least 10 bookings completed through the system in the first month
- At least 5 successful online payments processed in the first month
- Customer booking flow can be completed in under 2 minutes

---

## 5. Competitive Landscape

### Regional Players (Saudi / MENA)

**Fresha** — Global leader, available in Saudi Arabia. Free software with 20% commission on new marketplace clients. Strong product but English-first, no deep Arabic/RTL support, requires Fresha account for customers, and payment processing is through their own system (not local Saudi rails). Biggest competitor by brand recognition.

**Glamera** — Egyptian-founded, active in Saudi Arabia (Riyadh, Jeddah). SaaS + marketplace model. Arabic support. Offers POS, payments (has SoftPOS license from Saudi Payments), inventory, and booking. More feature-heavy and complex. Targets larger operations. Has processed $200M+ in transactions across 2,500 customers in 8 countries.

**Salonist** — Saudi-focused salon management software. Arabic support. Full-featured (booking, inventory, staff, ZATCA invoicing). Targets mid-to-large salons. Free tier available. More of a full management suite than a simple booking tool.

**Zylu** — UAE/Saudi salon software. Full suite with CRM, POS, inventory, and booking. Targets established salons wanting digital transformation.

**MioSalon** — Global with Saudi presence. Cloud-based, full-featured salon management.

### Global Players

**Booksy** — Strong in US/Europe, expanding. Per-staff monthly pricing. Good UX.
**Vagaro** — #1 in US market. Feature-rich. No MENA presence.
**Square Appointments** — Free for single users. Tied to Square's payment ecosystem. Not available in Saudi.
**GlossGenius** — US-focused, beautiful design, targets independent beauty professionals.
**Boulevard** — Upmarket, targets premium salons. Modern UX. US-only.
**Timely** — NZ-based, clean interface, growing internationally.

### The Gap

Every existing solution in Saudi either (a) is a complex, feature-heavy management suite that overwhelms a small salon owner, or (b) is a global tool with poor Arabic/RTL support and no local payment integration. There is a clear gap for a **dead-simple, Arabic-first booking + payment tool** that a salon owner can set up in 30 minutes and customers can book from in under 2 minutes.

---

## 6. Product Principles

1. **Simplicity over features.** If a feature isn't needed for booking and paying, it doesn't belong in the MVP.
2. **Arabic-first.** RTL is not an afterthought — it's the default experience.
3. **Mobile-first for customers.** The booking page will primarily be accessed on phones via links shared on WhatsApp, Instagram, and social media.
4. **Salon owner autonomy.** The admin should never need to contact a developer to update their services, prices, or schedule.
5. **Fast to deploy.** A new salon should be able to go from signup to live booking page in under 30 minutes.

---

## 7. Core Features — MVP

### 7.1 Salon Admin Dashboard

**Service Management**
- Add, edit, and delete services (name, description, price, duration)
- Organize services by category (e.g., hair, nails, skin, makeup)
- Set service availability per staff member (if multi-staff)

**Staff Management (simple)**
- Add staff members with name and photo
- Assign services each staff member can perform
- Set individual working hours per staff member

**Schedule / Calendar**
- Daily and weekly calendar view showing all bookings
- Color-coded by staff member or service type
- Ability to manually add walk-in bookings
- Ability to block off time slots (breaks, days off, vacations)

**Booking Management**
- View all upcoming bookings with customer details
- Cancel or reschedule bookings
- View booking history

**Settings**
- Salon profile (name, logo, description, location, contact info)
- Working hours (default for the salon)
- Booking rules: how far in advance customers can book, minimum notice for cancellation
- Payment settings: require full payment, require deposit, or pay at salon

### 7.2 Customer Booking Page

This is a public-facing page (each salon gets a unique URL like `app.com/salon-name`) that is shared via WhatsApp, Instagram bio, Google Maps, etc.

**Booking Flow (4 steps max):**

1. **Select a service** — Browse available services with prices and durations. Optionally select a preferred staff member (or "no preference").
2. **Pick a date and time** — Calendar showing available slots based on the selected service, staff availability, and existing bookings. Only available slots are shown.
3. **Enter contact info** — Name, phone number. No account creation required for MVP. Phone number serves as the identifier.
4. **Confirm & Pay** — Summary of booking (service, staff, date/time, price). Option to pay online or choose to pay at the salon (depending on salon settings).

**Post-Booking:**
- Confirmation screen with booking details
- "Add to Calendar" button (generates .ics file or Google Calendar link)
- WhatsApp confirmation link: opens WhatsApp with a pre-filled message to the salon confirming the booking (using wa.me deep link)
- SMS confirmation (stretch goal for MVP, can be Phase 2)

### 7.3 Online Payments

**Payment Provider:** Moyasar (primary choice)
- Supports mada, Visa, Mastercard, Apple Pay, STC Pay
- Saudi-focused, SAMA regulated
- Developer-friendly API with good documentation
- Sandbox environment for testing

**Payment Options (configurable per salon):**
- Full payment at time of booking
- Deposit (fixed amount or percentage) at time of booking, remainder at salon
- No online payment — book only, pay at salon

**Payment Flow:**
- Customer sees the total on the confirmation step
- Selects payment method (mada / credit card / Apple Pay)
- Redirected to Moyasar's secure payment form
- On success: booking is confirmed
- On failure: booking is held for 10 minutes to retry, then released

**For the salon owner:**
- Payments go directly to the salon's Moyasar account
- Dashboard shows payment status per booking (paid, pending, pay-at-salon)
- No need for the platform to hold funds — money goes directly salon → Moyasar → salon's bank

### 7.4 Notifications (MVP — minimal)

**WhatsApp (via wa.me deep links, not API):**
- After booking: customer sees a "Send confirmation via WhatsApp" button that opens WhatsApp with a pre-filled message
- This is a zero-cost, zero-integration solution for MVP

**Email (if customer provides one):**
- Booking confirmation email with details and calendar link

**SMS (stretch — Phase 2):**
- Automated booking confirmation
- Reminder 24 hours before appointment
- Provider options: Unifonic (Saudi-based) or Twilio

### 7.5 Multi-Tenancy

- Each salon is a tenant with isolated data
- Each salon gets a unique public URL for their booking page
- Admin users belong to a specific salon
- Custom branding per salon (logo, colors) — even if minimal in MVP
- All data queries are scoped to the tenant

---

## 8. What is NOT in the MVP

These are explicitly out of scope for the first version. They may be added later based on demand:

- Inventory / product management
- POS (point of sale) for walk-in payments
- Customer accounts / login
- Loyalty programs or reward points
- Marketing tools (email campaigns, promotions)
- Multi-location support
- Employee commission tracking or payroll
- Analytics and reporting beyond basic booking counts
- ZATCA e-invoicing compliance
- WhatsApp Business API integration (automated messages)
- Native mobile app
- Marketplace / discovery (customers finding salons)
- Reviews and ratings
- Package deals / bundles
- Recurring appointments
- Waitlist management
- Integration with Google Calendar or other external calendars

---

## 9. User Stories

### Salon Owner

- As a salon owner, I want to add my services with prices and durations so customers can see what I offer.
- As a salon owner, I want to add my staff and their working hours so the system shows correct availability.
- As a salon owner, I want to see my daily bookings at a glance so I know what's coming.
- As a salon owner, I want to block off time for breaks or days off so customers can't book those slots.
- As a salon owner, I want to share a booking link on my Instagram and WhatsApp so customers can book themselves.
- As a salon owner, I want to require online payment so I reduce no-shows.
- As a salon owner, I want to manually add a walk-in booking so my calendar stays accurate.
- As a salon owner, I want to cancel or reschedule a booking when needed.
- As a salon owner, I want to see which bookings are paid and which will pay at the salon.

### Customer

- As a customer, I want to see available services and prices without creating an account.
- As a customer, I want to pick a date and time that works for me and see only available slots.
- As a customer, I want to choose my preferred staff member if I have one.
- As a customer, I want to pay online with mada or Apple Pay so I don't need cash.
- As a customer, I want a confirmation of my booking that I can save.
- As a customer, I want the booking page to be in Arabic and work well on my phone.

---

## 10. Design & UX Requirements

**Language:** Arabic (RTL) is the default. English is secondary and optional for MVP.

**Customer Booking Page:**
- Mobile-first responsive design
- Clean, minimal — no clutter
- Fast loading (< 3 seconds on 4G)
- Salon's logo and brand color visible
- Maximum 4 steps from landing to booking confirmed
- No signup or account creation required
- Works on all modern mobile browsers (Safari, Chrome)

**Admin Dashboard:**
- Desktop-first (salon owners often use tablets or laptops in the salon)
- Also functional on mobile for quick checks
- Simple navigation — no more than 5-6 top-level menu items
- Calendar is the home screen / default view

---

## 11. Localization Requirements

- Full Arabic (RTL) support for all customer-facing pages
- Arabic admin dashboard
- Date format: Gregorian (standard in Saudi business context)
- Currency: SAR (Saudi Riyal) with proper formatting
- Phone numbers: Saudi format (+966)
- Time format: 12-hour with AM/PM (common in Saudi Arabia)

---

## 12. Revenue Model Options

To be decided after MVP validation. Options under consideration:

**Option A — One-time build + maintenance**
Charge the initial client 5,000-10,000 SAR for the build. Offer optional monthly maintenance/support for 300-500 SAR/month. Good for immediate revenue, doesn't scale.

**Option B — SaaS subscription**
Monthly fee per salon (200-500 SAR/month). Predictable revenue but harder to sell to small salons used to paying nothing.

**Option C — Transaction fee (Fresha model)**
Free software, take 2-5% per online payment. Low barrier to adoption, revenue scales with usage. Requires payment routing through the platform.

**Option D — Hybrid**
Low monthly subscription (100-200 SAR) + small transaction fee (1-2%). Balances predictable revenue with usage-based growth.

For the first client, Option A applies. For the SaaS version, Option C or D is recommended for fastest adoption.

---

## 13. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Salon owner finds it too complex | They stop using it | Keep MVP ruthlessly simple. Onboard with a 15-minute walkthrough call. |
| Customers don't adopt online booking | Low usage, salon questions value | Make the booking link easy to share on WhatsApp. Salon can still add walk-ins manually. |
| Payment integration delays (Moyasar activation) | Can't accept payments at launch | Start Moyasar activation process early. Ship with "pay at salon" option first, add online payment when approved. |
| No-shows despite online booking | Salon loses trust in the system | Enable deposit/prepayment option. Add SMS reminders in Phase 2. |
| Competitor launches Arabic-first solution | Market window closes | Move fast. The advantage is speed and direct relationship with the client. |
| Scope creep from first client | Delays delivery | This PRD defines the scope. Anything not listed here is Phase 2. |

---

## 14. Open Questions

These need answers before or during development:

1. **From the client:** How many staff members does the salon have?
2. **From the client:** What services do they offer and at what price ranges?
3. **From the client:** Do they want customers to pay upfront, deposit, or at the salon?
4. **From the client:** Do they already have a Moyasar or other payment account?
5. **Product decision:** What should the product be called?
6. **Product decision:** Custom domain per salon (salon.product.com) or path-based (product.com/salon)?
7. **Business decision:** Referral arrangement with the friend who brought the client.

---

## 15. Phases

**Phase 1 — MVP (this document)**
Ship the core: services, staff, calendar, booking page, online payments.

**Phase 2 — Retention & Communication**
SMS reminders (Unifonic/Twilio), automated WhatsApp via Business API, booking modification by customer, basic analytics for salon owner.

**Phase 3 — Growth**
Multi-location support, marketplace/discovery, customer accounts with booking history, reviews, promotions/discounts, ZATCA compliance.

**Phase 4 — Platform**
API for third-party integrations, white-label options, embeddable booking widget for salon websites, mobile app.

---

*This is a living document. Update it as you learn from the first client and early users.*
