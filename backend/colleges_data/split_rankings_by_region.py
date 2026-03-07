"""
Split rankings-data-clean.json into separate files by region.
Regions: northeast, southeast, midwest, southwest, west, california, new york, texas, florida, massachusetts
Infers college location from ranking category names (e.g. "Best Colleges in Massachusetts").
"""
import json
import os

# Location string (from category " in X") -> state abbreviation
LOCATION_TO_STATE = {
    "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
    "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL", "Georgia": "GA",
    "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA",
    "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
    "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
    "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH",
    "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC",
    "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA",
    "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", "Tennessee": "TN",
    "Texas": "TX", "Utah": "UT", "Vermont": "VT", "Virginia": "VA", "Washington": "WA",
    "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY", "District of Columbia": "DC",
    # Area names that map to states
    "Boston Area": "MA", "San Francisco Bay Area": "CA", "New York City Area": "NY",
    "Los Angeles Area": "CA", "Chicago Area": "IL", "Philadelphia Area": "PA",
    "Washington D.C. Area": "DC", "D.C. Area": "DC", "Seattle Area": "WA",
    "San Diego Area": "CA", "Dallas Area": "TX", "Houston Area": "TX",
    "Atlanta Area": "GA", "Miami Area": "FL", "Phoenix Area": "AZ",
    "Denver Area": "CO", "Minneapolis Area": "MN", "Detroit Area": "MI",
    "Baltimore Area": "MD", "St. Louis Area": "MO", "Tampa Area": "FL",
    "Pittsburgh Area": "PA", "Portland Area": "OR", "Cleveland Area": "OH",
    "Las Vegas Area": "NV", "San Antonio Area": "TX", "Orlando Area": "FL",
    "Indianapolis Area": "IN", "Nashville Area": "TN", "Charlotte Area": "NC",
    "Austin Area": "TX", "Columbus Area": "OH", "Milwaukee Area": "WI",
    "Sacramento Area": "CA", "Kansas City Area": "MO", "Raleigh Area": "NC",
}

# State abbreviation -> set of region keys (user's regions)
STATE_TO_REGIONS = {
    # Northeast (excluding MA, NY which have their own regions)
    "CT": ["northeast"], "NJ": ["northeast"], "PA": ["northeast"], "RI": ["northeast"],
    "NH": ["northeast"], "VT": ["northeast"], "ME": ["northeast"], "DE": ["northeast"], "MD": ["northeast"], "DC": ["northeast"],
    # Southeast (excluding FL)
    "VA": ["southeast"], "WV": ["southeast"], "NC": ["southeast"], "SC": ["southeast"],
    "GA": ["southeast"], "KY": ["southeast"], "TN": ["southeast"], "MS": ["southeast"],
    "AL": ["southeast"], "LA": ["southeast"], "AR": ["southeast"],
    # Midwest
    "OH": ["midwest"], "IN": ["midwest"], "IL": ["midwest"], "MI": ["midwest"],
    "WI": ["midwest"], "MN": ["midwest"], "IA": ["midwest"], "MO": ["midwest"],
    "ND": ["midwest"], "SD": ["midwest"], "NE": ["midwest"], "KS": ["midwest"],
    # Southwest (excluding TX)
    "AZ": ["southwest"], "NM": ["southwest"], "OK": ["southwest"],
    # West (excluding CA)
    "WA": ["west"], "OR": ["west"], "NV": ["west"], "ID": ["west"],
    "MT": ["west"], "WY": ["west"], "CO": ["west"], "UT": ["west"], "AK": ["west"], "HI": ["west"],
    # Standalone state regions
    "CA": ["california", "west"],
    "NY": ["new_york", "northeast"],
    "TX": ["texas", "southwest"],
    "FL": ["florida", "southeast"],
    "MA": ["massachusetts", "northeast"],
}

REGIONS_ORDER = [
    "northeast", "southeast", "midwest", "southwest", "west",
    "california", "new_york", "texas", "florida", "massachusetts",
]


def get_college_regions(college_data: dict) -> set:
    """Infer which regions a college belongs to from its ranking category keys."""
    regions = set()
    for category_name in college_data.keys():
        if " in " not in category_name:
            continue
        location = category_name.split(" in ", 1)[-1].strip()
        if location == "America":
            continue
        state = LOCATION_TO_STATE.get(location)
        if state and state in STATE_TO_REGIONS:
            regions.update(STATE_TO_REGIONS[state])
    return regions


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_path = os.path.join(script_dir, "rankings-data-clean.json")
    with open(input_path, "r", encoding="utf-8-sig") as f:
        data = json.load(f)

    # Bucket colleges by region
    by_region = {r: {} for r in REGIONS_ORDER}

    for college_name, college_data in data.items():
        regions = get_college_regions(college_data)
        for region in regions:
            if region in by_region:
                by_region[region][college_name] = college_data

    # Write one JSON file per region
    for region in REGIONS_ORDER:
        out_path = os.path.join(script_dir, f"rankings-{region}.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(by_region[region], f, indent=2, ensure_ascii=False)
        print(f"Wrote {out_path} with {len(by_region[region])} colleges")

    # Optional: also write a single JSON with all regions as top-level keys
    combined_path = os.path.join(script_dir, "rankings-by-region.json")
    with open(combined_path, "w", encoding="utf-8") as f:
        json.dump(by_region, f, indent=2, ensure_ascii=False)
    print(f"Wrote {combined_path} (all regions in one file)")


if __name__ == "__main__":
    main()
