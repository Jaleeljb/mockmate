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
