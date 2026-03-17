import { EssayPrompt } from "@/types/college";

interface CollegeEssayResponse {
  query: string;
  college_name: string;
  essay: string;
}

function extractWordLimit(text: string): number {
  const match = text.match(/(\d{2,4})\s*(?:word|words|character|characters)/i);
  if (!match) return 250;
  const value = Number.parseInt(match[1], 10);
  return Number.isFinite(value) ? value : 250;
}

function cleanPromptLine(line: string): string {
  return line
    .replace(/^\s*(prompt|question)\s*\d*\s*[:.)-]?\s*/i, "")
    .replace(/^\s*\d+\s*[:.)-]\s*/, "")
    .replace(/^\s*[-•]\s*/, "")
    .trim();
}

function isLikelyHeadingLine(line: string): boolean {
  const normalized = line.toLowerCase().trim();

  // Generic headers that are not actual prompts
  return /(?:essay|writing)\s*(?:prompt|prompts|question|questions|supplement|supplements)$/.test(normalized)
    || /^supplemental\s*(?:question|questions|prompt|prompts)$/i.test(line)
    || /^short\s*answer\s*(?:question|questions)$/i.test(line);
}

function parseEssayPrompts(essayText: string): EssayPrompt[] {
  const defaultWordLimit = extractWordLimit(essayText);

  const lines = essayText
    .split(/\r?\n/)
    .map((line) => cleanPromptLine(line))
    .filter(Boolean);

  const candidates = lines.filter((line) => {
    if (isLikelyHeadingLine(line)) {
      return false;
    }

    const hasQuestionMark = line.includes("?");
    const looksLikePrompt = /\b(prompt|question|describe|discuss|tell us|reflect|explain)\b/i.test(line);
    const goodLength = line.length >= 25 && line.length <= 380;
    return goodLength && (hasQuestionMark || looksLikePrompt);
  });

  const unique = Array.from(new Set(candidates)).slice(0, 6);

  if (unique.length > 0) {
    return unique.map((question) => ({
      question,
      wordLimit: defaultWordLimit,
      required: true,
    }));
  }

  const fallbackText = essayText.trim().replace(/\s+/g, " ").slice(0, 420);
  if (!fallbackText) return [];

  return [
    {
      question: fallbackText,
      wordLimit: defaultWordLimit,
      required: true,
    },
  ];
}

export async function fetchCollegeEssayPrompts(collegeName: string): Promise<EssayPrompt[]> {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8005";
  const url = `${apiBase}/api/college-essays?college_name=${encodeURIComponent(collegeName)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Essay API request failed with status ${response.status}`);
  }

  const data = (await response.json()) as CollegeEssayResponse;
  return parseEssayPrompts(data.essay || "");
}
