
import React, { useState } from 'react';
import type { SymptomData } from '../types';
import { DURATION_OPTIONS } from '../constants';
import { AlertTriangleIcon } from './icons';

interface InputScreenProps {
  onAnalyze: (data: SymptomData) => void;
  error: string | null;
}

const SYMPTOM_CHIPS = ["Headache", "Fever", "Chest discomfort", "Fatigue", "Stress", "Sleep issues"];
const SEVERITY_OPTIONS = ['Mild', 'Moderate', 'Severe'] as const;

type SeverityOption = typeof SEVERITY_OPTIONS[number];

const OptionSelector = ({ label, options, selected, onSelect }: { label: string; options: readonly string[]; selected: string | null; onSelect: (option: string | null) => void; }) => (
    <div>
        <label className="block text-base font-medium text-slate-700 mb-2">{label}</label>
        <div className="flex items-center space-x-2">
            {options.map(option => (
                <button
                    key={option}
                    type="button"
                    onClick={() => onSelect(selected === option ? null : option)}
                    className={`flex-1 py-2 px-3 text-sm font-semibold rounded-full transition-all border-2 ${
                        selected === option 
                        ? 'bg-brand-primary text-white border-brand-primary shadow-md' 
                        : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                >
                    {option}
                </button>
            ))}
        </div>
    </div>
);


const InputScreen: React.FC<InputScreenProps> = ({ onAnalyze, error }) => {
  const [symptoms, setSymptoms] = useState('');
  const [durationIndex, setDurationIndex] = useState(1); // Default to '1-3 days'
  const [severity, setSeverity] = useState<SeverityOption | null>(null);
  
  const [formError, setFormError] = useState('');

  const handleChipClick = (chipText: string) => {
    setSymptoms(prev => {
        const newText = chipText.toLowerCase();
        if (prev.toLowerCase().includes(newText)) return prev; // Avoid duplicates
        if (prev.trim() === '') return chipText;
        if (prev.endsWith(' ') || prev.endsWith(',')) return prev + ' ' + chipText;
        return prev + ', ' + chipText;
    });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symptoms.trim().length < 5) {
      setFormError('Please describe your symptoms in a bit more detail.');
      return;
    }
    setFormError('');
    onAnalyze({
      symptoms,
      duration: DURATION_OPTIONS[durationIndex].value,
      severity
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 p-6 rounded-2xl shadow-lg opacity-0 animate-fade-in-up w-full">
      <h2 className="text-3xl font-bold text-center text-brand-dark mb-6">Tell Us How You Feel</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="symptoms" className="block text-base font-medium text-slate-700">Describe your symptoms</label>
          <textarea
            id="symptoms"
            value={symptoms}
            onChange={(e) => {
              setSymptoms(e.target.value);
              if (formError) setFormError('');
            }}
            placeholder="Example: headache for 2 days, mild fever, feeling anxious and tired"
            className={`mt-2 block w-full rounded-md shadow-sm text-base h-32 bg-white text-slate-900 placeholder:text-slate-400 transition-colors ${
              formError
                ? 'border-red-500 ring-2 ring-red-200 focus:border-red-500 focus:ring-red-500'
                : 'border-slate-300 focus:border-brand-primary focus:ring-brand-primary'
            }`}
            required
            aria-invalid={!!formError}
            aria-describedby="symptoms-error"
          />
          <p className="text-xs text-slate-500 mt-2">Use simple language. No medical terms required.</p>
          <p className="text-xs text-slate-500 font-semibold mt-1">This assessment does not provide a diagnosis.</p>
        </div>

        <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">Or tap to add common symptoms:</label>
            <div className="flex flex-wrap gap-2">
                {SYMPTOM_CHIPS.map(chip => (
                    <button
                        key={chip}
                        type="button"
                        onClick={() => handleChipClick(chip)}
                        className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-full hover:bg-brand-primary/20 hover:text-brand-dark transition-colors"
                    >
                        {chip}
                    </button>
                ))}
            </div>
        </div>
        
        <div className="space-y-5 pt-2">
            <div>
                <label htmlFor="duration-slider" className="block text-base font-medium text-slate-700 mb-2">
                    Duration
                </label>
                <div className="flex items-center space-x-3">
                    <input
                        id="duration-slider"
                        type="range"
                        min="0"
                        max={DURATION_OPTIONS.length - 1}
                        value={durationIndex}
                        onChange={(e) => setDurationIndex(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                    />
                    <span className="text-sm font-semibold text-slate-600 w-32 text-center bg-slate-100 py-1 px-2 rounded-md">
                        {DURATION_OPTIONS[durationIndex].label}
                    </span>
                </div>
            </div>

            <OptionSelector label="Severity (Optional)" options={SEVERITY_OPTIONS} selected={severity} onSelect={(opt) => setSeverity(opt as SeverityOption)} />
        </div>
        
        {formError && (
          <div id="symptoms-error" className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center space-x-2" role="alert">
            <AlertTriangleIcon className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold text-sm">{formError}</span>
          </div>
        )}
        {error && <p className="text-red-500 text-base text-center bg-red-50 p-3 rounded-md">{error}</p>}

        <button
          type="submit"
          className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-full shadow-lg transition-all transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary text-lg"
        >
          Analyze Risk
        </button>
      </form>
    </div>
  );
};

export default InputScreen;
