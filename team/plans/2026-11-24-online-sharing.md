# Online Sharing Link Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One command on the host PC (`scripts\start_online.bat`) puts the DormCare website behind a public `https://…trycloudflare.com` link that any device can open with no setup.

**Architecture:** A new standalone script, `scripts/start_online.py`, reuses or starts `pubsub.webapp` on port 8000, starts a Cloudflare quick tunnel (`cloudflared`) to it, waits until the public link answers, then prints it, copies it to the clipboard and opens it. `pubsub/` is not changed. A `.bat` wrapper follows the existing helper-script pattern.

**Tech Stack:** Python 3.10+ standard library (`subprocess`, `threading`, `urllib.request`, `re`, `shutil`, `webbrowser`), `unittest`, Windows batch, the external `cloudflared` program.

**Spec:** `team/specs/2026-11-24-online-sharing-design.md`

## Global Constraints

- Project code uses the Python standard library only; `requirements.txt` stays empty (`cloudflared` is an external program).
- Do not modify anything under `pubsub/`.
- `scripts/` is graded and goes into the submission zip: short, readable, commented, matching the style of `scripts/record_demo.py` (module docstring with usage, `ROOT = Path(__file__).resolve().parents[1]`, `sys.path.insert(0, str(ROOT))`).
- The script must state that anyone with the link can use the site until it is stopped.
- Tunnel target is `http://127.0.0.1:<port>`, not `localhost`: `pubsub.webapp` listens on IPv4 only, and `localhost` may resolve to `::1` first. (Deliberate refinement of the spec's `localhost`.)
- Do not commit or push: the user will ask. When a commit is made later, no `Co-Authored-By: Claude` trailer.
- Run Python as `C:\Users\Client\anaconda3\python.exe` on this PC (`python` on PATH is the Microsoft Store placeholder).

## Review Focus

1. Cloudflare is unreachable or rate-limited: `cloudflared` logs an error containing `https://api.trycloudflare.com/tunnel` and exits. That must never be shown as the share link; the script reports the error and exits non-zero. Pinned by test O2 and O4 (Task 1).
2. Port 8000 is held by a program that is not DormCare: the script must not tunnel to it; it says so and exits. Pinned by test O3 (Task 1).
3. The link is printed before it is reachable (it can take several seconds): the script waits up to 30 s for `<link>/broker/info` before announcing it, and if it never answers, still prints the link with "it may take a minute to start working". Pinned by test O5 (Task 1).
4. `cloudflared` exits right away (no internet, blocked outbound): the script must also stop the web app it started, so nothing is left holding ports 8000/5555. Pinned by test O4 (Task 1) and step 2.6 (Task 2).
5. A website started earlier (`start_website.bat`) is already running: reuse it and leave it running after Ctrl+C. Pinned by step 2.5 (Task 2).

---

### Task 1: `start_online` script, wrapper, tests and README

**Files:**
- Create: `scripts/start_online.py`
- Create: `scripts/start_online.bat`
- Create: `tests/test_online.py`
- Modify: `README.md` (section 4 after "DormCare website on the broker"; the "Helper scripts (Windows)" table; section 9)

**Interfaces:**
- Consumes: `pubsub.common.children.end_with_this_process(proc: subprocess.Popen) -> bool`; `pubsub.webapp` CLI (`--port`, `--no-browser`); its `GET /broker/info` returns JSON `{"ok": true, "broker": ..., "broker_port": ...}`.
- Produces (in `scripts/start_online.py`):
  - `TUNNEL_URL: re.Pattern` matching `https://<sub>.trycloudflare.com` but not `https://api.trycloudflare.com`
  - `find_tunnel_url(line: str) -> str | None`
  - `find_cloudflared() -> str | None` (PATH via `shutil.which`, then `%ProgramFiles(x86)%\cloudflared\cloudflared.exe`, `%ProgramFiles%\cloudflared\cloudflared.exe`)
  - `website_running(base_url: str, timeout: float = 2.0) -> bool` (True only if `GET {base_url}/broker/info` returns JSON whose `ok` is true)
  - `wait_until_reachable(base_url: str, timeout: float) -> bool` (polls `website_running` about every 1 s)
  - `open_tunnel(command: list[str], timeout: float = 30.0) -> tuple[subprocess.Popen, str | None]` (stdout+stderr merged; returns the first `find_tunnel_url` hit, or `None` when the process exits or the timeout passes; a daemon thread keeps draining output afterwards and echoes lines containing ` ERR `; keeps the last 10 lines for error reports)
  - `main(argv: list[str] | None = None) -> int` with options `--port` (default 8000) and `--no-browser`

- [ ] **Step 1.1: Write the failing tests in `tests/test_online.py`**

Load the script with `importlib.util.spec_from_file_location("start_online", ROOT / "scripts" / "start_online.py")`. Module docstring in the style of the other test files ("The internet sharing script (O) …").

```python
CF_BANNER = "2026-11-24T07:00:00Z INF |  https://quiet-river-maple-tone.trycloudflare.com                    |"
CF_API_ERROR = ('2026-11-24T07:00:00Z ERR Error requesting quick Tunnel error="Post '
                '\\"https://api.trycloudflare.com/tunnel\\": dial tcp: lookup api.trycloudflare.com: no such host"')

def test_O1_link_is_found_in_cloudflared_banner(self):
    self.assertEqual(mod.find_tunnel_url(CF_BANNER), "https://quiet-river-maple-tone.trycloudflare.com")

def test_O2_api_address_and_plain_lines_are_not_links(self):
    self.assertIsNone(mod.find_tunnel_url(CF_API_ERROR))
    self.assertIsNone(mod.find_tunnel_url("INF Requesting new quick Tunnel on trycloudflare.com..."))

def test_O3_only_a_dormcare_website_counts_as_running(self):
    # a stdlib http.server on a free port answering /broker/info with {"ok": true} -> True
    # the same server answering HTML (another program) -> False
    # a free port with nothing listening -> False

def test_O4_tunnel_that_fails_returns_no_link_quickly(self):
    fake = [sys.executable, "-c", f"print({CF_API_ERROR!r})"]
    start = time.monotonic()
    proc, url = mod.open_tunnel(fake, timeout=10)
    self.assertIsNone(url)
    self.assertLess(time.monotonic() - start, 5)   # returns when the process exits, not at the timeout
    proc.wait(5)

def test_O4b_tunnel_link_is_returned_while_process_keeps_running(self):
    fake = [sys.executable, "-c", f"import time; print({CF_BANNER!r}, flush=True); time.sleep(30)"]
    proc, url = mod.open_tunnel(fake, timeout=10)
    try:
        self.assertEqual(url, "https://quiet-river-maple-tone.trycloudflare.com")
        self.assertIsNone(proc.poll())
    finally:
        proc.kill(); proc.wait(5)

def test_O5_reachability_wait(self):
    # local server answering {"ok": true} -> wait_until_reachable(url, 3) is True
    # free port, nothing listening -> wait_until_reachable(url, 2) is False, after roughly 2 s (< 4 s)

def test_O6_missing_cloudflared_prints_install_command(self):
    with mock.patch.object(mod, "find_cloudflared", return_value=None), redirect_stdout(io.StringIO()) as out:
        self.assertEqual(mod.main(["--no-browser"]), 1)
    self.assertIn("winget install --id Cloudflare.cloudflared", out.getvalue())
```

- [ ] **Step 1.2: Run the tests to verify they fail**

Run: `C:\Users\Client\anaconda3\python.exe -m unittest tests.test_online -v`
Expected: errors, because `scripts/start_online.py` does not exist.

- [ ] **Step 1.3: Implement `scripts/start_online.py`**

`main()` order: find `cloudflared` (missing: print the winget command, return 1) → if `website_running("http://127.0.0.1:<port>")` reuse it, else if the port is open print "port <port> is used by another program" and return 1, else start `[sys.executable, "-m", "pubsub.webapp", "--port", str(port), "--no-browser"]` with `cwd=ROOT`, call `end_with_this_process`, and wait up to 15 s for `website_running` → `open_tunnel([exe, "tunnel", "--url", f"http://127.0.0.1:{port}", "--no-autoupdate"])` (no link: print the last `cloudflared` lines, stop what was started, return 1) → `wait_until_reachable(link, 30)` → banner with the link and the warning "Anyone with this link can use the site until you press Ctrl+C", copy to clipboard with `subprocess.run(["clip"], input=link, text=True)` on Windows, `webbrowser.open(link)` unless `--no-browser` → wait for `cloudflared` to exit or Ctrl+C → stop `cloudflared` and only the web app this script started → return 0. Call `console.setup(title="DormCare online link")` at the start.

- [ ] **Step 1.4: Create `scripts/start_online.bat`**

Same shape as `scripts/start_website.bat`: comment header saying what it does and that `cloudflared` must be installed once (`winget install --id Cloudflare.cloudflared`); `title DormCare online link`; `cd /d "%~dp0.."`; `call "%~dp0find_python.bat"`; `%PY% scripts\start_online.py %*`; then "Stopped. Press any key to close this window." and `pause >nul`.

- [ ] **Step 1.5: Run the tests to verify they pass**

Run: `C:\Users\Client\anaconda3\python.exe -m unittest tests.test_online -v`
Expected: 7 tests, OK.

- [ ] **Step 1.6: Update `README.md`**

- Section 4, new subsection after "DormCare website on the broker": "Share a link to the website (any device, no setup)". Cover: the one-time `winget install --id Cloudflare.cloudflared`; running `scripts\start_online.bat` (or `python scripts/start_online.py`); that it prints a `https://….trycloudflare.com` link, copies it, and works from any network; that only the website goes through the link (command-line clients on other machines still need `--host 0.0.0.0`); that the link changes every start; that anyone with the link can use the site, so stop it after the demo.
- "Helper scripts (Windows)" table: a row for `scripts\start_online.bat`, "Share the DormCare website on a public link (needs cloudflared)".
- Section 9: one bullet saying the shared link is public and has no login, so anyone who has it can read and post until the script is stopped.

- [ ] **Step 1.7: Run the full suite**

Run: `C:\Users\Client\anaconda3\python.exe -m unittest discover -s tests -t . -v` (about 2 minutes; stop the running broker and website first if any test needs port 5555 or 8000. They use free ports, so it should not matter.)
Expected: the previous 95 tests plus 7 new ones, `OK`.

### Task 2: Install `cloudflared` and verify the public link end to end

**Files:** none (verification only).

**Interfaces:**
- Consumes: `scripts/start_online.py` from Task 1 (`main`, `--no-browser`); the browser driver pattern in `tests/browser/browser_check.mjs`.

- [ ] **Step 2.1: Install `cloudflared`**

Run: `winget install --id Cloudflare.cloudflared --accept-source-agreements --accept-package-agreements`
Expected: "Successfully installed". Then confirm `find_cloudflared()` returns a path (a new shell may be needed for PATH).

- [ ] **Step 2.2: Start the script against the running website**

Run `python scripts/start_online.py --no-browser` in the background with output to a log file.
Expected: the log shows "using the DormCare website already running on port 8000" (or equivalent) and a banner with an `https://…trycloudflare.com` link within about 30 s.

- [ ] **Step 2.3: Check the public link from this PC**

Run: `curl -s <link>/broker/info`
Expected: `{"ok": true, "broker": true, "broker_port": 5555}`.

- [ ] **Step 2.4: Live delivery through Cloudflare in headless Edge**

Adapt the scratchpad driver `drive_webapp.mjs` (manager posts a Casa Jaro announcement, tenant window receives it) to use `<link>/?role=tenant` and `<link>/?role=manager` against the already running site.
Expected: both live pills green; the tenant bell shows the new announcement marked "live from the broker"; no page errors.

- [ ] **Step 2.5: Ctrl+C leaves an existing website running**

Stop the script (stop its background task).
Expected: `cloudflared` is gone; `curl http://127.0.0.1:8000/broker/info` still answers, because the website was already running before the script started.

- [ ] **Step 2.6: Script started alone cleans up after itself**

With the website stopped and port 8000 free, run the script, wait for the link, then stop it.
Expected: ports 8000 and 5555 are free afterwards and no `cloudflared.exe` process remains. Then restore the user's running setup: broker on 5555 and website on 8000, as before this task.

- [ ] **Step 2.7: Hand over**

Give the user the command, a fresh link from a final run left running, and ask them to open it on their phone over mobile data.

---

## Revision R1: switch to ngrok (supersedes the cloudflared specifics above)

Quick tunnels cannot carry server-sent events (see the spec's Revision R1). Task 1R replaces the cloudflared parts of
Task 1; Task 2R replaces Task 2. Interfaces that change, in `scripts/start_online.py`:

- `find_tunnel_url(line: str) -> str | None`: the `url=https://…` value, only from a line containing `msg="started tunnel"`.
- `find_ngrok() -> str | None` replaces `find_cloudflared()`: PATH via `shutil.which("ngrok")`, then
  `%LOCALAPPDATA%\Microsoft\WindowsApps\ngrok.exe` and `%LOCALAPPDATA%\Microsoft\WinGet\Links\ngrok.exe`.
- New `explain_failure(lines: list[str]) -> str`: advice for the user. `ERR_NGROK_4018` → the sign-up and
  `ngrok config add-authtoken` steps; `ERR_NGROK_334` or "already online" → the link is already in use (is the script
  running in another window?); anything else → "Is this PC online?".
- `INSTALL = "winget install --id Ngrok.Ngrok"`; tunnel command `[ngrok, "http", local, "--log", "stdout", "--log-format", "logfmt"]`.
- Unchanged: `website_running`, `wait_until_reachable`, `open_tunnel`, `port_in_use`, `stop`, `main` options.

### Task 1R: script, tests and README for ngrok
- [ ] Tests first (`tests/test_online.py`), with fixtures copied from real ngrok 3.39 output: O1 the link is read from
  a `started tunnel` line; O2 the sign-up/credential links in an `ERR_NGROK_4018` line and the inspector address are not
  links; O4/O4b unchanged in shape with ngrok lines; O6 missing ngrok prints `winget install --id Ngrok.Ngrok`;
  O7 `explain_failure` gives the authtoken steps for 4018, the "already running" hint for 334, and the generic hint
  otherwise. Run: they fail.
- [ ] Switch the script; banner adds "Visitors see an ngrok notice page once: tap Visit." Run: 8 tests OK.
- [ ] README section and table row rewritten for ngrok (setup steps, fixed link, notice page, free limits); section 9
  bullet kept. Full suite: 103 tests OK; update the expected count in README, Demo_Runbook and SUBMISSION_CHECKLIST.

### Task 2R: verify through ngrok (needs the user's authtoken)
- [ ] `start_online.py --no-browser` against the running site: banner with the `ngrok-free` link.
- [ ] `curl <link>/broker/info` → the website's JSON (curl gets no notice page).
- [ ] Headless Edge on an isolated test copy behind ngrok: click through the notice page, both live pills green, the
  tenant bell shows the manager's announcement "live from the broker", no page errors. This is the SSE check.
- [ ] Stop: ngrok gone, an existing website keeps running; started alone, ports 8000/5555 are freed afterwards.
- [ ] Hand over the link and ask the user to open it on a phone over mobile data.
