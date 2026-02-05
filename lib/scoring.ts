import { College, CollegeCategory } from "@/types/college";
import { StudentProfile } from "@/types/profile";

export function calculateAdmissionProbability(
  college: College,
  profile: StudentProfile
): number {
  let score = 0;

  // GPA comparison (40% weight)
  const gpaRatio = profile.gpa / college.avgGPA;
  if (gpaRatio >= 1.05) score += 40;
  else if (gpaRatio >= 0.95) score += 30;
  else if (gpaRatio >= 0.85) score += 20;
  else score += 10;

  // SAT comparison (40% weight)
  const satRatio = profile.satScore / college.avgSAT;
  if (satRatio >= 1.05) score += 40;
  else if (satRatio >= 0.95) score += 30;
  else if (satRatio >= 0.85) score += 20;
  else score += 10;

  // Extracurriculars (20% weight)
  const ecCount = profile.extracurriculars?.length || 0;
  if (ecCount >= 5) score += 20;
  else if (ecCount >= 3) score += 15;
  else if (ecCount >= 1) score += 10;
  else score += 5;

  return Math.min(score, 100);
}

export function calculateAlignmentScore(
  college: College,
  profile: StudentProfile
): number {
  let score = 0;

  // Major match (30% weight)
  if (college.majors.includes(profile.intendedMajor)) {
    score += 30;
  }

  // Cost preference (25% weight)
  if (college.avgCost <= profile.maxCost) {
    const costRatio = college.avgCost / profile.maxCost;
    score += 25 * (1 - costRatio);
  }

  // Location preference (20% weight)
  if (profile.locationPreference) {
    if (college.location.toLowerCase().includes(profile.locationPreference.toLowerCase())) {
      score += 20;
    }
  } else {
    score += 10;
  }

  // School size (15% weight)
  if (profile.schoolSize) {
    const matchesSize =
      (profile.schoolSize === 'small' && college.studentSize < 5000) ||
      (profile.schoolSize === 'medium' && college.studentSize >= 5000 && college.studentSize <= 15000) ||
      (profile.schoolSize === 'large' && college.studentSize > 15000);
    
    if (matchesSize) score += 15;
  } else {
    score += 8;
  }

  // Setting preference (10% weight)
  if (profile.settingPreference) {
    if (college.setting === profile.settingPreference) {
      score += 10;
    }
  } else {
    score += 5;
  }

  return Math.min(score, 100);
}

export function categorizeCollege(
  college: College,
  admissionProbability: number
): CollegeCategory {
  // Acceptance rates are stored as percentages (e.g., 3.7, 14.5, 50.0)
  // Higher acceptance rate = Safety
  // Medium acceptance rate = Target  
  // Lower acceptance rate = Reach
  const acceptanceRate = college.acceptanceRate || 50;
  
  if (acceptanceRate >= 50) return "Safety";  // 50%+ acceptance = Safety
  if (acceptanceRate >= 20) return "Target";  // 20-50% acceptance = Target
  return "Reach";  // <20% acceptance = Reach
}

export function recommendColleges(
  colleges: College[],
  profile: StudentProfile
): College[] {
  return colleges.map((college) => {
    const admissionProbability = calculateAdmissionProbability(college, profile);
    const alignmentScore = calculateAlignmentScore(college, profile);
    const category = categorizeCollege(college, admissionProbability);

    return {
      ...college,
      admissionProbability,
      alignmentScore,
      category,
    };
  });
}
