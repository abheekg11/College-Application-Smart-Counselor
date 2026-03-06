import requests
import json
import os

BASE_URL = "http://localhost:8005/api/colleges"
PER_PAGE = 50
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "colleges_data")
os.makedirs(OUTPUT_DIR, exist_ok=True)

states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI",
    "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND",
    "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA",
    "WA", "WV", "WI", "WY",
]

for state in states:
    all_colleges = []

    for page in range(2):  # fetch page 0 and page 1 only
        url = f"{BASE_URL}?state={state}&page={page}&per_page={PER_PAGE}"
        response = requests.get(url)
        data = response.json()

        # Support both "colleges" and "results" key from the API
        batch = data.get("colleges") or data.get("results") or []
        all_colleges.extend(batch)
        print(f"[{state}] page {page}: got {len(batch)} colleges (total so far: {len(all_colleges)})")

        # If the first page wasn't full, no need to fetch page 1
        if len(batch) < PER_PAGE:
            break

    combined = {"colleges": all_colleges}
    out_path = os.path.join(OUTPUT_DIR, f"{state}.json")
    with open(out_path, "w") as f:
        json.dump(combined, f, indent=4)

    print(f"[{state}] saved {len(all_colleges)} colleges → {out_path}")

    