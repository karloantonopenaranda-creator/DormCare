# Online sharing link for the DormCare website (design)

Date: 2026-11-24 · Size: small change · Status: approved, then revised (R1 below)

## Revision R1 (2026-11-24): ngrok instead of a Cloudflare quick tunnel

Testing showed that Cloudflare quick tunnels never deliver the website's live connection (server-sent events):
Cloudflare's documentation says "Quick Tunnels do not support Server-Sent Events (SSE)." Without it, live alerts
and chat do not arrive. The user chose **ngrok** instead. Changes to the design below:

- **One-time setup on the host PC:** `winget install --id Ngrok.Ngrok`, a free ngrok account, and
  `ngrok config add-authtoken <token>`. Other devices still need nothing.
- **The link is fixed:** every free account gets one permanent dev domain (`https://<name>.ngrok-free.app` or
  `.ngrok-free.dev`), and `ngrok http` uses it automatically. This also removes the "brand-new link is not in DNS yet"
  problem found with quick tunnels.
- **Visitors see an ngrok notice page once** and click Visit; a cookie hides it for 7 days on that device.
- **Free-plan limits:** 1 GB of data and 20,000 HTTP requests a month. The site sends no timed requests, so a demo uses
  a few hundred.
- The script starts `ngrok http http://127.0.0.1:<port> --log stdout --log-format logfmt` and takes the link only from
  ngrok's `msg="started tunnel"` line (its error messages also contain `https://` links). If ngrok reports
  `ERR_NGROK_4018`, the script explains how to add the authtoken.
- Live alerts through the link are part of the verification, not an assumption.

Everything else below still holds; read "cloudflared" as "ngrok" in the design steps.

## Intent

Let any phone or laptop open the DormCare website, and so use the broker, with **nothing to install on that
device and no network or firewall changes on the host PC**. If someone has the link, it works. This is for
the demo and for group testing on several devices.

## Goals

- One command on the host PC prints a public `https://` link.
- The link works from any network the other device is on: the same Wi-Fi, campus Wi-Fi that blocks
  device-to-device traffic, or mobile data.
- Live alerts and chat (server-sent events from `pubsub/webapp`) work through the link.
- No change to `pubsub/`: broker, protocol and delivery guarantees stay exactly as they are.

## Non-goals

- A permanent link or always-on hosting (that is approach B below).
- Opening the raw TCP broker port to command-line clients on other machines. They still use the LAN steps
  (`--host 0.0.0.0`, Private network, firewall rule).
- Authentication. The login page is a separate request and is on hold.
- Sharing the app's local data (bills, tickets) across devices. Only what travels through the broker
  (announcements, chat, alerts) is shared.

## Anti-goals

- Anything that weakens the durable-queue demonstration, such as moving the database to storage that is
  wiped on restart.
- Exposing the site without saying so: the script must state that anyone with the link can use it.

## Constraints

- The host is Windows. Project code uses the Python standard library only. `cloudflared` is an external
  program, not a Python package, so `requirements.txt` stays empty.
- `scripts/` is graded and goes into the submission zip: keep it short, readable and commented.
- The existing test suite must keep passing.

## Approaches

| Approach | Trade-offs | Decision |
|---|---|---|
| **A. Cloudflare quick tunnel from this PC** | Free, no account, outbound connection only, so no firewall or Wi-Fi changes. The PC must stay on, and the link changes every time it starts. | **Chosen** by the user |
| B. Host on a cloud server (Render, Railway, Fly.io, a VPS) | Permanent link, PC can be off. Needs an account and deployment setup; free tiers sleep or wipe the disk, which erases the durable queues; a persistent disk costs money. | Not chosen |
| Installable "Add to Home Screen" app | Only changes how the link opens; still needs A or B behind it. | Possible later add-on |
| Automatic discovery on the local network | Does not remove the firewall and Private-network steps. | Dropped |

## Design

1. **One-time install on the host PC:** `winget install --id Cloudflare.cloudflared`.
2. **New `scripts/start_online.py`**, with a `scripts/start_online.bat` wrapper that finds Python through
   `find_python.bat` like the other scripts:
   - Find `cloudflared` (on PATH, then the usual winget install folder). If it is missing, print the install
     command and exit.
   - If a web app already answers on port 8000, reuse it. Otherwise start `python -m pubsub.webapp --no-browser`,
     which reuses the broker on port 5555 or starts one.
   - Start `cloudflared tunnel --url http://localhost:8000 --no-autoupdate`, read its output, and extract the
     `https://<words>.trycloudflare.com` link.
   - Print the link in a banner, copy it to the clipboard, open it in the browser, and warn that anyone with
     the link can use the site until the script is stopped.
   - Ctrl+C stops the tunnel and anything the script started. A web app or broker that was already running
     is left running.
3. **README:** a new subsection in section 4, "Share a link to the website (any device, no setup)"; a row in
   the helper-scripts table; a line in section 9 (Known limitations) about the public link and no login.
4. **Tests:** a unit test for extracting the link from sample `cloudflared` output. The existing suite stays
   green.
5. **Verification before handing over:** run it on this PC, open the public link in a headless browser (so the
   traffic really goes through Cloudflare), post an announcement as Manager and confirm it reaches the Tenant
   window live. Then the user tries the link on a phone.

## Left to the builder

- Exact banner wording, and how long to wait for the link (about 30 seconds) before reporting an error.
- Whether the new test goes in `tests/test_scripts.py` or a new test file.
