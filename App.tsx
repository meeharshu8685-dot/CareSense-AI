
import React, { useState, useCallback, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import InputScreen from './components/InputScreen';
import LoadingScreen from './components/LoadingScreen';
import ResultScreen from './components/ResultScreen';
import SplashScreen from './components/SplashScreen';
import { AppState, SymptomData, AIAnalysisResult } from './types';
import { getHealthRiskAnalysis } from './services/azureService';
import { HeartPulseIcon, HomeIcon } from './components/icons';

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
      setAnalysisResult(result);
      setAppState(AppState.RESULT);
    } catch (err) {
      console.error("Error analyzing symptoms:", err);
      setError("Sorry, we couldn't analyze your symptoms at this time. Please try again later.");
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
        return analysisResult ? <ResultScreen result={analysisResult} onReset={handleReset} /> : <LoadingScreen />;
      default:
        return <SplashScreen />;
    }
  };

  return (
    <div className="min-h-screen font-sans text-slate-800 flex flex-col items-center p-4">
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
          <p>© 2026 CareSense AI – Imagine Cup MVP</p>
        </footer>
      )}
    </div>
  );
};

export default App;
