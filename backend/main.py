import os
import json
import re
import asyncio
from typing import Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import requests

# Apply Windows selector event loop policy at import time so it also works when
# running via `uvicorn backend.main:app --reload` (not just `python main.py`).
if os.name == "nt":
    try:
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    except Exception:
        pass

load_dotenv()  # Load environment variables from .env file

app = FastAPI(title="College Application Smart Counselor API")

# Configure CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    # Allow common local dev origins (localhost / 127.0.0.1, any port)
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GOV_BASE_URL = "https://api.data.gov/ed/collegescorecard/v1/schools"
GOV_API_KEY = os.getenv("GOV_API_KEY")


def _normalize_text(value: Optional[str]) -> str:
    if not value:
        return ""
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9\s]", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value


def _normalize_school_name(name: Optional[str]) -> str:
    name = _normalize_text(name)
    # normalize common naming variants
    name = name.replace(" university ", " univ ")
    name = name.replace(" college ", " ")
    name = name.replace(" institute of technology", " tech")
    return name.strip()


def _parse_int(value: Optional[str]) -> Optional[int]:
    if value is None:
        return None
    cleaned = re.sub(r"[^0-9]", "", str(value))
    if not cleaned:
        return None
    return int(cleaned)


def _load_rankings_data() -> dict:
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        rankings_path = os.path.join(script_dir, "colleges_data", "rankings-data-clean.json")
        with open(rankings_path, "r", encoding="utf-8-sig") as f:
            raw = json.load(f)

        indexed = {}
        for school_name, school_rankings in raw.items():
            indexed[_normalize_school_name(school_name)] = school_rankings
        return indexed
    except Exception as exc:
        print(f"[WARN] Could not load rankings-data-clean.json: {exc}")
        return {}


RANKINGS_INDEX = _load_rankings_data()


def _lookup_college_rankings(college_name: Optional[str]) -> Optional[dict]:
    if not college_name or not RANKINGS_INDEX:
        return None

    norm = _normalize_school_name(college_name)
    if norm in RANKINGS_INDEX:
        return RANKINGS_INDEX[norm]

    # fallback: fuzzy containment to handle small naming differences
    for idx_name, rankings in RANKINGS_INDEX.items():
        if norm and (norm in idx_name or idx_name in norm):
            return rankings
    return None


def _category_rank_points(category_data: dict) -> float:
    if not category_data:
        return 0.0

    school_rank = _parse_int(category_data.get("school_rank"))
    total_rank = _parse_int(category_data.get("total_rank"))

    if school_rank is None:
        rank_text = category_data.get("rank")
        if rank_text:
            rank_match = re.search(r"(\d+)\s+of\s+(\d+)", rank_text.replace(",", ""))
            if rank_match:
                school_rank = int(rank_match.group(1))
                total_rank = int(rank_match.group(2))

    if school_rank is None:
        return 0.0

    if total_rank and total_rank > 1:
        percentile = 1 - ((school_rank - 1) / (total_rank - 1))
        return max(0.0, percentile * 10.0)

    if school_rank <= 10:
        return 10.0
    if school_rank <= 25:
        return 8.0
    if school_rank <= 50:
        return 6.0
    if school_rank <= 100:
        return 4.5
    if school_rank <= 200:
        return 3.0
    return 1.5


def _best_interest_match_points(rankings: Optional[dict], interest_term: Optional[str]) -> tuple[float, Optional[dict]]:
    if not rankings or not interest_term:
        return 0.0, None

    norm_interest = _normalize_text(interest_term)
    if not norm_interest:
        return 0.0, None

    best_points = 0.0
    best_category = None

    for category_name, category_data in rankings.items():
        norm_category = _normalize_text(category_name)
        if " for " not in norm_category:
            continue
        if norm_interest in norm_category:
            points = _category_rank_points(category_data)
            if points > best_points:
                best_points = points
                best_category = {
                    "interest": interest_term,
                    "category": category_name,
                    "rank": category_data.get("rank"),
                    "school_rank": category_data.get("school_rank"),
                    "total_rank": category_data.get("total_rank"),
                }

    return best_points, best_category


def _safe_ratio(numerator: Optional[float], denominator: Optional[float]) -> float:
    if numerator is None or denominator in (None, 0):
        return 0.0
    return float(numerator) / float(denominator)


def _normalize_locale_to_setting(locale_value: Optional[int]) -> Optional[str]:
    # College Scorecard locale codes (11-13 city, 21-23 suburb, 31-33 town, 41-43 rural)
    if locale_value is None:
        return None
    if 11 <= locale_value <= 13:
        return "urban"
    if 21 <= locale_value <= 23:
        return "suburban"
    if 31 <= locale_value <= 43:
        return "rural"
    return None


def _size_bucket(student_size: Optional[int]) -> Optional[str]:
    if student_size is None:
        return None
    if student_size < 5000:
        return "small"
    if student_size <= 15000:
        return "medium"
    return "large"


def _compute_recommendation(college: dict, preferences: dict) -> dict:
    score = 0.0

    admission_rate = college.get("latest.admissions.admission_rate.overall")
    avg_sat = college.get("latest.admissions.sat_scores.average.overall")
    student_size = college.get("latest.student.size")
    locale = college.get("school.locale")
    cost = (
        college.get("latest.cost.attendance.academic_year")
        or college.get("latest.cost.avg_net_price.public")
        or college.get("latest.cost.avg_net_price.private")
    )
    college_name = college.get("school.name")
    college_rankings = _lookup_college_rankings(college_name)
    ranking_matches = []

    sat_score = preferences.get("satScore")
    if sat_score and avg_sat:
        sat_ratio = _safe_ratio(sat_score, avg_sat)
        if sat_ratio >= 1.05:
            score += 25
        elif sat_ratio >= 0.95:
            score += 20
        elif sat_ratio >= 0.85:
            score += 12
        else:
            score += 6

    gpa = preferences.get("gpa")
    if gpa is not None:
        if gpa >= 3.8:
            score += 10
        elif gpa >= 3.5:
            score += 8
        elif gpa >= 3.0:
            score += 6
        else:
            score += 3

    max_cost = preferences.get("maxCost")
    if max_cost is not None and cost is not None:
        if cost <= max_cost:
            cost_ratio = _safe_ratio(cost, max_cost)
            score += 25 * max(0.0, 1 - cost_ratio)
        else:
            score -= min(12, _safe_ratio(cost - max_cost, max_cost) * 12)

    school_size_pref = preferences.get("schoolSize")
    if school_size_pref:
        actual_size = _size_bucket(student_size)
        if actual_size and actual_size == school_size_pref:
            score += 15

    setting_pref = preferences.get("settingPreference")
    if setting_pref:
        actual_setting = _normalize_locale_to_setting(locale)
        if actual_setting and actual_setting == setting_pref:
            score += 12

    location_pref = preferences.get("locationPreference")
    if location_pref:
        city = (college.get("school.city") or "").lower()
        state = (college.get("school.state") or "").lower()
        name = (college.get("school.name") or "").lower()
        loc = location_pref.lower()
        if loc in city or loc in state or loc in name:
            score += 12

    extracurricular_count = preferences.get("extracurricularCount")
    if extracurricular_count is not None:
        if extracurricular_count >= 5:
            score += 8
        elif extracurricular_count >= 3:
            score += 6
        elif extracurricular_count >= 1:
            score += 4
        else:
            score += 2

    intended_major = preferences.get("intendedMajor")
    major_points, major_match = _best_interest_match_points(college_rankings, intended_major)
    if major_points > 0:
        # Intended major has stronger weight than general interests
        score += min(18.0, major_points * 1.8)
    if major_match:
        ranking_matches.append(major_match)

    academic_interests = preferences.get("academicInterests") or []
    interest_points_total = 0.0
    for interest in academic_interests:
        points, match = _best_interest_match_points(college_rankings, interest)
        if points > 0:
            interest_points_total += min(6.0, points * 0.8)
        if match:
            ranking_matches.append(match)

    score += min(16.0, interest_points_total)

    admission_probability = None
    if admission_rate is not None:
        if sat_score and avg_sat:
            ratio = _safe_ratio(sat_score, avg_sat)
            admission_probability = max(0.0, min(1.0, (admission_rate * 0.7) + (min(ratio, 1.2) / 1.2 * 0.3)))
        else:
            admission_probability = admission_rate

    category = None
    if admission_rate is not None:
        if admission_rate >= 0.5:
            category = "Safety"
        elif admission_rate >= 0.2:
            category = "Target"
        else:
            category = "Reach"

    return {
        "recommendation_score": round(max(0.0, min(score, 100.0)), 2),
        "admission_probability": round(admission_probability * 100, 2) if admission_probability is not None else None,
        "category": category,
        "ranking_matches": ranking_matches[:5],
    }


@app.get("/")
async def root():
    return {"message": "Welcome to College Application Smart Counselor API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/api/colleges")
@app.get("/api/get_colleges")
async def get_colleges(
    # Existing API controls
    state: Optional[str] = Query(None, description="Filter by state abbreviation (e.g. CA, NY, TX)"),
    page: int = Query(0, description="Page number (0-indexed)"),
    per_page: int = Query(50, le=50, description="Results per page (max 50)"),

    # StudentProfile-like preferences
    firstName: Optional[str] = Query(None),
    lastName: Optional[str] = Query(None),
    gpa: Optional[float] = Query(None, ge=0, le=5),
    weightedGpa: Optional[float] = Query(None, ge=0, le=6),
    satScore: Optional[int] = Query(None, ge=400, le=1600),
    intendedMajor: Optional[str] = Query(None),
    academicInterests: Optional[list[str]] = Query(None),
    locationPreference: Optional[str] = Query(None),
    maxCost: Optional[float] = Query(None, ge=0),
    careerGoals: Optional[str] = Query(None),
    schoolSize: Optional[str] = Query(None, pattern="^(small|medium|large)$"),
    settingPreference: Optional[str] = Query(None, pattern="^(urban|suburban|rural)$"),
    extracurricularCount: Optional[int] = Query(None, ge=0),
):
    fields = ",".join([
        "id",
        "school.name",
        "school.city",
        "school.state",
        "school.zip",
        "school.school_url",
        "school.price_calculator_url",
        "school.locale",
        "latest.admissions.admission_rate.overall",
        "latest.admissions.sat_scores.average.overall",
        "latest.student.size",
        "latest.cost.attendance.academic_year",
        "latest.cost.avg_net_price.public",
        "latest.cost.avg_net_price.private",
    ])

    params = {
        "api_key": GOV_API_KEY,
        "fields": fields,
        "per_page": per_page,
        "page": page,
        "sort": "latest.student.size:desc",
    }

    if state:
        params["school.state"] = state.upper()

    response = requests.get(GOV_BASE_URL, params=params)
    print(f"[DEBUG] URL requested: {response.url}")
    print(f"[DEBUG] Status: {response.status_code}")

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=f"API Error: {response.text}")

    payload = response.json()
    results = payload.get("results", [])

    preferences = {
        "firstName": firstName,
        "lastName": lastName,
        "gpa": gpa,
        "weightedGpa": weightedGpa,
        "satScore": satScore,
        "intendedMajor": intendedMajor,
        "academicInterests": academicInterests,
        "locationPreference": locationPreference,
        "maxCost": maxCost,
        "careerGoals": careerGoals,
        "schoolSize": schoolSize,
        "settingPreference": settingPreference,
        "extracurricularCount": extracurricularCount,
    }

    has_preferences = any(
        v is not None and v != [] and v != ""
        for v in preferences.values()
    )

    if has_preferences:
        enriched = []
        for college in results:
            rec = _compute_recommendation(college, preferences)
            item = {**college, **rec}
            enriched.append(item)

        enriched.sort(key=lambda c: c.get("recommendation_score", 0), reverse=True)
        payload["results"] = enriched

    payload["applied_preferences"] = {
        k: v for k, v in preferences.items() if v is not None and v != [] and v != ""
    }
    return payload

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8005)
