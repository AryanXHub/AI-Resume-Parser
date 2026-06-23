const SKILL_DICTIONARY = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "C#",
  "Go",
  "Rust",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
  "Scala",
  "R",
  "MATLAB",
  "HTML",
  "CSS",
  "SASS",
  "SCSS",
  "Tailwind",
  "Bootstrap",
  "React",
  "Next.js",
  "Vue",
  "Nuxt",
  "Angular",
  "Svelte",
  "Redux",
  "jQuery",
  "Node.js",
  "Express",
  "NestJS",
  "Django",
  "Flask",
  "FastAPI",
  "Spring",
  "Spring Boot",
  "Laravel",
  "Rails",
  "SQL",
  "MySQL",
  "PostgreSQL",
  "SQLite",
  "MongoDB",
  "Redis",
  "Cassandra",
  "DynamoDB",
  "Oracle",
  "Firebase",
  "Supabase",
  "AWS",
  "Azure",
  "GCP",
  "Docker",
  "Kubernetes",
  "Terraform",
  "Ansible",
  "Jenkins",
  "CI/CD",
  "Git",
  "GitHub",
  "GitLab",
  "Linux",
  "Bash",
  "Shell",
  "NLP",
  "Machine Learning",
  "Deep Learning",
  "TensorFlow",
  "PyTorch",
  "Keras",
  "Scikit-learn",
  "Pandas",
  "NumPy",
  "OpenCV",
  "Hugging Face",
  "LangChain",
  "REST",
  "GraphQL",
  "gRPC",
  "WebSockets",
  "Microservices",
  "Figma",
  "Photoshop",
  "Illustrator",
  "UI/UX",
  "Agile",
  "Scrum",
  "Jira",
];

const EDUCATION_KEYWORDS = [
  "bachelor",
  "b.sc",
  "b.s.",
  "b.tech",
  "btech",
  "computer science",
  "engineering",
  "be ",
  "master",
  "m.sc",
  "m.s.",
  "m.tech",
  "mba",
  "phd",
  "doctorate",
  "diploma",
  "high school",
  "intermediate",
  "associate",
];
const SECTION_HEADERS = {
  education: /^\s*(education|academic background|qualifications)\s*$/i,
  experience:
    /^\s*(experience|work experience|professional experience|employment)\s*$/i,
  skills: /^\s*(skills|technical skills|core competencies)\s*$/i,
  certifications: /^\s*(certifications?|courses|licenses)\s*$/i,
  projects: /^\s*(projects?|personal projects)\s*$/i,
  summary: /^\s*(summary|profile|objective|about|introduction)\s*$/i,
};

function extractEmail(text) {
  const m = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return m ? m[0] : null;
}

function extractPhone(text) {
  const m = text.match(
    /(\+?\d{1,3}[\s.-]?)?\(?\d{3,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/,
  );
  return m ? m[0].trim() : null;
}

function extractLinkedIn(text) {
  const m = text.match(
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[A-Za-z0-9_\-\/?=&%.]+/i,
  );
  return m ? m[0] : null;
}

function extractGithub(text) {
  const m = text.match(
    /(?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9_\-\/?=&%.]+/i,
  );
  return m ? m[0] : null;
}

function extractName(text) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const email = extractEmail(text);

  if (email) {
    const emailLineIndex = lines.findIndex((line) => line.includes(email));

    if (emailLineIndex > 0) {
      for (
        let i = emailLineIndex - 1;
        i >= Math.max(0, emailLineIndex - 5);
        i--
      ) {
        const line = lines[i];

        if (
          /^[A-Z][A-Z\s.'-]{3,}$/.test(line) ||
          /^[A-Za-z]+(?:\s+[A-Za-z]+){1,4}$/.test(line)
        ) {
          return line.trim();
        }
      }
    }
  }

  return null;
}

function extractLocation(text) {
  const email = extractEmail(text);

  if (!email) return null;

  const lines = text.split("\n");

  const contactLine = lines.find((line) => line.includes(email));

  if (!contactLine) return null;

  const match = contactLine.match(/^([^|@]+?),(.+?)\s*\|/);

  if (match) {
    return `${match[1].trim()}, ${match[2].trim()}`;
  }

  return null;
}

function extractSkills(text) {
  const found = new Set();
  const lower = text.toLowerCase();
  for (const skill of SKILL_DICTIONARY) {
    const pattern = new RegExp(
      `(^|[^a-zA-Z0-9+#.])${skill.replace(/[.+]/g, "\\$&")}([^a-zA-Z0-9+#.]|$)`,
      "i",
    );
    if (pattern.test(lower)) found.add(skill);
  }
  return Array.from(found);
}

function splitSections(text) {
  const lines = text.split("\n");
  const sections = {};
  let current = "header";
  sections[current] = [];

  for (const line of lines) {
    let matched = null;

    for (const [name, re] of Object.entries(SECTION_HEADERS)) {
      if (re.test(line.trim())) {
        matched = name;
        break;
      }
    }

    if (matched) {
      current = matched;
      sections[current] = sections[current] || [];
    } else {
      sections[current].push(line);
    }
  }

  const out = {};

  for (const k of Object.keys(sections)) {
    out[k] = sections[k].join("\n").trim();
  }

  return out;
}

function extractEducation(text, sections) {
  const lines = text.split("\n");

  const educationLines = lines.filter((line) =>
    EDUCATION_KEYWORDS.some((keyword) => line.toLowerCase().includes(keyword)),
  );

  return educationLines
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 5)
    .join(" | ");
}

function extractExperience(text, sections) {
  const block = sections.experience || "";
  if (!block) return "";
  return block
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 30)
    .join("\n");
}

function extractCertifications(sections) {
  const block = sections.certifications || "";
  return block
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 20)
    .join(" | ");
}

function extractProjects(sections) {
  const block = sections.projects || "";

  const lines = block
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const projectTitles = [];

  for (const line of lines) {
    if (
      line.length > 3 &&
      line.length < 60 &&
      !/[.!?]$/.test(line) &&
      !line.includes(":")
    ) {
      projectTitles.push(line);
    }
  }

  return [...new Set(projectTitles)].join("|");
}

function buildSummary({ name, skills, experience, education }) {
  const skillBit = skills.slice(0, 5).join(", ");
  const eduBit = education ? education.split("|")[0].trim() : "";
  const expBit = experience ? experience.split("\n")[0].slice(0, 100) : "";
  const parts = [];
  if (name) parts.push(`${name} is a professional candidate.`);
  if (skillBit) parts.push(`Key skills include ${skillBit}.`);
  if (expBit) parts.push(`Recent experience: ${expBit}.`);
  if (eduBit) parts.push(`Education: ${eduBit}.`);
  return parts.join(" ");
}

function completenessScore(data) {
  const fields = [
    "name",
    "email",
    "phone",
    "skills",
    "education",
    "experience",
    "linkedin",
    "github",
    "location",
    "certifications",
    "projects",
  ];
  let score = 0;
  for (const f of fields) {
    const v = data[f];
    if (Array.isArray(v) ? v.length : v && String(v).trim()) score++;
  }
  return Math.round((score / fields.length) * 100);
}

function parseResume(text) {
  const cleaned = text.replace(/\r/g, "").replace(/\u0000/g, "");
  const sections = splitSections(cleaned);

  const data = {
    name: extractName(cleaned),
    email: extractEmail(cleaned),
    phone: extractPhone(cleaned),
    linkedin: extractLinkedIn(cleaned),
    github: extractGithub(cleaned),
    location: extractLocation(cleaned),
    skills: extractSkills(cleaned),
    education: extractEducation(cleaned, sections),
    experience: extractExperience(cleaned, sections),
    certifications: extractCertifications(sections),
    projects: extractProjects(sections),
  };
  data.summary = buildSummary(data);
  data.completeness = completenessScore(data);
  data.raw_text = cleaned.slice(0, 20000);
  return data;
}

module.exports = { parseResume };
