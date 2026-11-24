# Presentation & Q&A Guide (team use only, not for submission)

The final presentation is 15 minutes plus 5 to 10 minutes of Q&A. **Every member must speak**, and the instructor
may ask **any** member about **any** part of the system or the relevant chapters (4, 5, 6, 7). Individual
answers affect individual marks, so everyone should read all of this guide, not just their own part.

---

## 1. Fifteen-minute plan

| Time | Part | Speaker | Content | Show |
|---|---|---|---|---|
| 0:00–1:30 | Scenario | Member 1 | DormCare in one sentence; why notices need pub-sub (tenants offline, managers don't know who's listening); 2 publishers, 3 subscribers, topics | Slide 2–3 |
| 1:30–4:00 | Architecture | Member 2 | Figure 1 walkthrough, steps 1–6; thread per connection; single delivery path | Slide 4 (Figure 1) |
| 4:00–5:30 | Protocol & filtering | Member 3 | Newline-delimited JSON over TCP; message table; topic matching = one indexed lookup; durable subscriptions | Slide 5–6 |
| 5:30–7:00 | Persistent queues & at-least-once | Member 4 | Three tables; PUBACK after commit; ACK, re-send, duplicates (Figure 5) | Slide 7–8 |
| 7:00–13:00 | **Live demo** | Member 5 drives, Member 4 narrates | `docs/Demo_Runbook.md` steps 1–15 | Demo windows |
| 13:00–14:30 | Chapter 6 link, trade-offs | Member 1 | Space/time uncoupling; topic vs content; central broker vs broker network; limitations | Slide 9 |
| 14:30–15:00 | Wrap-up | Member 2 | What the project achieved (95 tests, fault report), how AI was used, thanks | Slide 10 |

**Four members?** Merge "Protocol & filtering" into Member 2's part and have Member 3 drive the demo.

## 2. Slide outline (10 slides: `docs/Presentation.pptx`, speaker notes included)

1. **Title.** DormCare Live Alerts: a broker-based publish-subscribe system. Group names.
2. **The problem.** Prototype: `notify()` writes to one list in one browser tab. Real life: separate devices, often offline. Pub-sub gives space and time uncoupling (§6.1).
3. **Scenario.** Publishers: manager-office, maintenance-desk. Subscribers: tenant-juan (Casa Jaro), tenant-jerome (Molo), caretaker. Topics `<property>.<category>`.
4. **Architecture.** Figure 1 (`docs/diagrams/fig1_architecture.png`).
5. **Protocol.** TCP plus newline-delimited JSON; example PUBLISH and DELIVER frames; message-type table (keep it short).
6. **Topic filtering.** Durable subscriptions table; `SELECT client_id FROM subscriptions WHERE topic = ?`; filtering at the broker, not the subscriber.
7. **Persistent queues.** messages / subscriptions / deliveries; "a row = a message still owed"; PUBACK only after commit.
8. **At-least-once.** Figure 5 (`fig5_at_least_once_sequences.png`): lost PUBACK and crash before ACK; duplicates detected on both hops.
9. **Design decisions.** Topic vs content (table from design doc §8.2); central broker vs network; at-least-once vs exactly-once; limitations.
10. **Results.** 95/95 tests; fault tests X1–X11; how AI was used; what we'd do next (replication, security, wildcards).

## 3. Q&A answer bank

Short, accurate answers. **Where** tells you where to point in the code.

**Chapter 6: indirect communication**

1. **What is space uncoupling and time uncoupling? Where does your system show them?**
   Space: senders don't know who receives (a publisher names a topic, not subscribers). Time: sender and receiver needn't be active at the same time; the broker's durable queues hold messages for offline subscribers. Demo step 5–9: Juan is offline while messages are published, and receives them later. (§6.1)
2. **Topic-based vs content-based filtering: what's the difference, and why did you choose topics?**
   Topic: subscription names a topic, and matching is an equality test. Content: subscription is a predicate over message attributes, which is more expressive but costlier to match and route. We chose topics because DormCare notices divide naturally by property and category, matching is one indexed lookup, behaviour is predictable, and privacy needs access control either way. (Design doc §8)
3. **What other subscription models exist?** Channel-based (everything on a named channel), type-based (subscriptions by object type), and content-based. (§6.3)
4. **How is a message queue (§6.4) different from publish-subscribe (§6.3)?**
   A queue is point-to-point: each message is consumed by one receiver. Pub-sub is one-to-many: every subscriber of the topic gets a copy. Our broker combines them: pub-sub routing, then one persistent queue per subscriber.
5. **Your broker is centralised. How would you distribute it?**
   A network of brokers routing notifications between them: flooding, filter-based routing, or rendezvous nodes per topic (§6.3 implementation issues). Or replicate the single broker's database (primary-backup) for availability.

**Delivery guarantees (Chapters 5 and 6)**

6. **What does at-least-once mean here, and how do you guarantee it?**
   Once a publisher gets PUBACK, every subscriber of that topic will receive the message, possibly more than once. It stays in the subscriber's queue (`deliveries` table) until ACKed. It's re-sent after 5 s without ACK, and immediately on reconnect. Where: `store.publish`, `broker.delivery_loop`, `broker.handle_ack`.
7. **Where can duplicates come from, and how do you handle them?**
   (a) Lost PUBACK: the publisher re-sends the same `msg_id`; the broker finds it in `messages` (UNIQUE publisher_id, pub_msg_id) and doesn't route it again. (b) Crash after processing, before ACK: the broker re-sends; the subscriber's on-disk processed log recognises the message by (seq, published_at) and ignores it. Seq alone would repeat after a database reset. Where: `store.publish` (duplicate check), `subscriber.ProcessedLog`.
8. **Maybe vs at-least-once vs at-most-once?** Maybe: no retry. At-least-once: retry, no duplicate filtering. At-most-once: retry plus duplicate filtering. (§5.3.1) We retry and filter duplicates on both hops, but call it at-least-once because duplicates can still be *delivered*.
9. **Why not exactly-once?** It needs processing and acknowledgement to be one atomic step shared by subscriber and broker (a distributed transaction). At-least-once plus duplicate detection gives the same practical result much more simply.
10. **Why is PUBACK sent only after the database commit?** So a publisher that has seen PUBACK knows the message survives a broker crash. Test F8 kills the broker right after PUBACK and still gets the message.
11. **What happens if the broker crashes?** Clients see the connection reset. The broker restarts and reloads subscriptions and queues from SQLite (`RECOVER` line). Subscribers reconnect with back-off 1, 2, 4, 8 s; publishers reconnect on their next publish and retry. No acknowledged message is lost, as long as the database file survives. A publisher gives up after 5 retries. (Demo step 12–14, test X3.)

**Chapter 4: interprocess communication**

12. **Why TCP and not UDP?** TCP gives reliable, ordered streams and tells us when a peer dies. With UDP we'd have to add retransmission, ordering and fragmentation ourselves. (§4.2.3–4.2.4)
13. **TCP is reliable, so why do you need ACKs at all?** TCP only guarantees bytes reach the other machine's OS. If the receiving *process* crashes before handling them, they're lost. Application-level ACKs confirm the message was actually processed.
14. **How do you know where one message ends?** TCP is a byte stream, so we frame each message as one JSON object plus a newline. JSON escapes newlines inside strings, so a raw newline always means end of frame. `FrameReader` buffers until a newline arrives, handling split and merged reads. (`protocol.FrameReader`, tests F1)
15. **Why JSON?** It's a textual external data representation (§4.3): language-neutral, self-describing, and readable in logs. The cost is size and parse speed compared with binary formats; that's irrelevant for short notices.

**Chapter 7: OS support, and implementation**

16. **How does the broker handle many clients at once?** Thread per connection (§7.4), plus one delivery thread per online subscriber. Shared state is protected by locks: the store lock (SQLite connections must not be shared between threads), the registry lock, and a per-connection send lock so two threads never interleave frames on one socket.
17. **Why not a thread pool or asyncio?** With tens of long-lived connections, threads are cheap and the code stays straight-line and readable. An event loop scales to thousands of connections but is harder to read and explain.
18. **How do you detect a failed client?** (a) A killed process: the OS resets the connection and the read fails immediately. (b) A frozen process or broken network: no PING within 15 s (3 missed heartbeats), so the broker closes it. A wrong suspicion only causes a duplicate, never a loss.
19. **What if two clients use the same id?** The newest connection wins; the broker sends REPLACED to the older one and closes it, and that subscriber program stops instead of reconnecting (`registry.attach`, tests X7 and R6).
20. **How is order guaranteed?** One broker-wide sequence number. Each subscriber's queue is delivered `ORDER BY seq`, and live messages go through the same queue (the single delivery path), so the backlog always comes before newer messages.
21. **What are the limitations?** Single broker (unavailable while down), no authentication or encryption, exact-match topics only, message log never trimmed, durability covers process crashes but not power loss (`synchronous = NORMAL`).
22. **How did you test it?** 95 automated tests that run the real programs over TCP and hard-kill them; fault injection flags (`--crash-after`, `--no-ack`, `--fault-skip-puback`); a scripted end-to-end run with saved logs (Fault Test Report).
23. **Is the web dashboard part of the distributed system? Does it cheat?** It's a client and a monitor, not part of the middleware. It starts the real broker and subscriber programs as separate processes (Crash really kills one), shows what they print, publishes through the same TCP protocol as any publisher, and gets queue lengths from the broker's `STATUS` reply. Nothing on the page bypasses the broker; the same demo works with plain terminal windows. (`pubsub/dashboard/server.py`)
24. **How does the browser get live updates?** Server-sent events: the browser opens one long HTTP response (`GET /events`) and the dashboard writes a `data: {json}` line for each event. A browser can't open raw TCP sockets, which is why it talks to the dashboard rather than directly to the broker.
25. **How is the DormCare website connected to the broker?** `pubsub/webapp/server.py` serves the app and acts as its bridge. Every `notify()` in `app.js` becomes a PUBLISH; each DormCare user (manager, admin, each tenant) is a durable subscriber, and the bell fills from that user's DELIVERs, which the page ACKs only after saving them. Personal alerts go to `tenant.<user>` so the site shows tenants only their own (no access control: another client could subscribe); announcements go to `<property>.announcements`, the same topics as the command-line clients and the dashboard, which is why they receive the website's announcements too.
26. **What happens to a user's alerts while nobody has their page open?** They wait in that user's queue at the broker, exactly like an offline subscriber. When the view opens (switching role in the app, or opening a window), the queue is delivered and the page labels those alerts "waited at the broker".
27. **How does the chat work?** Each tenant's conversation with the manager is its own topic, `chat.<user>`. The manager subscribes to every conversation and each tenant only to theirs, so the site doesn't show Ana Juan's chat. It is not secure: there is no access control. A sent message is a PUBLISH. The sender subscribes to the conversation too, so its own copy coming back from the broker is what turns *"sending…"* into *"sent through the broker (#n)"*. A message for someone offline waits in their queue and is shown as *"waited at the broker"*.

28. **How can PUBACK promise delivery if DELIVER is bigger than PUBLISH?** Before storing, the broker encodes the largest DELIVER the message could become and refuses it if that doesn't fit. (`broker._check_deliverable`, test R1)
29. **Who wrote this code?** Answer truthfully: Claude generated most of it (README, "Use of AI tools"). Then say what you personally did and show you understand the part you are asked about.

## 4. Individual reflection (each student writes their own, 1 page)

The reflection must describe **your own** contribution and **one textbook concept you found hard to apply**,
so it has to be written by you. Prompts to get started:

- What did you personally do: direct, read, run, test, correct, rehearse, present? Claude generated most of the code
  and documents, so don't describe those as your own writing, or its debugging as your experience.
- What did you yourself find confusing or surprising when you studied or ran the system?
- Concept ideas: at-least-once vs exactly-once semantics; time uncoupling with durable queues; failure detection in an asynchronous system (slow vs crashed); topic vs content filtering; framing a byte stream.
- What would you do differently with more time?

## 5. Submission checklist

See [`team/SUBMISSION_CHECKLIST.md`](../team/SUBMISSION_CHECKLIST.md).
