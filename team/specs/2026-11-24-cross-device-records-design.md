# Tickets, payments and join requests across devices (design)

Date: 2026-11-24 · Size: small change · Status: awaiting approval

## Intent

On the shared ngrok link, each phone or laptop keeps its own copy of the DormCare data in its browser. Today only
the alert reaches the other device: Juan's repair request rings the manager's bell, but the ticket never appears on
the manager's Maintenance page. The user wants the records themselves to reach the other device, live, for the
demo flows: maintenance tickets, payment proofs and join requests, with their follow-up status changes.

## Goals

- These records appear on the other user's device without a refresh, when that device is open.
- A device that is closed or signed out catches up when its user next signs in (the record waits in that user's
  durable queue at the broker).
- Malformed or forged records from the broker never crash the page and are never stored.
- No change to `pubsub/` (graded Python); `app.js` only.

## Non-goals

- Sharing anything else between devices (rooms, generated bills, utility splits, listings, verification).
- One shared copy of the data (that was option 2), history for new devices, or merging conflicting edits.
- Access control (README section 9 already states there is none).

## Approaches

| Approach | Trade-offs | Decision |
|---|---|---|
| **1. Records travel inside the alerts already sent through the broker** | `app.js` only; offline devices catch up from their queue; each device still starts from its own demo data | **Chosen** by the user |
| 2. One shared copy of the data on the server | Fully shared, but changes the graded gateway and how the whole app stores data | Not chosen (deadline risk) |
| 3. Leave it; demo these steps in two tabs of one browser | No work, but not on two devices | Not chosen |

## Design

1. `notify(role, text, to, userId, records)` gains an optional `records` argument, for example
   `{ tickets: [k] }`. When the page is served by the broker gateway, `Broker.notify` puts it in the published
   payload next to the alert text. Without the gateway (page opened as a file) nothing changes.
2. Call sites that pass records (the record as it is after the change):
   - tenant files a ticket → manager: the ticket; manager updates a ticket → tenant: the ticket.
   - tenant submits a payment proof → manager: the invoice; manager verifies, rejects or records a payment →
     tenant: the invoice.
   - tenant asks to join → manager: the join request; manager approves → tenant: the join request, the new tenant
     record and the first bill (if generated); manager rejects → tenant: the join request.
3. On delivery, before adding the alert to the bell, the receiving device replaces or adds each record by id.
   Only the four collections above are accepted, only known fields are copied, each field's type is checked,
   ids must be plain ids, and references must exist on that device (a ticket's tenant and property, a tenant's
   property and room, an invoice's tenant). Tenants are applied first, so an approval's bill and tenant arrive
   together. A record that fails a check is dropped; the alert is still shown.
4. Last change wins: the incoming record replaces the local one. *Revised after the final review:* the manager's copy
   is the official one. A tenant's payment proof travels on its own (`payments: [{ invoice, ...proof }]`) and is added
   to the manager's copy of the bill, so a stale tenant copy can no longer erase a payment the manager recorded; the
   manager's answers still replace the tenant's copy. An approval also carries its room, because the manager may have
   added that room on their own device.
5. Added during planning: records are matched by id, so every device must start from the same ids. The seed
   currently gives bills random ids (`uid('inv')`), so Juan's October bill has a different id on each device.
   The seed bills get fixed ids (`inv-<tenant>-oct`, `inv-<tenant>-sep`), and the saved-data version goes from 1 to
   2, so every browser loads the new demo data once. (Tenants, rooms, properties, tickets and join requests in the
   seed already have fixed ids.)

## Testing

Browser checks in `tests/browser/browser_check.mjs`, numbered from E25, with the manager and each tenant in
**separate browser profiles** (separate storage, like separate devices). Tabs of one profile would share storage
and hide the problem.
- Juan's ticket reaches the manager's Maintenance page; the manager's status change reaches Juan.
- Juan signed out while the manager updates the ticket: the update arrives when Juan signs in again.
- Juan's payment proof reaches the manager; the verification reaches Juan.
- Ana's join request reaches the manager; the approval makes Ana a member on her device.
- A forged record (unknown tenant, wrong types) is not stored and causes no page error.

## Left to the builder

- Exact per-field type rules and the helper's name.
- README wording: a bullet in the website section and a line in section 9 about what is and is not shared.
