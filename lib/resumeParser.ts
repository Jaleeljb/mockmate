import type { ResumeProfile } from "@/types";

const SKILL_DICTIONARY = [
  "javascript", "typescript", "python", "java", "c++", "c#", "go", "golang",
  "rust", "ruby", "php", "swift", "kotlin", "scala", "sql", "nosql",
  "react", "next.js", "nextjs", "vue", "angular", "svelte", "node.js",
  "nodejs", "express", "django", "flask", "fastapi", "spring", "rails",
  "html", "css", "tailwind", "sass", "graphql", "rest api", "grpc",
  "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ci/cd",
  "jenkins", "git", "github", "gitlab", "linux", "bash", "redis",
  "postgresql", "mysql", "mongodb", "elasticsearch", "kafka", "rabbitmq",
  "machine learning", "deep learning", "nlp", "computer vision",
  "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy",
  "data analysis", "data engineering", "data science", "spark", "hadoop",
  "product management", "project management", "agile", "scrum", "kanban",
  "figma", "sketch", "ui/ux", "user research", "wireframing",
  "sales", "marketing", "seo", "content strategy", "salesforce",
  "accounting", "financial modeling", "excel", "powerpoint",
  "leadership", "communication", "stakeholder management", "negotiation",
  "android", "ios", "flutter", "react native", "unity", "unreal engine",
  "cybersecurity", "penetration testing", "network security",
  "solidity", "blockchain", "web3",
];

const ROLE_PATTERNS = [
  /(?:senior|junior|lead|staff|principal)?\s?(?:software|frontend|backend|full[\s-]?stack|mobile|data|devops|cloud|security|qa|test)?\s?(?:engineer|developer|architect)/gi,
  /(?:product|project|program|engineering|marketing|sales|operations)\s?manager/gi,
  /(?:data|business|financial|systems)\s?analyst/gi,
  /(?:data|research)\s?scientist/gi,
  /(?:ui|ux)\s?designer/gi,
  /(?:account|sales)\s?executive/gi,
  /intern(?:ship)?/gi,
];

function extractSkills(text: string): string[] {
  const lower = text.toLowerCase();
  const found = new Set<string>();
  for (const skill of SKILL_DICTIONARY) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, "i");
    if (pattern.test(lower)) found.add(skill);
  }
  return Array.from(found).slice(0, 14);
}

function extractRoles(text: string): string[] {
  const found = new Set<string>();
  for (const pattern of ROLE_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach((m) => {
        const cleaned = m.trim().replace(/\s+/g, " ");
        if (cleaned.length > 3) found.add(cleaned);
      });
    }
  }
  return Array.from(found).slice(0, 6);
}

const ACTION_VERBS = [
  "led", "built", "designed", "implemented", "launched", "migrated", "automated",
  "optimized", "reduced", "increased", "managed", "architected", "spearheaded",
  "developed", "created", "delivered", "improved", "drove", "scaled", "owned",
  "streamlined", "mentored", "shipped", "refactored", "negotiated", "grew",
];

const PROJECT_KEYWORDS =
  "platform|system|tool|application|app|dashboard|pipeline|engine|service|framework|library|portal|integration";

/**
 * Pairs each detected role with the nearest "at <Company>" mention in the
 * surrounding text (checked forward and backward within a small window),
 * so resume-grounded questions can reference a real role+company combo
 * instead of treating roles and companies as unrelated lists.
 */
function extractRoleCompanyPairs(text: string): { role: string; company: string | null }[] {
  const WINDOW = 220;
  const companyMatches: { name: string; index: number }[] = [];
  const atPattern = /\bat\s+([A-Z][A-Za-z0-9&.,'\- ]{2,40})(?=[\n,.]| \d{4}| -| –)/g;
  let cm: RegExpExecArray | null;
  while ((cm = atPattern.exec(text)) !== null) {
    companyMatches.push({ name: cm[1].trim(), index: cm.index });
  }

  const pairs: { role: string; company: string | null }[] = [];
  const seen = new Set<string>();

  for (const pattern of ROLE_PATTERNS) {
    const re = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g");
    let rm: RegExpExecArray | null;
    while ((rm = re.exec(text)) !== null) {
      const roleText = rm[0].trim().replace(/\s+/g, " ");
      if (roleText.length <= 3) continue;
      const followingChar = text[rm.index + rm[0].length];
      if (followingChar && /[a-zA-Z]/.test(followingChar)) continue;

      let nearest: { name: string; distance: number } | null = null;
      for (const c of companyMatches) {
        const distance = Math.abs(c.index - rm.index);
        if (distance <= WINDOW && (!nearest || distance < nearest.distance)) {
          nearest = { name: c.name, distance };
        }
      }

      const key = `${roleText.toLowerCase()}|${nearest?.name ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push({ role: roleText, company: nearest?.name ?? null });
    }
  }

  return pairs.slice(0, 8);
}

/**
 * Finds sentence/bullet-like fragments that read as concrete accomplishments:
 * either they open with a strong action verb, or they contain a number/metric
 * (%, x-multiplier, or a count). These ground follow-up questions in specifics
 * the candidate actually wrote rather than generic prompts.
 */
function extractHighlights(text: string): string[] {
  const rawLines = text
    .split(/\n|(?<=[.!?])\s+(?=[A-Z•\-])/)
    .map((l) => l.replace(/^[•\-*\u2022]\s*/, "").trim())
    .filter((l) => l.length >= 25 && l.length <= 220);

  const hasMetric = /\b\d+(\.\d+)?\s?(%|percent|x\b|k\b|m\b|million|billion|users|customers|hours|days|weeks|months)/i;
  const startsWithVerb = new RegExp(`^(${ACTION_VERBS.join("|")})\\b`, "i");

  const found = new Set<string>();
  for (const line of rawLines) {
    if (hasMetric.test(line) || startsWithVerb.test(line)) {
      found.add(line);
    }
    if (found.size >= 10) break;
  }
  return Array.from(found).slice(0, 8);
}

function extractProjects(text: string): string[] {
  const found = new Set<string>();

  const labelPattern = /[Pp]roject\s*[:\-]\s*([A-Z][A-Za-z0-9&'.]*(?:\s+[A-Z][A-Za-z0-9&'.]*){0,4})/g;
  let m: RegExpExecArray | null;
  while ((m = labelPattern.exec(text)) !== null) {
    found.add(m[1].trim());
  }

  const namedPattern = new RegExp(
    `\\b([A-Z][A-Za-z0-9]*(?:\\s[A-Z][A-Za-z0-9]*){0,3})\\s(?:${PROJECT_KEYWORDS})\\b`,
    "g"
  );
  while ((m = namedPattern.exec(text)) !== null) {
    const name = m[1].trim();
    if (name.split(" ").length <= 4 && !/^(The|A|An|This|Our)$/i.test(name)) {
      found.add(name);
    }
  }

  return Array.from(found).slice(0, 6);
}

function extractCompanies(text: string): string[] {
  // Heuristic: capitalized multi-word sequences near "at" / preceding a date range,
  // filtered against a short stoplist of common resume section headers.
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
  return Array.from(found).slice(0, 6);
}

function extractYearsOfExperience(text: string): number | null {
  const pattern = /(\d{1,2})\+?\s*(?:years|yrs)\s*(?:of)?\s*experience/i;
  const match = text.match(pattern);
  if (match) return parseInt(match[1], 10);
  return null;
}

function extractEducation(text: string): string[] {
  const pattern = /(bachelor|master|b\.?tech|m\.?tech|b\.?sc|m\.?sc|mba|ph\.?d|associate)[^\n,.]{0,60}/gi;
  const matches = text.match(pattern) || [];
  return Array.from(new Set(matches.map((m) => m.trim()))).slice(0, 4);
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

export function analyzeResumeText(rawText: string): ResumeProfile {
  return {
    rawText,
    name: extractName(rawText),
    skills: extractSkills(rawText),
    roles: extractRoles(rawText),
    companies: extractCompanies(rawText),
    yearsOfExperience: extractYearsOfExperience(rawText),
    education: extractEducation(rawText),
    rolesWithCompanies: extractRoleCompanyPairs(rawText),
    highlights: extractHighlights(rawText),
    projects: extractProjects(rawText),
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
    const strings = content.items.map((item: any) => item.str);
    text += strings.join(" ") + "\n";
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
