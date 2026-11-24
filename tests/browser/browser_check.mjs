// Optional end-to-end check (E) of the dashboard and the DormCare website in headless Microsoft Edge.
//
//   node tests/browser/browser_check.mjs [path-to-python]
//
// Needs Node.js 22 or newer and Microsoft Edge. Not needed to run the project or the Python test suite.
// It uses its own ports, a temporary database and a temporary browser profile, and blocks external hosts.
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const py = process.argv[2] || process.env.DORMCARE_PYTHON || 'python';
const edgeExe = process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const [B, D, W, C] = [15600, 18080, 18000, 19333];
const dir = mkdtempSync(join(tmpdir(), 'dormcare-browser-'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const run = (exe, args) => spawn(exe, args.map(String), { cwd: root, stdio: 'ignore', windowsHide: true });

let passed = 0; let failed = 0;
function ok(title, good) {
  if (good) passed += 1; else failed += 1;
  console.log(`[${good ? 'PASS' : 'FAIL'}] ${title}`);
}

const children = [
  run(py, ['-m', 'pubsub.dashboard', '--port', D, '--broker-port', B, '--data-dir', join(dir, 'data'), '--no-browser']),
  run(edgeExe, ['--headless=new', `--remote-debugging-port=${C}`, `--user-data-dir=${join(dir, 'profile')}`,
    '--no-first-run', '--disable-extensions', '--disable-background-networking',
    '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1', 'about:blank']),
];

async function tab(url) {
  const t = await (await fetch(`http://127.0.0.1:${C}/json/new?${url}`, { method: 'PUT' })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r) => { ws.onopen = r; });
  let id = 0; const waiting = new Map(); const errors = [];
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id) { waiting.get(m.id)(m.result); waiting.delete(m.id); }
    else if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description);
  };
  const send = (method, params = {}) => new Promise((r) => { waiting.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });
  await send('Runtime.enable');
  await sleep(2500);
  const ev = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    return r.exceptionDetails ? `EVAL ERROR ${r.exceptionDetails.exception?.description}` : r.result.value;
  };
  const until = async (expr, ms = 20000) => {
    const end = Date.now() + ms;
    while (Date.now() < end) { if ((await ev(expr)) === true) return true; await sleep(300); }
    return false;
  };
  const reload = async () => { await send('Page.reload'); await sleep(3500); };
  return { ev, until, reload, errors };
}

try {
  await sleep(3500);
  const d = await tab(`http://127.0.0.1:${D}/`);
  const phone = (id) => `document.querySelector('.phone[data-id="${id}"]')`;
  const notice = (text) => d.ev(`[...document.querySelectorAll('.notice')].find(b => b.innerText.includes(${JSON.stringify(text)})).click()`);
  const crash = (id) => d.ev(`${phone(id)}.querySelector('.btn-crash').click()`);
  const start = (id) => d.ev(`${phone(id)}.querySelector('.btn-start').click()`);
  const shows = (id, text) => d.until(`${phone(id)}.querySelector('.inbox').textContent.includes(${JSON.stringify(text)})`);
  const waits = (id, n) => d.until(`document.querySelector('.slot[data-id="${id}"] .count').textContent === '${n}waiting'`);
  const brokerButton = () => d.ev(`document.querySelector('#btn-broker').click()`);

  await d.ev(`document.querySelector('#btn-demo').click()`);
  ok('E01 dashboard: four subscribers online', await d.until(`document.querySelectorAll('.phone.is-online').length === 4`));
  await notice('Fire safety');
  ok('E02 dashboard: topic filtering', await shows('tenant-juan', 'Fire safety')
    && !(await d.ev(`${phone('tenant-jerome')}.textContent.includes('Fire safety')`)));
  await notice('Welcome to our new');
  ok('E03 dashboard: filtering, other property', await shows('tenant-jerome', 'Welcome'));
  await notice('faucet in shared CR: acknowledged');
  ok('E04 dashboard: fan-out', await shows('tenant-juan', 'acknowledged') && await shows('caretaker', 'acknowledged'));
  await crash('tenant-juan');
  ok('E05 dashboard: subscriber crash', await d.until(`${phone('tenant-juan')}.classList.contains('is-off')`));
  await sleep(1500);
  for (const text of ['water interruption on', 'rent is due on Oct 15', 'shared CR: in progress']) { await notice(text); await sleep(1000); }
  ok('E06 dashboard: three queued', await waits('tenant-juan', 3));
  await start('tenant-juan');
  ok('E07 dashboard: catch-up', await d.until(`${phone('tenant-juan')}.querySelectorAll('.chip-CATCH-UP').length === 3`));
  await crash('tenant-jerome'); await sleep(1500);
  await notice('rent is due on Oct 10'); await waits('tenant-jerome', 1);
  await brokerButton(); await sleep(2500);
  ok('E08 dashboard: broker crash', await d.until(`document.querySelector('#broker-state').textContent.includes('stopped')`));
  await brokerButton(); await sleep(6000); await start('tenant-jerome');
  ok('E09 dashboard: broker recovery', await shows('tenant-jerome', 'Oct 10'));
  await d.ev(`document.querySelector('[data-fault="crash-before-ack"]').click()`); await sleep(4000);
  await notice('Pest control this');
  await d.until(`${phone('tenant-juan')}.classList.contains('is-off')`); await start('tenant-juan');
  ok('E10 dashboard: duplicate ignored', await shows('tenant-juan', 'Duplicate ignored'));
  await d.ev(`document.querySelector('[data-fault="lost-puback"]').click()`); await sleep(7000);
  await notice('electricity bill');
  ok('E11 dashboard: lost PUBACK', await d.until(`document.querySelector('.desk-result').textContent.includes('recognised the duplicate')`));

  const reset = async () => {
    await d.ev(`window.confirm = () => true; document.querySelector('#btn-reset').click()`); await sleep(2500);
    await d.ev(`document.querySelector('#btn-demo').click()`);
    await d.until(`document.querySelectorAll('.phone.is-online').length === 4`); await sleep(12000);
  };
  await reset();
  children.push(run(py, ['-m', 'pubsub.webapp', '--port', W, '--broker-port', B, '--no-broker', '--no-browser']));
  await sleep(3000);
  const m = await tab(`http://127.0.0.1:${W}/?role=manager`);
  await sleep(4000);

  const announceThenViewAsJuan = async (title) => {
    await m.ev(`S.role = 'manager'; commit()`); await sleep(4000);
    await m.ev(`F.announce({ prop: 'p1', title: '${title}', body: 'x' })`);
    const onPhone = await shows('tenant-juan', title);
    await sleep(1500);
    await m.ev(`S.role = 'tenant'; S.persona = 'u-juan'; commit()`);
    const inBell = await m.until(`S.notifs.some(n => n.role === 'tenant' && n.text.includes('${title}'))`, 12000);
    return onPhone && inBell;
  };
  ok('E12 website: announcement reaches phone and bell', await announceThenViewAsJuan('Water tank cleaning Friday'));
  await reset();
  ok('E13 website: alert after a data reset is not taken for a duplicate', await announceThenViewAsJuan('Second rehearsal notice'));

  await m.ev(`S.role = 'manager'; commit()`); await sleep(3000);
  const t = await tab(`http://127.0.0.1:${W}/?role=tenant`);
  await t.ev(`S.role = 'tenant'; S.persona = 'u-juan'; commit()`); await sleep(4000);
  const hasAlert = `S.notifs.some(n => n.role === 'tenant' && n.text.includes('Two window notice'))`;
  await m.ev(`F.announce({ prop: 'p1', title: 'Two window notice', body: 'x' })`);
  ok('E14 website: live delivery between two windows', await t.until(hasAlert));
  await sleep(1500); await m.ev(`commit()`); await sleep(500); await t.reload();
  ok('E15 website: alert survives a save from the other window', await t.until(hasAlert, 6000));

  const visibleTo = (role, text) => `Chat.list('u-juan').some(x => x.text === '${text}' && Chat.visible(x, '${role}') && !x.failed && x.deliveredTo?.['${role}'])`;
  await t.ev(`Chat.send('u-juan', 'Is the Wi-Fi down?'); commit()`);
  const live = await m.until(visibleTo('manager', 'Is the Wi-Fi down?'));
  await sleep(2000); await m.reload(); await t.reload();
  ok('E16 website: chat survives reload in both windows', live
    && await m.until(visibleTo('manager', 'Is the Wi-Fi down?'), 6000) && await t.until(visibleTo('tenant', 'Is the Wi-Fi down?'), 6000));

  await brokerButton(); await sleep(3000);
  await m.ev(`Chat.send('u-juan', 'Sent while the broker was down'); commit()`);
  const marked = await m.until(`Chat.list('u-juan').some(x => x.text === 'Sent while the broker was down' && x.failed === true)`, 25000);
  await brokerButton();
  ok('E17 website: chat sent during a broker outage is re-sent', marked && await t.until(visibleTo('tenant', 'Sent while the broker was down'), 45000));

  await sleep(3000);
  await t.ev(`Broker.publish('manager.m1', { kind: 'announcement', id: '"><img src=x onerror="window.pwned=1">', prop: 'p1', title: 'Forged notice', date: '2026-10-14' })`);
  await m.until(`S.notifs.some(n => n.text.includes('Forged notice'))`);
  await m.ev(`go('announcements')`); await sleep(2000);
  ok('E18 website: broker payload cannot inject HTML', await m.ev(`!window.pwned && !document.querySelector('img[src="x"]')`) === true);

  const errors = [...d.errors, ...m.errors, ...t.errors];
  ok('E19 no uncaught page errors', errors.length === 0);
  errors.forEach((e) => console.log(`       ${e}`));
} catch (e) {
  failed += 1;
  console.log('[FAIL] harness error', e);
} finally {
  await fetch(`http://127.0.0.1:${D}/api/reset`, { method: 'POST' }).catch(() => {});
  try {
    const v = await (await fetch(`http://127.0.0.1:${C}/json/version`)).json();
    const ws = new WebSocket(v.webSocketDebuggerUrl);
    await new Promise((r) => { ws.onopen = r; });
    ws.send(JSON.stringify({ id: 1, method: 'Browser.close' }));
    await sleep(1000);
  } catch { /* the browser is already closed */ }
  children.forEach((child) => child.kill());
  console.log(`${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}
