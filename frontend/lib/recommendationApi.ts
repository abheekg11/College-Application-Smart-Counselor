import { College } from "@/types/college";
import { StudentProfile } from "@/types/profile";

type BackendCategory = "Safety" | "Target" | "Reach";

interface RankingMatch {
  interest?: string;
  category?: string;
}

interface BackendCollege {
  id?: number;
  category?: BackendCategory;
  recommendation_score?: number;
  admission_probability?: number;
  ranking_matches?: RankingMatch[];
  [key: string]: unknown;
}

interface BackendResponse {
  results?: BackendCollege[];
}

function getNumber(row: BackendCollege, key: string): number | null {
  const value = row[key];
  return typeof value === "number" ? value : null;
}

function getString(row: BackendCollege, key: string): string | null {
  const value = row[key];
  return typeof value === "string" ? value : null;
}

function localeToSetting(locale: number | null): "urban" | "suburban" | "rural" {
  if (locale !== null) {
    if (locale >= 11 && locale <= 13) return "urban";
    if (locale >= 21 && locale <= 23) return "suburban";
  }
  return "rural";
}

function mapBackendCollegeToUiCollege(row: BackendCollege, index: number, fallbackMajor: string): College {
  const name = getString(row, "school.name") || "Unknown College";
  const city = getString(row, "school.city") || "";
  const state = getString(row, "school.state") || "";
  const location = [city, state].filter(Boolean).join(", ") || "Unknown Location";

  const admissionRateRaw = getNumber(row, "latest.admissions.admission_rate.overall");
  const acceptanceRate = admissionRateRaw !== null ? Math.round(admissionRateRaw * 1000) / 10 : 50;

  const avgSAT = getNumber(row, "latest.admissions.sat_scores.average.overall") ?? 1200;
  const avgCost =
    getNumber(row, "latest.cost.attendance.academic_year") ??
    getNumber(row, "latest.cost.avg_net_price.public") ??
    getNumber(row, "latest.cost.avg_net_price.private") ??
    0;

  const studentSize = getNumber(row, "latest.student.size") ?? 10000;
  const locale = getNumber(row, "school.locale");
  const setting = localeToSetting(locale);

  const rankingMatches = Array.isArray(row.ranking_matches) ? row.ranking_matches : [];
  const majorsFromRanking = rankingMatches
    .map((m) => (typeof m?.interest === "string" ? m.interest : null))
    .filter((m): m is string => Boolean(m));
  const majors = majorsFromRanking.length > 0 ? Array.from(new Set(majorsFromRanking)) : [fallbackMajor];

  return {
    id: String(row.id ?? `${name}-${index}`),
    name,
    location,
    avgGPA: 3.6,
    avgSAT,
    acceptanceRate,
    avgCost,
    ranking: index + 1,
    majors,
    essays: [],
    deadline: "",
    category: row.category,
    admissionProbability: typeof row.admission_probability === "number" ? row.admission_probability : undefined,
    alignmentScore: typeof row.recommendation_score === "number" ? row.recommendation_score : undefined,
    studentSize,
    setting,
  };
}

function buildRecommendationParams(profile: StudentProfile, page: number, perPage: number): URLSearchParams {
  const params = new URLSearchParams();

  params.set("firstName", profile.firstName || "");
  params.set("lastName", profile.lastName || "");
  params.set("gpa", String(profile.gpa));
  if (typeof profile.weightedGpa === "number") params.set("weightedGpa", String(profile.weightedGpa));
  params.set("satScore", String(profile.satScore));
  params.set("intendedMajor", profile.intendedMajor || "");
  params.set("locationPreference", (profile.locationPreference || "").trim());
  params.set("maxCost", String(profile.maxCost));
  params.set("careerGoals", (profile.careerGoals || "").trim());
  if (profile.schoolSize) params.set("schoolSize", profile.schoolSize);
  if (profile.settingPreference) params.set("settingPreference", profile.settingPreference);
  params.set("extracurricularCount", String(profile.extracurriculars?.length || 0));
  params.set("per_page", String(perPage));
  params.set("page", String(page));

  for (const interest of profile.academicInterests || []) {
    if (interest?.trim()) params.append("academicInterests", interest.trim());
  }

  return params;
}

export async function fetchRecommendedColleges(
  profile: StudentProfile,
  options?: { page?: number; perPage?: number }
): Promise<College[]> {
  const page = options?.page ?? 0;
  const perPage = options?.perPage ?? 50;

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8005";
  const params = buildRecommendationParams(profile, page, perPage);

  const response = await fetch(`${apiBase}/api/colleges?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  const data = (await response.json()) as BackendResponse;
  const rows = Array.isArray(data.results) ? data.results : [];
  return rows.map((row, index) => mapBackendCollegeToUiCollege(row, index, profile.intendedMajor));
}
