/**
 * UserVault — REST API Server
 * Built with Express.js | Node.js
 */

const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 8000;
const DB   = path.join(__dirname, 'MOCK_DATA.json');

/* ── Middleware ─────────────────────────────────────────── */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

/* ── DB helpers ─────────────────────────────────────────── */
const readDB  = () => JSON.parse(fs.readFileSync(DB, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(DB, JSON.stringify(data, null, 2));
const nextId  = (users) => users.length ? Math.max(...users.map(u => u.id)) + 1 : 1;

/* ── Validation ─────────────────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GENDERS  = ['Male', 'Female', 'Other'];

function validate(body, partial = false) {
  const errors = [];
  const { first_name, last_name, email, gender, job_title } = body;

  if (!partial || first_name !== undefined) {
    if (!first_name || first_name.trim().length < 2)
      errors.push({ field: 'first_name', msg: 'First name must be at least 2 characters.' });
  }
  if (!partial || last_name !== undefined) {
    if (!last_name || last_name.trim().length < 2)
      errors.push({ field: 'last_name', msg: 'Last name must be at least 2 characters.' });
  }
  if (!partial || email !== undefined) {
    if (!email || !EMAIL_RE.test(email.trim()))
      errors.push({ field: 'email', msg: 'Please provide a valid email address.' });
  }
  if (!partial || gender !== undefined) {
    if (!gender || !GENDERS.includes(gender))
      errors.push({ field: 'gender', msg: `Gender must be one of: ${GENDERS.join(', ')}.` });
  }
  if (!partial || job_title !== undefined) {
    if (!job_title || job_title.trim().length < 2)
      errors.push({ field: 'job_title', msg: 'Job title must be at least 2 characters.' });
  }
  return errors;
}

/* ── Response helpers ───────────────────────────────────── */
const ok   = (res, data, code = 200) => res.status(code).json({ success: true,  ...data });
const fail = (res, msg, code = 400)  => res.status(code).json({ success: false, message: msg });

/* ═══════════════════════════════════════════════════════════
   API ROUTES
═══════════════════════════════════════════════════════════ */

/* GET /api/users — list all (supports ?search=, ?gender=, ?sort=) */
app.get('/api/users', (req, res) => {
  let users = readDB();
  const { search, gender, sort } = req.query;

  if (search) {
    const q = search.toLowerCase();
    users = users.filter(u =>
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.job_title.toLowerCase().includes(q)
    );
  }

  if (gender && GENDERS.includes(gender)) {
    users = users.filter(u => u.gender === gender);
  }

  if (sort === 'name') {
    users.sort((a, b) => a.first_name.localeCompare(b.first_name));
  } else if (sort === 'id_desc') {
    users.sort((a, b) => b.id - a.id);
  }

  ok(res, { count: users.length, data: users });
});

/* GET /api/users/stats — dashboard metrics */
app.get('/api/users/stats', (req, res) => {
  const users = readDB();
  const genderCounts = users.reduce((acc, u) => {
    acc[u.gender] = (acc[u.gender] || 0) + 1;
    return acc;
  }, {});

  ok(res, {
    data: {
      total:    users.length,
      genders:  genderCounts,
      newest:   users[users.length - 1] || null,
      jobCount: [...new Set(users.map(u => u.job_title))].length,
    }
  });
});

/* GET /api/users/:id */
app.get('/api/users/:id', (req, res) => {
  const id   = parseInt(req.params.id);
  const user = readDB().find(u => u.id === id);
  if (!user) return fail(res, `No user found with ID ${id}.`, 404);
  ok(res, { data: user });
});

/* POST /api/users */
app.post('/api/users', (req, res) => {
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ success: false, errors });

  const users = readDB();
  const email = req.body.email.trim().toLowerCase();

  if (users.find(u => u.email.toLowerCase() === email))
    return res.status(409).json({ success: false, errors: [{ field: 'email', msg: 'Email already in use.' }] });

  const user = {
    id:         nextId(users),
    first_name: req.body.first_name.trim(),
    last_name:  req.body.last_name.trim(),
    email,
    gender:     req.body.gender,
    job_title:  req.body.job_title.trim(),
    created_at: new Date().toISOString(),
  };

  users.push(user);
  writeDB(users);
  ok(res, { data: user, message: 'User created successfully.' }, 201);
});

/* PATCH /api/users/:id */
app.patch('/api/users/:id', (req, res) => {
  const id    = parseInt(req.params.id);
  const users = readDB();
  const idx   = users.findIndex(u => u.id === id);
  if (idx === -1) return fail(res, `User ${id} not found.`, 404);

  const errors = validate(req.body, true);
  if (errors.length) return res.status(400).json({ success: false, errors });

  const updated = { ...users[idx], ...req.body, id, updated_at: new Date().toISOString() };
  users[idx] = updated;
  writeDB(users);
  ok(res, { data: updated, message: 'User updated.' });
});

/* DELETE /api/users/:id */
app.delete('/api/users/:id', (req, res) => {
  const id    = parseInt(req.params.id);
  let users   = readDB();
  const idx   = users.findIndex(u => u.id === id);
  if (idx === -1) return fail(res, `User ${id} not found.`, 404);

  const [deleted] = users.splice(idx, 1);
  writeDB(users);
  ok(res, { data: deleted, message: 'User deleted.' });
});

/* Catch-all → serve SPA */
app.get('*', (_req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

/* ── Boot ───────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║   UserVault API — ready              ║');
  console.log(`║   http://localhost:${PORT}              ║`);
  console.log('╚══════════════════════════════════════╝\n');
});
