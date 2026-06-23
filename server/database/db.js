const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'resume_parser.db');
const db = new Database(DB_PATH);

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      phone TEXT,
      education TEXT,
      experience TEXT,
      skills TEXT,
      certifications TEXT,
      projects TEXT,
      linkedin TEXT,
      github TEXT,
      location TEXT,
      summary TEXT,
      completeness INTEGER DEFAULT 0,
      raw_text TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS uploads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT,
      upload_date DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

module.exports = { db, initDb };
