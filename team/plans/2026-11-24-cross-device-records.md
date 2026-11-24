# Cross-Device Records Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Maintenance tickets, payment proofs and join requests (and their status changes) reach the other user's device through the broker, live or on next sign-in, not only their alerts.

**Architecture:** The record travels inside the alert that each flow already publishes (`notify(..., records)`). The receiving page validates each record against per-collection field rules and replaces or adds it by id before adding the alert to the bell. Seed bills get fixed ids so records match across devices.

**Tech Stack:** Plain browser JavaScript in `app.js` (no libraries); tests in `tests/browser/browser_check.mjs` (Node 22+, headless Edge over the DevTools protocol).

**Spec:** `team/specs/2026-11-24-cross-device-records-design.md`

## Global Constraints

- `app.js` only for behaviour; no change under `pubsub/`.
- Accepted collections: `tenants`, `joinRequests`, `invoices`, `tickets`, applied in that order. Only known fields are copied; ids are plain ids (`/^[\w-]{1,64}$/`); references must exist on the receiving device. A failing record is dropped; the alert is still shown.
- Seed bills: rent `inv-<tenantId>-oct`, electricity `inv-<tenantId>-sep`. Saved-data version 1 → 2 (`seed()` and `load()`).
- Without the broker gateway (page opened as a file), behaviour is unchanged.
- Browser checks numbered E25–E29, placed after E24 and before E19 (E19 stays the final "no page errors" check and must include the new tabs).
- Do not commit until the user asks; no `Co-Authored-By: Claude` trailer.

## Review Focus

1. A forged or malformed record (unknown tenant, wrong types, odd id, huge arrays) arrives through the broker: not stored, no page error, alert still shown. Pinned by E29.
2. A record whose reference is missing on this device (a ticket for a tenant this device has never seen): dropped, not stored with a dangling reference that would crash a view. Pinned by E29 (unknown tenant).
3. The same user open on two devices: both open devices get the record live (the gateway fans out to every open stream of that user). Covered implicitly: the default-profile manager tab from E12–E18 stays open during E25–E28; E19 catches any error it throws.
4. A device that was signed out when the change happened catches up on sign-in, provided no other device of that user received it first. Pinned by E26 (the default-profile Juan tab is signed out first).
5. A browser with version-1 saved data loads the version-2 seed once instead of keeping random bill ids. Pinned by E27 (fresh profiles) and by reading `load()`.

---

### Task 1: Records travel with alerts, across separate browser profiles

**Files:**
- Modify: `app.js` (seed bill ids and `version`; `load()`; `notify()` and `Broker.notify()`; new record rules and `applyRecords()` before `const Broker`; `Broker.deliver()`; call sites in A `reject-join`, A `decide-payment`, F `record`, F `approve`, F `ticket-update`, F `ticket`, F `pay`, F `join`)
- Modify: `tests/browser/browser_check.mjs` (`tab(url, { isolated })`; E25–E29)
- Modify: `README.md` (website section bullet; section 7 "E01–E24" → "E01–E29"; section 9 line)

**Interfaces:**
- Produces in `app.js`:
  - `notify(role, text, to, userId, records)`; `Broker.notify(role, text, to, userId, records)` puts `records` in the payload.
  - `RECORD_RULES`: `{ tenants, joinRequests, invoices, tickets }` → `{ field: type }`, types `'id' 'id?' 's' 's?' 'n' 'n?' 'b?' 'log' 'items' 'pays'`.
  - `applyRecords(records: object) -> number` (records applied); never throws.
- Consumed by tests: global `S`, `F`, `A`, `Broker`, `myTenancy`, `roomFree`, `go` (top-level declarations, reachable from `Runtime.evaluate`).

- [ ] **Step 1: Write the failing browser checks (E25–E29)**

`tab(url, { isolated = false } = {})`: when isolated, open the page in a new browser context (DevTools `Target.createBrowserContext`, then `Target.createTarget({ url, browserContextId })` over the browser WebSocket from `/json/version`, then attach to `ws://127.0.0.1:${C}/devtools/page/${targetId}`), so it has its own storage like a separate device. After E24: sign out the default-profile Juan tab `t` (`A.logout()`), open `mgr`, `juan`, `ana` as isolated tabs and sign them in (`manager`, `juan`, `ana`). A stub form for handlers that read a file input: `{ querySelector: () => ({ files: [] }) }`.

```js
// E25: juan files 'Shower drain blocked' (F.ticket) → mgr: S.tickets has it, and after go('maintenance') the page text includes it
ok('E25 devices: a tenant's repair request reaches the manager's Maintenance page', ...);
// E26: juan signs out; mgr F['ticket-update']({ status: 'In progress', note: 'Plumber tomorrow' }, { dataset: { id } }); juan signs in → that ticket's status is 'In progress'
ok('E26 devices: the manager's ticket update reaches the tenant, even after being signed out', ...);
// E27: juan's first 'Unpaid' invoice of tenant 't1'; F.pay({ inv, amount: <its balance>, method: 'GCash', ref: 'GC-E27', date: '2026-10-14' }, stub)
//      → mgr: same invoice id has payment ref 'GC-E27' and status 'Submitted for review'; mgr A['decide-payment']({ id, d: 'verify' })
//      → juan: that invoice's payment 'GC-E27' is verified and its status is 'Paid'
ok('E27 devices: a payment proof reaches the manager and the verification reaches the tenant', ...);
// E28: ana F.join({ code: 'CJD-7K2Q', note: 'E28' }) → mgr: a Pending join request with userId 'u-ana';
//      mgr F.approve({ room: <first p1 room with roomFree > 0>, start: '2026-10-14', bill: 'on' }, { dataset: { id } })
//      → ana: myTenancy()?.prop === 'p1' and S.invoices has a bill for myTenancy().id
ok('E28 devices: a join request reaches the manager and the approval makes the tenant a member', ...);
// E29: juan Broker.publish('manager.m1', { kind: 'notification', title: 'Forged record', text: 'Forged record',
//      records: { tickets: [{ id: 'forged-k', tenant: 'nobody', prop: 'p1', title: 'x', status: 5, history: 'no' }],
//                 invoices: [{ id: 'bad id!', tenant: 't1' }], rooms: [{ id: 'r-x' }] } })
//      → mgr: the alert 'Forged record' is in S.notifs; no 'forged-k' ticket, no 'bad id!' invoice, S.rooms unchanged in length
ok('E29 devices: a forged record is ignored but its alert still shows', ...);
```
Add `mgr`, `juan`, `ana` errors to E19.

- [ ] **Step 2: Run them to verify they fail**

Run: `node tests/browser/browser_check.mjs C:/Users/Client/anaconda3/python.exe` (about 4 minutes)
Expected: E01–E24 and E19 PASS (E06 may flake once; re-run), E25–E28 FAIL (records never arrive), E29 PASS or FAIL (nothing is stored yet either way; it becomes meaningful after Step 3).

- [ ] **Step 3: Implement in `app.js`**

Seed ids and version 2 as in Global Constraints. `RECORD_RULES`:
- `tenants`: `id id, userId id?, name s, email s?, phone s?, prop id, room id, start s?, status s`; references `propById(prop) && roomById(room)`
- `joinRequests`: `id id, userId id?, name s, email s?, prop id, via s?, at s?, note s?, status s`; references `propById(prop)`
- `invoices`: `id id, tenant id, kind s, label s, period s?, items items, due s?, status s, paid n?, payments pays, utilityBill id?, basis s?`; references `tenantById(tenant)`
- `tickets`: `id id, tenant id, prop id, category s, title s, desc s?, priority s, status s, created s, photo s?, history log`; references `tenantById(tenant) && propById(prop)`
- `log`: array of at most 100 `{ at s, text s }`; `items`: at most 50 `{ label s, amount n }`; `pays`: at most 100 `{ id id, amount n, method s, ref s?, date s?, verified b?, rejected b?, receipt s?, proof s? }`; strings at most 2000 characters.

`applyRecords` copies known fields only, replaces by id or adds (`unshift` for `tickets` and `joinRequests`, `push` for the others), catches everything. `Broker.deliver`: in the non-chat branch, call `applyRecords(p.records)` when `p.kind === 'notification'` and `p.records` is an object, before adding the alert. Call sites pass `{ tickets: [k] }`, `{ invoices: [i] }`, `{ joinRequests: [j] }`, and for `approve` `{ joinRequests: [j], tenants: [t], invoices: [bill] }` (bill only if generated).

- [ ] **Step 4: Run the browser checks to verify they pass**

Run: same as Step 2.
Expected: `29 passed, 0 failed` (re-run once if only E06 fails, and say so).

- [ ] **Step 5: README and the Python suite**

README: in "DormCare website on the broker", a bullet saying tickets, payment proofs and join requests (and their status changes) travel inside their alerts, so they reach the other user's device live or when they next sign in, while everything else stays per browser; section 7 "E01–E24" → "E01–E29"; section 9, one line: only those records are shared between devices, a browser that is new or reset starts from the demo data, and the last change wins.
Run: `C:\Users\Client\anaconda3\python.exe -m unittest discover -s tests -t .`
Expected: `Ran 105 tests ... OK` (no Python change; this guards the website's gateway tests).
