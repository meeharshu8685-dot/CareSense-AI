
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
          className={`flex-1 py-2 px-3 text-sm font-semibold rounded-full transition-all border-2 ${selected === option
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
    <div className="bg-white/70 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-xl opacity-0 animate-fade-in-up w-full">
      <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Tell Us How You Feel</h2>
      <p className="text-center text-slate-500 mb-6 text-sm">We'll help you understand your symptoms.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="symptoms" className="block text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">Describe your symptoms</label>
          <div className="relative">
            <textarea
              id="symptoms"
              value={symptoms}
              onChange={(e) => {
                setSymptoms(e.target.value);
                if (formError) setFormError('');
              }}
              placeholder="e.g., severe headache for 2 days, sensitivity to light..."
              className={`block w-full rounded-2xl shadow-sm text-base p-4 min-h-[120px] bg-white/50 focus:bg-white text-slate-900 placeholder:text-slate-400 transition-all duration-300 resize-none ${formError
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                  : 'border-slate-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-100'
                } border-2 focus:outline-none`}
              required
            />
          </div>
          {formError && (
            <p className="text-rose-500 text-xs mt-2 font-medium flex items-center animate-pulse">
              <AlertTriangleIcon className="w-3 h-3 mr-1" /> {formError}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Quick Add Symptoms</label>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_CHIPS.map(chip => (
              <button
                key={chip}
                type="button"
                onClick={() => handleChipClick(chip)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 ${symptoms.toLowerCase().includes(chip.toLowerCase())
                    ? 'bg-teal-100 text-teal-700 border border-teal-200 shadow-inner'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600 hover:shadow-md'
                  }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6 pt-2">
          <div>
            <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
              Duration
            </label>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <input
                type="range"
                min="0"
                max={DURATION_OPTIONS.length - 1}
                value={durationIndex}
                onChange={(e) => setDurationIndex(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
              <div className="flex justify-between mt-2 px-1">
                {DURATION_OPTIONS.map((opt, idx) => (
                  <div key={opt.label} className={`text-xs font-medium transition-colors ${idx === durationIndex ? 'text-teal-600' : 'text-slate-400'}`}>
                    {opt.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <OptionSelector label="Severity" options={SEVERITY_OPTIONS} selected={severity} onSelect={(opt) => setSeverity(opt as SeverityOption)} />
        </div>

        {error && <div className="text-rose-600 text-sm bg-rose-50 border border-rose-100 p-3 rounded-xl text-center">{error}</div>}

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-teal-500/30 transition-all transform hover:-translate-y-1 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-4 focus:ring-teal-200 flex items-center justify-center space-x-2"
        >
          <span>Analyze Symptoms</span>
        </button>
      </form>
    </div>
  );
};

export default InputScreen;
