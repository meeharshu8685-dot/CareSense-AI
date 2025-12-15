
export enum AppState {
  SPLASH = 'SPLASH',
  WELCOME = 'WELCOME',
  INPUT = 'INPUT',
  LOADING = 'LOADING',
  RESULT = 'RESULT',
}

export interface SymptomData {
  symptoms: string;
  duration: number;
  severity: 'Mild' | 'Moderate' | 'Severe' | null;
}

export interface CopingAndWellnessGuidance {
  title: string;
  description: string;
}

export interface NextStepGuidance {
  whatToDoNow: string;
  whenToSeekHelp: string;
  emergencyGuidance: string;
}

export interface AIAnalysisResult {
  riskLevel: 'Low' | 'Medium' | 'High';
  explanation: string;
  copingAndWellness: CopingAndWellnessGuidance[];
  nextSteps: NextStepGuidance;
  disclaimer: string;
  rawResponse?: string; // Fallback for when JSON parsing fails or returns text
}
