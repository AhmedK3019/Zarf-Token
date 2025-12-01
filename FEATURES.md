# Zarf Token - Feature List

## Authentication & User Management

### Student/Staff/TA/Professor Registration

- Sign up with GUC email, password, first name, last name, and student/staff ID
- Receive verification email with automatic redirect link to login page
- Login restricted until email verification is completed

### Vendor Registration

- Sign up with email, password, and company name
- Upload tax card and company logo to prove validity

### Admin & Role Management

- Admins assign correct roles to Staff/TA/Professor after registration requests
- Staff/TA/Professor receive verification emails after admin approval
- Admins can create other Admin/Event Office accounts
- Admins can delete Admin/Event Office accounts

### Login & Logout

- All users can login with email and password
- All users can logout successfully
- Admins can block any user
- Admins can view list of all users with details and status (active/blocked)

---

## Event Management

### Event Viewing & Discovery

- View all available upcoming events and their details
- Search events by name (Professor name/Event name) or type
- Filter events by name, location, type, or date
- Sort events by date
- Add events to favorites list (Students/Staff/TA/Professor)
- View favorites list

### Event Types

- **Workshops** - Professor-led educational sessions
- **Trips** - University organized trips
- **Bazaars** - Vendor marketplace events
- **Booths** - Individual vendor booths in platform
- **Conferences** - Academic conferences with external links

### Event Creation & Management

#### Workshops (Professor)

- Create workshops with: name, location (GUC Cairo/Berlin), dates/times, description, agenda, faculty responsible, participating professors, budget, funding source, resources, capacity, registration deadline
- Edit workshop details before publication
- View list of created workshops
- View participant lists and remaining spots
- Receive notifications when workshops are accepted/rejected
- View status and requested edits

#### Trips (Events Office)

- Create trips with: name, location, price, dates/times, description, capacity, registration deadline
- Edit trip details before start date

#### Bazaars (Events Office)

- Create bazaars with: name, dates/times, location, description, registration deadline
- Edit bazaar details before event starts

#### Conferences (Events Office)

- Create conferences with: name, dates/times, description, agenda, website link, budget, funding source, resources
- Edit conference details

### Event Office Capabilities

- Receive notifications for workshop submissions
- Accept, reject, or request edits for workshops
- Archive past events
- Delete events with no registrations
- Export registered attendees to .xlsx sheets (except conferences)
- Restrict events to specific user types
- Generate QR codes for external visitors to bazaars/career fairs

---

## Event Participation

### Registration & Payment

- Register for workshops/trips with name, email, and ID
- Pay via credit/debit card (Stripe) or wallet
- Receive payment receipt via email
- View list of registered events (upcoming and past)
- Cancel registration with refund to wallet (only if 2+ weeks before event)
- View wallet balance and refunded amounts

### Ratings & Comments

- Rate events after attendance (1-5 stars)
- Comment on attended events
- View all ratings and comments on any event
- Receive warning email if comments are deleted for being inappropriate
- Admins can delete inappropriate comments

### Certificates & Notifications

- Receive certificate of attendance via email after completing workshops
- Receive notifications for newly added events
- Receive reminders 1 day and 1 hour before registered events

---

## Vendor Features

### Bazaar & Booth Applications

- View list of upcoming bazaars
- Apply to join bazaars (max 5 attendees, booth size 2x2 or 4x4)
- Apply for platform booth (duration 1-4 weeks, location, size 2x2 or 4x4)
- Upload IDs of attendees
- Receive email notifications for acceptance/rejection
- Pay participation fees within 3 days of acceptance
- Receive payment receipt via email
- Receive QR codes for registered visitors
- Cancel participation before payment
- View upcoming bazaars/booths (accepted requests)
- View pending/rejected requests

### Loyalty Program

- Apply to GUC loyalty program with discount rate, promo code, terms & conditions
- Cancel loyalty program participation
- All users can view partner vendors with discounts and promo codes
- Students/Staff receive notifications for new loyalty partners

### Vendor Request Management (Events Office/Admin)

- Receive notifications for pending vendor requests
- View vendor participation request details
- View/download uploaded documents
- Accept or reject vendor requests

---

## Sports & Recreation

### Court Reservations (Students)

- View all courts (basketball/tennis/football) and availability
- Reserve courts from available time slots
- Automatic inclusion of student name and GUC ID

### Gym Sessions

- View monthly gym schedule (yoga, pilates, aerobics, Zumba, cross circuit, kickboxing)
- Register to attend sessions
- Receive notifications for cancelled or edited sessions

#### Gym Management (Events Office)

- Create gym sessions with: date, time, duration, type, max participants
- Edit gym session date, time, and duration
- Cancel gym sessions

---

## Polling System

### Vendor Polls

- Events Office creates polls for vendor booth setup during overlapping durations
- Students/Staff/TA/Professor vote for preferred vendors

---

## Reporting & Analytics (Events Office/Admin)

### Attendance Reports

- View total number of attendees in events
- Filter by event name, type, or date

### Sales Reports

- View revenue from all events
- Filter by event type and/or date
- Sort by revenue (ascending or descending)

---

## Notification System

- System notifications for new events
- Event reminders (1 day and 1 hour prior)
- Workshop approval/rejection notifications (Professors)
- Vendor request acceptance/rejection emails
- Payment receipts via email
- Gym session cancellation/edit notifications
- Loyalty program updates
- Inappropriate comment warnings
- Pending vendor request alerts (Events Office/Admin)

---

## Security & Validation

- Email verification required for all users
- GUC email mandatory for students/staff/TA/professors
- Tax card and logo validation for vendors
- ID verification for bazaar/booth attendees
- Admin role assignment for Staff/TA/Professor
- User blocking capability
