# AI Resume Parser

A premium, SaaS-style **AI Resume Parser** built with **Node.js**, **Express**, **SQLite**, and an **NLP-style** extraction pipeline. Upload PDF, DOCX, or TXT resumes and get a beautifully organized candidate dashboard — complete with search, filters, analytics, and CSV/JSON export.

---

## Live Demo

https://ai-resume-parser-sotp.onrender.com

---

## ✨ Features

- 📥 **Drag-and-drop upload** for PDF, DOCX, TXT (10MB)
- 🧠 **Smart parsing** of name, email, phone, skills, education, experience, certifications, projects, LinkedIn, GitHub, and location
- 📊 **Live analytics**: top skills, education distribution, completeness score
- 🔎 **Search & filter** by name, skill, education, experience, email
- 📤 **Export** the candidate database as **CSV** or **JSON**
- 🗂️ **Candidate CRUD** with detailed profile pages
- 🎨 **Premium UI** with glassmorphism, motion, and full responsiveness
- ♿ Keyboard navigation, focus states, and accessible labels

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** SQLite
- **Parsing:** `pdf-parse`, `mammoth`, custom NLP/regex extraction pipeline
- **Uploads:** `multer`

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
│   │   └── resume_parser.db
│   └── uploads/
├── .gitignore
├── package.json
└── README.md
```

## 📡 API

| Method | Endpoint                      | Description                   |
| ------ | ----------------------------- | ----------------------------- |
| POST   | `/api/upload`                 | Upload a resume               |
| GET    | `/api/candidates`             | List candidates               |
| GET    | `/api/candidates/:id`         | Get a single candidate        |
| PUT    | `/api/candidates/:id`         | Update a candidate            |
| DELETE | `/api/candidates/:id`         | Delete a candidate            |
| GET    | `/api/candidates/export.csv`  | Export all candidates as CSV  |
| GET    | `/api/candidates/export.json` | Export all candidates as JSON |
| GET    | `/api/analytics`              | Dashboard analytics           |

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

## Author

Aryan Gaur
