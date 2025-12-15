
import React from 'react';
import { HeartPulseIcon } from './icons';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50">
      <div className="relative flex justify-center items-center w-24 h-24">
        <div className="absolute h-full w-full rounded-full bg-brand-primary/20 animate-ping"></div>
        <HeartPulseIcon className="w-12 h-12 text-brand-primary"/>
      </div>
      <h2 className="text-xl font-semibold text-brand-dark mt-4">Analyzing with AI...</h2>
      <p className="text-slate-500 text-sm max-w-xs">
        Your privacy is protected. We are processing your information to provide safe, non-medical guidance.
      </p>
    </div>
  );
};

export default LoadingScreen;
