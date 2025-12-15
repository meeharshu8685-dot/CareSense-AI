
import React from 'react';
import { HeartPulseIcon } from './icons';

const SplashScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full opacity-0 animate-fade-in-up">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative flex justify-center items-center w-24 h-24">
            <div className="absolute h-full w-full rounded-full bg-brand-primary/20 animate-ping delay-500"></div>
            <HeartPulseIcon className="w-20 h-20 text-brand-primary" />
        </div>
        <h1 className="text-5xl font-bold text-brand-dark">CareSense AI</h1>
        <p className="text-slate-500">Your health awareness guide.</p>
      </div>
    </div>
  );
};

export default SplashScreen;
