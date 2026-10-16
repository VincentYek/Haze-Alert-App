import React from 'react';
import { PsiBandLevel } from '../types/psi';
import { HeartPulse, Baby, UserCheck, HardHat, Wind, CheckCircle2, AlertOctagon, HelpCircle } from 'lucide-react';

interface HealthAdvisoryProps {
  currentPsi: number;
  currentPm25: number;
  psiLevel: PsiBandLevel;
}

export const HealthAdvisory: React.FC<HealthAdvisoryProps> = ({
  currentPsi,
  currentPm25,
  psiLevel,
}) => {
  // Determine recommendation by band
  const isGood = psiLevel === 'good';
  const isModerate = psiLevel === 'moderate';
  const isUnhealthy = psiLevel === 'unhealthy';
  const isVeryUnhealthy = psiLevel === 'very_unhealthy' || psiLevel === 'hazardous';

  const demographics = [
    {
      group: 'Healthy Individuals',
      icon: UserCheck,
      color: 'text-emerald-400',
      action: isGood || isModerate
        ? 'Normal outdoor activities'
        : isUnhealthy
        ? 'Reduce prolonged or strenuous outdoor physical exertion'
        : 'Avoid prolonged strenuous outdoor exertion',
      details: isUnhealthy
        ? 'Shift heavy outdoor workouts (running, cycling) indoors or postpone until PSI drops below 100.'
        : 'Outdoor running, cycling, and sports are safe to carry out.',
    },
    {
      group: 'Vulnerable Groups',
      subtitle: 'Elderly, Pregnant Women & Children',
      icon: Baby,
      color: 'text-amber-400',
      action: isGood || isModerate
        ? 'Normal outdoor activities'
        : isUnhealthy
        ? 'Minimise outdoor activity'
        : 'Stay indoors, keep windows closed',
      details: isUnhealthy
        ? 'Keep rescue medications on hand. Avoid high-exertion playgrounds and prolonged park visits.'
        : 'Regular school activities and walks can proceed normally.',
    },
    {
      group: 'Chronic Lung or Heart Disease',
      subtitle: 'Asthma, COPD, Heart Conditions',
      icon: HeartPulse,
      color: 'text-rose-400',
      action: isGood
        ? 'Normal outdoor activities'
        : isModerate
        ? 'Monitor symptoms if outdoors'
        : 'Avoid outdoor activity entirely',
      details: isUnhealthy || isVeryUnhealthy
        ? 'Stay in an air-conditioned room with an air purifier equipped with a clean HEPA filter.'
        : 'Carry reliever inhalers. Seek medical advice promptly if feeling breathless.',
    },
    {
      group: 'Outdoor Workers',
      subtitle: 'Delivery Riders, Construction, Cleaners',
      icon: HardHat,
      color: 'text-sky-400',
      action: isGood || isModerate
        ? 'Regular work schedule'
        : isUnhealthy
        ? 'Rotate shifts and schedule regular rest indoors'
        : 'Mandatory rest breaks and N95 mask usage',
      details: isUnhealthy
        ? 'Employers under MOM guidelines must provide shaded rest points and clean potable drinking water.'
        : 'Standard hydration and sun protection protocols apply.',
    },
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-rose-400" />
            Official Singapore MOH & NEA Health Advisory
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tailored activity recommendations based on current reading of{' '}
            <span className="font-mono font-bold text-slate-200">{currentPsi} PSI</span> (
            <span className="capitalize">{psiLevel.replace('_', ' ')}</span>).
          </p>
        </div>

        {/* Mask Guide Pill */}
        <div className="flex items-center gap-1.5 text-xs bg-slate-800/80 px-2.5 py-1 rounded-md text-slate-300 self-start sm:self-auto">
          <Wind className="w-3.5 h-3.5 text-teal-400" />
          <span>Haze Mask: Use <strong>N95</strong> (Surgical masks do not block PM2.5)</span>
        </div>
      </div>

      {/* Demographic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {demographics.map((demo, idx) => {
          const Icon = demo.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-lg border border-slate-800/80 bg-slate-950/40 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 rounded-lg bg-slate-800/70">
                    <Icon className={`w-4 h-4 ${demo.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-200">{demo.group}</h3>
                    {demo.subtitle && (
                      <span className="text-[11px] text-slate-400 block">{demo.subtitle}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-1.5 my-2">
                  {isGood || isModerate ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <span className="text-xs font-semibold text-slate-100">
                    {demo.action}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                {demo.details}
              </p>
            </div>
          );
        })}
      </div>

      {/* Everyday Precautions FAQ / Tips */}
      <div className="p-3.5 rounded-lg border border-slate-800/60 bg-slate-950/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <HelpCircle className="w-4 h-4 text-teal-400 shrink-0" />
          <span>
            <strong>Indoor air quality tip:</strong> Keep windows and doors closed when PSI &gt; 100.
            Operate air purifiers with genuine True HEPA filters for optimum PM2.5 removal.
          </span>
        </div>
      </div>
    </div>
  );
};
