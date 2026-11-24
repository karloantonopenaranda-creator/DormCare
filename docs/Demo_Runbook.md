# Demo Runbook: DormCare Live Alerts

A step-by-step live demonstration that shows every graded behaviour:
**topic filtering**, **disconnect and catch-up**, **at-least-once delivery**, and **broker crash and recovery**.
Allow about 6 minutes of the 15-minute presentation, without the optional extras. On 23 Nov 2026 sections 2–3 (with
both extras) were run by an automated driver through the real `.bat` files on the development laptop, and section 0 by
`tests/browser/browser_check.mjs`. That is not a substitute for the group's own rehearsal on the presentation laptop.

---

## 0. Dashboard version (one browser window instead of six terminals)

Double-click `scripts\start_dashboard.bat`; the browser opens at http://127.0.0.1:8080. Press **Reset** first for
clean sequence numbers, then follow the same story as section 3:

| # | Click | Audience sees | Say |
|---|---|---|---|
| 1 | **Start demo** | Broker pill turns green; four phones turn on and show "Online" | "Every phone is a real subscriber process; the dashboard just shows what they print." |
| 2 | Manager's office: *Fire safety inspection* | An envelope travels desk → Juan's pigeonhole → Juan's phone. Jerome gets nothing | "Topic filtering: only Casa Jaro tenants subscribe to casa-jaro.announcements." |
| 3 | Manager's office: *Welcome to our new tenants!* | Only Jerome's phone | |
| 4 | Maintenance desk: *Leaking faucet: acknowledged* | Juan **and** the caretaker | "Second publisher, fan-out to two subscribers." |
| 5 | Juan's phone: **Crash** | Juan's phone goes Off; his slot says offline | "That really killed his process. No goodbye message." |
| 6 | *Scheduled water interruption*, *October rent is due on Oct 15*, maintenance *in progress* | Envelopes pile up in Juan's pigeonhole: **3 waiting** | "The broker queues them on disk for him." |
| 7 | Juan's phone: **Start** | Three **Caught up** notices, in order; the pigeonhole empties | "Same id, no topics given: durable subscription and catch-up." |
| 8 | Jerome: **Crash**, then *October rent is due on Oct 10*, then header **Crash broker** | Wall dims: "Waiting envelopes are kept safely in its database" | "Worst case: the broker dies with a message queued." |
| 9 | **Start broker**, then Jerome **Start** | Phones reconnect on their own; Jerome shows **Caught up** | "Recovered from SQLite. Nothing lost." |
| 10 | *(optional)* **Fault tests → Juan crashes before ACK**, publish a Casa Jaro notice, then Juan **Start** | **Duplicate ignored** on Juan's phone | "At-least-once: re-sent because no ACK came; recognised by its sequence number and publish time." |
| 11 | *(optional)* **Fault tests → Broker loses a PUBACK**, publish any notice | Desk says the broker "recognised the duplicate" | "Publisher retry plus duplicate detection." |

Tick **Show deliveries and ACKs** under the broker log if someone asks to see the acknowledgements.

### Closing touch (about 1 minute): the real DormCare app on the same broker
With the dashboard still running, double-click `scripts\start_website.bat`; DormCare opens at http://127.0.0.1:8000
and connects to the dashboard's broker (green **Live alerts** pill in the top bar).

| # | Do | Audience sees | Say |
|---|---|---|---|
| 1 | In DormCare, sign in as **Manager** (`manager` / `manager123`): Announcements, pick Casa Jaro, post *"Water tank cleaning Friday"* | The dashboard's **Juan phone** receives it too | "The real app publishes to the same broker; any subscriber of casa-jaro.announcements gets it." |
| 2 | Click the manager's name, **Log out**, and sign in as **Tenant** Juan (`juan` / `juan123`) | Toast: *"Was waiting at the broker"*; it's in his bell | "Juan's web account is a durable subscriber; the notice waited in his queue." |
| 3 | *(optional)* Open `http://127.0.0.1:8000/?role=manager` in a second window, sign in as `manager`, update Juan's ticket in Maintenance | Juan's window: *"New alert: Maintenance update…"* | "Live delivery between two separate browser windows." |
| 4 | *(optional)* Both windows on **Messages**: Juan asks *"Is the Wi-Fi down on the 2nd floor?"*, the manager replies | Bubbles appear live in the other window; each shows *"via the broker (#n)"* / *"sent through the broker (#n)"* | "Two-way chat: each conversation is its own topic, chat.u-juan. The website subscribes the manager to every conversation, each tenant only to theirs. There is no access control yet." |

## 1. Before the presentation (the day before, and again 10 minutes before)

- [ ] Use **the laptop you will present on**. Run `scripts\run_tests.bat` and expect `Ran 105 tests ... OK`.
- [ ] Decide which version you'll show: the **web dashboard** (section 0, best on a projector) or the **terminal windows** (sections 2–3). Rehearse that one. Don't run both at once: they share broker port 5555.
- [ ] Close every old demo window, then run `scripts\reset_data.bat` (empty queues give clean sequence numbers #1, #2, ...).
- [ ] Set terminal font size to 16+ (right-click the title bar → Properties → Font) so the back row can read it.
- [ ] Disable notifications / Focus Assist so pop-ups don't cover the windows.
- [ ] Have `docs\diagrams\fig1_architecture.png` open to point at during the walkthrough.
- [ ] Keep a **backup screen recording** of a full rehearsal in case the laptop fails.
- [ ] Open one extra terminal in the project folder: the **control terminal**, used for `status.bat` and `crash.bat`.

## 2. Start everything

In the control terminal:
```
scripts\start_demo.bat
```
Six windows open. Arrange them like this (Windows key + arrow keys to snap):

```
+--------------------------+--------------------------+--------------------------+
| BROKER                   | SUB tenant-juan          | PUB manager-office       |
| (big: the audience reads | (Casa Jaro tenant)       |                          |
|  routing decisions here) +--------------------------+--------------------------+
|                          | SUB tenant-jerome        | PUB maintenance-desk     |
|                          | (Molo tenant)            |                          |
|                          +--------------------------+--------------------------+
|                          | SUB caretaker            | control terminal         |
+--------------------------+--------------------------+--------------------------+
```

**Say:** *"One broker, two publishers (the manager's office and the maintenance desk), and three subscribers: two tenants at different boarding houses and the caretaker. They never talk to each other directly. Everything goes through the broker over TCP."*

Point at the broker window: each subscriber's `ONLINE ... new session` and `SUBSCRIBE` lines.

## 3. The sequence

| # | Who acts | Type / do | Audience sees | What it proves | Say |
|---|---|---|---|---|---|
| 1 | manager-office | `list` | The 8 scripted DormCare events | Real-world scenario | "These notices are based on the DormCare prototype's sample data." |
| 2 | manager-office | `send 1` | **Only Juan** shows `LIVE #1 ... Fire safety inspection`. Broker: `-> 1 of 3 subscriber(s): tenant-juan` | **Topic filtering** | "Jerome lives at Molo, so he gets nothing. The broker filtered it." |
| 3 | manager-office | `send 2` | **Only Jerome** shows the Molo welcome notice | Filtering (other direction) | |
| 4 | maintenance-desk | `send 1` | **Juan and caretaker** both show "Leaking faucet: acknowledged"; Jerome doesn't | Second publisher, fan-out | "Same topic, two subscribers: the broker fans it out." |
| 5 | control terminal | `scripts\crash.bat tenant-juan` | Juan's window: *"Subscriber tenant-juan stopped"*. Broker: `OFFLINE subscriber tenant-juan: connection reset ... new messages will be queued` | **Crash detection** | "That was a hard kill, like his phone dying. No goodbye message, yet the broker noticed instantly." |
| 6 | manager-office | `send 3`, then `send 4` | Broker: `tenant-juan (offline: queued)` for each | **Durable queue** | |
| 7 | maintenance-desk | `send 2` | Caretaker receives it LIVE; broker shows Juan queued | Mixed online/offline | |
| 8 | manager-office | `status` | `tenant-juan  offline  3` | Queue is real and visible | "Three messages are waiting in Juan's queue, stored in SQLite." |
| 9 | Juan's window | press any key | `CONNECTED ... resumed durable session, 3 queued message(s) waiting`, `durable subscriptions: ...`, then **3× CATCH-UP #4, #5, #6** in order | **Catch-up, at-least-once, durable subscriptions** | "We restarted him *without* `--topics`. The broker remembered his subscriptions and replayed everything he missed, in order." |
| 10 | manager-office | `status` | `tenant-juan  online  0` | Queue drained by ACKs | |
| 11 | control terminal | `scripts\crash.bat tenant-jerome`, then in manager-office: `send 5` | Jerome queued 1 | Set-up for broker crash | |
| 12 | control terminal | `scripts\crash.bat broker` | Broker window: *"Broker stopped"*. Juan and caretaker: `OFFLINE ... RECONNECT trying again in 1s` (repeating) | **Broker crash** | "Now the worst case: the broker itself dies, with a message queued for Jerome." |
| 13 | Broker window | press any key | `RECOVER 7 durable subscription(s) for 3 client(s), 1 message(s) waiting`. Juan and caretaker reconnect by themselves | **Recovery from SQLite**, auto-reconnect | "Everything came back from the database. The subscribers reconnected on their own." |
| 14 | Jerome's window | press any key | `CATCH-UP #... October rent is due on Oct 10` | Nothing lost across a broker crash | |
| 15 | maintenance-desk | `send 3` | Possibly `RETRY ... re-sending the SAME msg_id`, then `PUBACK`; Juan and caretaker get it LIVE | Publisher retry after broker restart | "The publisher's old connection died with the broker, so it reconnected and re-sent the same message id. Duplicates are detected by id." |

### Optional extra (if time allows, about 1 minute): crash before ACK
Close Juan's window, then in the control terminal start him with the fault flag:
```
scripts\run_subscriber.bat tenant-juan --crash-after 1
```
Then manager-office: `send 7`. Juan shows the message, then `FAULT ... exiting abruptly before ACKing`.
Press a key in the control terminal to restart him (the fault flag applies to the first run only):
the broker shows `REDELIVER #.. (attempt 2)` and Juan shows **`DUPLICATE ... ignored`**.
**Say:** *"That's at-least-once, shown honestly: the broker re-sent it because no ACK arrived, and Juan recognised it by its sequence number and publish time, so it wasn't processed twice."*

### Optional extra: lost PUBACK
Close the broker window. In the control terminal start a broker that "loses" its first PUBACK:
```
start "BROKER (fault)" scripts\run_broker.bat --fault-skip-puback 1
scripts\pyrun.bat -m pubsub.publisher --id manager-office-2 --topic casa-jaro.billing --title "Reminder: rent due tomorrow" --puback-timeout 2
```
Broker: `FAULT ... PUBACK is being dropped`, then `DUPLICATE ... not routed again`. Publisher: `RETRY`, then
`duplicate detected`. Juan receives one copy. Afterwards close the fault broker window and start a normal one
(`start "BROKER" scripts\run_broker.bat`).

## 4. If something goes wrong

| Problem | Fix |
|---|---|
| "Cannot listen on 127.0.0.1:5555" | An old broker is still running: `scripts\crash.bat broker`, then press a key in the broker window. |
| A window says "Could not find Python 3" | `set DORMCARE_PYTHON=C:\path\to\python.exe` in the control terminal, then run `start_demo.bat` again from it. |
| Sequence numbers aren't #1, #2, ... | Data from an earlier run. Close all windows, `scripts\reset_data.bat`, start again. (Numbers don't affect correctness.) |
| `reset_data.bat` says it could not delete | A broker or subscriber is still running. Close all demo windows first. |
| A subscriber says another connection took over its id | The same id was started twice. Keep the newer window, close the older one. |
| Windows Firewall prompt | Click Cancel. The demo uses 127.0.0.1 only. |
| Anything else | Switch to the backup recording, and narrate it the same way. |

## 5. Commands cheat sheet

| Command | Where |
|---|---|
| `list`, `send <n>`, `send all`, `status`, `help` | publisher window |
| `pub <topic> <title> \| <body>` | publisher window (free-text message) |
| `scripts\status.bat` | control terminal: queue report |
| `scripts\crash.bat <client-id>` / `scripts\crash.bat broker` | control terminal: hard kill |
| `scripts\reset_data.bat` | control terminal: wipe queues (close windows first) |
| `scripts\run_tests.bat` | control terminal: full test suite |
| `scripts\pyrun.bat <args>` | control terminal: run Python when `python` is not on PATH |
