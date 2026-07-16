import type { ResumeProfile, ResumeProject } from "@/types";

// A broad technical/professional vocabulary used to catch skills mentioned
// inline (in project bullets, summaries, etc.) even outside a dedicated
// "Skills" section. This is a *supplement* to section-based extraction
// below, not the only source of truth — see extractSkills().
const SKILL_DICTIONARY = [
  // Languages
  "javascript", "typescript", "python", "java", "c++", "c#", "go", "golang",
  "rust", "ruby", "php", "swift", "kotlin", "scala", "dart", "perl",
  "matlab", "objective-c", "elixir", "haskell", "lua", "solidity",
  // Data / query
  "sql", "nosql", "plsql", "t-sql", "graphql",
  // Frontend
  "react", "next.js", "nextjs", "vue", "nuxt", "angular", "svelte", "jquery",
  "html", "html5", "css", "css3", "tailwind", "tailwindcss", "sass", "less",
  "bootstrap", "material ui", "redux", "webpack", "vite", "three.js",
  // Backend / runtime
  "node.js", "nodejs", "express", "express.js", "django", "flask", "fastapi",
  "spring", "spring boot", "rails", "ruby on rails", "laravel", ".net",
  "asp.net", "nestjs",
  // APIs / protocols
  "rest api", "restful", "grpc", "websocket", "soap",
  // Cloud / infra
  "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "terraform",
  "ci/cd", "jenkins", "github actions", "gitlab ci", "ansible", "vercel",
  "netlify", "heroku", "firebase", "cloudflare", "nginx", "linux", "unix",
  "bash", "shell scripting", "powershell",
  // Version control / collab
  "git", "github", "gitlab", "bitbucket",
  // Databases
  "redis", "postgresql", "postgres", "mysql", "mongodb", "sqlite",
  "elasticsearch", "dynamodb", "cassandra", "oracle", "mariadb", "supabase",
  "firestore",
  // Messaging / data infra
  "kafka", "rabbitmq", "airflow", "spark", "hadoop", "snowflake", "dbt",
  "databricks",
  // AI / ML / data
  "machine learning", "deep learning", "nlp", "computer vision",
  "reinforcement learning", "tensorflow", "pytorch", "keras",
  "scikit-learn", "sklearn", "pandas", "numpy", "opencv", "hugging face",
  "llm", "large language models", "generative ai", "data analysis",
  "data engineering", "data science", "data visualization", "tableau",
  "power bi", "looker", "statistics", "a/b testing",
  // Mobile / game
  "android", "ios", "flutter", "react native", "swiftui", "unity",
  "unreal engine", "xamarin",
  // Testing / QA
  "jest", "cypress", "selenium", "playwright", "junit", "pytest",
  "test automation", "qa", "unit testing", "tdd",
  // Product / process
  "product management", "project management", "agile", "scrum", "kanban",
  "jira", "confluence", "okrs", "roadmapping", "a/b testing",
  // Design
  "figma", "sketch", "adobe xd", "photoshop", "illustrator", "ui/ux",
  "user research", "wireframing", "prototyping", "design systems",
  // Sales / marketing / business
  "sales", "marketing", "seo", "sem", "content strategy", "salesforce",
  "hubspot", "google analytics", "crm", "email marketing", "growth hacking",
  "social media marketing",
  // Finance / ops
  "accounting", "financial modeling", "excel", "powerpoint", "quickbooks",
  "sap", "erp", "budgeting", "forecasting",
  // Soft / leadership
  "leadership", "communication", "stakeholder management", "negotiation",
  "public speaking", "mentoring", "cross-functional collaboration",
  "team management", "problem solving", "critical thinking",
  // Security / networking
  "cybersecurity", "penetration testing", "network security", "owasp",
  "iam", "encryption", "compliance",
  // Blockchain
  "blockchain", "web3", "ethereum", "smart contracts",
];

// Recognized resume section headings, mapped to a normalized key. Matching
// is done against a trimmed, lowercased, punctuation-stripped line, so
// "SKILLS", "Technical Skills:", and "Skills & Tools" all resolve to "skills".
const SECTION_HEADERS: { key: SectionKey; pattern: RegExp }[] = [
  { key: "skills", pattern: /^(technical |core |key )?skills( ?(&|and) ?tools)?$/i },
  { key: "skills", pattern: /^technolog(y|ies)$/i },
  { key: "skills", pattern: /^tools?( ?(&|and) ?technolog(y|ies))?$/i },
  { key: "skills", pattern: /^core competenc(y|ies)$/i },
  { key: "skills", pattern: /^tech(nical)? stack$/i },
  { key: "projects", pattern: /^(personal |academic |key |featured )?projects?$/i },
  { key: "experience", pattern: /^(work |professional |relevant )?experience$/i },
  { key: "experience", pattern: /^employment( history)?$/i },
  { key: "experience", pattern: /^work history$/i },
  { key: "education", pattern: /^education$/i },
  { key: "education", pattern: /^academic background$/i },
  { key: "certifications", pattern: /^certifications?( ?(&|and) ?licenses)?$/i },
  { key: "certifications", pattern: /^licenses?( ?(&|and) ?certifications?)?$/i },
  { key: "achievements", pattern: /^(achievements?|awards?|honors?)( ?(&|and) ?(achievements?|awards?|honors?))?$/i },
  { key: "summary", pattern: /^(summary|objective|profile|about( me)?)$/i },
  { key: "other", pattern: /^(references?|contact|interests?|hobbies|publications?|languages?)$/i },
];

type SectionKey =
  | "skills"
  | "projects"
  | "experience"
  | "education"
  | "certifications"
  | "achievements"
  | "summary"
  | "other";

interface Section {
  key: SectionKey;
  lines: string[];
}

/**
 * Splits the resume into sections by scanning for lines that match a known
 * heading pattern. Resumes lose all font/bold/size information once
 * converted to plain text, so this is necessarily heuristic — but it's the
 * same trick every plain-text resume parser relies on, and it's what lets
 * us go beyond a fixed keyword dictionary and read the sections the
 * candidate actually organized their resume into.
 */
function splitIntoSections(text: string): Section[] {
  const rawLines = text.split(/\r?\n/).map((l) => l.trim());
  const sections: Section[] = [];
  let current: Section = { key: "other", lines: [] };

  for (const line of rawLines) {
    const normalized = line.replace(/[:：]+$/, "").trim();
    const header = normalized.length > 0 && normalized.length <= 40
      ? SECTION_HEADERS.find((h) => h.pattern.test(normalized))
      : undefined;

    if (header) {
      if (current.lines.some((l) => l.length > 0)) sections.push(current);
      current = { key: header.key, lines: [] };
      continue;
    }
    current.lines.push(line);
  }
  if (current.lines.some((l) => l.length > 0)) sections.push(current);
  return sections;
}

function sectionsByKey(sections: Section[], key: SectionKey): string[] {
  return sections.filter((s) => s.key === key).flatMap((s) => s.lines);
}

const BULLET_PREFIX = /^[•●▪◦○■\-–*·]\s*/;

function stripBullet(line: string): string {
  return line.replace(BULLET_PREFIX, "").trim();
}

function isBulletLine(line: string): boolean {
  return BULLET_PREFIX.test(line.trim());
}

/**
 * Splits a block of "Skills" section text into individual skill tokens.
 * Candidates are frequently separated by commas, pipes, bullets, or slashes
 * (or simply stacked one per line) — this captures whatever delimiter the
 * candidate actually used, so every listed skill is picked up rather than
 * only the ones that happen to appear in a curated dictionary.
 */
function tokenizeSkillsSection(lines: string[]): string[] {
  const out = new Set<string>();
  for (const rawLine of lines) {
    const line = stripBullet(rawLine);
    if (!line) continue;

    // A line like "Languages: Python, Java, C++" — drop the "Languages:"
    // label so it isn't picked up as a skill token itself.
    const afterLabel = line.replace(/^[A-Za-z /&]{2,30}:\s*/, "");

    const tokens = afterLabel
      .split(/[,|•●▪◦○■;/]|(?:\s{2,})/)
      .map((t) => t.trim())
      .map((t) => t.replace(/\.$/, ""))
      .filter(Boolean);

    for (const token of tokens) {
      // Guard against picking up whole sentences that slipped through
      // (a real skill/tool name is short and has no sentence punctuation).
      if (token.length < 1 || token.length > 40) continue;
      if (/[.!?]{1}\s/.test(token)) continue;
      out.add(token);
    }
  }
  return Array.from(out);
}

function extractSkills(rawText: string, sections: Section[]): string[] {
  const found = new Map<string, string>(); // lowercase key -> display form

  const addSkill = (skill: string) => {
    const key = skill.toLowerCase().trim();
    if (!key) return;
    if (!found.has(key)) found.set(key, skill.trim());
  };

  // 1. Whatever the candidate actually listed under a Skills-type heading —
  //    the primary, most reliable source, and the one that lets us surface
  //    tools/frameworks we've never seen before instead of only dictionary hits.
  tokenizeSkillsSection(sectionsByKey(sections, "skills")).forEach(addSkill);

  // 2. Dictionary sweep across the full text, for skills mentioned in prose
  //    (project write-ups, summaries) rather than listed in a Skills block.
  //    Match against the original-case text so e.g. "Node.js" is captured
  //    as written, rather than forcing the lowercase dictionary spelling.
  for (const skill of SKILL_DICTIONARY) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, "i");
    const match = rawText.match(pattern);
    if (match) addSkill(match[0]);
  }

  return Array.from(found.values()).slice(0, 60);
}

const ROLE_PATTERNS = [
  /(?:senior|junior|lead|staff|principal)?\s?(?:software|frontend|backend|full[\s-]?stack|mobile|data|devops|cloud|security|qa|test)?\s?(?:engineer|developer|architect)\b/gi,
  /(?:product|project|program|engineering|marketing|sales|operations)\s?manager\b/gi,
  /(?:data|business|financial|systems)\s?analyst\b/gi,
  /(?:data|research)\s?scientist\b/gi,
  /(?:ui|ux)\s?designer\b/gi,
  /(?:account|sales)\s?executive\b/gi,
  /intern(?:ship)?\b/gi,
];

// Bare, unqualified matches like a lone "engineer" or "architect" (as
// opposed to "Senior Software Engineer") read as noise rather than an
// actual title the candidate used — drop them.
const GENERIC_BARE_ROLES = new Set([
  "engineer", "developer", "architect", "manager", "analyst",
  "scientist", "designer", "executive", "intern", "internship",
]);

function extractRoles(text: string): string[] {
  const found = new Set<string>();
  for (const pattern of ROLE_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach((m) => {
        const cleaned = m.trim().replace(/\s+/g, " ");
        if (cleaned.length > 3 && !GENERIC_BARE_ROLES.has(cleaned.toLowerCase())) found.add(cleaned);
      });
    }
  }
  return Array.from(found).slice(0, 8);
}

function extractCompanies(text: string): string[] {
  const stoplist = new Set([
    "Experience", "Education", "Summary", "Skills", "Projects",
    "Objective", "Certifications", "Awards", "References", "Contact",
  ]);
  const found = new Set<string>();
  const atPattern = /\bat\s+([A-Z][A-Za-z0-9&.,'\- ]{2,40})(?=[\n,.]| \d{4}| -| –)/g;
  let match: RegExpExecArray | null;
  while ((match = atPattern.exec(text)) !== null) {
    const name = match[1].trim();
    if (!stoplist.has(name)) found.add(name);
  }
  return Array.from(found).slice(0, 8);
}

function extractYearsOfExperience(text: string): number | null {
  const pattern = /(\d{1,2})\+?\s*(?:years|yrs)\s*(?:of)?\s*experience/i;
  const match = text.match(pattern);
  if (match) return parseInt(match[1], 10);
  return null;
}

function extractEducation(sections: Section[], fallbackText: string): string[] {
  const pattern = /(bachelor|master|b\.?tech|m\.?tech|b\.?sc|m\.?sc|mba|ph\.?d|associate)\.?[^\n,.]{0,60}/gi;
  const sectionText = sectionsByKey(sections, "education").join("\n");
  const source = sectionText.trim().length > 0 ? sectionText : fallbackText;
  const matches = source.match(pattern) || [];
  const cleaned = Array.from(new Set(matches.map((m) => m.trim()))).slice(0, 5);
  if (cleaned.length > 0) return cleaned;

  // No degree keyword matched — fall back to non-empty lines in the
  // Education section itself, so a listed school/program still surfaces.
  return sectionsByKey(sections, "education")
    .map((l) => stripBullet(l))
    .filter((l) => l.length > 3 && l.length < 100)
    .slice(0, 3);
}

function extractName(text: string): string | null {
  const firstLines = text.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 5);
  for (const line of firstLines) {
    const words = line.split(/\s+/);
    if (
      words.length >= 2 &&
      words.length <= 4 &&
      words.every((w) => /^[A-Z][a-zA-Z.'-]*$/.test(w)) &&
      !/resume|curriculum|vitae|cv/i.test(line)
    ) {
      return line;
    }
  }
  return null;
}

/**
 * Groups the "Projects" section into individual project entries. Each
 * entry is assumed to start with a short title line (project name, often
 * with a tech stack in parentheses or a date after it), followed by one or
 * more bullet lines describing it.
 */
function extractProjects(sections: Section[]): ResumeProject[] {
  const lines = sectionsByKey(sections, "projects");
  const projects: ResumeProject[] = [];
  let current: ResumeProject | null = null;

  const looksLikeTitle = (line: string) =>
    line.length > 0 &&
    line.length <= 90 &&
    !isBulletLine(line) &&
    !/[.!?]$/.test(line);

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (isBulletLine(line) || !looksLikeTitle(line)) {
      const detail = stripBullet(line);
      if (!detail) continue;
      if (!current) {
        // Description text with no preceding title line — start an
        // untitled project bucket rather than dropping the content.
        current = { name: `Project ${projects.length + 1}`, description: "" };
      }
      current.description = current.description ? `${current.description} ${detail}` : detail;
    } else {
      if (current) projects.push(current);
      // Strip a trailing " (React, Node.js)" / " — Jan 2023" style suffix
      // from the title line so the project name reads cleanly.
      const name = line.replace(/\s*[\(\|–-].*$/, "").trim() || line;
      current = { name, description: "" };
    }
  }
  if (current) projects.push(current);

  return projects
    .filter((p) => p.name.length > 1)
    .map((p) => ({ name: p.name, description: p.description.slice(0, 260) }))
    .slice(0, 8);
}

/**
 * Pulls the individual accomplishment bullets out of the Experience
 * section, so resume-driven questions can reference something specific the
 * candidate wrote ("You mention you cut deploy time by 40% — walk me
 * through that.") instead of only the company/role line.
 */
function extractExperienceBullets(sections: Section[]): string[] {
  const lines = sectionsByKey(sections, "experience");
  const bullets = lines
    .filter((l) => isBulletLine(l) || l.trim().length > 40)
    .map((l) => stripBullet(l))
    .filter((l) => l.length >= 25 && l.length <= 220);
  return Array.from(new Set(bullets)).slice(0, 10);
}

function extractCertifications(sections: Section[]): string[] {
  return sectionsByKey(sections, "certifications")
    .map((l) => stripBullet(l))
    .filter((l) => l.length > 3 && l.length < 120)
    .slice(0, 8);
}

function extractAchievements(sections: Section[]): string[] {
  return sectionsByKey(sections, "achievements")
    .map((l) => stripBullet(l))
    .filter((l) => l.length > 5 && l.length < 200)
    .slice(0, 8);
}

export function analyzeResumeText(rawText: string): ResumeProfile {
  const sections = splitIntoSections(rawText);

  return {
    rawText,
    name: extractName(rawText),
    skills: extractSkills(rawText, sections),
    roles: extractRoles(rawText),
    companies: extractCompanies(rawText),
    yearsOfExperience: extractYearsOfExperience(rawText),
    education: extractEducation(sections, rawText),
    projects: extractProjects(sections),
    experienceBullets: extractExperienceBullets(sections),
    certifications: extractCertifications(sections),
    achievements: extractAchievements(sections),
  };
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    // Reconstruct line breaks from item Y-position rather than joining
    // everything with spaces — pdf.js otherwise flattens the whole page
    // into one line, which destroys the section structure our parser
    // relies on (bullets, one-skill-per-line lists, etc).
    let lastY: number | null = null;
    let line = "";
    for (const item of content.items as any[]) {
      const y = item.transform?.[5] ?? null;
      if (lastY !== null && y !== null && Math.abs(y - lastY) > 2) {
        text += line.trim() + "\n";
        line = "";
      }
      line += item.str + " ";
      lastY = y;
    }
    text += line.trim() + "\n";
  }
  return text;
}

async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}

async function extractTxtText(file: File): Promise<string> {
  return await file.text();
}

export async function parseResumeFile(file: File): Promise<ResumeProfile> {
  const name = file.name.toLowerCase();
  let text = "";

  if (name.endsWith(".pdf")) {
    text = await extractPdfText(file);
  } else if (name.endsWith(".docx")) {
    text = await extractDocxText(file);
  } else if (name.endsWith(".txt")) {
    text = await extractTxtText(file);
  } else {
    throw new Error("Unsupported file type. Please upload a PDF, DOCX, or TXT resume.");
  }

  if (!text || text.trim().length < 20) {
    throw new Error("We couldn't read enough text from that file. Try a different export of your resume.");
  }

  return analyzeResumeText(text);
}
