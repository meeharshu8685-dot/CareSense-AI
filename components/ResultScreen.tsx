
import React, { useState } from 'react';
import type { AIAnalysisResult, CopingAndWellnessGuidance, RiskTrend, DailyPlan, RiskAnalysis } from '../types';
import { ShieldCheckIcon, WalkIcon, BrainCircuitIcon, SparklesIcon, WindIcon, ZapIcon, PlusCircleIcon, ActivityIcon, ClockIcon } from './icons';

interface ResultScreenProps {
  result: AIAnalysisResult;
  riskTrend: RiskTrend;
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

const RiskTrendBadge: React.FC<{ trend: RiskTrend }> = ({ trend }) => {
  if (trend === 'unknown') return null;

  const styles = {
    improving: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    worsening: 'bg-rose-50 text-rose-700 border-rose-200',
    unchanged: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  const labels = {
    improving: 'Risk Improving',
    worsening: 'Risk Worsening',
    unchanged: 'Risk Unchanged',
  };

  return (
    <div className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${styles[trend]}`}>
      {labels[trend]}
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

const DailyPlanSection: React.FC<{ plan: DailyPlan }> = ({ plan }) => (
  <div className="mt-4 space-y-3">
    <h4 className="font-bold text-slate-700 flex items-center">
      <ClockIcon className="w-5 h-5 mr-2 text-indigo-500" /> Daily Wellness Plan
    </h4>
    <div className="grid gap-3">
      {Object.entries(plan).map(([time, action]) => {
        if (!action) return null;
        const timeLabel = time.replace(/([A-Z])/g, ' $1').trim();
        return (
          <div key={time} className="flex bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
            <span className="font-bold text-indigo-800 capitalize w-24 flex-shrink-0 text-xs">{timeLabel}</span>
            <span className="text-slate-700 text-sm">{action}</span>
          </div>
        );
      })}
    </div>
  </div>
);

const WhyRiskToggle: React.FC<{ analysis?: RiskAnalysis }> = ({ analysis }) => {
  const [isOpen, setIsOpen] = useState(false);
  if (!analysis) return null;

  return (
    <div className="w-full mt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs font-semibold text-slate-500 hover:text-brand-primary underline decoration-dotted mb-2"
      >
        {isOpen ? "Hide details" : "Why did CareSense choose this risk level?"}
      </button>

      {isOpen && (
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-2 animate-fade-in">
          <div><span className="font-bold">Duration:</span> {analysis.durationFactor}</div>
          <div><span className="font-bold">Severity:</span> {analysis.severityFactor}</div>
          <div><span className="font-bold">Logic:</span> {analysis.symptomLogic}</div>
        </div>
      )}
    </div>
  );
};


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


const ResultScreen: React.FC<ResultScreenProps> = ({ result, riskTrend, onReset }) => {
  return (
    <div className="w-full space-y-5 opacity-0 animate-fade-in-up">
      <div className="flex flex-col items-center space-y-2 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50">
        <h2 className="text-xl font-bold text-slate-700">Your Health Risk Awareness Results</h2>
        {result.riskLevel && <RiskBadge level={result.riskLevel} />}
        <RiskTrendBadge trend={riskTrend} />

        <p className="text-slate-600 text-center text-sm mt-2">{result.explanation}</p>
        <WhyRiskToggle analysis={result.riskAnalysis} />
        <p className="text-xs text-slate-500 font-semibold italic mt-2">This is not a diagnosis.</p>
      </div>

      {result.dailyPlan ? (
        <ResultCard title="Your Daily Plan" icon={<BrainCircuitIcon className="w-6 h-6 mr-3 text-indigo-500" />} color="border-t-indigo-400">
          <DailyPlanSection plan={result.dailyPlan} />
        </ResultCard>
      ) : (
        /* Fallback if dailyPlan is missing (e.g. older AI model response or error) */
        Array.isArray(result.copingAndWellness) && result.copingAndWellness.length > 0 && (
          <ResultCard title="Coping & Wellness Guidance" icon={<BrainCircuitIcon className="w-6 h-6 mr-3 text-indigo-500" />} color="border-t-indigo-400">
            <div className="space-y-4">
              {result.copingAndWellness.map((item, index) => (
                <CopingItem key={index} item={item} />
              ))}
            </div>
          </ResultCard>
        )
      )}

      {result.nextSteps && (
        <ResultCard title="Next-Step Guidance" icon={<WalkIcon className="w-6 h-6 mr-3 text-teal-500" />} color="border-t-teal-400">
          <div className="flex items-start mb-6">
            <ActivityIcon className="w-6 h-6 mr-3 text-blue-500 flex-shrink-0" />
            <div>
              <strong className="font-semibold text-slate-700">What to do now:</strong>
              <p className="whitespace-pre-line">{result.nextSteps?.whatToDoNow || "Consult a healthcare professional."}</p>
            </div>
          </div>

          <div className="bg-rose-50/50 p-4 rounded-lg border border-rose-100">
            <div className="flex items-center mb-2">
              <PlusCircleIcon className="w-5 h-5 mr-2 text-rose-500 flex-shrink-0" />
              <strong className="font-bold text-rose-800 text-sm">Watch-Out Signals - Seek Help If:</strong>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
              {/* Split by newline or bullet if it's a single string, or just render. 
                   The prompt asks for bullet points. AI might return a block. 
                   We will try to split it if it looks like a list, or just display it. */}
              {result.nextSteps?.whenToSeekHelp.split(/\n|- /).filter(line => line.trim().length > 0).map((line, idx) => (
                <li key={idx} className="pl-1">{line.replace(/^- /, '')}</li>
              ))}
            </ul>
          </div>

          {result.riskLevel === 'High' && result.nextSteps?.emergencyGuidance && (
            <div className="p-3 bg-rose-100 border-l-4 border-status-high text-rose-900 rounded-md mt-4">
              <p><strong className="font-bold">Emergency Guidance:</strong> {result.nextSteps.emergencyGuidance}</p>
            </div>
          )}
        </ResultCard>
      )}

      {/* Raw Response Fallback Display */}
      {result.rawResponse && (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4">
          <h3 className="text-sm font-bold text-slate-700 mb-2">AI Response Details</h3>
          <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono">{result.rawResponse}</pre>
        </div>
      )}

      <div className="p-4 bg-amber-50 border-l-4 border-amber-400 text-amber-900 rounded-lg text-sm">
        <div className="flex items-start space-x-3">
          <ShieldCheckIcon className="w-6 h-6 flex-shrink-0 text-amber-500 mt-0.5" />
          <div>
            <h2 className="font-bold">Disclaimer</h2>
            <p>{result.disclaimer || "Not medical advice."}</p>
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
