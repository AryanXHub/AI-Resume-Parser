# AI Resume Parser

A premium, SaaS-style **AI Resume Parser** built with **Node.js**, **Express**, **SQLite**, and an **NLP-style** extraction pipeline. Upload PDF, DOCX, or TXT resumes and get a beautifully organized candidate dashboard — complete with search, filters, analytics, and CSV/JSON export.

> Glassmorphism UI · Animated gradient background · Production-ready architecture.

---

## ✨ Features

- 📥 **Drag-and-drop upload** for PDF, DOCX, TXT (10MB)
- 🧠 **Smart parsing** of name, email, phone, skills, education, experience, certifications, projects, LinkedIn, GitHub, and location
- 📊 **Live analytics**: top skills, education distribution, completeness score
- 🔎 **Search & filter** by name, skill, education, experience, email
- 📤 **Export** the candidate database as **CSV** or **JSON**
- 🗂️ **Candidate CRUD** with detailed profile pages
- 🎨 **Premium UI** with glassmorphism, animated gradient blobs, motion, and full responsiveness
- ♿ Keyboard navigation, focus states, and accessible labels

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3 (glassmorphism + CSS animations), vanilla JavaScript (SPA with hash router)
- **Backend:** Node.js, Express.js
- **Database:** SQLite (via `better-sqlite3`) — file auto-created at `server/database/resume_parser.db`
- **Parsing:** `pdf-parse`, `mammoth`, custom NLP/regex extraction pipeline
- **Uploads:** `multer`

## 🚀 Quick Start

```bash
npm install
npm start
```

Then open **http://localhost:3000** in your browser.

The SQLite database is created automatically on first run.

## 📁 Project Structure

```
AI-Resume-Parser/
├── client/
│   ├── index.html
│   ├── css/style.css
│   ├── js/app.js
│   └── assets/
├── server/
│   ├── server.js
│   ├── routes/
│   │   ├── upload.js
│   │   ├── candidates.js
│   │   └── analytics.js
│   ├── controllers/
│   │   └── parser.js
│   ├── middleware/
│   │   └── upload.js
│   ├── database/
│   │   ├── db.js
│   │   └── resume_parser.db   (auto-created)
│   └── uploads/               (auto-created)
├── screenshots/
├── package.json
└── README.md
```

## 📡 API

| Method | Endpoint                         | Description                                  |
|--------|----------------------------------|----------------------------------------------|
| POST   | `/api/upload`                    | Upload a resume (`multipart/form-data`, field `resume`) |
| GET    | `/api/candidates`                | List candidates. Query: `q`, `skill`, `sort`, `order` |
| GET    | `/api/candidates/:id`            | Get a single candidate                       |
| PUT    | `/api/candidates/:id`            | Update a candidate                           |
| DELETE | `/api/candidates/:id`            | Delete a candidate                           |
| GET    | `/api/candidates/export.csv`     | Export all candidates as CSV                 |
| GET    | `/api/candidates/export.json`    | Export all candidates as JSON                |
| GET    | `/api/analytics`                 | Dashboard analytics                          |

## 🗃️ Database Schema

**candidates**: `id, name, email, phone, education, experience, skills, certifications, projects, linkedin, github, location, summary, completeness, raw_text, created_at`

**uploads**: `id, filename, upload_date`

## 🧠 Parsing Pipeline

1. Extract raw text (`pdf-parse` / `mammoth` / plain text).
2. Detect contact info via regex (email, phone, LinkedIn, GitHub).
3. Heuristically detect the candidate name from the top of the document.
4. Split the document into sections (Education, Experience, Skills, etc.).
5. Match skills against a curated dictionary of 80+ technologies.
6. Generate a candidate summary and completeness score (0-100%).

## 📸 Screenshots

Add screenshots to the `screenshots/` directory and reference them here.

## 🔭 Future Enhancements

- LLM-powered summarization for richer candidate insights
- Authentication & multi-user workspaces
- Bulk upload + background processing queue
- Match scoring against job descriptions
- PostgreSQL adapter for scale

## 📄 License

MIT
