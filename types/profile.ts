export interface Extracurricular {
  activity: string;
  role: string;
  years: number;
  hoursPerWeek: number;
  description: string;
}

export interface Essay {
  prompt: string;
  content: string;
  wordCount: number;
}

export interface StudentProfile {
  firstName: string;
  lastName: string;
  gpa: number;
  weightedGpa?: number;
  satScore: number;
  intendedMajor: string;
  academicInterests: string[];
  extracurriculars: Extracurricular[];
  locationPreference: string;
  maxCost: number;
  essays: Essay[];
  careerGoals: string;
  schoolSize?: 'small' | 'medium' | 'large';
  settingPreference?: 'urban' | 'suburban' | 'rural';
}