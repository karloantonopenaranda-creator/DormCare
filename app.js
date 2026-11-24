'use strict';
/* =========================================================================
   DormCare MVP — clickable prototype
   Roles: Property manager, Tenant, DormCare admin (switch in the top bar).
   All data is demo data kept in this browser (localStorage). No real funds,
   documents, or messages are processed.
   ========================================================================= */

const TODAY = '2026-10-14';
const STORE_KEY = 'dormcare-mvp-v1';
const AREAS = ['Jaro', 'Molo', 'La Paz', 'Mandurriao', 'Arevalo', 'City Proper', 'Lapuz'];
const TYPES = ['Dormitory', 'Boarding house', 'Bedspace', 'Apartment', 'Room'];
const TICKET_STATUSES = ['Submitted', 'Acknowledged', 'In progress', 'Resolved', 'Closed'];
const PLANS = [
  { id: 'starter', name: 'Starter', min: 0, max: 5, price: 0 },
  { id: 'basic', name: 'Basic', min: 6, max: 10, price: 249 },
  { id: 'standard', name: 'Standard', min: 11, max: 20, price: 449 },
  { id: 'growth', name: 'Growth', min: 21, max: 30, price: 649 },
  { id: 'professional', name: 'Professional', min: 31, max: 50, price: 849 },
  { id: 'enterprise', name: 'Enterprise', min: 51, max: Infinity, price: 1299 },
];

/* ---------------- Helpers ---------------- */
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = (p) => p + Math.random().toString(36).slice(2, 8);
const sum = (arr, f = (x) => x) => arr.reduce((s, x) => s + f(x), 0);
const peso = (n) => '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const fmtDate = (d) => (d ? new Date(d + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—');
const fmtShort = (d) => (d ? new Date(d + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—');
const addDays = (d, n) => { const x = new Date(d + 'T00:00'); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
const daysBetween = (a, b) => Math.round((new Date(b + 'T00:00') - new Date(a + 'T00:00')) / 86400000);
const nowStamp = () => `${TODAY} ${new Date().toTimeString().slice(0, 5)}`;
const round2 = (n) => Math.round(n * 100) / 100;

const ICONS = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
  building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  store: '<path d="M3 9 4.5 4h15L21 9M3 9h18M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M5 12v8h14v-8M10 20v-5h4v5"/>',
  search: '<circle cx="11" cy="11" r="7.5"/><path d="m20.5 20.5-4.2-4.2"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  card: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  arrow: '<path d="M7 17 17 7M7 7h10v10"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  home: '<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/>',
  drop: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  bed: '<path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  msg: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7"/><circle cx="12" cy="12" r="3"/>',
  receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/><path d="M8 7h8M8 11h8M8 15h5"/>',
  send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
};
const icon = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;

const AV = ['#f9d8cf', '#d6ecd2', '#d9dcf7', '#fbe8c3', '#d4ecf2', '#ecd6f0', '#f3e0d0'];
function avatar(name, size = '') {
  const h = [...String(name)].reduce((a, c) => a + c.charCodeAt(0), 0);
  const ini = String(name).split(' ').filter((w) => /^[A-Z]/.test(w)).map((w) => w[0]).slice(0, 2).join('');
  return `<span class="avatar ${size}" style="background:${AV[h % AV.length]}">${esc(ini)}</span>`;
}

const CHIP = {
  ok: ['Paid', 'Verified', 'Approved', 'Resolved', 'Closed', 'Live', 'Active', 'Replied', 'Issued', 'Dismissed', 'Low'],
  warn: ['Submitted for review', 'Pending', 'Submitted', 'Acknowledged', 'In progress', 'Partially paid', 'New', 'Paused', 'Medium', 'Draft', 'Open', 'Renewal due'],
  bad: ['Unpaid', 'Overdue', 'Rejected', 'Needs correction', 'Missing', 'High', 'Expired', 'Revoked', 'Suspended', 'Not eligible'],
};
function chip(s) {
  const cls = CHIP.ok.includes(s) ? 'ok' : CHIP.warn.includes(s) ? 'warn' : CHIP.bad.includes(s) ? 'bad' : 'neutral';
  return `<span class="chip ${cls}">${esc(s)}</span>`;
}
const verifiedBadge = () => `<span class="chip verified">${icon('shield')}Document-reviewed</span>`;

/* ---------------- Seed data ---------------- */
function seed() {
  const properties = [
    {
      id: 'p1', owner: 'm1', name: 'Casa Jaro Dormitory', type: 'Dormitory', address: 'E. Lopez St., Jaro, Iloilo City', area: 'Jaro',
      verification: 'Verified', verifiedOn: '2026-06-12', listed: true, hue: 150,
      deposit: '1 month advance + 1 month deposit', amenities: ['Wi-Fi', 'CCTV', 'Laundry area', 'Study lounge', 'Water included'],
      rules: ['Curfew at 11:00 PM', 'No overnight visitors', 'No cooking inside rooms'],
      docs: [
        { type: 'Government-issued ID', status: 'Approved', file: 'maria-santos-umid.jpg' },
        { type: "Business / Mayor's Permit", status: 'Approved', file: 'mayors-permit-2026.pdf', expires: '2026-12-31' },
        { type: 'Permit to operate / property registration', status: 'Approved', file: 'permit-to-operate.pdf', expires: '2027-03-31' },
        { type: 'Proof of ownership or authorization', status: 'Approved', file: 'tct-casa-jaro.pdf' },
      ], note: '',
    },
    {
      id: 'p2', owner: 'm1', name: 'Molo Bedspace Hub', type: 'Bedspace', address: 'M.H. del Pilar St., Molo, Iloilo City', area: 'Molo',
      verification: 'Pending', submittedOn: '2026-10-10', listed: false, hue: 95,
      deposit: '1 month deposit', amenities: ['Wi-Fi', 'Shared kitchen', 'Near jeepney route'],
      rules: ['Quiet hours 10 PM – 6 AM', 'Keep common areas clean'],
      docs: [
        { type: 'Government-issued ID', status: 'Submitted', file: 'maria-santos-umid.jpg' },
        { type: "Business / Mayor's Permit", status: 'Submitted', file: 'mayors-permit-molo.pdf', expires: '2027-01-15' },
        { type: 'Permit to operate / property registration', status: 'Submitted', file: 'molo-registration.pdf' },
        { type: 'Proof of ownership or authorization', status: 'Submitted', file: 'authorization-letter.pdf' },
      ], note: '',
    },
    {
      id: 'px1', owner: 'm2', name: 'Tagbak Boarding House', type: 'Boarding house', address: 'Tagbak, Jaro, Iloilo City', area: 'Jaro',
      verification: 'Pending', submittedOn: '2026-10-09', listed: false, hue: 30, amenities: [], rules: [],
      docs: [
        { type: 'Government-issued ID', status: 'Submitted', file: 'ramon-v-id.jpg' },
        { type: "Business / Mayor's Permit", status: 'Missing' },
        { type: 'Permit to operate / property registration', status: 'Submitted', file: 'bh-registration.pdf' },
        { type: 'Proof of ownership or authorization', status: 'Submitted', file: 'deed-of-sale.pdf' },
      ], note: '',
    },
  ];
  const rooms = [
    { id: 'r101', prop: 'p1', name: 'Room 101', beds: 4, price: 2500, reserved: 0, unavailable: 0 },
    { id: 'r102', prop: 'p1', name: 'Room 102', beds: 4, price: 2500, reserved: 0, unavailable: 0 },
    { id: 'r103', prop: 'p1', name: 'Room 103', beds: 2, price: 3800, reserved: 0, unavailable: 0 },
    { id: 'r201', prop: 'p1', name: 'Room 201', beds: 4, price: 2500, reserved: 1, unavailable: 0 },
    { id: 'r202', prop: 'p1', name: 'Room 202', beds: 4, price: 2500, reserved: 0, unavailable: 1 },
    { id: 'r203', prop: 'p1', name: 'Room 203', beds: 2, price: 3800, reserved: 0, unavailable: 0 },
    { id: 'b1', prop: 'p2', name: 'Bedspace A', beds: 6, price: 1800, reserved: 0, unavailable: 0 },
    { id: 'b2', prop: 'p2', name: 'Bedspace B', beds: 6, price: 1800, reserved: 0, unavailable: 0 },
  ];
  const names = ['Juan dela Cruz', 'Andrea Villanueva', 'Mark Gonzaga', 'Patricia Lim', 'Kevin Tan', 'Bea Ledesma', 'Carlo Javellana', 'Nicole Sison',
    'Paolo Reyes', 'Jessa Mae Divinagracia', 'Rafael Lopez', 'Hannah Uy', 'Miguel Torres', 'Kristine Dela Peña', 'Joshua Arroyo', 'Camille Salazar',
    'Vince Golez', 'Trisha Panes', 'Ralph Tupas', 'Angela Ong', 'Liza Montinola', 'Earl Dimaano'];
  const fill = [['r101', 4], ['r102', 4], ['r103', 2], ['r201', 3], ['r202', 3], ['b1', 4], ['b2', 2]];
  const moveIns = ['2026-06-01', '2026-06-01', '2026-06-15', '2026-07-01', '2026-07-01', '2026-07-15', '2026-08-01', '2026-08-01'];
  const tenants = [];
  let n = 0;
  fill.forEach(([roomId, count]) => {
    const room = rooms.find((r) => r.id === roomId);
    for (let k = 0; k < count; k++, n++) {
      const name = names[n];
      tenants.push({
        id: 't' + (n + 1), userId: n === 0 ? 'u-juan' : null, name, prop: room.prop, room: roomId,
        email: name.toLowerCase().replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '') + '@email.com',
        phone: '09' + String(170000000 + n * 7919113).slice(0, 9),
        start: [3, 9, 20].includes(n) || n === 21 ? '2026-10-01' : moveIns[n % moveIns.length], status: 'active',
      });
    }
  });

  const pattern = ['Unpaid', 'Paid', 'Paid', 'Paid', 'Submitted for review', 'Paid', 'Paid', 'Paid', 'Paid', 'Partially paid', 'Paid',
    'Submitted for review', 'Paid', 'Unpaid', 'Paid', 'Unpaid', 'Paid', 'Unpaid', 'Paid', 'Partially paid', 'Paid', 'Paid'];
  const methods = ['GCash', 'Bank transfer', 'Cash'];
  const invoices = [];
  let rc = 1;
  tenants.forEach((t, i) => {
    const room = rooms.find((r) => r.id === t.room);
    const due = t.prop === 'p1' ? '2026-10-15' : '2026-10-10';
    const st = pattern[i];
    const amt = room.price;
    const pays = [];
    let paid = 0;
    const m = methods[i % 3];
    if (st === 'Paid') { paid = amt; pays.push({ id: uid('pay'), amount: amt, method: m, ref: m === 'Cash' ? '' : (m === 'GCash' ? 'GC' : 'BT') + (8800120 + i * 37), date: addDays('2026-10-01', i % 9), verified: true, receipt: 'DC-2610-' + String(rc++).padStart(3, '0') }); }
    if (st === 'Partially paid') { paid = 1000; pays.push({ id: uid('pay'), amount: 1000, method: 'Cash', ref: '', date: '2026-10-06', verified: true, receipt: 'DC-2610-' + String(rc++).padStart(3, '0') }); }
    if (st === 'Submitted for review') pays.push({ id: uid('pay'), amount: amt, method: 'GCash', ref: 'GC' + (9100450 + i * 13), date: '2026-10-13', verified: false, proof: 'gcash-screenshot.jpg' });
    invoices.push({ id: uid('inv'), tenant: t.id, kind: 'rent', label: 'Rent – Oct 2026', period: 'Oct 2026', items: [{ label: `Monthly rent · ${room.name}`, amount: amt }], due, status: st, paid, payments: pays });
    if (t.prop === 'p1') {
      const share = 800;
      const uPaid = st === 'Paid';
      invoices.push({
        id: uid('inv'), tenant: t.id, kind: 'utility', label: 'Electricity – Sep 2026', period: 'Sep 2026', utilityBill: 'ub1',
        items: [{ label: 'Electricity share (per occupant)', amount: share }], basis: '₱12,800 total ÷ 16 occupants (per-occupant split)',
        due: '2026-10-15', status: uPaid ? 'Paid' : 'Unpaid', paid: uPaid ? share : 0,
        payments: uPaid ? [{ id: uid('pay'), amount: share, method: m, ref: '', date: addDays('2026-10-02', i % 9), verified: true, receipt: 'DC-2610-' + String(rc++).padStart(3, '0') }] : [],
      });
    }
  });

  const T = (id) => tenants.find((t) => t.id === id);
  const tickets = [
    { id: 'k1', tenant: 't1', prop: 'p1', category: 'Plumbing', title: 'Leaking faucet in shared CR', desc: 'The faucet in the 1st floor shared bathroom keeps dripping even when closed tight.', priority: 'High', status: 'In progress', created: '2026-10-11', history: [{ at: '2026-10-11 08:12', text: 'Ticket submitted by tenant' }, { at: '2026-10-11 10:40', text: 'Acknowledged — plumber scheduled' }, { at: '2026-10-13 09:05', text: 'In progress — replacement part ordered' }] },
    { id: 'k2', tenant: 't6', prop: 'p1', category: 'Electrical', title: 'Flickering light in Room 102', desc: 'Ceiling light flickers at night.', priority: 'Medium', status: 'Acknowledged', created: '2026-10-12', history: [{ at: '2026-10-12 19:30', text: 'Ticket submitted by tenant' }, { at: '2026-10-13 08:00', text: 'Acknowledged by manager' }] },
    { id: 'k3', tenant: 't12', prop: 'p1', category: 'Internet', title: 'Wi-Fi slow on 2nd floor', desc: 'Connection drops during evening classes.', priority: 'Low', status: 'Submitted', created: '2026-10-13', history: [{ at: '2026-10-13 21:02', text: 'Ticket submitted by tenant' }] },
    { id: 'k4', tenant: 't18', prop: 'p2', category: 'Pest control', title: 'Ants near the shared sink', desc: 'Lots of ants in the kitchen area.', priority: 'Low', status: 'Submitted', created: '2026-10-14', history: [{ at: '2026-10-14 07:45', text: 'Ticket submitted by tenant' }] },
    { id: 'k5', tenant: 't3', prop: 'p1', category: 'Electrical', title: 'Aircon not cooling', desc: 'Room 101 aircon blows warm air.', priority: 'High', status: 'Submitted', created: '2026-10-14', history: [{ at: '2026-10-14 09:15', text: 'Ticket submitted by tenant' }] },
    { id: 'k6', tenant: 't13', prop: 'p1', category: 'Furniture', title: 'Broken cabinet lock', desc: 'Locker lock does not close.', priority: 'Medium', status: 'Resolved', created: '2026-10-05', history: [{ at: '2026-10-05 12:00', text: 'Ticket submitted by tenant' }, { at: '2026-10-07 15:20', text: 'Resolved — lock replaced' }] },
    { id: 'k7', tenant: 't15', prop: 'p1', category: 'Other', title: 'Door hinge squeaks', desc: '', priority: 'Low', status: 'Closed', created: '2026-09-28', history: [{ at: '2026-09-28 18:00', text: 'Ticket submitted by tenant' }, { at: '2026-09-30 10:00', text: 'Closed — hinge oiled' }] },
  ];

  return {
    version: 1,
    role: 'manager',
    persona: 'u-juan',
    plan: 'growth',
    manager: { id: 'm1', name: 'Maria Santos', email: 'maria@casajaro.ph' },
    admin: { name: 'DormCare Admin', email: 'verify@dormcare.ph' },
    personas: [
      { id: 'u-juan', name: 'Juan dela Cruz', email: 'juan.dela.cruz@email.com', note: 'Active tenant · Casa Jaro' },
      { id: 'u-ana', name: 'Ana Robles', email: 'ana.robles@email.com', note: 'New renter · not yet a member' },
    ],
    properties, rooms, tenants, invoices, tickets,
    utilityBills: [{ id: 'ub1', prop: 'p1', type: 'Electricity', period: 'Sep 2026', total: 12800, method: 'occupant', issuedOn: '2026-10-02', due: '2026-10-15', count: 16 }],
    history: [{ m: 'May', rate: 0.94 }, { m: 'Jun', rate: 0.97 }, { m: 'Jul', rate: 0.88 }, { m: 'Aug', rate: 0.96 }, { m: 'Sep', rate: 0.91 }],
    joinRequests: [
      { id: 'j1', name: 'Carla Bautista', email: 'carla.b@email.com', prop: 'p1', via: 'QR code', at: '2026-10-12', note: 'Agreed on a bed in a 4-person room, moving in Oct 20.', status: 'Pending' },
      { id: 'j2', name: 'Jerome Alvarez', email: 'jerome.a@email.com', prop: 'p2', via: 'Invite link', at: '2026-10-13', note: 'Viewed Bedspace A last Saturday.', status: 'Pending' },
      { id: 'j3', name: 'Sofia Tan', email: 'sofia.tan@email.com', prop: 'p1', via: 'QR code', at: '2026-10-14', note: 'Prefers 2-person room (Room 203).', status: 'Pending' },
    ],
    invites: [
      { id: 'i1', code: 'CJD-7K2Q', prop: 'p1', created: '2026-10-08', expires: '2026-10-22', status: 'Active', uses: 2 },
      { id: 'i2', code: 'MBH-4RT9', prop: 'p2', created: '2026-10-01', expires: '2026-10-08', status: 'Expired', uses: 1 },
    ],
    announcements: [
      { id: 'a1', prop: 'p1', title: 'Fire safety inspection — Oct 16, 9:00 AM', body: 'The city fire safety inspection team will visit. Please keep hallways clear and allow access to your room.', date: '2026-10-13' },
      { id: 'a2', prop: 'p1', title: 'Scheduled water interruption on Oct 18', body: 'Water will be unavailable from 8 AM to 2 PM due to pipe maintenance. Please store water the night before.', date: '2026-10-10' },
      { id: 'a3', prop: 'p2', title: 'Welcome to our new tenants!', body: 'Please review the house rules posted in the kitchen. Quiet hours are from 10 PM to 6 AM.', date: '2026-10-02' },
    ],
    inquiries: [
      { id: 'q1', listing: 'p1', name: 'Rhea Castillo', msg: 'Hi! Is the 2-bed room still available for November? Can I schedule a viewing this weekend?', at: '2026-10-13', status: 'New' },
      { id: 'q2', listing: 'p1', name: 'Ken Ortega', msg: 'Is electricity included in the monthly rent?', at: '2026-10-11', status: 'Replied', reply: 'Hi Ken! Water is included; electricity is split monthly per occupant.' },
    ],
    market: [
      { id: 'm-1', name: 'La Paz Ladies Dormitory', type: 'Dormitory', area: 'La Paz', price: 2800, avail: 3, manager: 'Grace Lacson', hue: 330, deposit: '1 month deposit', amenities: ['Wi-Fi', 'CCTV', 'Laundry area', 'Water included'], rules: ['Female tenants only', 'Curfew at 10:30 PM'] },
      { id: 'm-2', name: 'Business Park Studio Units', type: 'Apartment', area: 'Mandurriao', price: 9500, avail: 2, manager: 'Grace Lacson', hue: 210, deposit: '2 months deposit + 1 advance', amenities: ['Wi-Fi', 'Aircon', 'Private CR', 'Parking'], rules: ['Minimum 6-month lease'] },
      { id: 'm-3', name: 'Arevalo Seaside Rooms', type: 'Room', area: 'Arevalo', price: 4200, avail: 1, manager: 'Ramon Villareal', hue: 190, deposit: '1 month deposit', amenities: ['Aircon', 'Private CR', 'Water included'], rules: ['No pets'] },
      { id: 'm-4', name: 'City Proper Budget Bedspace', type: 'Bedspace', area: 'City Proper', price: 1500, avail: 5, manager: 'Edwin Sy', hue: 45, deposit: '1 month deposit', amenities: ['Wi-Fi', 'Shared kitchen', 'Near jeepney route'], rules: ['Quiet hours 10 PM'] },
      { id: 'm-5', name: 'Jaro Plaza Apartments', type: 'Apartment', area: 'Jaro', price: 6500, avail: 1, manager: 'Ramon Villareal', hue: 15, deposit: '2 months deposit', amenities: ['Parking', 'Private CR', 'CCTV'], rules: ['No smoking'] },
      { id: 'm-6', name: 'Mandurriao Student Residences', type: 'Dormitory', area: 'Mandurriao', price: 3200, avail: 7, manager: 'Grace Lacson', hue: 260, deposit: '1 month advance', amenities: ['Wi-Fi', 'Study lounge', 'Laundry area', 'Aircon'], rules: ['Curfew at 11:00 PM'] },
    ],
    managers: [
      { id: 'm2', name: 'Ramon Villareal', props: 3, tenants: 9, plan: 'basic' },
      { id: 'm3', name: 'Grace Lacson', props: 4, tenants: 43, plan: 'professional' },
      { id: 'm4', name: 'Edwin Sy', props: 1, tenants: 4, plan: 'starter' },
      { id: 'm5', name: 'Liezl Pama', props: 2, tenants: 17, plan: 'standard' },
    ],
    reports: [{ id: 'rp1', listing: 'm-4', reason: 'Listed price is lower than what the caretaker quoted on site.', by: 'Registered renter', at: '2026-10-12', status: 'Open' }],
    billingHistory: [
      { period: 'Oct 2026', plan: 'Growth', amount: 649, status: 'Paid', note: 'GCash · recorded by DormCare (pilot)' },
      { period: 'Sep 2026', plan: 'Standard', amount: 449, status: 'Paid', note: 'GCash · recorded by DormCare (pilot)' },
      { period: 'Aug 2026', plan: 'Standard', amount: 449, status: 'Paid', note: 'Bank transfer · pilot' },
    ],
    notifs: [
      { id: 'n1', role: 'manager', text: `Payment proof submitted by ${T('t5').name} (Rent – Oct 2026)`, at: '2026-10-13 18:20', read: false, to: 'rent' },
      { id: 'n2', role: 'manager', text: 'New join request from Sofia Tan via QR code', at: '2026-10-14 08:02', read: false, to: 'tenants' },
      { id: 'n3', role: 'manager', text: "Casa Jaro's Business / Mayor's Permit expires Dec 31 — upload renewal", at: '2026-10-14 07:00', read: false, to: 'verification' },
      { id: 'n4', role: 'manager', text: 'New inquiry from Rhea Castillo on Casa Jaro Dormitory', at: '2026-10-13 12:44', read: true, to: 'listings' },
      { id: 'n5', role: 'tenant', userId: 'u-juan', text: 'Your Oct 2026 rent of ₱2,500 is due on Oct 15', at: '2026-10-12 08:00', read: false, to: 'bills' },
      { id: 'n6', role: 'tenant', userId: 'u-juan', text: 'Maintenance update: "Leaking faucet in shared CR" is now In progress', at: '2026-10-13 09:05', read: false, to: 'tickets' },
      { id: 'n7', role: 'admin', text: 'Molo Bedspace Hub submitted documents for verification', at: '2026-10-10 15:30', read: false, to: 'queue' },
      { id: 'n8', role: 'admin', text: 'Listing report on "City Proper Budget Bedspace"', at: '2026-10-12 11:10', read: false, to: 'reports' },
    ],
    audit: [
      { at: '2026-10-12 11:10', actor: 'System', text: 'Listing report rp1 opened for City Proper Budget Bedspace' },
      { at: '2026-10-10 15:30', actor: 'Maria Santos', text: 'Submitted 4 verification documents for Molo Bedspace Hub' },
      { at: '2026-10-09 10:02', actor: 'Ramon Villareal', text: 'Submitted 3 of 4 verification documents for Tagbak Boarding House' },
      { at: '2026-06-12 14:00', actor: 'DormCare Admin', text: 'Approved verification for Casa Jaro Dormitory' },
    ],
    // Tenant <-> manager conversations, one thread per tenant account (key = persona id).
    chats: {
      'u-juan': [
        { id: 'c-seed1', thread: 'u-juan', from: 'tenant', name: 'Juan dela Cruz', text: 'Good evening po! Is the plumber still coming tomorrow for the CR faucet?', at: '2026-10-13 18:02', local: true },
        { id: 'c-seed2', thread: 'u-juan', from: 'manager', name: 'Maria Santos', text: 'Yes, he arrives at 9 AM. Please leave the shared CR unlocked.', at: '2026-10-13 18:10', local: true },
      ],
    },
    remindersSent: null,
    ui: {},
  };
}

/* ---------------- State ---------------- */
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    return s && s.version === 1 ? s : null;
  } catch { return null; }
}
function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch { /* storage unavailable: demo still works in-memory */ } }
let S = load() || seed();
const roleParam = new URLSearchParams(location.search).get('role');
if (['manager', 'tenant', 'admin'].includes(roleParam)) S.role = roleParam;
S.ui = { tenantTab: 'directory', rentTab: 'all', ex: { q: '', type: '', area: '', max: '', amen: '' }, ...S.ui, bell: false, profileMenu: false };

function commit() { save(); render(); }

/* Several windows share one saved state. When another window saves, this window takes that version (keeping
   its own role and screen), plus anything the broker delivered here that the other window did not have yet:
   those messages are already ACKed, so the broker would not send them again. */
function keepDelivered(mine, saved) {
  let changed = false;
  mine.notifs.filter((n) => n.broker && !saved.notifs.some((x) => x.id === n.id)).reverse()
    .forEach((n) => { saved.notifs.unshift(n); changed = true; });
  Object.entries(mine.chats || {}).forEach(([thread, list]) => list.forEach((m) => {
    const delivered = Object.entries(m.deliveredTo || {});
    if (!delivered.length) return;
    const savedList = ((saved.chats ||= {})[thread] ||= []);
    const s = savedList.find((x) => x.id === m.id);
    if (!s) { savedList.push(m); changed = true; return; }
    delivered.forEach(([role, info]) => {
      if ((s.deliveredTo ||= {})[role]) return;
      s.deliveredTo[role] = info; s.failed = false; changed = true;
      if (m.unreadFor === role) s.unreadFor = role;
    });
  }));
  return changed;
}
window.addEventListener('storage', (e) => {
  if (e.key !== STORE_KEY || !e.newValue) return;
  const saved = load();
  if (!saved) return;
  const restored = saved.epoch === S.epoch && keepDelivered(S, saved);  // not across "Reset Demo Data"
  Object.assign(saved, { role: S.role, persona: S.persona, ui: S.ui });
  S = saved;
  if (restored) save();
  render();
});

function audit(text, actor) { S.audit.unshift({ at: nowStamp(), actor: actor || actorName(), text }); }
function notify(role, text, to, userId) {
  if (Broker.available) { Broker.notify(role, text, to, userId); return; }  // live alerts: published to the broker
  S.notifs.unshift({ id: uid('n'), role, userId: userId || null, text, at: nowStamp(), read: false, to });
}
function actorName() { return S.role === 'manager' ? S.manager.name : S.role === 'admin' ? S.admin.name : persona().name; }

/* ---------------- Derived data ---------------- */
const myProps = () => S.properties.filter((p) => p.owner === 'm1');
const propById = (id) => S.properties.find((p) => p.id === id);
const roomById = (id) => S.rooms.find((r) => r.id === id);
const tenantById = (id) => S.tenants.find((t) => t.id === id);
const activeTenants = (prop) => S.tenants.filter((t) => t.status === 'active' && (!prop || t.prop === prop));
const roomOcc = (r) => S.tenants.filter((t) => t.status === 'active' && t.room === r.id).length;
const roomFree = (r) => r.beds - roomOcc(r) - (r.reserved || 0) - (r.unavailable || 0);
function beds(prop) {
  const rs = S.rooms.filter((r) => !prop || r.prop === prop);
  const cap = sum(rs, (r) => r.beds), occ = sum(rs, roomOcc), res = sum(rs, (r) => r.reserved || 0), unav = sum(rs, (r) => r.unavailable || 0);
  return { cap, occ, res, unav, avail: cap - occ - res - unav };
}
const invTotal = (i) => sum(i.items, (x) => x.amount);
const invBalance = (i) => round2(invTotal(i) - (i.paid || 0));
function invStatus(i) {
  if ((i.status === 'Unpaid' || i.status === 'Partially paid') && i.due < TODAY) return 'Overdue';
  return i.status;
}
const openInvoices = () => S.invoices.filter((i) => invBalance(i) > 0 && tenantById(i.tenant)?.status === 'active');
const forReview = () => S.invoices.filter((i) => i.status === 'Submitted for review');
const pendingJoins = () => S.joinRequests.filter((j) => j.status === 'Pending');
const openTickets = () => S.tickets.filter((k) => !['Resolved', 'Closed'].includes(k.status));
const isRenewal = (p) => p.verification === 'Verified' && p.docs.some((d) => d.status === 'Submitted');
const pendingProps = () => S.properties.filter((p) => p.verification === 'Pending' || isRenewal(p));
const plan = () => PLANS.find((p) => p.id === S.plan);
const planFor = (n) => PLANS.find((p) => n >= p.min && n <= p.max);
const persona = () => S.personas.find((p) => p.id === S.persona);
const myTenancy = () => S.tenants.find((t) => t.userId === S.persona && t.status === 'active');
function publicListings() {
  const own = S.properties.filter((p) => p.owner === 'm1' && p.verification === 'Verified' && p.listed).map((p) => {
    const rs = S.rooms.filter((r) => r.prop === p.id);
    return { id: p.id, prop: p.id, name: p.name, type: p.type, area: p.area, price: Math.min(...rs.map((r) => r.price)), avail: beds(p.id).avail, manager: S.manager.name, hue: p.hue, deposit: p.deposit, amenities: p.amenities, rules: p.rules, rooms: rs };
  });
  return [...own, ...S.market.filter((m) => !m.suspended)];
}
function docExpiryWarnings(p) {
  return p.docs.filter((d) => d.expires && d.status === 'Approved' && daysBetween(TODAY, d.expires) <= 90);
}

/* ---------------- Small UI pieces ---------------- */
const pageHead = (title, sub, actions = '') => `<div class="page-head"><div><h1>${title}</h1><p>${sub}</p></div><div class="head-actions">${actions}</div></div>`;
const empty = (ic, title, text, action = '') => `<div class="empty"><span class="sq-ic">${icon(ic)}</span><b>${title}</b><span>${text}</span>${action}</div>`;
const note = (text, kind = '', ic = 'info') => `<div class="note ${kind}">${icon(ic)}<div>${text}</div></div>`;
function propOptions(selected, { all = false, verifiedOnly = false } = {}) {
  return (all ? `<option value="">All properties</option>` : '') + myProps().filter((p) => !verifiedOnly || p.verification === 'Verified')
    .map((p) => `<option value="${p.id}" ${p.id === selected ? 'selected' : ''}>${esc(p.name)}</option>`).join('');
}
function photoStyle(hue) {
  return `background:radial-gradient(120% 90% at 100% 0%, hsl(${hue} 55% 62%), transparent 60%), linear-gradient(135deg, hsl(${hue} 45% 22%), hsl(${(hue + 30) % 360} 45% 42%))`;
}
function qrSvg(code) {
  let s = [...code].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 2166136261) || 7;
  const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  const N = 25;
  const inFinder = (x, y) => (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);
  let cells = '';
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!inFinder(x, y) && rnd() < 0.5) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
  const finder = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7" rx="1.2"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff" rx=".8"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx=".6"/>`;
  return `<svg class="qr" viewBox="-2 -2 29 29" role="img" aria-label="QR code for invite ${esc(code)}"><rect x="-2" y="-2" width="29" height="29" fill="#fff"/><g fill="#0e3b26">${cells}${finder(0, 0)}${finder(N - 7, 0)}${finder(0, N - 7)}</g></svg>`;
}
function gauge(parts) {
  const total = sum(parts, (p) => p.v) || 1;
  const cx = 120, cy = 118, r = 92;
  const pt = (deg) => [(cx + r * Math.cos((deg * Math.PI) / 180)).toFixed(2), (cy - r * Math.sin((deg * Math.PI) / 180)).toFixed(2)];
  let a = 180, paths = '';
  parts.forEach((p) => {
    if (!p.v) return;
    const a1 = a - (180 * p.v) / total;
    const [x0, y0] = pt(a - 0.6), [x1, y1] = pt(a1 + 0.6);
    paths += `<path d="M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}" class="${p.cls}"/>`;
    a = a1;
  });
  return `<svg viewBox="0 0 240 140" aria-hidden="true"><defs><pattern id="stripes" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="#fff"/><rect width="2.6" height="7" style="fill:var(--stripe)"/></pattern></defs>${paths}</svg>`;
}

/* ---------------- Modal & toast ---------------- */
function openModal(title, body, { wide = false } = {}) {
  const root = $('#modal');
  root.innerHTML = `<div class="modal-back" data-act="close-modal"></div><div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-head"><h3>${title}</h3><button class="icon-btn sm" data-act="close-modal" aria-label="Close">${icon('x')}</button></div><div class="modal-body">${body}</div></div>`;
  root.classList.add('open');
  const f = root.querySelector('input:not([type=hidden]):not([type=radio]):not([type=checkbox]), textarea, select');
  if (f) setTimeout(() => f.focus(), 30);
}
function closeModal() { $('#modal').classList.remove('open'); $('#modal').innerHTML = ''; }
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = icon('check') + esc(msg);
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

/* =========================================================================
   Navigation
   ========================================================================= */
const NAV = {
  manager: {
    menu: [['dashboard', 'Dashboard', 'grid'], ['properties', 'Properties', 'building'], ['tenants', 'Tenants', 'users', () => pendingJoins().length],
      ['rent', 'Rent & Payments', 'wallet', () => forReview().length], ['utilities', 'Utilities', 'zap'], ['maintenance', 'Maintenance', 'wrench', () => openTickets().length],
      ['announcements', 'Announcements', 'megaphone'], ['messages', 'Messages', 'msg', () => Chat.unread('manager')]],
    general: [['listings', 'Listings & Inquiries', 'store', () => S.inquiries.filter((q) => q.status === 'New').length], ['verification', 'Verification', 'shield'],
      ['subscription', 'Subscription', 'card'], ['explore', 'Explore Rentals', 'search']],
  },
  tenant: {
    menu: [['mydorm', 'My Dorm', 'home'], ['bills', 'Bills & Payments', 'wallet'], ['tickets', 'Maintenance', 'wrench'], ['notices', 'Announcements', 'megaphone'],
      ['messages', 'Messages', 'msg', () => Chat.unread('tenant')]],
    general: [['explore', 'Explore Rentals', 'search'], ['join', 'Join a Property', 'qr']],
  },
  admin: {
    menu: [['queue', 'Verification Queue', 'shield', () => pendingProps().length], ['reports', 'Listing Reports', 'flag', () => S.reports.filter((r) => r.status === 'Open').length],
      ['subs', 'Subscriptions', 'card'], ['audit', 'Audit Log', 'file']],
    general: [['explore', 'Explore Rentals', 'search']],
  },
};
const DEFAULT_VIEW = { manager: 'dashboard', tenant: 'mydorm', admin: 'queue' };
function currentView() {
  const v = location.hash.replace('#', '');
  const all = [...NAV[S.role].menu, ...NAV[S.role].general].map((x) => x[0]);
  return all.includes(v) ? v : DEFAULT_VIEW[S.role];
}
function go(view) {
  $('#shell').classList.remove('nav-open');
  if (location.hash === '#' + view) render(); else location.hash = view;
  window.scrollTo({ top: 0 });
}

function sidebarHtml(view) {
  const item = ([id, label, ic, badge]) => {
    const b = badge ? badge() : 0;
    return `<li><button class="${view === id ? 'active' : ''}" data-act="nav" data-to="${id}">${icon(ic)}<span>${label}</span>${b ? `<span class="badge">${b}</span>` : ''}</button></li>`;
  };
  const nav = NAV[S.role];
  const card = {
    manager: `<div class="side-card"><span class="ic">${icon('qr')}</span><h4>Invite tenants with a QR code</h4><p>Tenants request to join — you approve.</p><button class="btn sm" data-act="new-invite">Generate QR</button></div>`,
    tenant: `<div class="side-card"><span class="ic">${icon('qr')}</span><h4>Got a code from your manager?</h4><p>Scan or enter it to request access.</p><button class="btn sm" data-act="nav" data-to="join">Join Property</button></div>`,
    admin: `<div class="side-card"><span class="ic">${icon('pin')}</span><h4>Pilot: Iloilo City</h4><p>${pendingProps().length} properties awaiting document review.</p><button class="btn sm" data-act="nav" data-to="queue">Open Queue</button></div>`,
  }[S.role];
  return `<div class="brand"><span class="brand-mark">${icon('home')}</span><div>DormCare<small>Find Your Space. Manage Your Place.</small></div></div>
    <div class="nav-label">Menu</div><ul class="nav">${nav.menu.map(item).join('')}</ul>
    <div class="nav-label">General</div><ul class="nav">${nav.general.map(item).join('')}
      <li><button data-act="help">${icon('help')}<span>Demo Guide</span></button></li>
      <li><button data-act="reset">${icon('refresh')}<span>Reset Demo Data</span></button></li></ul>
    ${card}`;
}

function topbarHtml() {
  const who = S.role === 'manager' ? S.manager : S.role === 'admin' ? S.admin : persona();
  const notifs = myNotifs();
  const unread = notifs.filter((n) => !n.read).length;
  const ph = S.role === 'manager' ? 'Search tenants, rooms…' : 'Search rentals…';
  let dd = '';
  if (S.ui.bell) {
    dd = `<div class="dropdown"><h4>Notifications <button class="btn xs ghost" data-act="read-all">Mark all read</button></h4><div class="scroll">${
      notifs.length ? notifs.slice(0, 12).map((n) => `<button class="item ${n.read ? '' : 'unread'}" data-act="open-notif" data-id="${n.id}"><span class="sq-ic">${icon('bell')}</span><div>${esc(n.text)}<small>${esc(n.at)}${n.broker ? ` · ${n.broker.queued ? 'waited at the broker' : 'live from the broker'} (#${n.broker.seq})` : ''}</small></div></button>`).join('') : empty('bell', 'All caught up', 'No notifications yet.')
    }</div></div>`;
  } else if (S.ui.profileMenu && S.role === 'tenant') {
    dd = `<div class="dropdown"><h4>Switch demo tenant account</h4>${S.personas.map((p) => `<button class="item ${p.id === S.persona ? 'unread' : ''}" data-act="persona" data-id="${p.id}">${avatar(p.name, 'sm')}<div>${esc(p.name)}<small>${esc(p.note)}</small></div></button>`).join('')}</div>`;
  }
  return `<button class="icon-btn menu-btn" data-act="open-nav" aria-label="Open menu">${icon('menu')}</button>
    <label class="search">${icon('search')}<input id="global-search" placeholder="${ph}" aria-label="Search"><kbd>/</kbd></label>
    <div class="role-switch" role="group" aria-label="Demo role"><span class="lbl">View as</span>
      ${['manager', 'tenant', 'admin'].map((r) => `<button class="${S.role === r ? 'on' : ''}" data-act="role" data-role="${r}">${{ manager: 'Manager', tenant: 'Tenant', admin: 'Admin' }[r]}</button>`).join('')}
    </div>
    ${S.role === 'manager' ? `<button class="icon-btn" data-act="nav" data-to="listings" aria-label="Inquiries">${icon('mail')}${S.inquiries.some((q) => q.status === 'New') ? '<span class="dot"></span>' : ''}</button>` : ''}
    ${Broker.pill()}
    <button class="icon-btn" data-act="toggle-bell" aria-label="Notifications">${icon('bell')}${unread ? '<span class="dot"></span>' : ''}</button>
    <button class="profile" data-act="toggle-profile">${avatar(who.name, 'lg')}<span class="who"><b>${esc(who.name)}</b><small>${esc(who.email)}</small></span></button>
    ${dd}`;
}
function myNotifs() {
  return S.notifs.filter((n) => n.role === S.role && (S.role !== 'tenant' || n.userId === S.persona));
}

/* =========================================================================
   MANAGER VIEWS
   ========================================================================= */
function vDashboard() {
  const act = activeTenants();
  const b = beds();
  const newThisMonth = act.filter((t) => t.start >= '2026-10-01').length;
  const open = openInvoices();
  const outstanding = sum(open, invBalance);
  const overdue = open.filter((i) => invStatus(i) === 'Overdue').length;
  const tk = openTickets();
  const high = tk.filter((k) => k.priority === 'High').length;

  // Rent collection chart
  const octRent = S.invoices.filter((i) => i.kind === 'rent' && i.period === 'Oct 2026');
  const billed = sum(octRent, invTotal), collected = sum(octRent, (i) => i.paid || 0);
  const rate = billed ? collected / billed : 0;
  const series = [...S.history, { m: 'Oct', rate, current: true }, { m: 'Nov', rate: 1, proj: true }];
  const bars = series.map((s) => {
    const cls = s.proj ? 'proj' : s.current ? 'lv3' : s.rate >= 0.95 ? 'lv1' : 'lv2';
    const tip = s.current ? `<span class="tip">${Math.round(s.rate * 100)}%</span>` : '';
    return `<div class="bar-col" title="${s.m}: ${s.proj ? 'projected' : Math.round(s.rate * 100) + '% collected'}"><div class="bar-track"><div class="bar ${cls}" style="height:${Math.max(16, s.rate * 100)}%">${tip}</div></div><span>${s.m}</span></div>`;
  }).join('');

  // Reminder: rent due soon
  const dueSoon = open.filter((i) => i.kind === 'rent' && i.due >= TODAY && i.status !== 'Submitted for review');
  const nextDue = dueSoon.map((i) => i.due).sort()[0];
  const sentToday = S.remindersSent === TODAY;

  const joins = pendingJoins();
  const payRows = [...S.invoices.filter((i) => i.kind === 'rent' && i.period === 'Oct 2026')]
    .sort((x, y) => ['Submitted for review', 'Overdue', 'Unpaid', 'Partially paid', 'Paid'].indexOf(invStatus(x)) - ['Submitted for review', 'Overdue', 'Unpaid', 'Partially paid', 'Paid'].indexOf(invStatus(y)))
    .slice(0, 4);

  const pl = plan();
  const cap = pl.max === Infinity ? null : pl.max;

  return pageHead('Dashboard', 'Occupancy, rent, utilities and requests across your properties — in one place.',
    `<button class="btn primary" data-act="add-property">${icon('plus')}Add Property</button><button class="btn outline" data-act="new-invite">${icon('qr')}Invite Tenant</button>`) +
  `<div class="grid">
    <div class="card stat hero c-3"><div class="stat-top">Active Tenants<button class="arrow-btn" data-act="nav" data-to="tenants" aria-label="Open tenants">${icon('arrow')}</button></div>
      <div class="stat-num">${act.length}</div><div class="stat-foot"><span class="delta">${newThisMonth}▲</span>New move-ins this month</div></div>
    <div class="card stat c-3"><div class="stat-top">Occupied Beds<button class="arrow-btn" data-act="nav" data-to="properties" aria-label="Open properties">${icon('arrow')}</button></div>
      <div class="stat-num">${b.occ}<small> / ${b.cap}</small></div><div class="stat-foot"><span class="delta">${b.avail}</span>Beds available to list</div></div>
    <div class="card stat c-3"><div class="stat-top">Unpaid Balances<button class="arrow-btn" data-act="nav" data-to="rent" aria-label="Open rent">${icon('arrow')}</button></div>
      <div class="stat-num" style="font-size:38px">${peso(outstanding)}</div><div class="stat-foot" style="color:${overdue ? 'var(--bad)' : ''}"><span class="delta">${open.length}</span>Open bills · ${overdue} overdue</div></div>
    <div class="card stat c-3"><div class="stat-top">Open Tickets<button class="arrow-btn" data-act="nav" data-to="maintenance" aria-label="Open maintenance">${icon('arrow')}</button></div>
      <div class="stat-num">${tk.length}</div><div class="stat-foot"><span class="delta">${high}</span>High priority</div></div>

    <div class="card c-6"><div class="card-head"><h3>Rent Collection<span class="sub">Share of monthly rent collected</span></h3>
      <div class="legend"><span><i style="background:var(--g900)"></i>≥95%</span><span><i style="background:var(--g700)"></i>&lt;95%</span><span><i style="background:var(--g300)"></i>This month</span><span><i class="striped"></i>Projected</span></div></div>
      <div class="bars">${bars}</div></div>

    <div class="card c-3 reminder"><div class="card-head"><h3>Reminders</h3></div>
      ${nextDue ? `<h4>Rent due ${fmtShort(nextDue)}</h4><p>${dueSoon.length} tenant${dueSoon.length === 1 ? '' : 's'} still unpaid · ${peso(sum(dueSoon, invBalance))}</p>
        <button class="btn primary" data-act="send-reminders" ${sentToday ? 'disabled' : ''}>${icon(sentToday ? 'check' : 'send')}${sentToday ? 'Reminders sent today' : 'Send Reminders'}</button>`
        : `<h4>No upcoming dues</h4><p>All current bills are settled or under review.</p><button class="btn primary" data-act="nav" data-to="rent">${icon('wallet')}Open Rent</button>`}
      <div class="li mt"><span class="sq-ic">${icon('calendar')}</span><div class="body"><b>Fire safety inspection</b><small>Oct 16 · 9:00 AM · Casa Jaro</small></div></div>
    </div>

    <div class="card c-3"><div class="card-head"><h3>Join Requests</h3><button class="btn xs outline" data-act="new-invite">${icon('plus')}Invite</button></div>
      <div class="list">${joins.length ? joins.slice(0, 5).map((j) => `<div class="li">${avatar(j.name, 'sm')}<div class="body"><b>${esc(j.name)}</b><small>${esc(propById(j.prop).name)} · ${fmtShort(j.at)}</small></div>
        <button class="icon-btn sm" style="background:var(--g100);color:var(--g700)" data-act="approve-join" data-id="${j.id}" aria-label="Approve">${icon('check')}</button>
        <button class="icon-btn sm" style="background:var(--bad-bg);color:var(--bad)" data-act="reject-join" data-id="${j.id}" aria-label="Reject">${icon('x')}</button></div>`).join('')
        : empty('users', 'No pending requests', 'Share a QR code to onboard tenants.')}</div></div>

    <div class="card c-5"><div class="card-head"><h3>Payments to Watch</h3><button class="btn xs outline" data-act="record-payment">${icon('plus')}Record Payment</button></div>
      <div class="list">${payRows.map((i) => { const t = tenantById(i.tenant); const st = invStatus(i); const p = i.payments.find((x) => !x.verified && !x.rejected) || i.payments[0];
        return `<div class="li clickable" data-act="${st === 'Submitted for review' ? 'review-payment' : st === 'Paid' ? 'receipt' : 'record-payment'}" data-id="${i.id}">${avatar(t.name)}<div class="body"><b>${esc(t.name)}</b><small>${esc(roomById(t.room).name)} · <strong>${peso(invTotal(i))}</strong>${p ? ' via ' + esc(p.method) : ''}</small></div>${chip(st)}</div>`; }).join('')}</div></div>

    <div class="card c-4"><div class="card-head"><h3>Occupancy</h3><button class="btn xs ghost" data-act="nav" data-to="properties">Rooms ${icon('arrow')}</button></div>
      <div class="gauge">${gauge([{ v: b.occ, cls: 'g-occ' }, { v: b.res, cls: 'g-res' }, { v: b.unav, cls: 'g-unav' }, { v: b.avail, cls: 'g-avail' }])}
        <div class="gauge-label"><b>${Math.round((b.occ / (b.cap || 1)) * 100)}%</b><span>Beds occupied</span></div></div>
      <div class="legend" style="justify-content:center;margin-top:12px"><span><i style="background:var(--g700)"></i>Occupied ${b.occ}</span><span><i style="background:var(--g900)"></i>Reserved ${b.res}</span><span><i class="striped"></i>Available ${b.avail}</span></div></div>

    <div class="card c-3 dark-card"><h3>Plan Capacity</h3>
      <div class="big">${act.length}<small> / ${cap ?? '∞'}</small></div><div class="small" style="opacity:.75">active tenants · ${pl.name} plan · ${pl.price ? peso(pl.price) + '/mo' : 'Free'}</div>
      <div class="meter"><span style="width:${cap ? Math.min(100, (act.length / cap) * 100) : 30}%"></span></div>
      <div class="small" style="opacity:.75;margin-bottom:12px">${cap ? `${cap - act.length} slots left before an upgrade is needed` : 'No set maximum'}</div>
      <button class="btn sm" data-act="nav" data-to="subscription">Manage Plan</button></div>
  </div>`;
}

function vProperties() {
  return pageHead('Properties', 'Buildings, rooms and bedspaces. Availability updates automatically when tenants move in or out.',
    `<button class="btn primary" data-act="add-property">${icon('plus')}Add Property</button>`) +
  `<div class="stack">${myProps().map((p) => {
    const b = beds(p.id);
    const rs = S.rooms.filter((r) => r.prop === p.id);
    const pct = (v) => (b.cap ? (v / b.cap) * 100 : 0);
    return `<div class="card"><div class="prop-head"><div><h3>${esc(p.name)} ${chip(p.verification)}</h3><p class="muted small" style="margin-top:4px">${esc(p.type)} · ${esc(p.address)}</p></div>
      <div class="row wrap"><span class="small muted">${b.occ}/${b.cap} occupied · ${b.avail} available</span>
      ${p.verification !== 'Verified' ? `<button class="btn sm outline" data-act="nav" data-to="verification">${icon('shield')}Verification</button>` : ''}
      <button class="btn sm primary" data-act="room-form" data-prop="${p.id}">${icon('plus')}Add Room</button></div></div>
      <div class="occ-bar" style="margin-bottom:16px"><span style="width:${pct(b.occ)}%;background:var(--g700)"></span><span style="width:${pct(b.res)}%;background:var(--g900)"></span><span style="width:${pct(b.unav)}%;background:#d5dad7"></span></div>
      ${rs.length ? `<div class="room-grid">${rs.map((r) => {
        const occ = roomOcc(r), res = r.reserved || 0, unav = r.unavailable || 0;
        const dots = Array.from({ length: r.beds }, (_, i) => `<span class="bed ${i < occ ? 'occ' : i < occ + res ? 'res' : i < occ + res + unav ? 'unav' : 'free'}"></span>`).join('');
        const names = S.tenants.filter((t) => t.status === 'active' && t.room === r.id).map((t) => t.name.split(' ')[0]).join(', ');
        return `<div class="room"><div class="room-top"><div><b>${esc(r.name)}</b><small>${peso(r.price)} / bed · ${r.beds} beds</small></div><button class="btn xs ghost" data-act="room-form" data-prop="${p.id}" data-id="${r.id}">Edit</button></div>
          <div class="beds">${dots}</div><small class="muted">${roomFree(r) > 0 ? `<b style="color:var(--g700)">${roomFree(r)} free</b>` : 'Full'}${names ? ' · ' + esc(names) : ''}</small></div>`;
      }).join('')}</div>` : empty('bed', 'No rooms yet', 'Add rooms and bedspaces to start assigning tenants.')}
    </div>`;
  }).join('')}
  <div class="legend"><span><i style="background:var(--g700)"></i>Occupied</span><span><i style="background:var(--g900)"></i>Reserved</span><span><i style="background:#dde1de"></i>Unavailable</span><span><i class="striped"></i>Available</span></div></div>`;
}

function vTenants() {
  const tab = S.ui.tenantTab;
  const joins = pendingJoins();
  const tabs = [['directory', 'Directory', activeTenants().length], ['requests', 'Join Requests', joins.length], ['invites', 'QR & Invite Links', S.invites.filter((i) => i.status === 'Active').length], ['archived', 'Former Tenants', S.tenants.filter((t) => t.status === 'archived').length]];
  let body = '';
  if (tab === 'directory' || tab === 'archived') {
    body = `<div class="card"><div class="filters"><input class="input pill" style="max-width:280px" id="tenant-q" placeholder="Search name or room…" value="${esc(S.ui.tq || '')}"><select class="input pill" style="max-width:220px" id="tenant-prop">${propOptions(S.ui.tprop, { all: true })}</select></div><div class="table-wrap" id="tenant-rows">${tenantRows()}</div></div>`;
  } else if (tab === 'requests') {
    body = `<div class="card">${note('Invite links never grant access automatically. Confirm the person agreed to rent with you, then assign the correct room/bed and start date.')}
      <div class="list mt">${joins.length ? joins.map((j) => `<div class="li" style="padding:10px 0;border-bottom:1px solid var(--line)">${avatar(j.name)}<div class="body"><b>${esc(j.name)}</b><small>${esc(j.email)} · ${esc(propById(j.prop).name)} · via ${esc(j.via)} · ${fmtDate(j.at)}</small>${j.note ? `<small style="white-space:normal;color:var(--ink-2)">“${esc(j.note)}”</small>` : ''}</div>
        <button class="btn sm danger" data-act="reject-join" data-id="${j.id}">Reject</button><button class="btn sm primary" data-act="approve-join" data-id="${j.id}">${icon('check')}Approve & Assign</button></div>`).join('')
        : empty('users', 'No pending requests', 'When someone scans your QR code or opens your invite link, they will appear here.')}</div></div>`;
  } else {
    body = `<div class="card"><div class="card-head"><h3>Invite codes</h3><button class="btn sm primary" data-act="new-invite">${icon('plus')}New Invite</button></div><div class="table-wrap"><table>
      <thead><tr><th>Code</th><th>Property</th><th>Created</th><th>Expires</th><th>Requests</th><th>Status</th><th></th></tr></thead><tbody>
      ${S.invites.map((i) => { const st = i.status === 'Active' && i.expires < TODAY ? 'Expired' : i.status; return `<tr><td><span class="code">${esc(i.code)}</span></td><td>${esc(propById(i.prop).name)}</td><td>${fmtShort(i.created)}</td><td>${fmtShort(i.expires)}</td><td class="num">${i.uses}</td><td>${chip(st)}</td>
        <td class="actions">${st === 'Active' ? `<button class="btn xs outline" data-act="show-invite" data-id="${i.id}">Show QR</button><button class="btn xs danger" data-act="revoke-invite" data-id="${i.id}">Revoke</button>` : ''}</td></tr>`; }).join('')}
      </tbody></table></div></div>`;
  }
  return pageHead('Tenants', 'Approve join requests, assign rooms, and keep tenant records private to each tenant.',
    `<button class="btn primary" data-act="new-invite">${icon('qr')}Invite Tenant</button>`) +
    `<div class="tabs">${tabs.map(([id, l, c]) => `<button class="${tab === id ? 'on' : ''}" data-act="tenant-tab" data-tab="${id}">${l}<span class="count">${c}</span></button>`).join('')}</div>${body}`;
}
function tenantRows() {
  const archived = S.ui.tenantTab === 'archived';
  const q = (S.ui.tq || '').toLowerCase();
  const rows = S.tenants.filter((t) => (archived ? t.status === 'archived' : t.status === 'active') && (!S.ui.tprop || t.prop === S.ui.tprop) &&
    (!q || (t.name + ' ' + roomById(t.room).name).toLowerCase().includes(q)));
  if (!rows.length) return empty('users', archived ? 'No former tenants' : 'No tenants found', archived ? 'Moved-out tenants are archived here and do not count toward your plan.' : 'Try a different search.');
  return `<table><thead><tr><th>Tenant</th><th>Property · Room</th><th>${archived ? 'Stay' : 'Move-in'}</th><th>Balance</th><th></th></tr></thead><tbody>${rows.map((t) => {
    const bal = sum(S.invoices.filter((i) => i.tenant === t.id), invBalance);
    return `<tr><td><div class="li">${avatar(t.name, 'sm')}<div class="body"><b>${esc(t.name)}</b><small>${esc(t.email)} · ${esc(t.phone)}</small></div></div></td>
      <td>${esc(propById(t.prop).name)}<br><small class="muted">${esc(roomById(t.room).name)}</small></td>
      <td>${archived ? `${fmtShort(t.start)} – ${fmtShort(t.end)}` : fmtDate(t.start)}</td>
      <td class="num">${bal > 0 ? `<b style="color:var(--bad)">${peso(bal)}</b>` : '<span class="muted">₱0</span>'}</td>
      <td class="actions"><button class="btn xs outline" data-act="tenant-detail" data-id="${t.id}">View</button>${archived ? '' : `<button class="btn xs danger" data-act="move-out" data-id="${t.id}">Move out</button>`}</td></tr>`;
  }).join('')}</tbody></table>`;
}

function vRent() {
  const tab = S.ui.rentTab;
  const live = S.invoices.filter((i) => tenantById(i.tenant));
  const filters = { all: () => true, review: (i) => i.status === 'Submitted for review', unpaid: (i) => ['Unpaid', 'Partially paid'].includes(invStatus(i)), overdue: (i) => invStatus(i) === 'Overdue', paid: (i) => i.status === 'Paid' };
  const urgency = ['Submitted for review', 'Overdue', 'Unpaid', 'Partially paid', 'Paid'];
  const rows = live.filter(filters[tab]).sort((a, b) => urgency.indexOf(invStatus(a)) - urgency.indexOf(invStatus(b)) || (a.due < b.due ? -1 : 1));
  const oct = live.filter((i) => i.period === 'Oct 2026' || i.period === 'Sep 2026');
  const billed = sum(oct, invTotal), collected = sum(oct, (i) => i.paid || 0);
  const tabs = [['all', 'All'], ['review', 'For review'], ['unpaid', 'Unpaid'], ['overdue', 'Overdue'], ['paid', 'Paid']];
  const hasNov = S.invoices.some((i) => i.period === 'Nov 2026' && i.kind === 'rent');
  return pageHead('Rent & Payments', 'Bills, payment proofs and receipts. DormCare records payments — it does not move money.',
    `<button class="btn primary" data-act="record-payment">${icon('plus')}Record Payment</button><button class="btn outline" data-act="gen-bills" ${hasNov ? 'disabled' : ''}>${icon('receipt')}${hasNov ? 'Nov bills generated' : 'Generate Nov 2026 Bills'}</button>`) +
  `<div class="grid" style="margin-bottom:14px">
    <div class="card stat hero c-3"><div class="stat-top">Billed this cycle</div><div class="stat-num" style="font-size:34px">${peso(billed)}</div><div class="stat-foot">Rent + utilities, Oct cycle</div></div>
    <div class="card stat c-3"><div class="stat-top">Collected</div><div class="stat-num" style="font-size:34px">${peso(collected)}</div><div class="stat-foot"><span class="delta">${Math.round((collected / (billed || 1)) * 100)}%</span>of billed amount</div></div>
    <div class="card stat c-3"><div class="stat-top">Outstanding</div><div class="stat-num" style="font-size:34px">${peso(sum(openInvoices(), invBalance))}</div><div class="stat-foot" style="color:var(--bad)"><span class="delta">${live.filter((i) => invStatus(i) === 'Overdue').length}</span>Overdue bills</div></div>
    <div class="card stat c-3"><div class="stat-top">Proofs to review</div><div class="stat-num">${forReview().length}</div><div class="stat-foot">Never auto-verified from screenshots</div></div>
  </div>
  <div class="tabs">${tabs.map(([id, l]) => `<button class="${tab === id ? 'on' : ''}" data-act="rent-tab" data-tab="${id}">${l}<span class="count">${live.filter(filters[id]).length}</span></button>`).join('')}</div>
  <div class="card"><div class="table-wrap">${rows.length ? `<table><thead><tr><th>Tenant</th><th>Bill</th><th class="right">Amount</th><th class="right">Paid</th><th>Due</th><th>Status</th><th></th></tr></thead><tbody>
    ${rows.map((i) => { const t = tenantById(i.tenant); const st = invStatus(i);
      return `<tr><td><div class="li">${avatar(t.name, 'sm')}<div class="body"><b>${esc(t.name)}</b><small>${esc(roomById(t.room).name)}${t.status === 'archived' ? ' · moved out' : ''}</small></div></div></td>
      <td>${esc(i.label)}${i.basis ? `<br><small class="muted">${esc(i.basis)}</small>` : ''}</td><td class="right num">${peso(invTotal(i))}</td><td class="right num">${peso(i.paid || 0)}</td><td>${fmtShort(i.due)}</td><td>${chip(st)}</td>
      <td class="actions">${st === 'Submitted for review' ? `<button class="btn xs primary" data-act="review-payment" data-id="${i.id}">Review proof</button>` : ''}
        ${invBalance(i) > 0 && st !== 'Submitted for review' ? `<button class="btn xs outline" data-act="record-payment" data-id="${i.id}">Record</button><button class="btn xs ghost" data-act="remind-one" data-id="${i.id}">Remind</button>` : ''}
        ${(i.paid || 0) > 0 ? `<button class="btn xs ghost" data-act="receipt" data-id="${i.id}">Receipt</button>` : ''}</td></tr>`; }).join('')}
    </tbody></table>` : empty('wallet', 'Nothing here', 'No bills match this filter.')}</div></div>`;
}

function vUtilities() {
  const u = (S.ui.util ||= { prop: 'p1', type: 'Electricity', period: 'Oct 2026', total: '', due: '2026-11-10', method: 'occupant', meters: {} });
  return pageHead('Shared Utilities', 'Split electricity and water bills transparently. Preview every share before charging tenants.') +
  `<div class="grid"><form class="card c-7" data-form="issue-util" data-live="util"><div class="card-head"><h3>New allocation<span class="sub">Enter the bill from your provider — DormCare does not read meters or provider balances.</span></h3></div>
    <div class="form-grid">
      <label class="field"><span>Property</span><select class="input" name="prop">${propOptions(u.prop)}</select></label>
      <label class="field"><span>Utility</span><select class="input" name="type">${['Electricity', 'Water'].map((t) => `<option ${t === u.type ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
      <label class="field"><span>Billing period</span><input class="input" name="period" value="${esc(u.period)}" required></label>
      <label class="field"><span>Bill total (₱)</span><input class="input" name="total" type="number" min="0" step="0.01" value="${esc(u.total)}" placeholder="e.g. 12800" required></label>
      <label class="field"><span>Tenant due date</span><input class="input" name="due" type="date" value="${esc(u.due)}" required></label>
      <div class="field full"><span>Agreed allocation rule</span><div class="radio-cards">
        ${[['occupant', 'Per occupant', 'Equal share per active tenant'], ['room', 'Per room', 'Equal per occupied room, then split'], ['meter', 'Meter readings', 'By sub-meter kWh / m³ per room']]
          .map(([v, l, d]) => `<label><input type="radio" name="method" value="${v}" ${u.method === v ? 'checked' : ''}><b>${l}</b><span>${d}</span></label>`).join('')}</div></div>
    </div>
    <div id="util-dyn" class="mt">${utilDyn()}</div>
  </form>
  <div class="card c-5"><div class="card-head"><h3>Issued allocations</h3></div><div class="list">${S.utilityBills.length ? S.utilityBills.map((b) => `<div class="li clickable" data-act="util-detail" data-id="${b.id}"><span class="sq-ic">${icon(b.type === 'Water' ? 'drop' : 'zap')}</span><div class="body"><b>${esc(b.type)} · ${esc(b.period)}</b><small>${esc(propById(b.prop).name)} · ${b.count} tenants · ${{ occupant: 'per occupant', room: 'per room', meter: 'meter readings' }[b.method]}</small></div><b class="num">${peso(b.total)}</b></div>`).join('') : empty('zap', 'No allocations yet', 'Issued utility charges will be listed here.')}</div>
    <div class="mt">${note('Tenants see the bill total, the rule used, and their own share — never other tenants’ balances. Disputes can be adjusted from Rent & Payments with an audit trail.')}</div></div></div>`;
}
function occupiedRooms(prop) { return S.rooms.filter((r) => r.prop === prop && roomOcc(r) > 0); }
function utilDyn() {
  const u = S.ui.util;
  const meterInputs = u.method === 'meter' ? `<div class="field"><span>Sub-meter readings for this period (${u.type === 'Water' ? 'm³' : 'kWh'})</span><div class="form-grid">${occupiedRooms(u.prop).map((r) => `<label class="field"><small>${esc(r.name)} · ${roomOcc(r)} occupants</small><input class="input" type="number" min="0" name="m_${r.id}" value="${esc(u.meters[r.id] ?? 100)}"></label>`).join('')}</div></div>` : '';
  return meterInputs + `<div id="util-preview" class="${meterInputs ? 'mt' : ''}">${utilPreview()}</div>`;
}
function allocate(u) {
  const ts = activeTenants(u.prop);
  const total = Number(u.total) || 0;
  if (!ts.length || total <= 0) return [];
  let rows = [];
  if (u.method === 'occupant') {
    rows = ts.map((t) => ({ t, amount: total / ts.length, basis: `${peso(total)} ÷ ${ts.length} occupants` }));
  } else {
    const rs = occupiedRooms(u.prop);
    const units = u.method === 'meter' ? rs.map((r) => Number(u.meters[r.id] ?? 100) || 0) : rs.map(() => 1);
    const totalUnits = sum(units) || 1;
    rs.forEach((r, idx) => {
      const share = (total * units[idx]) / totalUnits;
      const occ = S.tenants.filter((t) => t.status === 'active' && t.room === r.id);
      const unit = u.type === 'Water' ? 'm³' : 'kWh';
      const basis = u.method === 'meter'
        ? `${r.name}: ${units[idx]} of ${totalUnits} ${unit} → ${peso(round2(share))} ÷ ${occ.length}`
        : `${peso(total)} ÷ ${rs.length} rooms → ${peso(round2(share))} ÷ ${occ.length}`;
      occ.forEach((t) => rows.push({ t, amount: share / occ.length, basis }));
    });
  }
  rows.forEach((r) => { r.amount = round2(r.amount); });
  const diff = round2(total - sum(rows, (r) => r.amount));
  if (rows.length && diff) rows[0].amount = round2(rows[0].amount + diff);
  return rows;
}
function utilPreview() {
  const rows = allocate(S.ui.util);
  if (!rows.length) return note('Enter the bill total to preview each tenant’s share.');
  return `<div class="table-wrap"><table><thead><tr><th>Tenant</th><th>Room</th><th>Calculation basis</th><th class="right">Share</th></tr></thead><tbody>
    ${rows.map((r) => `<tr><td>${esc(r.t.name)}</td><td>${esc(roomById(r.t.room).name)}</td><td class="small muted">${esc(r.basis)}</td><td class="right num strong">${peso(r.amount)}</td></tr>`).join('')}
    <tr><td colspan="3" class="strong">Total (${rows.length} tenants)</td><td class="right num strong">${peso(sum(rows, (r) => r.amount))}</td></tr></tbody></table></div>
    <div class="modal-foot"><button class="btn primary" type="submit">${icon('check')}Confirm & Issue Charges</button></div>`;
}

function vMaintenance() {
  const cols = TICKET_STATUSES.map((st) => {
    const ks = S.tickets.filter((k) => k.status === st && propById(k.prop)?.owner === 'm1');
    return `<div class="col"><div class="col-head">${st}<span>${ks.length}</span></div>${ks.map(ticketCard).join('')}</div>`;
  }).join('');
  return pageHead('Maintenance', 'Tenant requests with a timestamped history. Tenants only see their own tickets.') +
    `<div class="board">${cols}</div>`;
}
function ticketCard(k) {
  const t = tenantById(k.tenant);
  return `<button class="ticket" data-act="ticket" data-id="${k.id}"><div class="row between">${chip(k.priority)}<small>${fmtShort(k.created)}</small></div><b>${esc(k.title)}</b>
    <small>${esc(k.category)} · ${esc(roomById(t.room).name)}, ${esc(propById(k.prop).name)}</small>${S.role === 'manager' ? `<div class="row">${avatar(t.name, 'sm')}<small>${esc(t.name)}</small></div>` : ''}</button>`;
}

function vAnnouncements() {
  const list = S.announcements.filter((a) => propById(a.prop)?.owner === 'm1');
  return pageHead('Announcements', 'Post notices to approved members of a property. Tenants receive an in-app notification.') +
  `<div class="grid"><form class="card c-5" data-form="announce"><div class="card-head"><h3>New announcement</h3></div><div class="stack">
    <label class="field"><span>Send to</span><select class="input" name="prop">${propOptions('', { all: true }).replace('All properties', 'All my properties')}</select></label>
    <label class="field"><span>Title</span><input class="input" name="title" required placeholder="e.g. Pest control on Saturday"></label>
    <label class="field"><span>Message</span><textarea class="input" name="body" required placeholder="What should tenants know?"></textarea></label>
    <label class="check"><input type="checkbox" name="email"> Also send an email copy (tenants who opted in)</label>
    <button class="btn primary" type="submit" style="justify-content:center">${icon('send')}Post Announcement</button></div></form>
  <div class="card c-7"><div class="card-head"><h3>Posted</h3></div><div class="list">${list.map((a) => `<div class="li" style="align-items:flex-start;padding-bottom:12px;border-bottom:1px solid var(--line)"><span class="sq-ic">${icon('megaphone')}</span><div class="body"><b style="white-space:normal">${esc(a.title)}</b><small>${esc(propById(a.prop).name)} · ${fmtDate(a.date)}</small><p class="small" style="margin-top:6px;color:var(--ink-2)">${esc(a.body)}</p></div><button class="btn xs ghost" data-act="del-announce" data-id="${a.id}" aria-label="Delete">${icon('x')}</button></div>`).join('') || empty('megaphone', 'No announcements yet', 'Your posts will appear here.')}</div></div></div>`;
}

function vListings() {
  return pageHead('Listings & Inquiries', 'Only document-reviewed properties can be listed publicly. Availability syncs with occupancy.') +
  `<div class="grid"><div class="c-12 listing-grid">${myProps().map((p) => {
    const b = beds(p.id);
    const status = p.verification !== 'Verified' ? 'Not eligible' : p.listed ? 'Live' : 'Paused';
    const minPrice = Math.min(...S.rooms.filter((r) => r.prop === p.id).map((r) => r.price));
    return `<div class="listing"><div class="photo" style="${photoStyle(p.hue)}">${icon('building')}${chip(status)}<span class="price-tag">${isFinite(minPrice) ? peso(minPrice) + '/mo' : '—'}</span></div>
      <div class="info"><b>${esc(p.name)}</b><small>${icon('pin')}${esc(p.area)}, Iloilo City · ${esc(p.type)}</small><small>${icon('bed')}${b.avail} beds available (auto-synced)</small>
      <div class="row wrap mt">${status === 'Not eligible' ? `<button class="btn xs outline" data-act="nav" data-to="verification">Complete verification</button>` :
        `<button class="btn xs ${p.listed ? 'outline' : 'primary'}" data-act="toggle-listing" data-id="${p.id}">${p.listed ? 'Pause listing' : 'Publish listing'}</button><button class="btn xs ghost" data-act="listing-detail" data-id="${p.id}">Preview</button>`}</div></div></div>`;
  }).join('')}</div>
  <div class="card c-12"><div class="card-head"><h3>Inquiries<span class="sub">Arrange viewings directly with prospective tenants. Bookings are agreed outside the app in this MVP.</span></h3></div>
    <div class="list">${S.inquiries.length ? S.inquiries.map((q) => `<div class="li" style="align-items:flex-start;padding-bottom:12px;border-bottom:1px solid var(--line)">${avatar(q.name)}<div class="body"><b>${esc(q.name)} <span class="muted small">· ${esc(propById(q.listing)?.name || '')} · ${fmtShort(q.at)}</span></b>
      <p class="small" style="color:var(--ink-2);margin-top:2px">${esc(q.msg)}</p>${q.reply ? `<p class="small muted" style="margin-top:6px">↳ You: ${esc(q.reply)}</p>` : ''}</div>${chip(q.status)}
      ${q.status === 'New' ? `<button class="btn xs primary" data-act="reply-inquiry" data-id="${q.id}">Reply</button>` : ''}</div>`).join('') : empty('msg', 'No inquiries yet', 'Questions from renters will show up here.')}</div></div></div>`;
}

function vVerification() {
  const steps = ['Draft', 'Documents uploaded', 'Admin review', 'Verified'];
  return pageHead('Verification', 'Upload documents for DormCare review. Required before a property can be listed publicly.') +
  `<div class="stack">${note('Documents and IDs are stored privately and are <b>never shown publicly</b>. Only authorized DormCare reviewers can open them, and every access is logged. The public badge means DormCare completed defined document checks — it does not guarantee safety, full legal compliance, or listing accuracy. Requirements vary by property type; confirm with the relevant Iloilo City offices.', '', 'lock')}
  ${myProps().map((p) => {
    const uploaded = p.docs.every((d) => d.status !== 'Missing');
    const stage = p.verification === 'Verified' ? 4 : p.verification === 'Pending' ? 3 : uploaded ? 2 : 1;
    const warn = docExpiryWarnings(p);
    return `<div class="card"><div class="prop-head"><div><h3>${esc(p.name)} ${chip(p.verification)}</h3><p class="muted small" style="margin-top:4px">${esc(p.address)}${p.verifiedOn ? ' · verified ' + fmtDate(p.verifiedOn) : ''}${p.submittedOn && p.verification === 'Pending' ? ' · submitted ' + fmtDate(p.submittedOn) : ''}</p></div>
      ${['Draft', 'Needs correction', 'Rejected'].includes(p.verification) ? `<button class="btn sm primary" data-act="submit-verif" data-id="${p.id}" ${uploaded ? '' : 'disabled'}>${icon('send')}Submit for review</button>` : ''}</div>
      <div class="steps">${steps.map((s, i) => `<div class="step ${i + 1 < stage || stage === 4 ? 'done' : i + 1 === stage ? 'now' : ''}">${s}</div>`).join('')}</div>
      ${p.note ? note(`<b>Reviewer note:</b> ${esc(p.note)}`, 'bad', 'alert') : ''}
      ${warn.map((d) => note(`<b>${esc(d.type)}</b> expires ${fmtDate(d.expires)} (${daysBetween(TODAY, d.expires)} days). Upload the renewed document to keep your listing active.`, 'warn', 'alert')).join('')}
      <div>${p.docs.map((d, idx) => `<div class="doc-row"><span class="sq-ic">${icon('file')}</span><div class="body"><b>${esc(d.type)}</b><small>${d.file ? esc(d.file) : 'No file uploaded'}${d.expires ? ' · expires ' + fmtDate(d.expires) : ''}</small></div>${chip(d.status)}
        <label class="btn xs outline upload-btn">${icon('upload')}${d.file ? 'Replace' : 'Upload'}<input type="file" accept="image/*,.pdf" data-upload="${p.id}|${idx}"></label></div>`).join('')}</div></div>`;
  }).join('')}</div>`;
}

function vSubscription() {
  const n = activeTenants().length;
  const pl = plan();
  const rec = planFor(n);
  return pageHead('Subscription', 'Priced by total active tenants across all your properties. Tenants always use DormCare for free.') +
  `<div class="grid"><div class="card c-5 dark-card"><h3>Current usage</h3><div class="big">${n}<small> active tenants</small></div>
      <div class="meter"><span style="width:${pl.max === Infinity ? 30 : Math.min(100, (n / pl.max) * 100)}%"></span></div>
      <div class="small" style="opacity:.8">${pl.name} plan · ${pl.min}–${pl.max === Infinity ? '∞' : pl.max} tenants · ${pl.price ? peso(pl.price) + '/month' : 'Free'}</div>
      <div class="small" style="opacity:.6;margin-top:6px">Archived former tenants don't count. Exceeding capacity prompts an upgrade before adding more — existing records are always kept.</div></div>
    <div class="card c-7"><div class="card-head"><h3>Billing history<span class="sub">Pilot: subscription payments are recorded manually by DormCare.</span></h3></div><div class="table-wrap"><table><thead><tr><th>Period</th><th>Plan</th><th class="right">Amount</th><th>Status</th><th>Note</th></tr></thead><tbody>
      ${S.billingHistory.map((h) => `<tr><td>${esc(h.period)}</td><td>${esc(h.plan)}</td><td class="right num">${peso(h.amount)}</td><td>${chip(h.status)}</td><td class="small muted">${esc(h.note)}</td></tr>`).join('')}</tbody></table></div></div>
    <div class="c-12 plan-grid">${PLANS.map((p) => {
      const tooSmall = p.max < n;
      return `<div class="plan ${p.id === S.plan ? 'current' : ''}"><div class="row between"><b>${p.name}</b>${p.id === S.plan ? chip('Active') : p.id === rec.id ? '<span class="chip info">Fits you</span>' : ''}</div>
        <div class="price">${p.price ? peso(p.price) : 'Free'}<small>${p.price ? ' /month' : ''}</small></div><small class="muted">${p.max === Infinity ? `${p.min}+ tenants (no set max)` : `${p.min}–${p.max} active tenants`}</small>
        <button class="btn sm ${p.id === S.plan ? 'ghost' : 'outline'}" data-act="set-plan" data-id="${p.id}" ${p.id === S.plan || tooSmall ? 'disabled' : ''}>${p.id === S.plan ? 'Current plan' : tooSmall ? `Below ${n} tenants` : 'Switch'}</button></div>`;
    }).join('')}</div>
    <div class="c-12">${note('All prices are proposed and subject to customer validation. Plans differ by tenant capacity only — no essential tenant features are withheld.')}</div></div>`;
}

/* =========================================================================
   TENANT VIEWS
   ========================================================================= */
function noTenancy() {
  const reqs = S.joinRequests.filter((j) => j.userId === S.persona);
  const pending = reqs.find((j) => j.status === 'Pending');
  return `<div class="card" style="max-width:640px">${pending
    ? empty('calendar', 'Join request pending', `Your request to join <b>${esc(propById(pending.prop).name)}</b> was sent ${fmtDate(pending.at)}. The manager will verify your tenancy and assign your room.`, `<span class="small muted">Tip: switch to <b>Manager</b> to approve it.</span>`)
    : empty('home', "You're not part of a property yet", 'Find a place on Explore Rentals, or enter the invite code your manager gave you.', `<div class="row"><button class="btn primary" data-act="nav" data-to="join">${icon('qr')}Join a Property</button><button class="btn outline" data-act="nav" data-to="explore">Explore Rentals</button></div>`)}</div>`;
}
function vMyDorm() {
  const t = myTenancy();
  const me = persona();
  if (!t) return pageHead(`Hi, ${esc(me.name.split(' ')[0])}!`, 'Your private space for rent, utilities, notices and requests.') + noTenancy();
  const p = propById(t.prop), r = roomById(t.room);
  const inv = S.invoices.filter((i) => i.tenant === t.id);
  const open = inv.filter((i) => invBalance(i) > 0);
  const bal = sum(open, invBalance);
  const nextDue = open.map((i) => i.due).sort()[0];
  const tk = S.tickets.filter((k) => k.tenant === t.id);
  const notices = S.announcements.filter((a) => a.prop === t.prop);
  return pageHead(`Hi, ${esc(me.name.split(' ')[0])}!`, `${esc(p.name)} · ${esc(r.name)} — your private tenant space.`,
    `<button class="btn primary" data-act="pay" ${open.length ? '' : 'disabled'}>${icon('upload')}Submit Payment</button><button class="btn outline" data-act="new-ticket">${icon('wrench')}Request Repair</button>`) +
  `<div class="grid">
    <div class="card stat hero c-3"><div class="stat-top">Balance Due<button class="arrow-btn" data-act="nav" data-to="bills">${icon('arrow')}</button></div><div class="stat-num" style="font-size:38px">${peso(bal)}</div><div class="stat-foot"><span class="delta">${open.length}</span>Open bills</div></div>
    <div class="card stat c-3"><div class="stat-top">Next Due Date</div><div class="stat-num" style="font-size:34px">${nextDue ? fmtShort(nextDue) : '—'}</div><div class="stat-foot">${nextDue ? (nextDue < TODAY ? `<span style="color:var(--bad)">Overdue by ${daysBetween(nextDue, TODAY)} days</span>` : (daysBetween(TODAY, nextDue) <= 1 ? (nextDue === TODAY ? 'Due today' : 'Due tomorrow') : `In ${daysBetween(TODAY, nextDue)} days`)) : 'All settled'}</div></div>
    <div class="card stat c-3"><div class="stat-top">My Room</div><div class="stat-num" style="font-size:34px">${esc(r.name)}</div><div class="stat-foot">Since ${fmtDate(t.start)}</div></div>
    <div class="card stat c-3"><div class="stat-top">Open Requests<button class="arrow-btn" data-act="nav" data-to="tickets">${icon('arrow')}</button></div><div class="stat-num">${tk.filter((k) => !['Resolved', 'Closed'].includes(k.status)).length}</div><div class="stat-foot">${tk.length} total</div></div>
    <div class="card c-6"><div class="card-head"><h3>My Bills</h3><button class="btn xs ghost" data-act="nav" data-to="bills">All bills ${icon('arrow')}</button></div>${billList(inv.slice(0, 4))}</div>
    <div class="card c-3 reminder"><div class="card-head"><h3>Latest Notice</h3></div>${notices[0] ? `<h4>${esc(notices[0].title)}</h4><p>${esc(notices[0].body)}</p><button class="btn primary" data-act="nav" data-to="notices">${icon('megaphone')}All Announcements</button>` : '<p class="muted">No announcements.</p>'}</div>
    <div class="card c-3"><div class="card-head"><h3>House Info</h3></div><div class="list">
      <div class="li"><span class="sq-ic">${icon('pin')}</span><div class="body"><b>${esc(p.area)}, Iloilo City</b><small>${esc(p.address)}</small></div></div>
      <div class="li"><span class="sq-ic">${icon('users')}</span><div class="body"><b>${esc(S.manager.name)}</b><small>Property manager</small></div></div>
      ${p.rules.map((x) => `<div class="li"><span class="sq-ic">${icon('info')}</span><div class="body"><small style="white-space:normal;color:var(--ink-2)">${esc(x)}</small></div></div>`).join('')}</div></div>
    <div class="card c-12"><div class="card-head"><h3>My Maintenance Requests</h3><button class="btn xs outline" data-act="new-ticket">${icon('plus')}New Request</button></div>
      <div class="listing-grid">${tk.map(ticketCard).join('') || empty('wrench', 'No requests', 'Report anything that needs fixing.')}</div></div>
  </div>`;
}
function billList(inv) {
  if (!inv.length) return empty('wallet', 'No bills yet', 'Bills from your manager will appear here.');
  return `<div class="list">${inv.map((i) => { const st = invStatus(i); return `<div class="li"><span class="sq-ic">${icon(i.kind === 'utility' ? 'zap' : 'home')}</span><div class="body"><b>${esc(i.label)}</b><small>Due ${fmtDate(i.due)} · ${peso(invTotal(i))}${i.paid ? ` · paid ${peso(i.paid)}` : ''}</small></div>${chip(st)}
    ${invBalance(i) > 0 && st !== 'Submitted for review' ? `<button class="btn xs primary" data-act="pay" data-id="${i.id}">Pay</button>` : (i.paid ? `<button class="btn xs ghost" data-act="receipt" data-id="${i.id}">Receipt</button>` : '')}</div>`; }).join('')}</div>`;
}
function vBills() {
  const t = myTenancy();
  if (!t) return pageHead('Bills & Payments', 'Your own rent and utility records.') + noTenancy();
  const inv = S.invoices.filter((i) => i.tenant === t.id);
  const util = inv.filter((i) => i.kind === 'utility');
  return pageHead('Bills & Payments', 'Only you can see your bills. Pay your manager via GCash, bank or cash, then submit proof here.',
    `<button class="btn primary" data-act="pay">${icon('upload')}Submit Payment Proof</button>`) +
  `<div class="grid"><div class="card c-7"><div class="card-head"><h3>All bills</h3></div>${billList(inv)}</div>
    <div class="card c-5"><div class="card-head"><h3>Utility breakdown<span class="sub">How your share was calculated</span></h3></div>
      <div class="list">${util.map((i) => { const ub = S.utilityBills.find((b) => b.id === i.utilityBill); return `<div class="li" style="align-items:flex-start"><span class="sq-ic">${icon(ub?.type === 'Water' ? 'drop' : 'zap')}</span><div class="body"><b>${esc(i.label)}</b>
        <small style="white-space:normal">Bill total ${ub ? peso(ub.total) : '—'} · ${esc(i.basis || '')}</small><small>Your share: <strong>${peso(invTotal(i))}</strong> · due ${fmtShort(i.due)}</small></div></div>`; }).join('') || empty('zap', 'No utility charges', 'Shared utility charges will be itemized here.')}</div>
      <div class="mt">${note('Think a charge is wrong? Message your manager — adjustments are logged with an audit history.')}</div></div></div>`;
}
function vTickets() {
  const t = myTenancy();
  if (!t) return pageHead('Maintenance', 'Report issues in your room or shared areas.') + noTenancy();
  const tk = S.tickets.filter((k) => k.tenant === t.id);
  return pageHead('Maintenance', 'Report issues in your room or shared areas and follow their progress.', `<button class="btn primary" data-act="new-ticket">${icon('plus')}New Request</button>`) +
    `<div class="stack">${note('<b>Emergency?</b> For fire, medical or security emergencies call <b>911</b> immediately. DormCare does not dispatch emergency responders.', 'bad', 'alert')}
    <div class="listing-grid">${tk.map(ticketCard).join('') || empty('wrench', 'No requests yet', 'Your requests and their status updates appear here.')}</div></div>`;
}
function vNotices() {
  const t = myTenancy();
  if (!t) return pageHead('Announcements', 'Notices from your property manager.') + noTenancy();
  const list = S.announcements.filter((a) => a.prop === t.prop);
  return pageHead('Announcements', `Notices for members of ${esc(propById(t.prop).name)}.`) +
    `<div class="card"><div class="list">${list.map((a) => `<div class="li" style="align-items:flex-start;padding-bottom:12px;border-bottom:1px solid var(--line)"><span class="sq-ic">${icon('megaphone')}</span><div class="body"><b style="white-space:normal">${esc(a.title)}</b><small>${fmtDate(a.date)} · ${esc(S.manager.name)}</small><p class="small" style="margin-top:6px;color:var(--ink-2)">${esc(a.body)}</p></div></div>`).join('') || empty('megaphone', 'No announcements', 'You are all caught up.')}</div></div>`;
}
function vJoin() {
  const reqs = S.joinRequests.filter((j) => j.userId === S.persona);
  return pageHead('Join a Property', 'Scan the QR code from your manager, or enter the invite code below.') +
  `<div class="grid"><form class="card c-6" data-form="join"><div class="card-head"><h3>Enter invite code</h3></div><div class="stack">
    <label class="field"><span>Invite code</span><input class="input" name="code" required placeholder="e.g. CJD-7K2Q" style="text-transform:uppercase"><small>Demo: try <span class="code">CJD-7K2Q</span> (Casa Jaro Dormitory)</small></label>
    <label class="field"><span>Message to manager (optional)</span><textarea class="input" name="note" placeholder="e.g. We agreed on a bed in Room 203 starting Nov 1."></textarea></label>
    ${note('Joining sends a <b>request</b>. Your manager confirms your tenancy and assigns your room before you get access.')}
    <button class="btn primary" type="submit" style="justify-content:center">${icon('send')}Request to Join</button></div></form>
    <div class="card c-6"><div class="card-head"><h3>My requests</h3></div><div class="list">${reqs.map((j) => `<div class="li"><span class="sq-ic">${icon('home')}</span><div class="body"><b>${esc(propById(j.prop).name)}</b><small>Sent ${fmtDate(j.at)} via ${esc(j.via)}</small></div>${chip(j.status)}</div>`).join('') || empty('qr', 'No requests yet', 'Requests you send will be tracked here.')}</div></div></div>`;
}

/* =========================================================================
   ADMIN VIEWS
   ========================================================================= */
function ownerName(p) { return p.owner === 'm1' ? S.manager.name : S.managers.find((m) => m.id === p.owner)?.name || '—'; }
function vQueue() {
  const q = pendingProps();
  const others = S.properties.filter((p) => !pendingProps().includes(p));
  return pageHead('Verification Queue', 'Review identity, authority to manage, and applicable permits before a property can be listed.') +
  `<div class="grid" style="margin-bottom:14px">
    <div class="card stat hero c-3"><div class="stat-top">Awaiting review</div><div class="stat-num">${q.length}</div><div class="stat-foot">Avg. turnaround 2.1 days</div></div>
    <div class="card stat c-3"><div class="stat-top">Verified properties</div><div class="stat-num">${S.properties.filter((p) => p.verification === 'Verified').length + S.market.length}</div><div class="stat-foot">Across Iloilo City pilot</div></div>
    <div class="card stat c-3"><div class="stat-top">Renewals due (90d)</div><div class="stat-num">${S.properties.filter((p) => docExpiryWarnings(p).length).length}</div><div class="stat-foot">Reminders sent to managers</div></div>
    <div class="card stat c-3"><div class="stat-top">Open reports</div><div class="stat-num">${S.reports.filter((r) => r.status === 'Open').length}</div><div class="stat-foot">Listing moderation</div></div></div>
  <div class="stack">${q.map((p) => `<div class="card"><div class="prop-head"><div><h3>${esc(p.name)} ${isRenewal(p) ? '<span class="chip info">Renewal</span>' : chip('Pending')}</h3><p class="muted small" style="margin-top:4px">${esc(p.type)} · ${esc(p.address)} · Owner/manager: <b>${esc(ownerName(p))}</b> · submitted ${fmtDate(p.submittedOn)}</p></div>
      <div class="row wrap"><button class="btn sm danger" data-act="verif-decide" data-id="${p.id}" data-d="Rejected">Reject</button><button class="btn sm outline" data-act="verif-decide" data-id="${p.id}" data-d="Needs correction">Request correction</button><button class="btn sm primary" data-act="verif-decide" data-id="${p.id}" data-d="Verified">${icon('check')}Approve</button></div></div>
      ${p.docs.map((d, idx) => `<div class="doc-row"><span class="sq-ic">${icon('lock')}</span><div class="body"><b>${esc(d.type)}</b><small>${d.file ? esc(d.file) : 'Not provided'}${d.expires ? ' · expires ' + fmtDate(d.expires) : ''}</small></div>${chip(d.status)}${d.file ? `<button class="btn xs outline" data-act="view-doc" data-id="${p.id}" data-idx="${idx}">${icon('eye')}View securely</button>` : ''}</div>`).join('')}</div>`).join('') || `<div class="card">${empty('shield', 'Queue is clear', 'No properties are waiting for review.')}</div>`}
  <div class="card"><div class="card-head"><h3>Recently decided</h3></div><div class="table-wrap"><table><thead><tr><th>Property</th><th>Owner</th><th>Status</th><th>Note</th></tr></thead><tbody>
    ${others.map((p) => `<tr><td>${esc(p.name)}</td><td>${esc(ownerName(p))}</td><td>${chip(p.verification)}</td><td class="small muted">${esc(p.note || (p.verifiedOn ? 'Verified ' + fmtDate(p.verifiedOn) : ''))}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">None yet</td></tr>'}</tbody></table></div></div></div>`;
}
function vReports() {
  const all = publicListings().concat(S.market.filter((m) => m.suspended));
  return pageHead('Listing Reports', 'Reports of misleading, duplicate or suspicious listings.') +
  `<div class="card"><div class="table-wrap">${S.reports.length ? `<table><thead><tr><th>Listing</th><th>Reason</th><th>Reported</th><th>Status</th><th></th></tr></thead><tbody>
    ${S.reports.map((r) => { const l = all.find((x) => x.id === r.listing) || propById(r.listing); return `<tr><td><b>${esc(l?.name || r.listing)}</b><br><small class="muted">${esc(l?.manager || '')}</small></td><td class="small">${esc(r.reason)}</td><td>${fmtShort(r.at)}<br><small class="muted">${esc(r.by)}</small></td><td>${chip(r.status)}</td>
      <td class="actions">${r.status === 'Open' ? `<button class="btn xs outline" data-act="report-decide" data-id="${r.id}" data-d="Dismissed">Dismiss</button><button class="btn xs danger" data-act="report-decide" data-id="${r.id}" data-d="Suspended">Suspend listing</button>` : ''}</td></tr>`; }).join('')}
  </tbody></table>` : empty('flag', 'No reports', 'Reports from renters appear here.')}</div></div>`;
}
function vSubs() {
  const rows = [{ name: S.manager.name, props: myProps().length, tenants: activeTenants().length, plan: S.plan }, ...S.managers];
  const mrr = sum(rows, (r) => PLANS.find((p) => p.id === r.plan).price);
  return pageHead('Subscriptions', 'Manager plans by active tenant count. Payment collection is administered manually during the pilot.') +
  `<div class="grid" style="margin-bottom:14px">
    <div class="card stat hero c-4"><div class="stat-top">Monthly recurring revenue</div><div class="stat-num">${peso(mrr)}</div><div class="stat-foot">${rows.filter((r) => r.plan !== 'starter').length} paying managers</div></div>
    <div class="card stat c-4"><div class="stat-top">Active tenants on platform</div><div class="stat-num">${sum(rows, (r) => r.tenants)}</div><div class="stat-foot">Tenants use DormCare free</div></div>
    <div class="card stat c-4"><div class="stat-top">Managers</div><div class="stat-num">${rows.length}</div><div class="stat-foot">${rows.filter((r) => r.plan === 'starter').length} on free Starter</div></div></div>
  <div class="card"><div class="table-wrap"><table><thead><tr><th>Manager</th><th class="right">Properties</th><th class="right">Active tenants</th><th>Plan</th><th class="right">Monthly</th><th>Capacity</th></tr></thead><tbody>
    ${rows.map((r) => { const p = PLANS.find((x) => x.id === r.plan); const over = r.tenants > p.max; return `<tr><td><div class="li">${avatar(r.name, 'sm')}<b>${esc(r.name)}</b></div></td><td class="right num">${r.props}</td><td class="right num">${r.tenants}</td><td>${p.name}</td><td class="right num">${p.price ? peso(p.price) : 'Free'}</td>
      <td style="min-width:140px"><div class="progress"><span style="width:${p.max === Infinity ? 30 : Math.min(100, (r.tenants / p.max) * 100)}%"></span></div>${over ? '<small style="color:var(--bad)">Over capacity — upgrade prompted</small>' : ''}</td></tr>`; }).join('')}
  </tbody></table></div></div>`;
}
function vAudit() {
  return pageHead('Audit Log', 'Important actions: verification decisions, document access, payment verification and moderation.') +
    `<div class="card"><div class="table-wrap"><table><thead><tr><th>When</th><th>Actor</th><th>Action</th></tr></thead><tbody>
    ${S.audit.map((a) => `<tr><td class="num" style="white-space:nowrap">${esc(a.at)}</td><td style="white-space:nowrap">${esc(a.actor)}</td><td>${esc(a.text)}</td></tr>`).join('')}</tbody></table></div></div>`;
}

/* =========================================================================
   SHARED: Explore rentals (public marketplace)
   ========================================================================= */
function vExplore() {
  const ex = S.ui.ex;
  const amen = ['Wi-Fi', 'Aircon', 'Laundry area', 'Water included', 'Private CR', 'Study lounge'];
  return pageHead('Explore Rentals', 'Document-reviewed boarding houses, dorms, bedspaces and apartments in Iloilo City.') +
  `<div class="card" style="margin-bottom:14px"><div class="filters" style="margin:0" id="ex-filters">
    <input class="input pill" style="flex:1;min-width:200px" data-ex="q" placeholder="Search by name or area…" value="${esc(ex.q)}">
    <select class="input pill" style="width:auto" data-ex="type"><option value="">All types</option>${TYPES.map((t) => `<option ${ex.type === t ? 'selected' : ''}>${t}</option>`).join('')}</select>
    <select class="input pill" style="width:auto" data-ex="area"><option value="">All areas</option>${AREAS.map((t) => `<option ${ex.area === t ? 'selected' : ''}>${t}</option>`).join('')}</select>
    <select class="input pill" style="width:auto" data-ex="max"><option value="">Any rent</option>${[2000, 3000, 5000, 10000].map((v) => `<option value="${v}" ${String(ex.max) === String(v) ? 'selected' : ''}>Up to ${peso(v)}</option>`).join('')}</select>
    <select class="input pill" style="width:auto" data-ex="amen"><option value="">Any amenity</option>${amen.map((t) => `<option ${ex.amen === t ? 'selected' : ''}>${t}</option>`).join('')}</select>
  </div></div><div id="ex-results">${exploreResults()}</div>`;
}
function exploreResults() {
  const ex = S.ui.ex;
  const q = ex.q.toLowerCase();
  const list = publicListings().filter((l) => (!q || (l.name + ' ' + l.area + ' ' + l.type).toLowerCase().includes(q)) && (!ex.type || l.type === ex.type) &&
    (!ex.area || l.area === ex.area) && (!ex.max || l.price <= Number(ex.max)) && (!ex.amen || l.amenities.includes(ex.amen)));
  if (!list.length) return `<div class="card">${empty('search', 'No rentals match', 'Try widening your filters.')}</div>`;
  return `<p class="small muted" style="margin:0 0 10px 4px">${list.length} listing${list.length === 1 ? '' : 's'}</p><div class="listing-grid">${list.map((l) => `<button class="listing" data-act="listing-detail" data-id="${l.id}">
    <div class="photo" style="${photoStyle(l.hue)}">${icon('building')}${verifiedBadge()}<span class="price-tag">${peso(l.price)}/mo</span></div>
    <div class="info"><b>${esc(l.name)}</b><small>${icon('pin')}${esc(l.area)}, Iloilo City · ${esc(l.type)}</small><small>${icon('bed')}${l.avail > 0 ? `${l.avail} available` : 'Fully occupied'}</small>
    <div class="tags">${l.amenities.slice(0, 3).map((a) => `<span class="tag">${esc(a)}</span>`).join('')}</div></div></button>`).join('')}</div>`;
}

/* =========================================================================
   MESSAGES: tenant <-> manager chat
   One conversation per tenant account, on its own broker topic chat.<user>.
   The manager subscribes to every conversation, each tenant only to theirs.
   Served by the broker gateway, a message becomes visible to a role only
   when the broker has delivered it to that role's subscriber.
   ========================================================================= */
const Chat = {
  topic(thread) { return `chat.${thread}`; },
  list(thread) { S.chats ||= {}; return (S.chats[thread] ||= []); },
  openThread() { return S.role === 'tenant' ? S.persona : (S.ui.chatWith || S.personas[0].id); },
  visible(m, role) { return !Broker.available || m.local || m.from === role || !!(m.deliveredTo && m.deliveredTo[role]); },
  unread(role) {
    const threads = role === 'tenant' ? [S.persona] : S.personas.map((p) => p.id);
    return sum(threads, (t) => this.list(t).filter((m) => m.unreadFor === role && this.visible(m, role)).length);
  },
  markOpenThreadRead() {
    if (S.role === 'admin') return;
    let changed = false;
    this.list(this.openThread()).forEach((m) => {
      if (m.unreadFor === S.role && this.visible(m, S.role)) { m.unreadFor = null; changed = true; }
    });
    if (changed) save();
  },
  send(thread, text) {
    const role = S.role;
    const msg = { id: uid('c'), thread, from: role, name: actorName(), text, at: nowStamp(), deliveredTo: {} };
    this.list(thread).push(msg);
    if (Broker.available) {
      this.publish(msg);
    } else {
      msg.local = true;  // no broker: the other role sees it when you switch, from this browser's storage
      msg.unreadFor = role === 'tenant' ? 'manager' : 'tenant';
    }
  },
  publish(msg) {
    Broker.publish(this.topic(msg.thread), { kind: 'chat', id: msg.id, thread: msg.thread, from: msg.from, name: msg.name,
      text: msg.text, at: msg.at, title: `${msg.name}: ${msg.text}` })
      .then(() => { const cur = this.current(msg); if (cur.failed) { cur.failed = false; save(); render(); } })
      .catch(() => {
        const cur = this.current(msg);
        if (!cur.failed) toast('Not sent yet: the broker is not reachable. It will be sent when the connection is back.');
        cur.failed = true; save(); render();
      });
  },
  // S is replaced when another window saves, so look a message up again after waiting for the broker.
  current(msg) { return this.list(msg.thread).find((x) => x.id === msg.id) || msg; },
  // When the connection to the broker comes back, send this user's messages that could not be sent before.
  // Receivers recognise a message by its id, so a re-send is never shown twice.
  retryFailed(role) {
    Object.values(S.chats || {}).forEach((list) => list.forEach((m) => { if (m.failed && m.from === role) this.publish(m); }));
  },
  // A chat message delivered by the broker to the subscriber of role `me.role`.
  receive(p, m, me) {
    const list = this.list(p.thread);
    let msg = list.find((x) => x.id === p.id);
    if (!msg) {
      msg = { id: p.id, thread: p.thread, from: p.from, name: p.name, text: p.text, at: String(p.at || nowStamp()), deliveredTo: {} };
      list.push(msg);
    }
    const queued = m.published_at < Broker.connectedAt;
    (msg.deliveredTo ||= {})[me.role] = { seq: m.seq, queued };
    msg.failed = false;
    if (p.from === me.role) return { incoming: false };  // our own message, confirmed by the broker
    const viewing = currentView() === 'messages' && this.openThread() === p.thread;
    if (!viewing) msg.unreadFor = me.role;
    return { incoming: true, viewing, queued, name: p.name, text: p.text };
  },
};

function chatTime(at) {
  return at.startsWith(TODAY) ? at.slice(11) : `${fmtShort(at.slice(0, 10))}, ${at.slice(11)}`;
}
function chatBubble(m) {
  const mine = m.from === S.role;
  const d = (m.deliveredTo || {})[S.role];
  let status = '';
  if (m.failed) status = 'not sent yet: waiting for the broker';
  else if (!Broker.available) status = mine && m.local ? 'saved in this browser' : '';
  else if (m.local) status = '';  // earlier sample conversation
  else if (mine) status = d ? `sent through the broker (#${d.seq})` : 'sending…';
  else if (d) status = `${d.queued ? 'waited at the broker' : 'via the broker'} (#${d.seq})`;
  return `<div class="bubble ${mine ? 'mine' : 'theirs'}${m.failed ? ' failed' : ''}"><p>${esc(m.text)}</p><small>${esc(chatTime(m.at))}${status ? ` · ${status}` : ''}</small></div>`;
}
function vMessages() {
  const mgr = S.role === 'manager';
  const thread = Chat.openThread();
  const persona = S.personas.find((p) => p.id === thread) || S.personas[0];
  const other = mgr ? { name: persona.name, note: persona.note } : { name: S.manager.name, note: 'Property manager' };
  const how = Broker.available
    ? `Messages travel through the publish-subscribe broker on <span class="code">${esc(Chat.topic(thread))}</span>.`
    : 'Messages are kept in this browser. Run <span class="code">python -m pubsub.webapp</span> to send them through the broker.';
  const threads = mgr ? `<div class="card chat-threads"><div class="card-head"><h3>Conversations</h3></div><div class="list">${S.personas.map((p) => {
    const msgs = Chat.list(p.id).filter((m) => Chat.visible(m, 'manager'));
    const last = msgs[msgs.length - 1];
    const unread = msgs.filter((m) => m.unreadFor === 'manager').length;
    return `<button class="li chat-thread ${p.id === thread ? 'on' : ''}" data-act="chat-open" data-id="${p.id}" aria-current="${p.id === thread}">${avatar(p.name)}
      <div class="body"><b>${esc(p.name)}</b><small>${last ? esc(`${last.from === 'manager' ? 'You: ' : ''}${last.text}`) : esc(p.note)}</small></div>
      ${unread ? `<span class="chat-unread" aria-label="${unread} unread">${unread}</span>` : ''}</button>`;
  }).join('')}</div></div>` : '';
  const msgs = Chat.list(thread).filter((m) => Chat.visible(m, S.role));
  const log = msgs.length ? msgs.map(chatBubble).join('')
    : empty('msg', 'No messages yet', mgr ? `Send ${esc(persona.name.split(' ')[0])} a message.` : 'Ask your property manager anything about your stay.');
  const draft = (S.ui.chatDraft || {})[thread] || '';
  return pageHead('Messages', `${mgr ? 'Chat with tenants and prospective renters.' : 'Chat with your property manager.'} ${how}`) +
    `<div class="chat ${mgr ? 'with-list' : ''}">${threads}
      <div class="card chat-pane">
        <div class="chat-head">${avatar(other.name, 'lg')}<div class="body"><b>${esc(other.name)}</b><small>${esc(other.note)}</small></div></div>
        <div class="chat-log" id="chat-log" aria-live="polite">${log}</div>
        <form class="chat-compose" data-form="chat" data-thread="${esc(thread)}">
          <input class="input" id="chat-input" name="text" data-thread="${esc(thread)}" autocomplete="off" maxlength="500"
            placeholder="Write a message…" aria-label="Message" value="${esc(draft)}" required>
          <button class="btn primary" type="submit">${icon('send')}Send</button>
        </form>
      </div></div>`;
}

/* =========================================================================
   Render
   ========================================================================= */
const VIEWS = {
  manager: { dashboard: vDashboard, properties: vProperties, tenants: vTenants, rent: vRent, utilities: vUtilities, maintenance: vMaintenance, announcements: vAnnouncements, messages: vMessages, listings: vListings, verification: vVerification, subscription: vSubscription, explore: vExplore },
  tenant: { mydorm: vMyDorm, bills: vBills, tickets: vTickets, notices: vNotices, messages: vMessages, explore: vExplore, join: vJoin },
  admin: { queue: vQueue, reports: vReports, subs: vSubs, audit: vAudit, explore: vExplore },
};
function render() {
  const view = currentView();
  if (view === 'messages') Chat.markOpenThreadRead();
  const typing = document.activeElement && document.activeElement.id === 'chat-input';
  $('#sidebar').innerHTML = sidebarHtml(view);
  $('#topbar').innerHTML = topbarHtml();
  $('#content').innerHTML = VIEWS[S.role][view]();
  const log = $('#chat-log');
  if (log) log.scrollTop = log.scrollHeight;
  if (typing) {  // a message arrived while typing: keep the cursor in the box (the draft is kept in S.ui)
    const input = $('#chat-input');
    if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
  }
  Broker.sync();
}

/* =========================================================================
   Actions (click)
   ========================================================================= */
const A = {
  nav: (d) => go(d.to),
  'open-nav': () => $('#shell').classList.add('nav-open'),
  'close-nav': () => $('#shell').classList.remove('nav-open'),
  'close-modal': closeModal,
  role: (d) => { S.role = d.role; S.ui.bell = false; S.ui.profileMenu = false; save(); go(DEFAULT_VIEW[d.role]); },
  persona: (d) => { S.persona = d.id; S.ui.profileMenu = false; commit(); toast(`Now viewing as ${persona().name}`); },
  'toggle-bell': () => { S.ui.bell = !S.ui.bell; S.ui.profileMenu = false; render(); },
  'toggle-profile': () => { if (S.role !== 'tenant') return; S.ui.profileMenu = !S.ui.profileMenu; S.ui.bell = false; render(); },
  'read-all': () => { myNotifs().forEach((n) => { n.read = true; }); commit(); },
  'open-notif': (d) => { const n = S.notifs.find((x) => x.id === d.id); n.read = true; S.ui.bell = false; save(); if (n.to) go(n.to); else render(); },
  help: () => openModal('Demo guide', `<p>DormCare MVP is a clickable prototype with demo data stored in this browser. Switch roles in the top bar.</p>
    <div class="list">
      <div class="li" style="align-items:flex-start"><span class="sq-ic">${icon('building')}</span><div class="body"><b>Manager</b><small style="white-space:normal">Approve join requests (capacity rules apply), review GCash proofs, split a utility bill, move tickets through statuses, post announcements, upload verification documents, publish listings.</small></div></div>
      <div class="li" style="align-items:flex-start"><span class="sq-ic">${icon('home')}</span><div class="body"><b>Tenant</b><small style="white-space:normal">As Juan: submit payment proof, file a repair request. Switch to Ana (click the profile) and join with code <span class="code">CJD-7K2Q</span>, then approve her as Manager.</small></div></div>
      <div class="li" style="align-items:flex-start"><span class="sq-ic">${icon('shield')}</span><div class="body"><b>Admin</b><small style="white-space:normal">Approve Molo Bedspace Hub — then publish it from the Manager's Listings page and find it on Explore Rentals.</small></div></div>
    </div>${note('No real payments, documents or messages are processed. Use “Reset Demo Data” to start over.')}`),
  'broker-info': () => Broker.details(),
  'chat-open': (d) => { S.ui.chatWith = d.id; commit(); },
  reset: () => openModal('Reset demo data?', `<p>This restores the original sample properties, tenants and bills in this browser.</p><div class="modal-foot"><button class="btn ghost" data-act="close-modal">Cancel</button><button class="btn danger" data-act="do-reset">Reset</button></div>`),
  'do-reset': () => { const role = S.role; S = seed(); S.epoch = Date.now(); S.role = role; S.ui ={ tenantTab: 'directory', rentTab: 'all', ex: { q: '', type: '', area: '', max: '', amen: '' } }; closeModal(); commit(); toast('Demo data reset'); },

  /* --- properties --- */
  'add-property': () => openModal('Add property', `<form class="stack" data-form="add-property"><label class="field"><span>Property name</span><input class="input" name="name" required></label>
    <div class="form-grid"><label class="field"><span>Accommodation type</span><select class="input" name="type">${TYPES.map((t) => `<option>${t}</option>`).join('')}</select></label>
    <label class="field"><span>Area</span><select class="input" name="area">${AREAS.map((t) => `<option>${t}</option>`).join('')}</select></label></div>
    <label class="field"><span>Street address</span><input class="input" name="address" required placeholder="Street, barangay"></label>
    ${note('New properties start as <b>Draft</b>. Upload verification documents before the property can be listed publicly. You can add rooms and tenants right away.')}
    <div class="modal-foot"><button class="btn ghost" type="button" data-act="close-modal">Cancel</button><button class="btn primary" type="submit">Create property</button></div></form>`),
  'room-form': (d) => {
    const r = d.id ? roomById(d.id) : { name: '', beds: 4, price: 2500, reserved: 0, unavailable: 0 };
    openModal(d.id ? `Edit ${esc(r.name)}` : 'Add room / bedspace', `<form class="stack" data-form="room" data-prop="${d.prop}" data-id="${d.id || ''}">
      <div class="form-grid"><label class="field"><span>Room name</span><input class="input" name="name" value="${esc(r.name)}" required placeholder="e.g. Room 301"></label>
      <label class="field"><span>Monthly rent per bed (₱)</span><input class="input" type="number" min="0" name="price" value="${r.price}" required></label>
      <label class="field"><span>Beds (capacity)</span><input class="input" type="number" min="1" max="20" name="beds" value="${r.beds}" required></label>
      <label class="field"><span>Reserved beds</span><input class="input" type="number" min="0" name="reserved" value="${r.reserved || 0}"></label>
      <label class="field"><span>Unavailable beds</span><input class="input" type="number" min="0" name="unavailable" value="${r.unavailable || 0}"><small>Under repair, storage, etc.</small></label></div>
      ${d.id ? note(`${roomOcc(r)} bed(s) currently occupied.`) : ''}
      <div class="modal-foot"><button class="btn ghost" type="button" data-act="close-modal">Cancel</button><button class="btn primary" type="submit">Save</button></div></form>`);
  },

  /* --- tenants & joins --- */
  'tenant-tab': (d) => { S.ui.tenantTab = d.tab; commit(); },
  'approve-join': (d) => {
    const j = S.joinRequests.find((x) => x.id === d.id);
    const rs = S.rooms.filter((r) => r.prop === j.prop && roomFree(r) > 0);
    if (activeTenants().length + 1 > plan().max) return upgradePrompt();
    openModal(`Approve ${esc(j.name)}`, `<form class="stack" data-form="approve" data-id="${j.id}">
      <p class="small muted">${esc(propById(j.prop).name)} · requested ${fmtDate(j.at)} via ${esc(j.via)}${j.note ? ` — “${esc(j.note)}”` : ''}</p>
      ${rs.length ? `<label class="field"><span>Assign room / bed</span><select class="input" name="room">${rs.map((r) => `<option value="${r.id}">${esc(r.name)} · ${roomFree(r)} free · ${peso(r.price)}/bed</option>`).join('')}</select></label>
      <label class="field"><span>Start date</span><input class="input" type="date" name="start" value="${TODAY}" required></label>
      <label class="check"><input type="checkbox" name="bill" checked> Generate first rent bill (due in 7 days)</label>
      ${note('Approval gives this tenant access to the property’s announcements and <b>only their own</b> bills and tickets.')}
      <div class="modal-foot"><button class="btn ghost" type="button" data-act="close-modal">Cancel</button><button class="btn primary" type="submit">${icon('check')}Approve</button></div>`
      : note('No free beds in this property. Free up a bed or add a room first.', 'warn', 'alert')}</form>`);
  },
  'reject-join': (d) => {
    const j = S.joinRequests.find((x) => x.id === d.id);
    j.status = 'Rejected';
    audit(`Rejected join request from ${j.name} (${propById(j.prop).name})`);
    if (j.userId) notify('tenant', `Your request to join ${propById(j.prop).name} was not approved`, 'join', j.userId);
    commit(); toast(`Request from ${j.name} rejected`);
  },
  'new-invite': () => openModal('New invite', `<form class="stack" data-form="invite"><label class="field"><span>Property</span><select class="input" name="prop">${propOptions('p1')}</select></label>
    <label class="field"><span>Expires after</span><select class="input" name="days"><option value="3">3 days</option><option value="7" selected>7 days</option><option value="14">14 days</option></select></label>
    ${note('Share the QR code or link only with people who agreed to rent. Scanning sends a join request — it never grants access automatically.')}
    <div class="modal-foot"><button class="btn ghost" type="button" data-act="close-modal">Cancel</button><button class="btn primary" type="submit">${icon('qr')}Generate</button></div></form>`),
  'show-invite': (d) => showInvite(S.invites.find((i) => i.id === d.id)),
  'revoke-invite': (d) => { const i = S.invites.find((x) => x.id === d.id); i.status = 'Revoked'; audit(`Revoked invite ${i.code}`); closeModal(); commit(); toast(`Invite ${i.code} revoked`); },
  'copy-link': (d) => { try { navigator.clipboard.writeText(d.link); } catch { /* clipboard blocked */ } toast('Invite link copied'); },
  'tenant-detail': (d) => {
    const t = tenantById(d.id);
    const inv = S.invoices.filter((i) => i.tenant === t.id);
    openModal(esc(t.name), `<div class="li">${avatar(t.name, 'lg')}<div class="body"><b>${esc(t.name)}</b><small>${esc(t.email)} · ${esc(t.phone)}</small><small>${esc(propById(t.prop).name)} · ${esc(roomById(t.room).name)} · since ${fmtDate(t.start)}</small></div>${chip(t.status === 'active' ? 'Active' : 'Archived')}</div>
      <div class="table-wrap"><table><thead><tr><th>Bill</th><th class="right">Amount</th><th>Status</th></tr></thead><tbody>${inv.map((i) => `<tr><td>${esc(i.label)}</td><td class="right num">${peso(invTotal(i))}</td><td>${chip(invStatus(i))}</td></tr>`).join('')}</tbody></table></div>
      ${note('Data minimization: only contact details needed for the tenancy are stored. Other tenants never see this record.', '', 'lock')}`, { wide: true });
  },
  'move-out': (d) => {
    const t = tenantById(d.id);
    openModal(`Move out ${esc(t.name)}?`, `<p>The tenancy is archived and the bed becomes available. Bills and history are kept under the retention policy. Archived tenants don't count toward your plan.</p>
      <div class="modal-foot"><button class="btn ghost" data-act="close-modal">Cancel</button><button class="btn danger" data-act="do-move-out" data-id="${t.id}">Archive tenancy</button></div>`);
  },
  'do-move-out': (d) => { const t = tenantById(d.id); t.status = 'archived'; t.end = TODAY; audit(`Archived tenancy of ${t.name} (${roomById(t.room).name})`); closeModal(); commit(); toast(`${t.name} moved out — bed is now available`); },

  /* --- rent --- */
  'rent-tab': (d) => { S.ui.rentTab = d.tab; commit(); },
  'review-payment': (d) => {
    const i = S.invoices.find((x) => x.id === d.id);
    const p = i.payments.find((x) => !x.verified && !x.rejected);
    const t = tenantById(i.tenant);
    openModal('Review payment proof', `<div class="li">${avatar(t.name)}<div class="body"><b>${esc(t.name)}</b><small>${esc(i.label)} · balance ${peso(invBalance(i))}</small></div></div>
      <div class="grid"><div class="c-6" style="grid-column:span 6"><div class="photo hero-photo" style="${photoStyle(200)};height:180px;border-radius:14px">${icon('receipt')}</div><small class="muted">${esc(p.proof || 'proof.jpg')} (uploaded by tenant)</small></div>
      <div style="grid-column:span 6" class="list small"><div><span class="muted">Method</span><br><b>${esc(p.method)}</b></div><div><span class="muted">Reference no.</span><br><b class="code">${esc(p.ref || '—')}</b></div><div><span class="muted">Amount</span><br><b>${peso(p.amount)}</b></div><div><span class="muted">Date paid</span><br><b>${fmtDate(p.date)}</b></div></div></div>
      ${note('Check this reference in your own GCash / bank records before verifying. Screenshots are never treated as verified payment automatically.', 'warn', 'alert')}
      <div class="modal-foot"><button class="btn danger" data-act="decide-payment" data-id="${i.id}" data-d="reject">Reject</button><button class="btn primary" data-act="decide-payment" data-id="${i.id}" data-d="verify">${icon('check')}Verify & issue receipt</button></div>`, { wide: true });
  },
  'decide-payment': (d) => {
    const i = S.invoices.find((x) => x.id === d.id);
    const p = i.payments.find((x) => !x.verified && !x.rejected);
    const t = tenantById(i.tenant);
    if (d.d === 'verify') {
      p.verified = true; p.receipt = 'DC-2610-' + String(100 + S.invoices.flatMap((x) => x.payments).filter((x) => x.receipt).length);
      i.paid = round2((i.paid || 0) + p.amount);
      i.status = invBalance(i) <= 0 ? 'Paid' : 'Partially paid';
      audit(`Verified ${p.method} payment ${p.ref} of ${peso(p.amount)} from ${t.name}`);
      notify('tenant', `Payment of ${peso(p.amount)} for ${i.label} was verified — receipt ${p.receipt}`, 'bills', t.userId);
      toast('Payment verified — receipt issued');
    } else {
      p.rejected = true;
      i.status = (i.paid || 0) > 0 ? 'Partially paid' : 'Unpaid';
      audit(`Rejected payment proof ${p.ref} from ${t.name}`);
      notify('tenant', `Your payment proof for ${i.label} could not be verified. Please contact your manager.`, 'bills', t.userId);
      toast('Proof rejected — tenant notified');
    }
    closeModal(); commit();
  },
  'record-payment': (d) => {
    const opts = openInvoices().filter((i) => i.status !== 'Submitted for review');
    const sel = d.id ? S.invoices.find((x) => x.id === d.id) : opts[0];
    if (!sel) return toast('No open bills to record');
    openModal('Record payment', `<form class="stack" data-form="record">
      <label class="field"><span>Bill</span><select class="input" name="inv">${opts.map((i) => `<option value="${i.id}" ${i.id === sel.id ? 'selected' : ''}>${esc(tenantById(i.tenant).name)} — ${esc(i.label)} (${peso(invBalance(i))} due)</option>`).join('')}</select></label>
      <div class="form-grid"><label class="field"><span>Amount (₱)</span><input class="input" type="number" min="1" step="0.01" name="amount" value="${invBalance(sel)}" required></label>
      <label class="field"><span>Method</span><select class="input" name="method"><option>Cash</option><option>GCash</option><option>Bank transfer</option></select></label>
      <label class="field"><span>Reference no. (optional)</span><input class="input" name="ref"></label>
      <label class="field"><span>Date received</span><input class="input" type="date" name="date" value="${TODAY}"></label></div>
      ${note('Recording confirms you received the money. DormCare does not process funds in this MVP.')}
      <div class="modal-foot"><button class="btn ghost" type="button" data-act="close-modal">Cancel</button><button class="btn primary" type="submit">${icon('check')}Record & issue receipt</button></div></form>`);
  },
  receipt: (d) => {
    const i = S.invoices.find((x) => x.id === d.id);
    const t = tenantById(i.tenant);
    const pays = i.payments.filter((p) => p.verified);
    openModal('Acknowledgment receipt', `<div class="receipt"><div class="row between"><div class="brand" style="padding:0">${icon('home')}DormCare</div><span class="code">${esc(pays.at(-1)?.receipt || '')}</span></div>
      <p class="small muted" style="margin:8px 0 12px">${esc(propById(t.prop).name)} · ${esc(propById(t.prop).address)}</p>
      <div class="rrow"><span class="muted">Received from</span><b>${esc(t.name)}</b></div><div class="rrow"><span class="muted">For</span><span>${esc(i.label)}</span></div>
      ${pays.map((p) => `<div class="rrow"><span class="muted">${fmtDate(p.date)} · ${esc(p.method)}${p.ref ? ' · ' + esc(p.ref) : ''}</span><span>${peso(p.amount)}</span></div>`).join('')}
      <div class="rrow total"><span>Total received</span><span>${peso(i.paid)}</span></div><div class="rrow"><span class="muted">Remaining balance</span><span>${peso(invBalance(i))}</span></div>
      <p class="small muted" style="margin-top:10px">Acknowledged by ${esc(S.manager.name)}, property manager. This is a digital acknowledgment of payment recorded by the manager.</p></div>
      <div class="modal-foot"><button class="btn outline" data-act="print">Print / Save PDF</button></div>`);
  },
  print: () => window.print(),
  'remind-one': (d) => { const i = S.invoices.find((x) => x.id === d.id); const t = tenantById(i.tenant); notify('tenant', `Reminder: ${i.label} — ${peso(invBalance(i))} due ${fmtDate(i.due)}`, 'bills', t.userId); commit(); toast(`Reminder sent to ${t.name}`); },
  'send-reminders': () => {
    const due = openInvoices().filter((i) => i.kind === 'rent' && i.due >= TODAY && i.status !== 'Submitted for review');
    due.forEach((i) => { const t = tenantById(i.tenant); notify('tenant', `Reminder: ${i.label} — ${peso(invBalance(i))} due ${fmtDate(i.due)}`, 'bills', t.userId); });
    S.remindersSent = TODAY; audit(`Sent rent reminders to ${due.length} tenants`); commit(); toast(`In-app reminders sent to ${due.length} tenants`);
  },
  'gen-bills': () => {
    const ts = activeTenants();
    ts.forEach((t) => { const r = roomById(t.room); S.invoices.push({ id: uid('inv'), tenant: t.id, kind: 'rent', label: 'Rent – Nov 2026', period: 'Nov 2026', items: [{ label: `Monthly rent · ${r.name}`, amount: r.price }], due: t.prop === 'p1' ? '2026-11-15' : '2026-11-10', status: 'Unpaid', paid: 0, payments: [] }); notify('tenant', `New bill: Rent – Nov 2026 (${peso(r.price)})`, 'bills', t.userId); });
    audit(`Generated Nov 2026 rent bills for ${ts.length} tenants`); commit(); toast(`${ts.length} bills generated for Nov 2026`);
  },

  /* --- utilities --- */
  'util-detail': (d) => {
    const b = S.utilityBills.find((x) => x.id === d.id);
    const inv = S.invoices.filter((i) => i.utilityBill === b.id);
    openModal(`${esc(b.type)} · ${esc(b.period)}`, `<p class="small muted">${esc(propById(b.prop).name)} · bill total ${peso(b.total)} · issued ${fmtDate(b.issuedOn)} · due ${fmtDate(b.due)}</p>
      <div class="table-wrap"><table><thead><tr><th>Tenant</th><th>Basis</th><th class="right">Share</th><th>Status</th></tr></thead><tbody>${inv.map((i) => `<tr><td>${esc(tenantById(i.tenant).name)}</td><td class="small muted">${esc(i.basis)}</td><td class="right num">${peso(invTotal(i))}</td><td>${chip(invStatus(i))}</td></tr>`).join('')}</tbody></table></div>`, { wide: true });
  },

  /* --- maintenance --- */
  ticket: (d) => {
    const k = S.tickets.find((x) => x.id === d.id);
    const t = tenantById(k.tenant);
    const mgr = S.role === 'manager';
    openModal(esc(k.title), `<div class="row wrap">${chip(k.priority)}${chip(k.status)}<span class="small muted">${esc(k.category)} · ${esc(roomById(t.room).name)}, ${esc(propById(k.prop).name)} · ${esc(t.name)}</span></div>
      ${k.desc ? `<p>${esc(k.desc)}</p>` : ''}${k.photo ? `<p class="small muted">${icon('file')} ${esc(k.photo)}</p>` : ''}
      <ul class="timeline">${k.history.map((h) => `<li>${esc(h.text)}<small>${esc(h.at)}</small></li>`).join('')}</ul>
      ${mgr ? `<form class="stack" data-form="ticket-update" data-id="${k.id}"><div class="form-grid"><label class="field"><span>Update status</span><select class="input" name="status">${TICKET_STATUSES.map((s) => `<option ${s === k.status ? 'selected' : ''}>${s}</option>`).join('')}</select></label>
        <label class="field"><span>Note to tenant</span><input class="input" name="note" placeholder="e.g. Plumber arrives Thursday AM"></label></div>
        <div class="modal-foot"><button class="btn primary" type="submit">Save update</button></div></form>` : ''}`, { wide: true });
  },
  'new-ticket': () => openModal('New maintenance request', `<form class="stack" data-form="ticket">
    ${note('Emergency? Call <b>911</b>. DormCare does not dispatch emergency responders.', 'bad', 'alert')}
    <div class="form-grid"><label class="field"><span>Category</span><select class="input" name="category">${['Plumbing', 'Electrical', 'Internet', 'Furniture', 'Pest control', 'Cleaning', 'Security', 'Other'].map((c) => `<option>${c}</option>`).join('')}</select></label>
    <label class="field"><span>Priority</span><select class="input" name="priority"><option>Low</option><option selected>Medium</option><option>High</option></select></label>
    <label class="field full"><span>Title</span><input class="input" name="title" required placeholder="e.g. Clogged sink in shared kitchen"></label>
    <label class="field full"><span>Description</span><textarea class="input" name="desc" placeholder="Where is it, and since when?"></textarea></label>
    <label class="field full"><span>Photo (optional)</span><input class="input" type="file" name="photo" accept="image/*"></label></div>
    <div class="modal-foot"><button class="btn ghost" type="button" data-act="close-modal">Cancel</button><button class="btn primary" type="submit">${icon('send')}Submit request</button></div></form>`),

  /* --- tenant payments --- */
  pay: (d) => {
    const t = myTenancy();
    if (!t) return;
    const opts = S.invoices.filter((i) => i.tenant === t.id && invBalance(i) > 0 && i.status !== 'Submitted for review');
    if (!opts.length) return toast('Nothing to pay right now');
    const sel = (d.id && opts.find((i) => i.id === d.id)) || opts[0];
    openModal('Submit payment proof', `<form class="stack" data-form="pay">
      <label class="field"><span>Bill</span><select class="input" name="inv">${opts.map((i) => `<option value="${i.id}" ${i.id === sel.id ? 'selected' : ''}>${esc(i.label)} — ${peso(invBalance(i))} due ${fmtShort(i.due)}</option>`).join('')}</select></label>
      <div class="form-grid"><label class="field"><span>Paid via</span><select class="input" name="method"><option>GCash</option><option>Bank transfer</option><option>Cash</option></select></label>
      <label class="field"><span>Amount (₱)</span><input class="input" type="number" min="1" step="0.01" name="amount" value="${invBalance(sel)}" required></label>
      <label class="field"><span>Reference no.</span><input class="input" name="ref" placeholder="GCash / bank reference"></label>
      <label class="field"><span>Date paid</span><input class="input" type="date" name="date" value="${TODAY}"></label>
      <label class="field full"><span>Proof (screenshot or photo)</span><input class="input" type="file" name="proof" accept="image/*,.pdf"></label></div>
      ${note('Send the payment to your manager first — DormCare does not process funds. Your manager verifies the proof and issues a receipt.')}
      <div class="modal-foot"><button class="btn ghost" type="button" data-act="close-modal">Cancel</button><button class="btn primary" type="submit">${icon('upload')}Submit for review</button></div></form>`);
  },

  /* --- listings --- */
  'toggle-listing': (d) => { const p = propById(d.id); p.listed = !p.listed; audit(`${p.listed ? 'Published' : 'Paused'} listing for ${p.name}`); commit(); toast(p.listed ? 'Listing is live on Explore Rentals' : 'Listing paused'); },
  'listing-detail': (d) => {
    const l = publicListings().find((x) => x.id === d.id) || (() => { const p = propById(d.id); const rs = S.rooms.filter((r) => r.prop === p.id); return { ...p, prop: p.id, price: Math.min(...rs.map((r) => r.price)), avail: beds(p.id).avail, manager: S.manager.name, rooms: rs }; })();
    openModal(esc(l.name), `<div class="photo hero-photo" style="${photoStyle(l.hue)}">${icon('building')}${verifiedBadge()}<span class="price-tag">from ${peso(l.price)}/mo</span></div>
      <div class="row wrap small"><span class="row" style="gap:4px">${icon('pin')}${esc(l.area)}, Iloilo City (approximate)</span>·<span>${esc(l.type)}</span>·<b style="color:var(--g700)">${l.avail} available</b></div>
      <div class="grid"><div style="grid-column:span 6"><b class="small">Amenities</b><div class="tags" style="margin-top:6px">${l.amenities.map((a) => `<span class="tag">${esc(a)}</span>`).join('')}</div>
        <b class="small" style="display:block;margin-top:12px">Deposit & fees</b><p class="small muted">${esc(l.deposit)}</p></div>
        <div style="grid-column:span 6"><b class="small">House rules</b><ul class="small muted" style="margin:6px 0 0;padding-left:18px">${l.rules.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
        ${l.rooms ? `<b class="small" style="display:block;margin-top:12px">Pricing</b><p class="small muted">${[...new Set(l.rooms.map((r) => `${r.beds}-bed room · ${peso(r.price)}/bed`))].join('<br>')}</p>` : ''}</div></div>
      ${note(`Managed by <b>${esc(l.manager)}</b>. DormCare reviewed this manager's identity, authority and submitted permits. The badge is not a guarantee of safety or listing accuracy — details are owner-provided.`, '', 'shield')}
      <form class="stack" data-form="inquire" data-id="${l.id}"><label class="field"><span>Send an inquiry</span><textarea class="input" name="msg" required placeholder="Hi! Is a bed available next month? When can I visit?"></textarea></label>
      <div class="modal-foot"><button class="btn ghost" type="button" data-act="report-listing" data-id="${l.id}">${icon('flag')}Report listing</button><button class="btn primary" type="submit">${icon('send')}Send inquiry</button></div></form>`, { wide: true });
  },
  'report-listing': (d) => {
    openModal('Report this listing', `<form class="stack" data-form="report" data-id="${d.id}"><label class="field"><span>Reason</span><select class="input" name="kind"><option>Misleading price or details</option><option>Duplicate listing</option><option>Suspicious / possible scam</option><option>Property no longer available</option></select></label>
      <label class="field"><span>Details</span><textarea class="input" name="details" placeholder="What did you notice?"></textarea></label>
      <div class="modal-foot"><button class="btn ghost" type="button" data-act="close-modal">Cancel</button><button class="btn danger" type="submit">Submit report</button></div></form>`);
  },
  'reply-inquiry': (d) => {
    const q = S.inquiries.find((x) => x.id === d.id);
    openModal(`Reply to ${esc(q.name)}`, `<p class="small muted">“${esc(q.msg)}”</p><form class="stack" data-form="reply" data-id="${q.id}"><textarea class="input" name="reply" required placeholder="Write your reply…"></textarea>
      <div class="modal-foot"><button class="btn primary" type="submit">${icon('send')}Send reply</button></div></form>`);
  },
  'del-announce': (d) => { S.announcements = S.announcements.filter((a) => a.id !== d.id); commit(); toast('Announcement removed'); },

  /* --- verification --- */
  'submit-verif': (d) => { const p = propById(d.id); p.verification = 'Pending'; p.submittedOn = TODAY; p.note = ''; audit(`Submitted ${p.name} for verification`); notify('admin', `${p.name} submitted documents for verification`, 'queue'); commit(); toast('Submitted — DormCare will review your documents'); },
  'view-doc': (d) => {
    const p = propById(d.id); const doc = p.docs[+d.idx];
    audit(`Viewed ${doc.type} for ${p.name} (restricted access)`);
    save();
    openModal(`${esc(doc.type)}`, `<div class="photo hero-photo" style="background:repeating-linear-gradient(135deg,#eef1ef 0 10px,#e4e8e5 10px 20px);color:var(--muted)">${icon('lock')}</div>
      <p class="small"><b>${esc(doc.file)}</b> · ${esc(p.name)} · ${esc(ownerName(p))}${doc.expires ? ' · expires ' + fmtDate(doc.expires) : ''}</p>
      ${note('Secure preview (simulated). This access has been recorded in the audit log. Never download or share applicant documents outside the review workflow.', '', 'lock')}`);
  },
  'verif-decide': (d) => {
    const p = propById(d.id);
    if (d.d === 'Verified') return decideVerification(p, 'Verified', '');
    openModal(`${d.d === 'Rejected' ? 'Reject' : 'Request correction'} — ${esc(p.name)}`, `<form class="stack" data-form="verif-note" data-id="${p.id}" data-d="${d.d}"><label class="field"><span>Note to manager (required)</span><textarea class="input" name="note" required placeholder="${p.docs.some((x) => x.status === 'Missing') ? "Business / Mayor's Permit is missing." : 'Explain what needs to change'}"></textarea></label>
      <div class="modal-foot"><button class="btn ghost" type="button" data-act="close-modal">Cancel</button><button class="btn ${d.d === 'Rejected' ? 'danger' : 'primary'}" type="submit">Send decision</button></div></form>`);
  },
  'report-decide': (d) => {
    const r = S.reports.find((x) => x.id === d.id);
    r.status = d.d;
    if (d.d === 'Suspended') {
      const m = S.market.find((x) => x.id === r.listing);
      if (m) m.suspended = true;
      const p = propById(r.listing);
      if (p) { p.listed = false; notify('manager', `Your listing ${p.name} was suspended after a report. Contact DormCare to appeal.`, 'listings'); }
    }
    audit(`${d.d === 'Suspended' ? 'Suspended listing' : 'Dismissed report'} for ${r.listing}`);
    commit(); toast(d.d === 'Suspended' ? 'Listing suspended' : 'Report dismissed');
  },

  /* --- subscription --- */
  'set-plan': (d) => { const p = PLANS.find((x) => x.id === d.id); S.plan = p.id; audit(`Changed plan to ${p.name}`); closeModal(); commit(); toast(`Plan changed to ${p.name}`); },
};

function upgradePrompt() {
  const n = activeTenants().length;
  const next = PLANS.find((p) => p.max >= n + 1);
  openModal('Upgrade needed', `<p>You have <b>${n}</b> active tenants — the limit of the <b>${plan().name}</b> plan. Upgrade before adding another active tenant. Existing records and access are never removed.</p>
    <div class="plan current"><b>${next.name}</b><div class="price">${peso(next.price)}<small> /month</small></div><small class="muted">${next.min}–${next.max === Infinity ? '∞' : next.max} active tenants</small></div>
    <div class="modal-foot"><button class="btn ghost" data-act="close-modal">Not now</button><button class="btn primary" data-act="set-plan" data-id="${next.id}">Upgrade to ${next.name}</button></div>`);
}
function showInvite(inv) {
  const link = `https://dormcare.ph/join/${inv.code}`;
  openModal('Tenant invite', `<div class="qr-box">${qrSvg(inv.code)}<div class="stack" style="gap:8px"><b>${esc(propById(inv.prop).name)}</b><span class="small">Code <span class="code">${esc(inv.code)}</span></span>
    <span class="small muted">Expires ${fmtDate(inv.expires)} · ${inv.uses} request(s)</span><span class="small code" style="word-break:break-all">${esc(link)}</span>
    <div class="row wrap"><button class="btn sm outline" data-act="copy-link" data-link="${esc(link)}">Copy link</button><button class="btn sm danger" data-act="revoke-invite" data-id="${inv.id}">Revoke</button></div></div></div>
    ${note('Print this QR for your lobby or send the link privately. Every scan creates a join request that you approve.')}`);
}
function decideVerification(p, status, noteText) {
  p.verification = status; p.note = noteText;
  if (status === 'Verified') { p.verifiedOn = TODAY; p.docs.forEach((d) => { if (d.status === 'Submitted') d.status = 'Approved'; }); }
  if (status !== 'Verified') p.docs.forEach((d) => { if (d.status === 'Submitted') d.status = status === 'Rejected' ? 'Rejected' : 'Submitted'; });
  audit(`${status === 'Verified' ? 'Approved' : status === 'Rejected' ? 'Rejected' : 'Requested correction for'} verification of ${p.name}${noteText ? ' — ' + noteText : ''}`);
  if (p.owner === 'm1') notify('manager', status === 'Verified' ? `${p.name} is verified! You can now publish its listing.` : `${p.name}: ${status}. ${noteText}`, status === 'Verified' ? 'listings' : 'verification');
  closeModal(); commit(); toast(`${p.name}: ${status}`);
}

/* =========================================================================
   Forms (submit)
   ========================================================================= */
const F = {
  'add-property': (v) => {
    const id = uid('p');
    S.properties.push({ id, owner: 'm1', name: v.name, type: v.type, area: v.area, address: `${v.address}, ${v.area}, Iloilo City`, verification: 'Draft', listed: false, hue: Math.floor(Math.random() * 360),
      deposit: '1 month deposit', amenities: ['Wi-Fi'], rules: [], note: '',
      docs: ['Government-issued ID', "Business / Mayor's Permit", 'Permit to operate / property registration', 'Proof of ownership or authorization'].map((type) => ({ type, status: 'Missing' })) });
    audit(`Created property draft ${v.name}`); closeModal(); commit(); go('properties'); toast('Property created — add rooms and upload documents');
  },
  room: (v, f) => {
    const nums = ['beds', 'price', 'reserved', 'unavailable'].reduce((o, k) => ({ ...o, [k]: Math.max(0, Number(v[k]) || 0) }), {});
    const existing = f.dataset.id ? roomById(f.dataset.id) : null;
    const occ = existing ? roomOcc(existing) : 0;
    if (nums.beds < occ + nums.reserved + nums.unavailable) return toast(`Capacity too small: ${occ} occupied + ${nums.reserved} reserved + ${nums.unavailable} unavailable`);
    if (existing) Object.assign(existing, { name: v.name, ...nums });
    else S.rooms.push({ id: uid('r'), prop: f.dataset.prop, name: v.name, ...nums });
    closeModal(); commit(); toast('Room saved');
  },
  approve: (v, f) => {
    const j = S.joinRequests.find((x) => x.id === f.dataset.id);
    const r = roomById(v.room);
    const t = { id: uid('t'), userId: j.userId || null, name: j.name, email: j.email, phone: '—', prop: j.prop, room: r.id, start: v.start, status: 'active' };
    S.tenants.push(t);
    j.status = 'Approved';
    if (v.bill) S.invoices.push({ id: uid('inv'), tenant: t.id, kind: 'rent', label: 'Rent – first month', period: 'Oct 2026', items: [{ label: `Monthly rent · ${r.name}`, amount: r.price }], due: addDays(v.start, 7), status: 'Unpaid', paid: 0, payments: [] });
    audit(`Approved ${j.name} into ${propById(j.prop).name}, ${r.name}`);
    if (j.userId) notify('tenant', `Welcome! Your request to join ${propById(j.prop).name} was approved — ${r.name}`, 'mydorm', j.userId);
    closeModal(); commit(); toast(`${j.name} approved and assigned to ${r.name}`);
  },
  invite: (v) => {
    const prefix = propById(v.prop).name.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase();
    const code = `${prefix}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const inv = { id: uid('i'), code, prop: v.prop, created: TODAY, expires: addDays(TODAY, Number(v.days)), status: 'Active', uses: 0 };
    S.invites.unshift(inv); audit(`Created invite ${code} for ${propById(v.prop).name}`); save(); render(); showInvite(inv);
  },
  record: (v) => {
    const i = S.invoices.find((x) => x.id === v.inv);
    const amt = Math.min(Number(v.amount), invBalance(i));
    if (!(amt > 0)) return toast('Enter a valid amount');
    const receipt = 'DC-2610-' + String(200 + S.invoices.flatMap((x) => x.payments).filter((x) => x.receipt).length);
    i.payments.push({ id: uid('pay'), amount: amt, method: v.method, ref: v.ref, date: v.date, verified: true, receipt });
    i.paid = round2((i.paid || 0) + amt);
    i.status = invBalance(i) <= 0 ? 'Paid' : 'Partially paid';
    const t = tenantById(i.tenant);
    audit(`Recorded ${v.method} payment of ${peso(amt)} from ${t.name} (${i.label})`);
    notify('tenant', `Payment of ${peso(amt)} for ${i.label} recorded — receipt ${receipt}`, 'bills', t.userId);
    closeModal(); commit(); toast(`Payment recorded — receipt ${receipt}`);
  },
  'issue-util': () => {
    const u = S.ui.util;
    const rows = allocate(u);
    if (!rows.length) return toast('Enter a bill total first');
    const id = uid('ub');
    S.utilityBills.unshift({ id, prop: u.prop, type: u.type, period: u.period, total: Number(u.total), method: u.method, issuedOn: TODAY, due: u.due, count: rows.length });
    rows.forEach((r) => {
      S.invoices.push({ id: uid('inv'), tenant: r.t.id, kind: 'utility', label: `${u.type} – ${u.period}`, period: u.period, utilityBill: id, items: [{ label: `${u.type} share`, amount: r.amount }], basis: r.basis, due: u.due, status: 'Unpaid', paid: 0, payments: [] });
      notify('tenant', `New ${u.type.toLowerCase()} charge for ${u.period}: ${peso(r.amount)} — see the breakdown`, 'bills', r.t.userId);
    });
    audit(`Issued ${u.type} ${u.period} allocation (${peso(u.total)}, ${u.method}) to ${rows.length} tenants`);
    S.ui.util = { ...u, total: '', meters: {} };
    commit(); toast(`Charges issued to ${rows.length} tenants`);
  },
  'ticket-update': (v, f) => {
    const k = S.tickets.find((x) => x.id === f.dataset.id);
    const changed = v.status !== k.status;
    if (!changed && !v.note) return toast('Nothing to update');
    k.status = v.status;
    k.history.push({ at: nowStamp(), text: `${changed ? v.status : 'Update'}${v.note ? ' — ' + v.note : ''}` });
    notify('tenant', `Maintenance update: "${k.title}" is now ${k.status}`, 'tickets', tenantById(k.tenant).userId);
    closeModal(); commit(); toast('Ticket updated — tenant notified');
  },
  ticket: (v, f) => {
    const t = myTenancy();
    const photo = f.querySelector('[name=photo]').files[0];
    const k = { id: uid('k'), tenant: t.id, prop: t.prop, category: v.category, title: v.title, desc: v.desc, priority: v.priority, status: 'Submitted', created: TODAY, photo: photo ? photo.name : '', history: [{ at: nowStamp(), text: 'Ticket submitted by tenant' }] };
    S.tickets.unshift(k);
    notify('manager', `New ${v.priority.toLowerCase()}-priority ticket from ${t.name}: ${v.title}`, 'maintenance');
    closeModal(); commit(); toast('Request submitted — your manager has been notified');
  },
  pay: (v, f) => {
    const i = S.invoices.find((x) => x.id === v.inv);
    const t = tenantById(i.tenant);
    const proof = f.querySelector('[name=proof]').files[0];
    i.payments.push({ id: uid('pay'), amount: Number(v.amount), method: v.method, ref: v.ref, date: v.date, verified: false, proof: proof ? proof.name : 'no-file-attached' });
    i.status = 'Submitted for review';
    notify('manager', `Payment proof submitted by ${t.name} (${i.label})`, 'rent');
    closeModal(); commit(); toast('Submitted — waiting for manager verification');
  },
  announce: (v) => {
    const props = v.prop ? [v.prop] : myProps().map((p) => p.id);
    props.forEach((pid) => {
      const a = { id: uid('a'), prop: pid, title: v.title, body: v.body, date: TODAY };
      S.announcements.unshift(a);
      if (Broker.available) {  // one message on the property's topic reaches every tenant subscribed to it
        Broker.publish(`${propSlug(pid)}.announcements`, { kind: 'announcement', ...a, property: propById(pid).name,
          text: `New announcement: ${v.title}`, to: 'notices' })
          .catch(() => toast('Announcement saved, but the broker is not reachable, so tenants were not alerted'));
      } else {
        activeTenants(pid).forEach((t) => notify('tenant', `New announcement: ${v.title}`, 'notices', t.userId));
      }
    });
    commit(); toast(`Posted to ${props.length === 1 ? propById(props[0]).name : 'all properties'}${Broker.available ? ' and published to the broker' : ''}${v.email ? ' + email copies queued' : ''}`);
  },
  join: (v) => {
    const code = v.code.trim().toUpperCase();
    const inv = S.invites.find((i) => i.code === code);
    if (!inv) return toast('Invite code not found');
    if (inv.status !== 'Active' || inv.expires < TODAY) return toast('This invite has expired or was revoked — ask your manager for a new one');
    const t = myTenancy();
    if (t && t.prop === inv.prop) return toast('You are already a member of this property');
    if (S.joinRequests.some((j) => j.userId === S.persona && j.prop === inv.prop && j.status === 'Pending')) return toast('You already have a pending request');
    const me = persona();
    S.joinRequests.unshift({ id: uid('j'), userId: me.id, name: me.name, email: me.email, prop: inv.prop, via: 'Invite code', at: TODAY, note: v.note, status: 'Pending' });
    inv.uses++;
    notify('manager', `New join request from ${me.name} via invite code`, 'tenants');
    commit(); toast('Request sent — your manager will review it');
  },
  inquire: (v, f) => {
    const l = publicListings().find((x) => x.id === f.dataset.id) || propById(f.dataset.id);
    const who = S.role === 'tenant' ? persona().name : S.role === 'admin' ? 'DormCare Admin' : 'Guest renter';
    if (propById(f.dataset.id)) {
      S.inquiries.unshift({ id: uid('q'), listing: f.dataset.id, name: who, msg: v.msg, at: TODAY, status: 'New' });
      notify('manager', `New inquiry from ${who} on ${l.name}`, 'listings');
    }
    closeModal(); commit(); toast(`Inquiry sent to ${l.manager || S.manager.name}`);
  },
  reply: (v, f) => { const q = S.inquiries.find((x) => x.id === f.dataset.id); q.reply = v.reply; q.status = 'Replied'; closeModal(); commit(); toast('Reply sent'); },
  report: (v, f) => {
    S.reports.unshift({ id: uid('rp'), listing: f.dataset.id, reason: `${v.kind}${v.details ? ': ' + v.details : ''}`, by: S.role === 'tenant' ? 'Registered renter' : 'Guest', at: TODAY, status: 'Open' });
    notify('admin', 'New listing report received', 'reports'); closeModal(); commit(); toast('Report submitted to DormCare moderators');
  },
  'verif-note': (v, f) => decideVerification(propById(f.dataset.id), f.dataset.d, v.note),
  chat: (v, f) => {
    const text = (v.text || '').trim();
    if (!text) return;
    Chat.send(f.dataset.thread, text);
    (S.ui.chatDraft ||= {})[f.dataset.thread] = '';
    commit();
    $('#chat-input')?.focus();
  },
};

/* =========================================================================
   Live alerts through the DormCare Live Alerts publish-subscribe broker
   When this page is served by `python -m pubsub.webapp`, every notify() is
   published to the real broker, and each user's bell is filled from their
   own durable subscription (delivered over server-sent events, ACKed after
   saving). Opened any other way, the prototype keeps its local behaviour.
   ========================================================================= */
const PROP_SLUGS = { p1: 'casa-jaro', p2: 'molo-hub', px1: 'tagbak' };
function propSlug(pid) {
  if (PROP_SLUGS[pid]) return PROP_SLUGS[pid];
  const p = propById(pid);
  return (p ? p.name : String(pid)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'property';
}
async function brokerPost(path, body) {
  const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

const Broker = {
  available: false,   // true when the page is served by the broker gateway
  state: 'off',       // 'connecting' | 'live' | 'offline'
  info: null, source: null, viewer: null, viewKey: '', provisionKey: '', connectedAt: 0, burst: [], burstTimer: null,

  // Every DormCare user is a durable subscriber. Personal alerts use a per-user topic (privacy rule:
  // tenants never see each other's records); notices use the property's topic.
  identities() {
    const list = [
      // The manager is in every tenant's conversation (chat.<user>); each tenant only in their own.
      { client: 'web-manager-m1', role: 'manager', userId: null, label: S.manager.name,
        topics: ['manager.m1', ...S.personas.map((p) => Chat.topic(p.id))] },
      { client: 'web-admin', role: 'admin', userId: null, label: S.admin.name, topics: ['dormcare.admin'] },
    ];
    S.personas.forEach((p) => {
      const t = S.tenants.find((x) => x.userId === p.id && x.status === 'active');
      list.push({ client: `web-tenant-${p.id}`, role: 'tenant', userId: p.id, label: p.name,
        topics: [`tenant.${p.id}`, Chat.topic(p.id), ...(t ? [`${propSlug(t.prop)}.announcements`] : [])] });
    });
    return list;
  },
  current() {
    const ids = this.identities();
    return S.role === 'tenant' ? ids.find((i) => i.userId === S.persona) : ids.find((i) => i.role === S.role);
  },
  topicFor(role, userId) {
    if (role === 'tenant') return userId ? `tenant.${userId}` : null;
    return role === 'manager' ? 'manager.m1' : 'dormcare.admin';
  },

  async init() {
    try {
      const res = await fetch('/broker/info', { cache: 'no-store' });
      if (!res.ok) return;
      this.info = await res.json();
      this.available = true;
      render();
    } catch { /* not served by the broker gateway: keep local notifications */ }
  },
  // Called after every render: keeps subscriptions and the live stream in step with who is viewing.
  sync() {
    if (!this.available) return;
    const ids = this.identities();
    const pkey = JSON.stringify(ids.map((i) => [i.client, i.topics]));
    if (pkey !== this.provisionKey) {
      this.provisionKey = pkey;
      brokerPost('/broker/provision', { subscriptions: ids.map(({ client, topics }) => ({ client, topics })) })
        .catch(() => { this.provisionKey = ''; });
    }
    const me = this.current();
    const vkey = me ? `${me.client}|${me.topics.join(',')}` : '';
    if (me && vkey !== this.viewKey) { this.viewKey = vkey; this.open(me); }
  },
  open(me) {
    if (this.source) this.source.close();
    this.viewer = me;
    this.connectedAt = Infinity;  // until the server says when this view attached
    this.setState('connecting');
    this.source = new EventSource(`/broker/stream?${new URLSearchParams({ client: me.client, topics: me.topics.join(',') })}`);
    this.source.onmessage = (e) => this.onEvent(JSON.parse(e.data));
    this.source.onerror = () => this.setState('offline');
  },
  setState(state) {
    if (this.state === state) return;
    this.state = state;
    const top = $('#topbar');
    if (top) top.innerHTML = topbarHtml();
  },
  onEvent(ev) {
    // Anything published before this view attached (or before the latest reconnection) waited at the broker.
    if (ev.type === 'hello') this.connectedAt = ev.attached_at;
    else if (ev.type === 'ready') {
      this.connectedAt = Math.max(this.connectedAt, ev.connected_at);
      this.setState('live');
      // (Re)connected: register every user's subscriptions again, in case an earlier attempt happened while the
      // broker was down, then send any chat messages that could not be sent.
      this.provisionKey = '';
      this.sync();
      if (this.viewer) Chat.retryFailed(this.viewer.role);
    }
    else if (ev.type === 'offline') this.setState('offline');
    else if (ev.type === 'deliver') this.deliver(ev);
  },

  // Messages already processed for a subscriber: a re-sent message is ACKed again but not shown twice.
  // The key is seq + published_at, because seq alone starts again at 1 when the broker's database is reset.
  seen(client) {
    try { return JSON.parse(localStorage.getItem(`dormcare-broker-seen:${client}`)) || []; } catch { return []; }
  },
  remember(client, key) {
    const list = this.seen(client).concat(key).slice(-300);
    try { localStorage.setItem(`dormcare-broker-seen:${client}`, JSON.stringify(list)); } catch { /* storage unavailable */ }
  },
  deliver(m) {
    const me = this.viewer;
    if (!me) return;
    const p = m.payload || {};
    const key = `${m.seq}-${m.published_at}`;
    const isNew = !this.seen(me.client).includes(key);
    // Any client can publish any payload, and ids end up inside HTML attributes: accept only plain ids.
    // Anything else is still shown, as an ordinary alert (its text is always escaped).
    const plainId = (v) => typeof v === 'string' && /^[\w-]{1,64}$/.test(v);
    const isChat = p.kind === 'chat' && plainId(p.id) && S.personas.some((x) => x.id === p.thread);
    const isAnnouncement = p.kind === 'announcement' && plainId(p.id) && !!propById(p.prop);
    if (isChat && isNew) {
      const r = Chat.receive(p, m, me);  // goes into the conversation, not the bell
      this.remember(me.client, key);
      save(); render();
      if (r.incoming && !r.viewing) this.announce(`Message from ${r.name}: ${r.text}`, r.queued);
    } else if (isNew) {
      if (isAnnouncement && !S.announcements.some((a) => a.id === p.id)) {
        S.announcements.unshift({ id: p.id, prop: p.prop, title: p.title, body: p.body || '', date: p.date || TODAY });
      }
      const queued = m.published_at < this.connectedAt;
      const text = p.text || p.title || 'New message';
      // The id follows from the message, so two windows that both receive it store one alert, not two.
      S.notifs.unshift({ id: `b-${me.client}-${key}`, role: me.role, userId: me.userId, text, at: nowStamp(), read: false,
        to: p.to || null, broker: { seq: m.seq, topic: m.topic, queued } });
      this.remember(me.client, key);
      save(); render();
      this.announce(text, queued);
    }
    brokerPost('/broker/ack', { client: me.client, seq: m.seq }).catch(() => { /* the broker will send it again */ });
  },
  announce(text, queued) {  // one toast per burst, so catching up on 4 alerts is one message
    this.burst.push({ text, queued });
    clearTimeout(this.burstTimer);
    this.burstTimer = setTimeout(() => {
      const b = this.burst; this.burst = [];
      if (b.length === 1) toast(b[0].queued ? `Was waiting at the broker: ${b[0].text}` : `New alert: ${b[0].text}`);
      else toast(`${b.length} alerts delivered${b.some((x) => x.queued) ? ' from your queue at the broker' : ''}`);
    }, 400);
  },

  publish(topic, payload) { return brokerPost('/broker/publish', { role: S.role, topic, payload }); },
  notify(role, text, to, userId) {
    const topic = this.topicFor(role, userId);
    if (!topic) return;  // a tenant without an app account: nobody could receive it
    this.publish(topic, { kind: 'notification', title: text, text, to: to || null, role, userId: userId || null, from: actorName() })
      .catch(() => {  // broker unreachable: keep the alert locally so nothing is lost in the prototype
        S.notifs.unshift({ id: uid('n'), role, userId: userId || null, text, at: nowStamp(), read: false, to });
        save(); render();
      });
  },

  pill() {
    if (!this.available) return '';
    const label = { live: 'Live alerts', connecting: 'Connecting…', offline: 'Broker offline', off: 'Live alerts' }[this.state];
    return `<button class="live-pill ${this.state}" data-act="broker-info" aria-label="Live alerts: ${label}"><span class="dot"></span><span class="lbl">${label}</span></button>`;
  },
  details() {
    const me = this.current();
    const rows = this.identities().map((i) => `<div class="li"><span class="sq-ic">${icon(i.role === 'tenant' ? 'home' : i.role === 'admin' ? 'shield' : 'building')}</span><div class="body"><b>${esc(i.label)}${i.client === me?.client ? ' (viewing now)' : ''}</b><small style="white-space:normal"><span class="code">${esc(i.client)}</span> subscribes to ${i.topics.map((t) => `<span class="code">${esc(t)}</span>`).join(', ')}</small></div></div>`).join('');
    const stateText = { live: 'Connected: alerts arrive live.', connecting: 'Connecting to the broker…', offline: 'The broker is not reachable. Alerts are kept locally until it is back.', off: '' }[this.state];
    openModal('Live alerts', `<p>Notifications in this DormCare demo travel through the publish-subscribe broker on port ${esc(this.info?.broker_port)}. ${stateText}</p>
      <div class="list mt">${rows}</div>
      ${note('Messages for users who are not on screen wait in their queue at the broker. Switch role or tenant to receive them, or open a second window (for example <span class="code">?role=tenant</span>) to see them arrive live.')}`, { wide: true });
  },
};

/* =========================================================================
   Event wiring
   ========================================================================= */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el) {
    if ((S.ui.bell || S.ui.profileMenu) && !e.target.closest('.dropdown')) { S.ui.bell = false; S.ui.profileMenu = false; render(); }
    return;
  }
  const fn = A[el.dataset.act];
  if (!fn) return;
  e.preventDefault();
  if (!['toggle-bell', 'toggle-profile', 'read-all'].includes(el.dataset.act)) { S.ui.bell = false; S.ui.profileMenu = false; }
  fn({ ...el.dataset }, el, e);
});
document.addEventListener('submit', (e) => {
  const f = e.target.closest('form[data-form]');
  if (!f) return;
  e.preventDefault();
  const data = Object.fromEntries(new FormData(f));
  for (const k in data) if (data[k] instanceof File) delete data[k];
  F[f.dataset.form]?.(data, f);
});
document.addEventListener('input', (e) => {
  const t = e.target;
  if (t.id === 'chat-input') { (S.ui.chatDraft ||= {})[t.dataset.thread] = t.value; return; }
  if (t.id === 'tenant-q') { S.ui.tq = t.value; $('#tenant-rows').innerHTML = tenantRows(); return; }
  if (t.dataset.ex) { S.ui.ex[t.dataset.ex] = t.value; $('#ex-results').innerHTML = exploreResults(); save(); return; }
  const live = t.closest('form[data-live="util"]');
  if (live) {
    const u = S.ui.util;
    const before = u.prop + u.method;
    const fd = new FormData(live);
    ['prop', 'type', 'period', 'total', 'due', 'method'].forEach((k) => { if (fd.has(k)) u[k] = fd.get(k); });
    live.querySelectorAll('[name^="m_"]').forEach((m) => { u.meters[m.name.slice(2)] = m.value; });
    if (u.prop + u.method !== before) $('#util-dyn').innerHTML = utilDyn();
    else $('#util-preview').innerHTML = utilPreview();
    save();
  }
});
document.addEventListener('change', (e) => {
  const t = e.target;
  if (t.id === 'tenant-prop') { S.ui.tprop = t.value; $('#tenant-rows').innerHTML = tenantRows(); return; }
  if (t.dataset.upload && t.files[0]) {
    const [pid, idx] = t.dataset.upload.split('|');
    const p = propById(pid); const doc = p.docs[+idx];
    doc.file = t.files[0].name; doc.status = 'Submitted';
    if (p.verification === 'Verified') {
      // Renewal: the listing stays live while DormCare re-reviews the new document
      if (doc.expires) doc.expires = addDays(TODAY, 365);
      p.submittedOn = TODAY;
      notify('admin', `${p.name} uploaded a renewed ${doc.type}`, 'queue');
    }
    if (p.verification === 'Draft' && p.docs.every((d) => d.status !== 'Missing')) toast('All documents uploaded — submit for review');
    else toast(`${doc.type} uploaded securely`);
    audit(`Uploaded ${doc.type} for ${p.name}`);
    commit();
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeModal(); if (S.ui.bell || S.ui.profileMenu) { S.ui.bell = false; S.ui.profileMenu = false; render(); } }
  if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); $('#global-search')?.focus(); }
  if (e.key === 'Enter' && e.target.id === 'global-search') {
    const q = e.target.value.trim();
    if (S.role === 'manager') { S.ui.tq = q; S.ui.tenantTab = 'directory'; save(); go('tenants'); }
    else { S.ui.ex.q = q; save(); go('explore'); }
  }
});
window.addEventListener('hashchange', () => { closeModal(); render(); });

render();
Broker.init();
