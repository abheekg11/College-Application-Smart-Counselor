import os
from typing import Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import requests

load_dotenv()  # Load environment variables from .env file

app = FastAPI(title="College Application Smart Counselor API")

# Configure CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GOV_BASE_URL = "https://api.data.gov/ed/collegescorecard/v1/schools"
GOV_API_KEY = os.getenv("GOV_API_KEY")


@app.get("/")
async def root():
    return {"message": "Welcome to College Application Smart Counselor API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/api/colleges")
async def get_colleges(
    state: Optional[str] = Query(None, description="Filter by state abbreviation (e.g. CA, NY, TX)"),
    page: int = Query(0, description="Page number (0-indexed)"),
    per_page: int = Query(20, le=100, description="Results per page (max 100)"),
):
    fields = ",".join([
        # Basic Info
        "id",
        "school.name",
        "school.city",
        "school.state",
        "school.zip",
        "school.school_url",
        "school.price_calculator_url",
        "location.lat",
        "location.lon",

        # Institution Classification
        "school.ownership",                         # 1=Public, 2=Private nonprofit, 3=Private for-profit
        "school.region_id",
        "school.locale",
        "school.degree_urbanization",
        "school.carnegie_basic",
        "school.carnegie_undergrad",
        "school.carnegie_size_setting",
        "school.degrees_awarded.predominant",
        "school.degrees_awarded.highest",
        "school.religious_affiliation",
        "school.online_only",
        "school.men_only",
        "school.women_only",

        # Minority-Serving Institution Flags
        "school.minority_serving.historically_black",
        "school.minority_serving.predominantly_black",
        "school.minority_serving.hispanic",
        "school.minority_serving.tribal",
        "school.minority_serving.aanipi",
        "school.minority_serving.annh",

        # Admissions
        "latest.admissions.admission_rate.overall",
        "latest.admissions.sat_scores.average.overall",
        "latest.admissions.sat_scores.25th_percentile.critical_reading",
        "latest.admissions.sat_scores.75th_percentile.critical_reading",
        "latest.admissions.sat_scores.25th_percentile.math",
        "latest.admissions.sat_scores.75th_percentile.math",
        "latest.admissions.sat_scores.midpoint.critical_reading",
        "latest.admissions.sat_scores.midpoint.math",
        "latest.admissions.act_scores.25th_percentile.cumulative",
        "latest.admissions.act_scores.75th_percentile.cumulative",
        "latest.admissions.act_scores.midpoint.cumulative",

        # Enrollment & Student Body Size
        "latest.student.size",
        "latest.student.enrollment.all",
        "latest.student.part_time_share",
        "latest.student.share_25_older",
        "latest.student.demographics.student_faculty_ratio",
        "latest.student.retention_rate.four_year.full_time",
        "latest.student.retention_rate.lt_four_year.full_time",

        # Student Demographics (Race/Ethnicity)
        "latest.student.demographics.race_ethnicity.white",
        "latest.student.demographics.race_ethnicity.black",
        "latest.student.demographics.race_ethnicity.hispanic",
        "latest.student.demographics.race_ethnicity.asian",
        "latest.student.demographics.race_ethnicity.aian",
        "latest.student.demographics.race_ethnicity.nhpi",
        "latest.student.demographics.race_ethnicity.two_or_more",
        "latest.student.demographics.race_ethnicity.non_resident_alien",
        "latest.student.demographics.race_ethnicity.unknown",

        # Cost & Tuition
        "latest.cost.tuition.in_state",
        "latest.cost.tuition.out_of_state",
        "latest.cost.avg_net_price.public",
        "latest.cost.avg_net_price.private",
        "latest.cost.attendance.academic_year",

        # Net Price by Income Level (Public)
        "latest.cost.net_price.public.by_income_level.0-30000",
        "latest.cost.net_price.public.by_income_level.30001-48000",
        "latest.cost.net_price.public.by_income_level.48001-75000",
        "latest.cost.net_price.public.by_income_level.75001-110000",
        "latest.cost.net_price.public.by_income_level.110001-plus",

        # Net Price by Income Level (Private)
        "latest.cost.net_price.private.by_income_level.0-30000",
        "latest.cost.net_price.private.by_income_level.30001-48000",
        "latest.cost.net_price.private.by_income_level.48001-75000",
        "latest.cost.net_price.private.by_income_level.75001-110000",
        "latest.cost.net_price.private.by_income_level.110001-plus",

        # Financial Aid
        "latest.aid.pell_grant_rate",
        "latest.aid.federal_loan_rate",

        # Academics / Spending
        "latest.school.instructional_expenditure_per_fte",
        "latest.school.tuition_revenue_per_fte",

        # Completion Rates
        "latest.completion.completion_rate_4yr_150nt",
        "latest.completion.completion_rate_less_than_4yr_150nt",

        # Post-Grad Earnings
        "latest.earnings.6_yrs_after_entry.median_earnings_lowest_tercile",
        "latest.earnings.6_yrs_after_entry.median_earnings_middle_tercile",
        "latest.earnings.6_yrs_after_entry.median_earnings_highest_tercile",
        "latest.earnings.10_yrs_after_entry.median_earnings.lowest_tercile",
        "latest.earnings.10_yrs_after_entry.median_earnings.middle_tercile",
        "latest.earnings.10_yrs_after_entry.median_earnings.highest_tercile",
    ])

    params = {
        "api_key": GOV_API_KEY,
        "fields": fields,
        "per_page": per_page,
        "page": page,
        "sort": "latest.admissions.sat_scores.average.overall:desc",
    }

    if state:
        params["school.state"] = state.upper()

    response = requests.get(GOV_BASE_URL, params=params)
    print(f"[DEBUG] URL requested: {response.url}")
    print(f"[DEBUG] Status: {response.status_code}")
    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail=f"API Error: {response.text}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
