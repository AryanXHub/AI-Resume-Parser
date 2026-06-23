const app = document.getElementById("app");
const toast = document.getElementById("toast");
document.getElementById("year").textContent = new Date().getFullYear();

const api = {
  upload: (file, onProgress) =>
    new Promise((resolve, reject) => {
      const fd = new FormData();
      fd.append("resume", file);
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress)
          onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);
          xhr.status >= 200 && xhr.status < 300
            ? resolve(data)
            : reject(new Error(data.error || "Upload failed"));
        } catch {
          reject(new Error("Upload failed"));
        }
      };
      xhr.onerror = () => reject(new Error("Network error"));
      xhr.send(fd);
    }),
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch("/api/candidates" + (qs ? "?" + qs : "")).then((r) =>
      r.json(),
    );
  },
  get: (id) => fetch("/api/candidates/" + id).then((r) => r.json()),
  update: (id, body) =>
    fetch("/api/candidates/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
  remove: (id) =>
    fetch("/api/candidates/" + id, { method: "DELETE" }).then((r) => r.json()),
  analytics: () => fetch("/api/analytics").then((r) => r.json()),
};

function showToast(msg, type = "success") {
  toast.textContent = msg;
  toast.className = "toast show " + type;
  setTimeout(() => toast.classList.remove("show"), 2800);
}

function esc(s) {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
function initials(name) {
  return (name || "?")
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
function navTo(hash) {
  location.hash = hash;
}

function setActiveNav(path) {
  document.querySelectorAll(".nav-links a").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("data-route") === path);
  });
}

function renderHome() {
  setActiveNav("/");
  app.innerHTML = `
    <section class="hero glass section">
      <div>
        <h1>Turn resumes into <span class="grad">structured data</span> in seconds.</h1>
        <p>AI Resume Parser uses NLP and intelligent text processing to extract names, contacts, skills, experience and more — then organizes everything in a beautiful candidate dashboard.</p>
        <div class="hero-cta">
          <a class="btn btn-primary" href="#/upload">Upload a Resume →</a>
          <a class="btn btn-ghost" href="#/dashboard">View Dashboard</a>
        </div>
        <div class="hero-meta">
          <span>⚡ <b>Instant</b> parsing</span>
          <span>📄 PDF · DOCX · TXT</span>
          <span>🔒 Local SQLite storage</span>
        </div>
      </div>
      <aside class="hero-card">
        <h4>Live Preview</h4>
        <div class="row"><span>Name</span><span>Your Name</span></div>
        <div class="row"><span>Email</span><span>your.email@example.com</span></div>
        <div class="row"><span>Location</span><span>Your Location</span></div>
        <h4 style="margin-top:14px">Top Skills</h4>
        <div>
          <span class="pill">Python</span><span class="pill">NLP</span><span class="pill">Algorithms</span><span class="pill">SQL</span>
        </div>
      </aside>
    </section>

    <section class="features section">
      ${[
        [
          "📥",
          "Drag & Drop Upload",
          "Effortlessly upload PDF, DOCX and TXT resumes with progress tracking.",
        ],
        [
          "🧠",
          "Smart Extraction",
          "NLP + regex pipeline extracts contacts, skills, education and experience.",
        ],
        [
          "📊",
          "Live Analytics",
          "See top skills, education distribution, and completeness scores instantly.",
        ],
        [
          "🔎",
          "Powerful Search",
          "Find candidates by name, skill, education, experience or email.",
        ],
        [
          "📤",
          "One-click Export",
          "Download your candidate database as CSV or JSON anytime.",
        ],
        [
          "🎨",
          "Premium Experience",
          "Glassmorphism UI with animated backgrounds and smooth motion.",
        ],
      ]
        .map(
          ([i, h, p]) => `
        <div class="feature glass">
          <div class="ic">${i}</div>
          <h3>${h}</h3><p>${p}</p>
        </div>`,
        )
        .join("")}
    </section>
  `;
}

function renderUpload() {
  setActiveNav("/upload");
  app.innerHTML = `
    <section class="section">
      <h2 style="font-family:'Space Grotesk';margin:8px 0 18px">Upload a Resume</h2>
      <div class="upload-wrap">
        <div>
          <label class="dropzone glass" id="dz">
            <input type="file" id="file" accept=".pdf,.docx,.txt" />
            <div class="icon">📄</div>
            <h3>Drag & drop your resume</h3>
            <p>or <b style="color:var(--text)">click to browse</b> — PDF, DOCX, TXT up to 10MB</p>
            <button type="button" class="btn btn-primary" id="browseBtn">Choose File</button>
            <div class="progress" id="prog" style="display:none"><span></span></div>
            <p id="status" style="margin-top:14px;color:var(--muted)"></p>
          </label>
        </div>
        <aside class="parsed-card glass" id="result">
          <h3>Parsed Result</h3>
          <p style="color:var(--muted);margin:0">Upload a resume to see extracted fields here.</p>
        </aside>
      </div>
    </section>
  `;
  const dz = document.getElementById("dz");
  const fileInput = document.getElementById("file");
  const status = document.getElementById("status");
  const prog = document.getElementById("prog");
  const bar = prog.querySelector("span");
  const result = document.getElementById("result");

  document.getElementById("browseBtn").addEventListener("click", (e) => {
    e.preventDefault();
    fileInput.click();
  });
  ["dragenter", "dragover"].forEach((ev) =>
    dz.addEventListener(ev, (e) => {
      e.preventDefault();
      dz.classList.add("drag");
    }),
  );
  ["dragleave", "drop"].forEach((ev) =>
    dz.addEventListener(ev, (e) => {
      e.preventDefault();
      dz.classList.remove("drag");
    }),
  );
  dz.addEventListener("drop", (e) => {
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener("change", (e) => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
  });

  async function handleFile(file) {
    prog.style.display = "block";
    bar.style.width = "0%";
    status.innerHTML = `<span class="spinner"></span> Uploading ${esc(file.name)}…`;
    try {
      const data = await api.upload(file, (p) => {
        bar.style.width = p + "%";
        if (p >= 100)
          status.innerHTML = `<span class="spinner"></span> Parsing with NLP…`;
      });
      bar.style.width = "100%";
      status.textContent = "✅ Parsed successfully";
      showToast("Resume parsed successfully", "success");
      renderParsed(data.candidate);
    } catch (err) {
      status.textContent = "❌ " + err.message;
      showToast(err.message, "error");
    }
  }

  function renderParsed(c) {
    result.innerHTML = `
      <h3>${esc(c.name || "Unknown candidate")}</h3>
      <div class="field"><span>Email</span><span>${esc(c.email || "—")}</span></div>
      <div class="field"><span>Phone</span><span>${esc(c.phone || "—")}</span></div>
      <div class="field"><span>Location</span><span>${esc(c.location || "—")}</span></div>
      <div class="field"><span>LinkedIn</span><span>${esc(c.linkedin || "—")}</span></div>
      <div class="field"><span>GitHub</span><span>${esc(c.github || "—")}</span></div>
      <div class="field"><span>Completeness</span><span><b>${c.completeness}%</b></span></div>
      <div style="margin:14px 0 6px;color:var(--muted);font-size:13px">Top Skills</div>
      <div>${
        (c.skills || [])
          .slice(0, 12)
          .map((s) => `<span class="skill-pill">${esc(s)}</span>`)
          .join(" ") ||
        '<span style="color:var(--muted)">No skills detected</span>'
      }</div>
      <div style="display:flex;gap:8px;margin-top:18px;flex-wrap:wrap">
        <a class="btn btn-primary" href="#/candidate/${c.id}">View Profile</a>
        <a class="btn" href="#/dashboard">Go to Dashboard</a>
      </div>
    `;
  }
}

async function renderDashboard() {
  setActiveNav("/dashboard");
  app.innerHTML = `<section class="section"><div class="empty glass">Loading dashboard…</div></section>`;
  const [stats, candidates] = await Promise.all([api.analytics(), api.list()]);
  app.innerHTML = `
    <section class="section">
      <div style="display:flex;align-items:end;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:6px">
        <div>
          <h2 style="font-family:'Space Grotesk';margin:8px 0 4px">Candidate Dashboard</h2>
          <p style="color:var(--muted);margin:0">Manage, search and export your parsed talent pool.</p>
        </div>
        <div style="display:flex;gap:8px">
          <a class="btn" href="/api/candidates/export.csv">⬇ Export CSV</a>
          <a class="btn" href="/api/candidates/export.json">⬇ Export JSON</a>
          <a class="btn btn-primary" href="#/upload">+ Add Resume</a>
        </div>
      </div>

      <div class="stats">
        ${[
          ["Total Candidates", stats.totalCandidates],
          ["Resumes Parsed", stats.totalUploads],
          ["Avg Completeness", stats.avgCompleteness + "%"],
          ["Unique Skills", stats.topSkills.length],
        ]
          .map(
            ([l, v]) =>
              `<div class="stat glass"><div class="label">${l}</div><div class="value">${v}</div></div>`,
          )
          .join("")}
      </div>

      <div class="analytics">
        <div class="chart-card glass">
          <h4>Top Skills</h4>
          ${renderBars(stats.topSkills)}
        </div>
        <div class="chart-card glass">
          <h4>Education Distribution</h4>
          ${renderBars(stats.educationDistribution)}
        </div>
      </div>

      <div class="toolbar glass" style="padding:10px 14px;border-radius:999px">
        <input id="q" class="grow" placeholder="Search by name, email, skill, education…" />
        <input id="skill" placeholder="Filter by skill" style="max-width:180px"/>
        <select id="sort">
          <option value="created_at">Newest</option>
          <option value="name">Name (A-Z)</option>
          <option value="completeness">Completeness</option>
        </select>
      </div>

      <div id="grid" class="cards"></div>
    </section>
  `;

  const grid = document.getElementById("grid");
  const q = document.getElementById("q");
  const skill = document.getElementById("skill");
  const sort = document.getElementById("sort");

  function paint(rows) {
    if (!rows.length) {
      grid.innerHTML = `<div class="empty glass" style="grid-column:1/-1">No candidates yet — upload a resume to get started.</div>`;
      return;
    }
    grid.innerHTML = rows
      .map(
        (c) => `
      <article class="card glass" data-id="${c.id}">
        <div class="top">
          <div class="avatar">${esc(initials(c.name))}</div>
          <div style="flex:1;min-width:0">
            <p class="name">${esc(c.name || "Unknown")}</p>
            <p class="email">${esc(c.email || "No email")}</p>
          </div>
          <div title="Completeness" style="font-size:12px;color:var(--muted)"><b style="color:var(--text)">${c.completeness ?? 0}%</b></div>
        </div>
        <div class="skills">
          ${(c.skills || [])
            .slice(0, 5)
            .map((s) => `<span class="skill-pill">${esc(s)}</span>`)
            .join("")}
          ${(c.skills || []).length > 5 ? `<span class="skill-pill">+${c.skills.length - 5}</span>` : ""}
        </div>
        <div class="meta"><span>${esc(c.location || "—")}</span><span>${new Date(c.created_at).toLocaleDateString()}</span></div>
      </article>
    `,
      )
      .join("");
    grid
      .querySelectorAll(".card")
      .forEach((el) =>
        el.addEventListener("click", () =>
          navTo("#/candidate/" + el.dataset.id),
        ),
      );
  }
  paint(candidates);

  let t;
  async function refresh() {
    const rows = await api.list({
      q: q.value,
      skill: skill.value,
      sort: sort.value,
      order: sort.value === "name" ? "asc" : "desc",
    });
    paint(rows);
  }
  [q, skill].forEach((i) =>
    i.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(refresh, 200);
    }),
  );
  sort.addEventListener("change", refresh);
}

function renderBars(items) {
  if (!items.length)
    return `<p style="color:var(--muted);font-size:14px">No data yet.</p>`;
  const max = Math.max(...items.map((i) => i.count));
  return items
    .map(
      (i) => `
    <div class="bar-row">
      <span class="name" title="${esc(i.name)}">${esc(i.name)}</span>
      <div class="bar"><span style="width:${Math.round((i.count / max) * 100)}%"></span></div>
      <span class="count">${i.count}</span>
    </div>
  `,
    )
    .join("");
}

async function renderCandidate(id) {
  setActiveNav("");
  app.innerHTML = `<section class="section"><div class="empty glass">Loading candidate…</div></section>`;
  const c = await api.get(id);
  if (c.error) {
    app.innerHTML = `<section class="section"><div class="empty glass">Candidate not found.</div></section>`;
    return;
  }
  app.innerHTML = `
    <section class="section">
      <a href="#/dashboard" class="btn btn-ghost" style="margin-bottom:14px">← Back to dashboard</a>
      <div class="detail">
        <aside class="profile glass">
          <div class="avatar">${esc(initials(c.name))}</div>
          <h2>${esc(c.name || "Unknown")}</h2>
          <div class="role">${esc(c.location || "")}</div>
          <div style="margin-top:18px"><b style="font-size:28px;font-family:'Space Grotesk'">${c.completeness}%</b><div style="color:var(--muted);font-size:12px">Profile Completeness</div></div>
          <div class="links">
            ${c.email ? `<a class="btn" href="mailto:${esc(c.email)}">✉ Email</a>` : ""}
            ${c.linkedin ? `<a class="btn" target="_blank" href="${esc(c.linkedin.startsWith("http") ? c.linkedin : "https://" + c.linkedin)}">in LinkedIn</a>` : ""}
            ${c.github ? `<a class="btn" target="_blank" href="${esc(c.github.startsWith("http") ? c.github : "https://" + c.github)}">GitHub</a>` : ""}
          </div>
          <div class="actions">
            <button class="btn" id="downloadJson">⬇ Download JSON</button>
            <button class="btn btn-danger" id="delBtn">🗑 Delete</button>
          </div>
        </aside>
        <div class="panels">
          <div class="panel glass">
            <h3>Summary</h3>
            <p style="color:var(--muted);margin:0">${esc(c.summary || "No summary available.")}</p>
          </div>
          <div class="panel glass">
            <h3>Contact & Links</h3>
            <dl class="kv">
              <dt>Email</dt><dd>${esc(c.email || "—")}</dd>
              <dt>Phone</dt><dd>${esc(c.phone || "—")}</dd>
              <dt>Location</dt><dd>${esc(c.location || "—")}</dd>
              <dt>LinkedIn</dt><dd>${esc(c.linkedin || "—")}</dd>
              <dt>GitHub</dt><dd>${esc(c.github || "—")}</dd>
            </dl>
          </div>
          <div class="panel glass">
            <h3>Skills</h3>
            <div>${(c.skills || []).map((s) => `<span class="skill-pill" style="margin:4px 6px 0 0;display:inline-block">${esc(s)}</span>`).join("") || '<span style="color:var(--muted)">None detected</span>'}</div>
          </div>
          <div class="panel glass">
            <h3>Experience</h3>
            <pre>${esc(c.experience || "Not detected.")}</pre>
          </div>
          <div class="panel glass">
            <h3>Education</h3>
            <pre>${esc(
              (c.education || "")
                .split("|")
                .map((s) => s.trim())
                .filter(Boolean)
                .join("\n") || "Not detected.",
            )}</pre>
          </div>
          <div class="panel glass">
            <h3>Certifications</h3>
            <pre>${esc(
              (c.certifications || "")
                .split("|")
                .map((s) => s.trim())
                .filter(Boolean)
                .join("\n") || "Not detected.",
            )}</pre>
          </div>
          <div class="panel glass">
            <h3>Projects</h3>
<div style="display:flex;flex-direction:column;gap:12px">
  ${
    c.projects
      ? c.projects
          .split("|")
          .filter(Boolean)
          .map(
            (p) => `
              <div style="padding:12px;border:1px solid rgba(255,255,255,.08);border-radius:12px">
                ${esc(p)}
              </div>
            `,
          )
          .join("")
      : "<span style='color:var(--muted)'>Not detected.</span>"
  }
</div>
          </div>
        </div>
      </div>
    </section>
  `;

  document.getElementById("downloadJson").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(c, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(c.name || "candidate").replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
  document.getElementById("delBtn").addEventListener("click", async () => {
    if (!confirm("Delete this candidate? This cannot be undone.")) return;
    await api.remove(c.id);
    showToast("Candidate deleted");
    navTo("#/dashboard");
  });
}

function router() {
  const hash = location.hash.replace(/^#/, "") || "/";
  window.scrollTo(0, 0);
  if (hash === "/") return renderHome();
  if (hash === "/upload") return renderUpload();
  if (hash === "/dashboard") return renderDashboard();
  const m = hash.match(/^\/candidate\/(\d+)$/);
  if (m) return renderCandidate(m[1]);
  app.innerHTML = `<section class="section"><div class="empty glass">Page not found.</div></section>`;
}
window.addEventListener("hashchange", router);
router();
