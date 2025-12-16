
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

export type RiskTrend = 'improving' | 'worsening' | 'unchanged' | 'unknown';

export interface DailyPlan {
  morning: string;
  afternoon: string;
  evening: string;
  beforeSleep: string;
}

export interface RiskAnalysis {
  durationFactor: string;
  severityFactor: string;
  symptomLogic: string;
}

export interface AIAnalysisResult {
  riskLevel: 'Low' | 'Medium' | 'High';
  explanation: string;
  copingAndWellness: CopingAndWellnessGuidance[];
  dailyPlan?: DailyPlan; // New detailed daily plan
  riskAnalysis?: RiskAnalysis; // transparency factors
  nextSteps: NextStepGuidance;
  disclaimer: string;
  rawResponse?: string;
}
