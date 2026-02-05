export type CollegeCategory = 'Safety' | 'Target' | 'Reach';

export interface EssayPrompt {
  question: string;
  wordLimit: number;
  required: boolean;
}

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