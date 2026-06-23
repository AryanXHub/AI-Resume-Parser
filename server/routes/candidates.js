const express = require('express');
const { db } = require('../database/db');

const router = express.Router();

function rowToCandidate(row) {
  if (!row) return null;
  let skills = [];
  try { skills = JSON.parse(row.skills || '[]'); } catch { skills = []; }
  return { ...row, skills };
}

// List + search + filter + sort
router.get('/', (req, res) => {
  const { q = '', skill = '', sort = 'created_at', order = 'desc' } = req.query;
  const allowedSort = ['created_at', 'name', 'completeness'];
  const allowedOrder = ['asc', 'desc'];
  const sortCol = allowedSort.includes(sort) ? sort : 'created_at';
  const sortOrder = allowedOrder.includes(order) ? order : 'desc';

  let sql = `SELECT * FROM candidates WHERE 1=1`;
  const params = {};
  if (q) {
    sql += ` AND (
      LOWER(name) LIKE @q OR LOWER(email) LIKE @q OR LOWER(education) LIKE @q
      OR LOWER(experience) LIKE @q OR LOWER(skills) LIKE @q OR LOWER(location) LIKE @q
    )`;
    params.q = `%${String(q).toLowerCase()}%`;
  }
  if (skill) {
    sql += ` AND LOWER(skills) LIKE @skill`;
    params.skill = `%${String(skill).toLowerCase()}%`;
  }
  sql += ` ORDER BY ${sortCol} ${sortOrder.toUpperCase()}`;

  const rows = db.prepare(sql).all(params);
  res.json(rows.map(rowToCandidate));
});

router.get('/export.csv', (req, res) => {
  const rows = db.prepare('SELECT * FROM candidates ORDER BY created_at DESC').all().map(rowToCandidate);
  const headers = ['id','name','email','phone','location','linkedin','github','skills','education','certifications','completeness','created_at'];
  const escape = (v) => {
    if (v === null || v === undefined) return '';
    const s = Array.isArray(v) ? v.join('; ') : String(v);
    return `"${s.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
  };
  const csv = [headers.join(',')].concat(rows.map(r => headers.map(h => escape(r[h])).join(','))).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="candidates.csv"');
  res.send(csv);
});

router.get('/export.json', (req, res) => {
  const rows = db.prepare('SELECT * FROM candidates ORDER BY created_at DESC').all().map(rowToCandidate);
  res.setHeader('Content-Disposition', 'attachment; filename="candidates.json"');
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM candidates WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(rowToCandidate(row));
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM candidates WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const fields = ['name','email','phone','education','experience','certifications','projects','linkedin','github','location','summary'];
  const updates = {};
  for (const f of fields) if (f in req.body) updates[f] = req.body[f];
  if ('skills' in req.body) updates.skills = JSON.stringify(req.body.skills || []);
  if (!Object.keys(updates).length) return res.json(rowToCandidate(existing));
  const setSql = Object.keys(updates).map((k) => `${k} = @${k}`).join(', ');
  db.prepare(`UPDATE candidates SET ${setSql} WHERE id = @id`).run({ ...updates, id: req.params.id });
  const updated = db.prepare('SELECT * FROM candidates WHERE id = ?').get(req.params.id);
  res.json(rowToCandidate(updated));
});

router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM candidates WHERE id = ?').run(req.params.id);
  res.json({ deleted: info.changes });
});

module.exports = router;
