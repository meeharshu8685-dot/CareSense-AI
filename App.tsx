
import React, { useState, useCallback, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import InputScreen from './components/InputScreen';
import LoadingScreen from './components/LoadingScreen';
import ResultScreen from './components/ResultScreen';
import SplashScreen from './components/SplashScreen';
import { AppState, SymptomData, AIAnalysisResult, RiskTrend } from './types';
import { getHealthRiskAnalysis } from './services/azureService';
import { HeartPulseIcon, HomeIcon } from './components/icons';

const RISK_LEVEL_MAP = { 'Low': 1, 'Medium': 2, 'High': 3 };

const calculateTrend = (currentLevel: 'Low' | 'Medium' | 'High'): RiskTrend => {
  try {
    const historyItem = localStorage.getItem('careSense_history');
    if (!historyItem) return 'unknown';

    const history = JSON.parse(historyItem) as { riskLevel: 'Low' | 'Medium' | 'High', date: string }[];
    if (history.length === 0) return 'unknown';

    const lastRisk = history[0].riskLevel;
    const currentScore = RISK_LEVEL_MAP[currentLevel];
    const lastScore = RISK_LEVEL_MAP[lastRisk];

    if (currentScore < lastScore) return 'improving';
    if (currentScore > lastScore) return 'worsening';
    return 'unchanged';
  } catch (e) {
    console.warn("Failed to calculate trend", e);
    return 'unknown';
  }
};

const saveToHistory = (result: AIAnalysisResult) => {
  try {
    const historyItem = localStorage.getItem('careSense_history');
    let history = historyItem ? JSON.parse(historyItem) : [];

    // Add new user item
    history.unshift({ riskLevel: result.riskLevel, date: new Date().toISOString() });

    // Keep last 3
    if (history.length > 3) history = history.slice(0, 3);

    localStorage.setItem('careSense_history', JSON.stringify(history));
  } catch (e) {
    console.warn("Failed to save history", e);
  }
};

const Header: React.FC<{ onHomeClick: () => void }> = ({ onHomeClick }) => (
  <header className="w-full max-w-md mx-auto flex items-center justify-between py-2">
    <div className="flex items-center space-x-2">
      <HeartPulseIcon className="w-8 h-8 text-brand-primary" />
      <span className="text-xl font-bold text-brand-dark">CareSense AI</span>
    </div>
    <button
      onClick={onHomeClick}
      className="p-2 text-slate-600 hover:text-brand-primary hover:bg-slate-100 rounded-full transition-colors"
      aria-label="Go to Home Screen"
    >
      <HomeIcon className="w-6 h-6" />
    </button>
  </header>
);

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SPLASH);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [riskTrend, setRiskTrend] = useState<RiskTrend>('unknown');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (appState === AppState.SPLASH) {
      const timer = setTimeout(() => {
        setAppState(AppState.WELCOME);
      }, 2500); // Splash screen duration
      return () => clearTimeout(timer);
    }
  }, [appState]);

  const handleStart = () => {
    setAppState(AppState.INPUT);
    setError(null);
    setAnalysisResult(null);
  };

  const handleReset = () => {
    setAppState(AppState.WELCOME);
    setError(null);
    setAnalysisResult(null);
  };

  const handleAnalyze = useCallback(async (data: SymptomData) => {
    setAppState(AppState.LOADING);
    setError(null);
    try {
      // AI is a core dependency, not optional.
      // The system uses AI reasoning, architected similarly to Azure OpenAI,
      // to perform risk classification based on user-provided symptoms.
      const result = await getHealthRiskAnalysis(data);

      const trend = calculateTrend(result.riskLevel);
      setRiskTrend(trend);
      saveToHistory(result);

      setAnalysisResult(result);
      setAppState(AppState.RESULT);
    } catch (err: any) {
      console.error("Error analyzing symptoms:", err);
      // Show the specific error message to help debugging (e.g. "Env vars missing", "401", "Network Error")
      setError(err.message || "Sorry, we couldn't analyze your symptoms at this time. Please try again later.");
      setAppState(AppState.INPUT); // Go back to input screen on error
    }
  }, []);

  const renderContent = () => {
    switch (appState) {
      case AppState.SPLASH:
        return <SplashScreen />;
      case AppState.WELCOME:
        return <WelcomeScreen onStart={handleStart} />;
      case AppState.INPUT:
        return <InputScreen onAnalyze={handleAnalyze} error={error} />;
      case AppState.LOADING:
        return <LoadingScreen />;
      case AppState.RESULT:
        return analysisResult ? <ResultScreen result={analysisResult} riskTrend={riskTrend} onReset={handleReset} /> : <LoadingScreen />;
      default:
        return <SplashScreen />;
    }
  };

  return (
    <div className="min-h-screen font-sans text-slate-800 flex flex-col items-center p-4 bg-gradient-to-br from-teal-50 via-slate-50 to-indigo-50">
      {appState !== AppState.WELCOME && appState !== AppState.LOADING && appState !== AppState.SPLASH && (
        <Header onHomeClick={handleReset} />
      )}
      <main className="w-full max-w-md mx-auto flex-grow flex items-center justify-center">
        <div className="w-full">
          {renderContent()}
        </div>
      </main>
      {appState !== AppState.SPLASH && (
        <footer className="text-center p-4 text-xs text-slate-500 w-full max-w-md mx-auto space-y-1">
          <p>Built by Harsh</p>
          <p>© 2026 CareSense AI</p>
        </footer>
      )}
    </div>
  );
};

export default App;
