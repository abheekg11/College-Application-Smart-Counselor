// ── App-level types ────────────────────────────────────────────────────────────

export type CollegeCategory = 'Safety' | 'Target' | 'Reach';

export interface EssayPrompt {
  question: string;
  wordLimit: number;
  required: boolean;
}

// ── College Scorecard API response shape ───────────────────────────────────────

export interface CollegeScorecardCollege {
  // Root-level identifiers
  id: number;

  // School info
  school: {
    name: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    school_url: string | null;
    price_calculator_url: string | null;
    ownership: number | null;         // 1=Public, 2=Private nonprofit, 3=Private for-profit
    region_id: number | null;
    locale: number | null;
    degree_urbanization: number | null;
    carnegie_basic: number | null;
    carnegie_undergrad: number | null;
    carnegie_size_setting: number | null;
    religious_affiliation: number | null;
    online_only: number | null;
    men_only: number | null;
    women_only: number | null;
    instructional_expenditure_per_fte: number | null;
    tuition_revenue_per_fte: number | null;
    degrees_awarded: {
      predominant: number | null;
      highest: number | null;
    };
    minority_serving: {
      historically_black: number | null;
      predominantly_black: number | null;
      hispanic: number | null;
      tribal: number | null;
      aanipi: number | null;
      annh: number | null;
    };
  };

  // Location
  location: {
    lat: number | null;
    lon: number | null;
  };

  // Latest-year data
  latest: {
    admissions: {
      admission_rate: {
        overall: number | null;
      };
      sat_scores: {
        average: { overall: number | null };
        '25th_percentile': { critical_reading: number | null; math: number | null };
        '75th_percentile': { critical_reading: number | null; math: number | null };
        midpoint: { critical_reading: number | null; math: number | null };
      };
      act_scores: {
        '25th_percentile': { cumulative: number | null };
        '75th_percentile': { cumulative: number | null };
        midpoint: { cumulative: number | null };
      };
    };

    student: {
      size: number | null;
      enrollment: { all: number | null };
      part_time_share: number | null;
      share_25_older: number | null;
      retention_rate: {
        four_year: { full_time: number | null };
        lt_four_year: { full_time: number | null };
      };
      demographics: {
        student_faculty_ratio: number | null;
        race_ethnicity: {
          white: number | null;
          black: number | null;
          hispanic: number | null;
          asian: number | null;
          aian: number | null;
          nhpi: number | null;
          two_or_more: number | null;
          non_resident_alien: number | null;
          unknown: number | null;
        };
      };
    };

    cost: {
      tuition: {
        in_state: number | null;
        out_of_state: number | null;
      };
      avg_net_price: {
        public: number | null;
        private: number | null;
      };
      attendance: {
        academic_year: number | null;
      };
      net_price: {
        public: {
          by_income_level: {
            '0-30000': number | null;
            '30001-48000': number | null;
            '48001-75000': number | null;
            '75001-110000': number | null;
            '110001-plus': number | null;
          };
        };
        private: {
          by_income_level: {
            '0-30000': number | null;
            '30001-48000': number | null;
            '48001-75000': number | null;
            '75001-110000': number | null;
            '110001-plus': number | null;
          };
        };
      };
    };

    aid: {
      pell_grant_rate: number | null;
      federal_loan_rate: number | null;
    };

    completion: {
      completion_rate_4yr_150nt: number | null;
      completion_rate_less_than_4yr_150nt: number | null;
    };

    earnings: {
      '6_yrs_after_entry': {
        median_earnings_lowest_tercile: number | null;
        median_earnings_middle_tercile: number | null;
        median_earnings_highest_tercile: number | null;
      };
      '10_yrs_after_entry': {
        median_earnings: {
          lowest_tercile: number | null;
          middle_tercile: number | null;
          highest_tercile: number | null;
        };
      };
    };
  };
}

// API response wrapper
export interface CollegeScorecardResponse {
  metadata: {
    total: number;
    page: number;
    per_page: number;
  };
  results: CollegeScorecardCollege[];
}

// ── App-level College type (used in UI / counselor features) ───────────────────

export interface College {
  id: string;
  name: string;
  location: string;
  avgGPA: number;
  avgSAT: number;
  acceptanceRate: number;
  avgCost: number;
  ranking: number;
  majors: string[];
  essays: EssayPrompt[];
  deadline: string;
  category?: CollegeCategory;
  admissionProbability?: number;
  alignmentScore?: number;
  studentSize: number;
  setting: 'urban' | 'suburban' | 'rural';
}