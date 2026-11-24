# Empty Start Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** The website starts with the accounts, properties, rooms and invite codes only; all activity data is removed from the code.
**Architecture:** `seed()` keeps the setup and returns empty activity lists; saved-data version 3 → 4; the website browser checks create their own data through the app.
**Tech Stack:** `app.js` (plain JS), `tests/browser/browser_check.mjs` (Node + headless Edge).
**Spec:** `team/specs/2026-11-24-empty-start-design.md`

## Global Constraints
- Kept: accounts and personas, properties (p1, p2, px1) with rooms and documents, invites (`CJD-7K2Q` active, uses 0), plan, other managers' `market` listings and `managers` list.
- Empty: tenants, invoices, tickets, utilityBills, history, joinRequests, announcements, inquiries, reports, billingHistory, notifs, audit, chats; remindersSent null.
- No sample-data generator or button remains. No change under `pubsub/`. Do not commit until asked; no Claude co-author trailer.

## Review Focus
1. Every page of every role with empty lists: no page error (E32).
2. Juan and Ana as tenants with no property: tenant pages show the "no property" state, joining with `CJD-7K2Q` works (E25 setup, E28).
3. Chat with no conversations; manager dashboard numbers with zero tenants (no division by zero shown as NaN) (E32 plus a NaN scan).
4. Old saved data (version 3) is replaced once (version 4).
5. Tests no longer assume sample ids (`t1`, `inv-t1-oct`, `inv-t1-sep`).

### Task 1: Empty seed, tests that build their own data, docs
- [ ] Tests first: setup steps (Juan joins with `CJD-7K2Q`, the manager approves him into `r101` with a first bill) in the default profile before E12 and in the device profiles before E25; E27 uses Juan's first bill; E30 uses a "Generate bills" Nov bill; new E32 (fresh profile: no tenants, bills or tickets, 3 properties, 8 rooms, `CJD-7K2Q`; every page of manager, tenant and admin renders, no `NaN` in the page, no page errors). Run: E32 and the setup-dependent checks fail.
- [ ] `seed()` and version 4; fix any page E32 reports. Run: 32 passed.
- [ ] Demo Guide, persona notes, README (accounts table, "Try it", what is shared), demo runbook. Python suite 105 OK.
