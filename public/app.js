/* ═══════════════════════════════════════════════════════
   UserVault — Frontend Application
   Vanilla JS · No dependencies · Full CRUD
═══════════════════════════════════════════════════════ */

'use strict';

/* ── Validation rules ────────────────────────────────── */
const RULES = {
  first_name: { test: v => v.trim().length >= 2,           msg: 'At least 2 characters required.' },
  last_name:  { test: v => v.trim().length >= 2,           msg: 'At least 2 characters required.' },
  email:      { test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), msg: 'Valid email address required.' },
  gender:     { test: v => ['Male','Female','Other'].includes(v), msg: 'Please select a gender.' },
  job_title:  { test: v => v.trim().length >= 2,           msg: 'At least 2 characters required.' },
};

/* ── API ─────────────────────────────────────────────── */
async function api(path, method = 'GET', body = null) {
  const r = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : null,
  });
  return { ok: r.ok, status: r.status, data: await r.json() };
}

/* ── Toast ───────────────────────────────────────────── */
function toast(msg, type = 'info', ms = 3500) {
  const rack = document.getElementById('toast-rack');
  const el   = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="tdot"></span><span>${msg}</span>`;
  rack.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .25s'; setTimeout(() => el.remove(), 260); }, ms);
}

/* ── Field state helpers ─────────────────────────────── */
function setField(wrap, state, msg = '') {
  wrap.classList.remove('valid', 'invalid');
  if (state) wrap.classList.add(state);
  const ferr = wrap.closest('.field')?.querySelector('.ferr');
  if (ferr) ferr.textContent = msg;
}

function validateField(name, value) {
  const r = RULES[name];
  if (!r) return true;
  return r.test(value);
}

function attachLive(formEl) {
  Object.keys(RULES).forEach(name => {
    const el = formEl.querySelector(`[name="${name}"]`);
    if (!el) return;
    const wrap = el.closest('.field-wrap');
    el.addEventListener('blur', () => {
      const ok = validateField(name, el.value);
      setField(wrap, ok ? 'valid' : 'invalid', ok ? '' : RULES[name].msg);
    });
    el.addEventListener('input', () => {
      if (wrap.classList.contains('invalid') && validateField(name, el.value)) {
        setField(wrap, 'valid', '');
      }
    });
  });
}

function runValidation(formEl, errorBoxId) {
  const errors = [];
  let first = null;
  Object.keys(RULES).forEach(name => {
    const el   = formEl.querySelector(`[name="${name}"]`);
    if (!el) return;
    const wrap = el.closest('.field-wrap');
    const ok   = validateField(name, el.value);
    setField(wrap, ok ? 'valid' : 'invalid', ok ? '' : RULES[name].msg);
    if (!ok) { errors.push(RULES[name].msg); if (!first) first = el; }
  });
  if (first) first.focus();
  const box = document.getElementById(errorBoxId);
  if (box) {
    if (errors.length) {
      box.innerHTML = `<strong>Please correct the following:</strong><ul>${errors.map(e=>`<li>${e}</li>`).join('')}</ul>`;
      box.classList.remove('hidden');
    } else {
      box.classList.add('hidden');
    }
  }
  return errors;
}

function clearForm(formEl) {
  formEl.reset();
  formEl.querySelectorAll('.field-wrap').forEach(w => setField(w, '', ''));
}

/* ── View router ─────────────────────────────────────── */
const views    = document.querySelectorAll('.view');
const navItems = document.querySelectorAll('.nav-item');
const titles   = { dashboard:'Dashboard', users:'User Directory', add:'Register User', lookup:'Lookup User' };

function showView(name) {
  views.forEach(v => v.classList.remove('active'));
  navItems.forEach(n => n.classList.remove('active'));
  document.getElementById(`view-${name}`)?.classList.add('active');
  document.querySelector(`[data-view="${name}"]`)?.classList.add('active');
  document.getElementById('topbar-title').textContent = titles[name] || name;

  if (name === 'users')     loadUsers();
  if (name === 'dashboard') loadDashboard();
  closeSidebar();
}

navItems.forEach(n => n.addEventListener('click', () => showView(n.dataset.view)));
document.querySelectorAll('.qa-btn').forEach(b => b.addEventListener('click', () => showView(b.dataset.view)));
document.getElementById('topbar-add-btn').addEventListener('click', () => showView('add'));

/* ── Sidebar mobile ──────────────────────────────────── */
const sidebar  = document.getElementById('sidebar');
const overlay  = document.createElement('div');
overlay.className = 'sidebar-overlay';
document.body.appendChild(overlay);

function openSidebar()  { sidebar.classList.add('open');  overlay.classList.add('show'); }
function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('show'); }

document.getElementById('hamburger').addEventListener('click', openSidebar);
document.getElementById('sidebar-close').addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);

/* ── API status check ────────────────────────────────── */
async function checkAPIStatus() {
  const dot  = document.getElementById('api-dot');
  const text = document.getElementById('api-status-text');
  try {
    const { ok } = await api('/api/users/stats');
    dot.className  = `status-dot ${ok ? 'online' : 'offline'}`;
    text.textContent = ok ? 'API online' : 'API error';
  } catch {
    dot.className  = 'status-dot offline';
    text.textContent = 'API offline';
  }
}

/* ── Dashboard ───────────────────────────────────────── */
async function loadDashboard() {
  try {
    const { ok, data } = await api('/api/users/stats');
    if (!ok) return;
    const { total, genders, newest, jobCount } = data.data;

    document.getElementById('stat-total-num').textContent = total;
    document.getElementById('stat-jobs-num').textContent  = jobCount;
    document.getElementById('stat-male-num').textContent  = genders.Male   || 0;
    document.getElementById('stat-female-num').textContent= genders.Female || 0;

    const mPct = total ? Math.round((genders.Male   || 0) / total * 100) : 0;
    const fPct = total ? Math.round((genders.Female || 0) / total * 100) : 0;
    document.getElementById('stat-male-bar').style.width   = mPct + '%';
    document.getElementById('stat-female-bar').style.width = fPct + '%';

    const card = document.getElementById('newest-user-card');
    if (newest) {
      const initials = `${newest.first_name[0]}${newest.last_name[0]}`;
      card.innerHTML = `
        <div class="newest-card">
          <div class="newest-avatar">${initials}</div>
          <div class="newest-name">${newest.first_name} ${newest.last_name}</div>
          <div class="newest-role">${newest.job_title}</div>
          <div class="newest-email">${newest.email}</div>
          <div class="newest-id">ID #${newest.id}</div>
        </div>`;
    }
  } catch { toast('Could not load dashboard stats.', 'error'); }
}

/* ── User table ──────────────────────────────────────── */
let debounceTimer;
async function loadUsers() {
  const loading = document.getElementById('table-loading');
  const empty   = document.getElementById('table-empty');
  const tbody   = document.getElementById('user-tbody');
  const counter = document.getElementById('result-count');

  loading.classList.remove('hidden');
  empty.classList.add('hidden');
  tbody.innerHTML = '';

  const search = document.getElementById('search-input').value;
  const gender = document.getElementById('gender-filter').value;
  const sort   = document.getElementById('sort-select').value;

  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (gender) params.set('gender', gender);
  if (sort)   params.set('sort', sort);

  try {
    const { ok, data } = await api(`/api/users?${params}`);
    loading.classList.add('hidden');
    if (!ok || !data.data.length) { empty.classList.remove('hidden'); counter.textContent=''; return; }

    data.data.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="td-id">#${u.id}</td>
        <td class="td-name">${u.first_name} ${u.last_name}</td>
        <td class="td-email">${u.email}</td>
        <td><span class="gender-pill ${u.gender.toLowerCase()}">${u.gender}</span></td>
        <td class="td-job" title="${u.job_title}">${u.job_title}</td>
        <td class="td-actions">
          <button class="row-btn edit" data-id="${u.id}">Edit</button>
          <button class="row-btn del"  data-id="${u.id}" data-name="${u.first_name} ${u.last_name}">Delete</button>
        </td>`;
      tbody.appendChild(tr);
    });

    counter.textContent = `${data.count} record${data.count !== 1 ? 's' : ''}`;

    // Attach row actions
    tbody.querySelectorAll('.row-btn.edit').forEach(btn =>
      btn.addEventListener('click', () => openEditModal(parseInt(btn.dataset.id)))
    );
    tbody.querySelectorAll('.row-btn.del').forEach(btn =>
      btn.addEventListener('click', () => openDeleteModal(parseInt(btn.dataset.id), btn.dataset.name))
    );

  } catch { loading.classList.add('hidden'); toast('Could not load users.', 'error'); }
}

// Debounced filters
['search-input','gender-filter','sort-select'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(loadUsers, 300);
  });
});

/* ── Add user form ───────────────────────────────────── */
const addForm = document.getElementById('add-form');
attachLive(addForm);

addForm.addEventListener('submit', async e => {
  e.preventDefault();
  const errors = runValidation(addForm, 'form-errors');
  if (errors.length) return;

  const submitBtn = document.getElementById('submit-btn');
  submitBtn.classList.add('loading'); submitBtn.disabled = true;

  const payload = Object.fromEntries(new FormData(addForm));
  try {
    const { ok, data } = await api('/api/users', 'POST', payload);
    if (ok) {
      addForm.style.display = 'none';
      const banner = document.getElementById('success-banner');
      document.getElementById('success-msg').textContent =
        `${data.data.first_name} ${data.data.last_name} stored successfully.`;
      document.getElementById('success-id').textContent = `USER ID: ${data.data.id}`;
      banner.classList.remove('hidden');
      toast(`User #${data.data.id} registered!`, 'success');
    } else {
      const errs = data.errors?.map(e => e.msg || e) || [data.message];
      document.getElementById('form-errors').innerHTML =
        `<strong>Server error:</strong><ul>${errs.map(e=>`<li>${e}</li>`).join('')}</ul>`;
      document.getElementById('form-errors').classList.remove('hidden');
    }
  } catch { toast('Network error.', 'error'); }
  finally  { submitBtn.classList.remove('loading'); submitBtn.disabled = false; }
});

document.getElementById('reset-btn').addEventListener('click', () => {
  clearForm(addForm); document.getElementById('form-errors').classList.add('hidden');
  toast('Form cleared.', 'info', 2000);
});

document.getElementById('add-another').addEventListener('click', () => {
  clearForm(addForm);
  document.getElementById('form-errors').classList.add('hidden');
  document.getElementById('success-banner').classList.add('hidden');
  addForm.style.display = '';
});

/* ── Lookup ──────────────────────────────────────────── */
async function doLookup() {
  const input  = document.getElementById('lookup-id');
  const result = document.getElementById('lookup-result');
  const id     = parseInt(input.value);
  if (!id || id < 1) { toast('Enter a valid numeric ID.', 'error'); return; }

  const btn = document.getElementById('lookup-btn');
  btn.classList.add('loading'); btn.disabled = true;
  result.innerHTML = '';

  try {
    const { ok, data } = await api(`/api/users/${id}`);
    if (ok && data.data) {
      const u = data.data;
      const initials = `${u.first_name[0]}${u.last_name[0]}`;
      result.innerHTML = `
        <div class="detail-card">
          <div class="detail-header">
            <div class="detail-avatar">${initials}</div>
            <div>
              <div class="detail-name">${u.first_name} ${u.last_name}</div>
              <div class="detail-id">ID #${u.id}</div>
            </div>
          </div>
          <div class="detail-body">
            <div class="detail-field">
              <div class="detail-field-label">First Name</div>
              <div class="detail-field-val">${u.first_name}</div>
            </div>
            <div class="detail-field">
              <div class="detail-field-label">Last Name</div>
              <div class="detail-field-val">${u.last_name}</div>
            </div>
            <div class="detail-field">
              <div class="detail-field-label">Email</div>
              <div class="detail-field-val">${u.email}</div>
            </div>
            <div class="detail-field">
              <div class="detail-field-label">Gender</div>
              <div class="detail-field-val"><span class="gender-pill ${u.gender.toLowerCase()}">${u.gender}</span></div>
            </div>
            <div class="detail-field">
              <div class="detail-field-label">Job Title</div>
              <div class="detail-field-val">${u.job_title}</div>
            </div>
            ${u.created_at ? `<div class="detail-field">
              <div class="detail-field-label">Registered</div>
              <div class="detail-field-val">${new Date(u.created_at).toLocaleDateString('en-IN',{year:'numeric',month:'long',day:'numeric'})}</div>
            </div>` : ''}
          </div>
        </div>`;
    } else {
      result.innerHTML = `
        <div class="not-found">
          <div class="nf-code">⊘</div>
          <strong>No record for ID #${id}</strong>
          <p>This user does not exist or was deleted.</p>
        </div>`;
      toast(`No user found with ID #${id}.`, 'error');
    }
  } catch { toast('Network error.', 'error'); }
  finally  { btn.classList.remove('loading'); btn.disabled = false; }
}

document.getElementById('lookup-btn').addEventListener('click', doLookup);
document.getElementById('lookup-id').addEventListener('keydown', e => { if (e.key === 'Enter') doLookup(); });

/* ── Edit modal ──────────────────────────────────────── */
const editForm     = document.getElementById('edit-form');
const editBackdrop = document.getElementById('modal-backdrop');
attachLive(editForm);

async function openEditModal(id) {
  try {
    const { ok, data } = await api(`/api/users/${id}`);
    if (!ok) return toast('Could not fetch user data.', 'error');
    const u = data.data;
    document.getElementById('edit-id').value         = u.id;
    document.getElementById('e-first').value         = u.first_name;
    document.getElementById('e-last').value          = u.last_name;
    document.getElementById('e-email').value         = u.email;
    document.getElementById('e-gender').value        = u.gender;
    document.getElementById('e-job').value           = u.job_title;
    document.getElementById('modal-title').textContent = `Edit — ${u.first_name} ${u.last_name}`;
    document.getElementById('edit-errors').classList.add('hidden');
    editForm.querySelectorAll('.field-wrap').forEach(w => setField(w, '', ''));
    editBackdrop.classList.remove('hidden');
  } catch { toast('Network error.', 'error'); }
}

function closeEditModal() {
  editBackdrop.classList.add('hidden');
  clearForm(editForm);
}

document.getElementById('modal-close').addEventListener('click', closeEditModal);
document.getElementById('modal-cancel').addEventListener('click', closeEditModal);
editBackdrop.addEventListener('click', e => { if (e.target === editBackdrop) closeEditModal(); });

editForm.addEventListener('submit', async e => {
  e.preventDefault();
  const errors = runValidation(editForm, 'edit-errors');
  if (errors.length) return;

  const btn = document.getElementById('edit-submit');
  btn.classList.add('loading'); btn.disabled = true;

  const id      = parseInt(document.getElementById('edit-id').value);
  const payload = Object.fromEntries(
    [...new FormData(editForm)].filter(([k]) => k !== '')
  );

  try {
    const { ok, data } = await api(`/api/users/${id}`, 'PATCH', payload);
    if (ok) {
      toast(`User #${id} updated successfully.`, 'success');
      closeEditModal();
      loadUsers();
    } else {
      const errs = data.errors?.map(e => e.msg || e) || [data.message];
      document.getElementById('edit-errors').innerHTML =
        `<strong>Error:</strong><ul>${errs.map(e=>`<li>${e}</li>`).join('')}</ul>`;
      document.getElementById('edit-errors').classList.remove('hidden');
    }
  } catch { toast('Network error.', 'error'); }
  finally  { btn.classList.remove('loading'); btn.disabled = false; }
});

/* ── Delete modal ────────────────────────────────────── */
const deleteBackdrop = document.getElementById('delete-backdrop');
let pendingDeleteId  = null;

function openDeleteModal(id, name) {
  pendingDeleteId = id;
  document.getElementById('delete-msg').innerHTML =
    `Are you sure you want to permanently delete <strong>${name}</strong> (ID #${id})? This cannot be undone.`;
  deleteBackdrop.classList.remove('hidden');
}

function closeDeleteModal() {
  deleteBackdrop.classList.add('hidden');
  pendingDeleteId = null;
}

document.getElementById('delete-close').addEventListener('click', closeDeleteModal);
document.getElementById('delete-cancel').addEventListener('click', closeDeleteModal);
deleteBackdrop.addEventListener('click', e => { if (e.target === deleteBackdrop) closeDeleteModal(); });

document.getElementById('delete-confirm').addEventListener('click', async () => {
  if (!pendingDeleteId) return;
  const btn = document.getElementById('delete-confirm');
  btn.classList.add('loading'); btn.disabled = true;

  try {
    const { ok } = await api(`/api/users/${pendingDeleteId}`, 'DELETE');
    if (ok) {
      toast(`User #${pendingDeleteId} deleted.`, 'success');
      closeDeleteModal();
      loadUsers();
      loadDashboard();
    } else { toast('Could not delete user.', 'error'); }
  } catch { toast('Network error.', 'error'); }
  finally  { btn.classList.remove('loading'); btn.disabled = false; }
});

/* ── ESC to close modals ─────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!editBackdrop.classList.contains('hidden'))   closeEditModal();
    if (!deleteBackdrop.classList.contains('hidden')) closeDeleteModal();
  }
});

/* ── Boot ────────────────────────────────────────────── */
(async function init() {
  await checkAPIStatus();
  showView('dashboard');
  setInterval(checkAPIStatus, 30_000);
})();
