# DormCare — App Concept and Feature Specification

**Tagline:** Find Your Space. Manage Your Place.  
**Product category:** PropTech / rental marketplace and property-management SaaS  
**Initial market:** Iloilo City, Philippines  
**Status:** Proposed concept; features, pricing, and policies subject to customer validation and legal review.

## 1. Product overview

DormCare is a mobile-friendly rental discovery and property-management platform for boarding houses, dormitories, bedspaces, apartments, and small rental properties. It connects prospective tenants with available accommodations and gives property owners/managers tools to handle occupancy, rent, shared utilities, maintenance, and announcements.

Tenants can access the app for free. Managers can use a free starter plan or subscribe monthly according to their **total active tenant count across properties**.

## 2. Problems addressed

- Prospective renters rely on scattered listings with potentially outdated prices and availability.
- Small rental operators track rent and occupancy through notebooks, spreadsheets, and chat threads.
- Payment screenshots, receipts, and due dates are difficult to reconcile.
- Shared electricity and water charges can be unclear or disputed.
- Maintenance complaints and announcements get lost in messages.
- Renters need better ways to assess whether a listing and its operator have been reviewed.

## 3. User roles

| Role | Primary permissions |
|---|---|
| Guest / prospective renter | Browse approved listings, search/filter, view public property details, create account to inquire |
| Tenant | All renter functions; request to join property; after approval, see own bills, receipts, notices, and tickets |
| Property owner / manager | Register properties, upload verification documents, manage listings, tenants, rent, utilities, maintenance, and subscriptions |
| Authorized staff (future) | Limited manager-delegated operational permissions |
| DormCare administrator | Review verification submissions, moderate listings, resolve reports, manage plans and account status |

**Privacy rule:** Tenants must never see other tenants' private records, balances, IDs, or maintenance tickets unless explicitly authorized for a legitimate shared purpose.

## 4. Main modules and features

### 4.1 Accounts and authentication

- Email/phone-based registration and secure login.
- Choose tenant or owner/manager role; role changes require authorization.
- Password reset, account recovery, profile settings, notification preferences.
- Secure sessions and role-based access controls.

### 4.2 Property-owner/manager verification (mandatory before public listing)

When registering a property, the owner or authorized manager submits:

1. Valid government-issued ID for identity verification.
2. Business Permit / Mayor's Permit, where applicable.
3. Applicable property license, registration, or permit to operate, if required by relevant authorities.
4. Proof of ownership or written authorization to manage the property, as appropriate.
5. Property name, address, accommodation type, contact information, and other necessary listing details.

**Important:** Requirements vary by property type and local rules. DormCare must confirm applicable requirements with the relevant Iloilo City offices; it should not falsely claim that all rentals require identical permits.

**Workflow:**
1. Manager creates account and property draft.
2. Uploads required documents using secure submission.
3. Admin reviews identity, authorization, document validity, and applicable permits; may request resubmission.
4. Status becomes **Pending**, **Verified**, **Rejected / Needs correction**, or **Expired / Renewal needed**.
5. Only approved properties can be publicly listed and receive rental inquiries.
6. Renewal reminders prompt managers to update documents; expired or invalid documentation triggers re-review and possible listing suspension.

The public verification badge means DormCare has completed defined document-review checks; it **does not guarantee** a property's safety, legality in every respect, or listing accuracy. Documents and IDs are never shown publicly. Use restricted storage, access logs, retention/deletion rules, and a documented appeals process.

### 4.3 Public rental marketplace

- Search for boarding houses, dormitories, apartments, rooms, and bedspaces.
- Filter by location, monthly rent, accommodation type, available beds/rooms, and selected amenities.
- Listing page: photos, approximate/public location, pricing, deposit/fees, occupancy, amenities, house rules, availability, manager profile, and verification status.
- Contact property manager through an inquiry thread (or approved contact option for initial MVP).
- Managers can create, update, pause, and archive listings; availability updates when occupancy changes.
- Report misleading, duplicate, or suspicious listings.
- Never publish a tenant's exact private room assignment or personal details.

### 4.4 Tenant onboarding through QR code or invitation link

- After agreeing to rent, a manager generates a property-specific QR code or invitation link.
- Tenant opens the link, signs in, and **requests to join** the property group.
- Manager reviews request, verifies tenancy, assigns the correct room/bedspace and start date, and approves or rejects.
- Approval grants tenant-only access to the property's private area and **their own** rental data.
- Invite links can expire or be revoked and must not automatically grant access.
- When tenancy ends, manager archives membership while preserving necessary historical records under the retention policy.

### 4.5 Property and occupancy management

- Create multiple properties under one manager account.
- Define buildings, floors (optional), rooms, beds, rental prices, and capacity.
- Track available, reserved, occupied, and unavailable units.
- Assign tenants to rooms/beds and record move-in/move-out dates.
- Dashboard shows occupancy, upcoming dues, unpaid invoices, and open maintenance requests.
- Maintain tenant records with data minimization and appropriate access restrictions.

### 4.6 Rent and payment management

- Configure monthly rent, due dates, deposits, and recurring charges.
- Generate tenant-specific bills and show itemized balances.
- Send reminders for upcoming or overdue payments.
- Record payments made through cash, bank transfer, or GCash, with optional proof upload.
- Manager verifies payments and issues downloadable/visible digital acknowledgments or receipts as applicable.
- Tenant can see **their own** payment history and statuses: Unpaid, Submitted for review, Partially paid, Paid, Overdue.
- Corrections and disputes should be logged; do not mark a screenshot as verified payment automatically.
- **MVP does not directly process funds**; online gateway integration is a later phase.

### 4.7 Shared utilities

- Manager records electricity/water bill totals and billing periods.
- Choose an agreed allocation rule: equal split, per occupant, per room, or entered meter readings.
- Preview a transparent calculation and confirm before issuing tenant charges.
- Tenant sees itemized utility amounts, calculation basis, and due date.
- Permit adjustments and dispute handling with audit history.
- Avoid implying the system independently knows utility-provider balances or meter readings.

### 4.8 Maintenance requests

- Tenants create tickets with category, description, priority, and optional photos.
- Managers update status: Submitted, Acknowledged, In progress, Resolved, Closed.
- Timestamped activity history and notifications.
- Tenants see their own tickets; managers see tickets for properties they manage.
- Emergency instructions should direct users to appropriate immediate assistance, not imply the app dispatches emergency responders.

### 4.9 Property announcements and notifications

- Manager posts notices for approved property members (e.g., inspections, repairs, house rules).
- Tenants receive in-app notifications and optional email reminders.
- Rent due/overdue, join request, maintenance update, verification renewal, and inquiry notifications.
- SMS/push notifications may be introduced later based on operating cost and consent.

### 4.10 Subscription and account billing

| Plan | Total active tenants managed | Monthly price |
|---|---:|---:|
| Starter | 0–5 | Free |
| Basic | 6–10 | ₱249 |
| Standard | 11–20 | ₱449 |
| Growth | 21–30 | ₱649 |
| Professional | 31–50 | ₱849 |
| Enterprise | 51+ (no set maximum) | ₱1,299 |

- Tenants use the app **free**, including browsing, inquiries, private property access after approval, and their own rental records.
- Count **active tenants across all properties** under the same manager account; archived former tenants do not count toward capacity.
- Plans primarily differ by tenant capacity, not by withholding essential tenant information.
- Managers can view usage, upgrade/downgrade, and billing history.
- If capacity is exceeded, prompt an upgrade before adding further active tenants; preserve existing records and access.
- Enterprise unlimited capacity and all pricing are **proposed**, pending unit-cost analysis and customer interviews.

## 5. Example user journeys

### Prospective tenant to resident

1. Create free account.
2. Search and filter verified rental listings.
3. View property photos, terms, rent, and vacancy status.
4. Send inquiry and arrange viewing directly with manager.
5. Agree to rent **outside the app or through a documented process** (MVP does not guarantee bookings).
6. Scan QR code/open invite link and request membership.
7. Manager approves and assigns room/bedspace.
8. Open **My Dorm** to review rent, utility charges, announcements, and maintenance requests.

### Property manager

1. Register and submit identity, authority, and applicable permit documents.
2. Wait for admin review before publishing a public listing.
3. Add property, rooms, bedspaces, rent, and availability.
4. Respond to inquiries and confirm tenancy.
5. Approve tenant join requests.
6. Generate bills, record/verify payments, allocate utilities, and respond to tickets.
7. Monitor dashboard and subscription capacity.

### DormCare administrator

1. Review property and manager verification queue.
2. Approve, reject, or request corrections with audit notes.
3. Review reports of suspicious listings and manage appeals.
4. Monitor renewals, policy violations, and subscription support.

## 6. Recommended app screens

**Public / tenant:** Welcome, Sign up/Login, Explore Rentals, Search Filters, Listing Details, Manager Inquiry, Join Property via QR/Link, Join Approval Pending, My Dorm Dashboard, Bills & Payments, Utility Breakdown, Maintenance Tickets, Announcements, Notifications, Profile.

**Manager:** Registration & Verification Upload, Verification Status, Property Dashboard, Property Editor, Rooms & Beds, Listings & Inquiries, Tenant Approval Queue, Tenant Directory, Rent & Payments, Utility Allocation, Maintenance Queue, Announcements, Subscription & Billing, Settings.

**Admin:** Verification Queue, Document Review, Property Moderation, Report Handling, Subscription Overview, Audit Logs.

## 7. Suggested data model

- `users` — account identity, role, authentication reference.
- `manager_profiles` — management identity and business details.
- `properties` — address, type, verification state, owner/manager.
- `verification_documents` — document type, secure storage reference, review/expiry status.
- `rooms` / `beds` — capacity, rental price, availability.
- `listings` / `listing_photos` — public listing details and media.
- `inquiries` / `inquiry_messages` — prospective renter communication.
- `property_invites` / `join_requests` — token, expiry, approval status.
- `tenancies` — approved tenant, property, assigned room/bed, dates, active/archived status.
- `invoices` / `invoice_items` — rent and utility charges.
- `payments` — payment evidence, amount, verification state, audit trail.
- `utility_bills` / `utility_allocations` — source totals, methods, tenant shares.
- `maintenance_tickets` / `ticket_updates` — requests and progress.
- `announcements` / `notifications` — messages and delivery status.
- `subscriptions` / `plans` — tenant limits, prices, status.
- `reports` / `audit_logs` — moderation and important actions.

## 8. Suggested technical stack

- **MVP delivery:** Responsive Progressive Web App (PWA), installable on supported devices.
- **Frontend:** React or Next.js with Tailwind CSS.
- **Backend:** Node.js / Express or Next.js server endpoints.
- **Database:** PostgreSQL.
- **Authentication and secure storage:** Supabase or comparable managed services.
- **QR invitations:** QR library with expiring/revocable tokens.
- **Notifications:** In-app and email first; optional SMS later.
- **Hosting:** Managed web and database services with backups and monitoring.

## 9. MVP scope vs later releases

### MVP — build first

- Account registration and roles.
- Manager/property verification upload and manual admin approval.
- Property, room, bedspace, and listing CRUD.
- Search/filter and basic inquiries.
- QR/link join request and manager approval.
- Occupancy dashboard.
- Rent invoices, manual payment proof/verification, reminders.
- Basic utility allocation.
- Maintenance tickets and announcements.
- Tenant-capacity subscription rules (payment collection may be manually administered during pilot).

### Future enhancements

- Integrated online payments and automated subscription billing.
- Advanced in-app real-time messaging.
- Map-based search, saved searches, and richer recommendations.
- Push/SMS notifications.
- Digital lease signing, document workflows, and exportable reports.
- Multiple staff roles and institutional management.
- Analytics, vacancy forecasting, and integrations.

## 10. Security, trust, and compliance

- Apply least-privilege role-based access and enforce authorization on the server.
- Protect ID/permit uploads with private storage and authorized reviewer access only.
- Collect only necessary data; publish privacy notices and obtain appropriate consent/legal basis.
- Establish document retention/deletion periods, account removal, breach response, and audit logs.
- Follow the Philippine Data Privacy Act of 2012 and relevant implementing guidance.
- Verify actual permit requirements with local licensing authorities; a document upload alone is not proof of regulatory compliance.
- Clearly label owner-provided listing details and verified-review status.
- Support listing reports, disputes, corrections, and appeals.
- Avoid exposing exact tenant locations or private financial records to other renters.

## 11. Business model and validation

**Revenue:** Manager subscriptions, priced by active tenant capacity. No tenant subscription fee.

**Initial customer segments:** Small boarding house operators, apartment owners, dormitory managers; free tenant segment includes students and workers seeking accommodation.

**Key assumptions to validate:**
1. Managers experience meaningful administrative pain with current methods.
2. Managers will pay ₱249–₱1,299/month based on capacity and demonstrated value.
3. Tenants will use a single app for rental discovery and ongoing rental tasks.
4. Manual property verification is operationally affordable.
5. Managers will keep listings and payment records updated.

**Suggested customer research:** Interview at least 5 owners, 3 managers/caretakers, 5 tenants, and 2 accommodation seekers (or the instructor-required sample). Record real workflows, pain frequency, alternative tools, and willingness to pay. Do not treat assumptions as findings.

**Core metrics:** Verified active properties, active tenants, inquiry-to-tenancy conversion, manager activation, paid conversion, churn, monthly recurring revenue, on-time rent-record updates, ticket resolution time, and verification turnaround.

## 12. Positioning and unique value proposition

> **DormCare helps tenants find document-reviewed rental listings for free while giving boarding house and apartment managers one affordable system for occupancy, rent, utilities, maintenance, and communication—from discovery to move-in and everyday living.**

**Product promise:** *Find Your Space. Manage Your Place.*

---

*Prepared as a working product specification for concept development, customer interviews, wireframing, and MVP planning. It is not a statement of completed implementation or verified market demand.*
