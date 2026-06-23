const express = require('express');
const { db } = require('../database/db');

const router = express.Router();

router.get('/', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) AS c FROM candidates').get().c;
  const uploads = db.prepare('SELECT COUNT(*) AS c FROM uploads').get().c;
  const avgCompleteness = db.prepare('SELECT IFNULL(AVG(completeness),0) AS a FROM candidates').get().a;

  const rows = db.prepare('SELECT skills, education FROM candidates').all();
  const skillCount = {};
  const eduCount = {};
  for (const r of rows) {
    try {
      const arr = JSON.parse(r.skills || '[]');
      for (const s of arr) skillCount[s] = (skillCount[s] || 0) + 1;
    } catch {}
    const eduLine = (r.education || '').split('|')[0].trim();
    if (eduLine) {
      const key = eduLine.length > 40 ? eduLine.slice(0, 40) + '…' : eduLine;
      eduCount[key] = (eduCount[key] || 0) + 1;
    }
  }
  const topSkills = Object.entries(skillCount).sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([name, count]) => ({ name, count }));
  const educationDistribution = Object.entries(eduCount).sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  res.json({
    totalCandidates: total,
    totalUploads: uploads,
    avgCompleteness: Math.round(avgCompleteness),
    topSkills,
    educationDistribution,
  });
});

module.exports = router;
