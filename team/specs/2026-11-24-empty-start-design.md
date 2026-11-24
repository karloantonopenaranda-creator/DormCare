# Website starts empty (design)

Date: 2026-11-24 · Size: small change · Status: awaiting approval

## Intent

The user wants the DormCare website to start without sample activity: no tenants, rent bills, payments, maintenance
tickets and so on. Everything in the demo is then created live (tenants join, the manager approves, bills, payments
and tickets appear), which also shows the publish-subscribe records travelling between devices.

## Decisions by the user

- **Keep** the boarding houses and their rooms (Casa Jaro Dormitory, Molo Bedspace Hub), so the invite code
  `CJD-7K2Q` still works and the manager can approve tenants straight away.
- **Remove** the sample data from the code entirely; no "load sample data" button. The automated website tests create
  their own data step by step.

## What stays and what goes

| Kept (setup) | Removed (activity) |
|---|---|
| The demo accounts: Maria (manager), the admin, Juan and Ana (tenant accounts with no property yet) | Tenants (the 22 sample occupants), rent and electricity bills with their payments |
| Properties with their rooms, documents and verification state (Casa Jaro verified and listed, Molo pending) | Maintenance tickets, join requests, announcements, notifications, chats |
| Invite codes (`CJD-7K2Q` active), the subscription plan | Utility bills, the audit log, inquiries, listing reports, subscription billing history, the occupancy history |
| *My call:* other managers' public listings on Explore Rentals, their Tagbak property awaiting admin review, and the admin's manager list | |

*Why the call:* those belong to other (fictional) managers, not to this manager's houses. Without them, Explore Rentals
and the admin pages would be blank. They can go too if the user prefers.

## Design

1. `seed()` returns the kept setup and empty lists for the removed collections. The code that generated the sample
   tenants, bills, payments, tickets and the rest is deleted.
2. The saved-data version goes from 3 to 4, so every browser (phone and PC) switches to the empty start once.
3. Every page for every role must work with empty lists. A new browser check opens each page of the manager, tenant
   and admin with the empty data and requires no page errors; any page that breaks gets a fix (an empty-state message
   instead of a crash).
4. The Demo Guide, the README (accounts table, "Try it" steps) and the demo runbook describe the new starting point:
   Juan and Ana join with `CJD-7K2Q`, the manager approves them (with a first rent bill), then tickets, payments and
   announcements follow.

## Testing

- The website browser checks (E12–E31) set up their own data through the app: Juan joins with the invite code and the
  manager approves him with a first bill; the payment checks use that bill and one created by the manager's
  "Generate bills". Account and record ids are looked up instead of assumed (`t1`, `inv-t1-oct` no longer exist).
- New check E32: every page of every role renders with the empty data, with no page errors.
- The Python suite is unaffected (it does not use the website's data) and must stay at 105 OK.

## Non-goals

- Changing the broker, the dashboard demo or its scenario (`pubsub/scenario/dormcare_scenario.json`), which are the
  command-line demo's own data.
- Updating the Word documents and slides (flagged for the user).
