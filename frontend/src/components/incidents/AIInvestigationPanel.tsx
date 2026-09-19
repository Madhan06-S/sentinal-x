import React from 'react';
import { Card } from '../ui/Card';
import { AIInvestigation } from '../../types/incident';
import { Sparkles, CheckCircle2, FileText, Cpu, Target, HelpCircle } from 'lucide-react';

interface AIInvestigationPanelProps {
  investigation?: AIInvestigation;
}

export const AIInvestigationPanel: React.FC<AIInvestigationPanelProps> = ({ investigation }) => {
  if (!investigation) return null;

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
          <span className="text-base font-bold text-slate-100">AI Investigation & Reasoning</span>
        </div>
      }
      subtitle="Autonomous evidence correlation & root cause validation"
    >
      <div className="space-y-6">
        {/* Probable Root Cause Header Banner */}
        <div className="p-4 bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-800/60 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_0_24px_rgba(168,85,247,0.12)]">
          <div>
            <span className="text-xs font-mono font-semibold uppercase text-purple-400 tracking-wider flex items-center gap-1.5">
              <Target className="w-4 h-4 text-purple-400" /> Probable Root Cause Identified
            </span>
            <h3 className="text-base font-bold text-slate-100 mt-1 leading-snug">
              {investigation.probable_root_cause}
            </h3>
          </div>
          <div className="shrink-0 flex items-center gap-2 px-4 py-2 bg-purple-900/40 border border-purple-700/60 rounded-xl font-mono">
            <Cpu className="w-5 h-5 text-purple-300 animate-pulse" />
            <div>
              <span className="text-[10px] text-purple-300 block uppercase font-medium">Confidence Score</span>
              <span className="text-lg font-extrabold text-white">{investigation.confidence}%</span>
            </div>
          </div>
        </div>

        {/* Structured Evidence Checklist */}
        <div className="space-y-2">
          <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" /> Structured Evidence Summary
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {investigation.evidence.map((ev) => (
              <div
                key={ev.id}
                className="flex items-start gap-2.5 p-3 bg-slate-950/60 border border-slate-800 rounded-xl"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-200 leading-relaxed">{ev.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hypothesis & Conclusion Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
            <span className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" /> Hypothesis & Validation
            </span>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{investigation.hypothesis}</p>
            <ul className="text-[11px] text-slate-400 font-mono space-y-1 pt-1 list-disc list-inside">
              {investigation.validation_steps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
            <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Final Conclusion
            </span>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{investigation.conclusion}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
