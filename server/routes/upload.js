const express = require("express");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const upload = require("../middleware/upload");
const { parseResume } = require("../controllers/parser");
const { db } = require("../database/db");

const router = express.Router();

async function extractText(filePath, ext) {
  const buffer = fs.readFileSync(filePath);
  if (ext === ".pdf") {
    const data = await pdfParse(buffer);
    return data.text;
  }
  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  return buffer.toString("utf-8");
}

router.post("/", upload.single("resume"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded." });
    const ext = path.extname(req.file.originalname).toLowerCase();
    let text;

    try {
      text = await extractText(req.file.path, ext);
    } catch (err) {
      return res.status(400).json({
        error:
          "Unable to read the uploaded resume. Please upload a valid PDF or DOCX file.",
      });
    }
    if (!text || text.trim().length < 20) {
      return res
        .status(422)
        .json({ error: "Could not extract readable text from file." });
    }
    const parsed = parseResume(text);

    const stmt = db.prepare(`
      INSERT INTO candidates
        (name, email, phone, education, experience, skills, certifications, projects, linkedin, github, location, summary, completeness, raw_text)
      VALUES (@name, @email, @phone, @education, @experience, @skills, @certifications, @projects, @linkedin, @github, @location, @summary, @completeness, @raw_text)
    `);
    const info = stmt.run({
      ...parsed,
      skills: JSON.stringify(parsed.skills || []),
    });

    db.prepare("INSERT INTO uploads (filename) VALUES (?)").run(
      req.file.originalname,
    );

    res.json({
      id: info.lastInsertRowid,
      candidate: { id: info.lastInsertRowid, ...parsed },
    });
  } catch (err) {
    console.error("Upload Error:", err);

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        error: "File size exceeds the 10 MB limit.",
      });
    }

    if (err.message === "Only PDF, DOCX, and TXT files are allowed.") {
      return res.status(400).json({
        error: err.message,
      });
    }

    if (err.message.includes("Invalid PDF")) {
      return res.status(400).json({
        error: "The uploaded PDF is corrupted or invalid.",
      });
    }

    if (err.message.includes("Zip")) {
      return res.status(400).json({
        error: "The uploaded DOCX file appears to be corrupted.",
      });
    }

    return res.status(500).json({
      error: "Something went wrong while parsing the resume. Please try again.",
    });
  }
});

module.exports = router;
