require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const candidateRoutes = require("./routes/candidates");
const uploadRoutes = require("./routes/upload");
const analyticsRoutes = require("./routes/analytics");
const { initDb } = require("./database/db");

const app = express();
const PORT = process.env.PORT || 3000;

["uploads", "database"].forEach((d) => {
  const p = path.join(__dirname, d);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

initDb();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "..", "client")));

app.use("/api/upload", uploadRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

app.listen(PORT, () => {
  console.log(`\n🚀 AI Resume Parser running at http://localhost:${PORT}\n`);
});
