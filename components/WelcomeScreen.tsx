
import React from 'react';
import { HeartPulseIcon, ShieldCheckIcon, LightbulbIcon } from './icons';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 md:p-8 space-y-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 opacity-0 animate-fade-in-up">
      <div className="flex items-center space-x-3">
        <HeartPulseIcon className="w-12 h-12 text-brand-primary" />
        <h1 className="text-4xl font-bold text-brand-dark">CareSense AI</h1>
      </div>
      
      <p className="text-slate-600 max-w-sm text-lg">
        Your personal guide to understanding health signals and promoting wellness.
      </p>

      <div className="w-full max-w-sm p-4 bg-amber-50 border-l-4 border-amber-400 text-amber-900 rounded-lg text-left space-y-2">
        <div className="flex items-start space-x-3">
          <ShieldCheckIcon className="w-7 h-7 flex-shrink-0 text-amber-500 mt-0.5" />
          <div>
            <h2 className="font-bold">Important Disclaimer</h2>
            <p className="text-sm">
              This tool provides informational guidance only. It is not a substitute for professional medical advice, diagnosis, or treatment. For emergencies, contact local health services immediately.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-sm p-4 bg-sky-50 border-t-4 border-sky-300 rounded-lg text-left">
        <div className="flex items-start space-x-3">
          <LightbulbIcon className="w-6 h-6 flex-shrink-0 text-sky-500 mt-0.5" />
          <div>
            <h2 className="font-bold text-slate-700">Our Mission</h2>
            <p className="text-sm text-slate-600 italic mt-1">
              “We built CareSense AI to help people make calm, informed health decisions before panic escalates.”
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full max-w-xs bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-full shadow-lg transition-all transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
      >
        Start Assessment
      </button>
    </div>
  );
};

export default WelcomeScreen;
