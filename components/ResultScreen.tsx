
import React from 'react';
import type { AIAnalysisResult, CopingAndWellnessGuidance } from '../types';
import { ShieldCheckIcon, WalkIcon, BrainCircuitIcon, SparklesIcon, WindIcon, ZapIcon, PlusCircleIcon, ActivityIcon } from './icons';

interface ResultScreenProps {
  result: AIAnalysisResult;
  onReset: () => void;
}

const RiskBadge: React.FC<{ level: 'Low' | 'Medium' | 'High' }> = ({ level }) => {
  const levelStyles = {
    Low: 'bg-emerald-100 text-status-low border-emerald-300',
    Medium: 'bg-amber-100 text-status-medium border-amber-300',
    High: 'bg-rose-100 text-status-high border-rose-300',
  };
  return (
    <div className={`px-6 py-2 rounded-full font-bold text-lg border-2 ${levelStyles[level]}`}>
      {level} Risk
    </div>
  );
};

const ResultCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; color: string }> = ({ title, icon, children, color }) => (
  <div className={`bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-md border border-slate-200/50 border-t-4 ${color}`}>
    <div className="flex items-center mb-4">
      {icon}
      <h3 className="text-lg font-bold text-brand-dark">{title}</h3>
    </div>
    <div className="text-slate-600 space-y-4 text-sm">
      {children}
    </div>
  </div>
);

const getIconForCopingItem = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('breath') || lowerTitle.includes('mindful')) return <WindIcon className="w-6 h-6 mr-3 text-sky-500" />;
    if (lowerTitle.includes('stress') || lowerTitle.includes('anxiety')) return <ZapIcon className="w-6 h-6 mr-3 text-amber-500" />;
    return <SparklesIcon className="w-6 h-6 mr-3 text-violet-500" />;
};

const CopingItem: React.FC<{ item: CopingAndWellnessGuidance }> = ({ item }) => (
    <div className="flex items-start">
        {getIconForCopingItem(item.title)}
        <div>
            <strong className="font-semibold text-slate-700">{item.title}:</strong>
            <p className="text-slate-600">{item.description}</p>
        </div>
    </div>
);


const ResultScreen: React.FC<ResultScreenProps> = ({ result, onReset }) => {
  return (
    <div className="w-full space-y-5 opacity-0 animate-fade-in-up">
      <div className="flex flex-col items-center space-y-4 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50">
        <h2 className="text-xl font-bold text-slate-700">Your Health Risk Awareness Results</h2>
        <RiskBadge level={result.riskLevel} />
        <p className="text-slate-600 text-center text-sm">{result.explanation}</p>
        <p className="text-xs text-slate-500 font-semibold italic">This is not a diagnosis.</p>
      </div>

      <ResultCard title="Coping & Wellness Guidance" icon={<BrainCircuitIcon className="w-6 h-6 mr-3 text-indigo-500" />} color="border-t-indigo-400">
        <div className="space-y-4">
            {result.copingAndWellness.map((item, index) => (
                <CopingItem key={index} item={item} />
            ))}
        </div>
      </ResultCard>

      <ResultCard title="Next-Step Guidance" icon={<WalkIcon className="w-6 h-6 mr-3 text-teal-500" />} color="border-t-teal-400">
        <div className="flex items-start">
            <ActivityIcon className="w-6 h-6 mr-3 text-blue-500 flex-shrink-0" />
            <div>
                <strong className="font-semibold text-slate-700">What to do now:</strong>
                <p>{result.nextSteps.whatToDoNow}</p>
            </div>
        </div>
         <div className="flex items-start">
            <PlusCircleIcon className="w-6 h-6 mr-3 text-rose-500 flex-shrink-0" />
            <div>
                <strong className="font-semibold text-slate-700">When to seek professional help:</strong>
                <p>{result.nextSteps.whenToSeekHelp}</p>
            </div>
        </div>

        {result.riskLevel === 'High' && result.nextSteps.emergencyGuidance && (
            <div className="p-3 bg-rose-50 border-l-4 border-status-high text-rose-900 rounded-md mt-2">
                <p><strong className="font-bold">Emergency Guidance:</strong> {result.nextSteps.emergencyGuidance}</p>
            </div>
        )}
      </ResultCard>

      <div className="p-4 bg-amber-50 border-l-4 border-amber-400 text-amber-900 rounded-lg text-sm">
        <div className="flex items-start space-x-3">
          <ShieldCheckIcon className="w-6 h-6 flex-shrink-0 text-amber-500 mt-0.5" />
          <div>
            <h2 className="font-bold">Disclaimer</h2>
            <p>{result.disclaimer}</p>
          </div>
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-4 rounded-full shadow-md transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
      >
        Start New Assessment
      </button>
    </div>
  );
};

export default ResultScreen;
