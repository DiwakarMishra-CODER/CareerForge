import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronDown, 
    Sparkles, 
    Zap, 
    AlertTriangle, 
    Search, 
    CheckCircle2, 
    Layers, 
    ArrowRight,
    Type,
    Smile,
    History,
    Briefcase,
    Target
} from 'lucide-react';

const AnalysisSection = ({ data, onGenerateAI }) => {
    const [openSection, setOpenSection] = useState('headline');

    const sections = [
        { 
            id: 'headline', 
            label: 'Headline & Banner', 
            icon: Type, 
            score: data.headline.score,
            content: (
                <div className="space-y-6">
                    <div className="p-4 bg-gray-900 border border-white/5 rounded-2xl">
                        <p className="text-[10px] uppercase font-bold text-gray-500 mb-2">Current Headline</p>
                        <p className="text-sm text-gray-300 italic">"{data.headline.current}"</p>
                    </div>
                    <div className="flex gap-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                        <AlertTriangle className="text-amber-400 w-5 h-5 flex-shrink-0" />
                        <p className="text-sm text-amber-100/80 leading-relaxed italic">
                            {data.headline.analysis}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {data.headline.suggestions.map((sug, i) => (
                            <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {sug}
                            </span>
                        ))}
                    </div>
                    <button 
                        onClick={() => onGenerateAI('headline')}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-cyan-600/20 border border-cyan-500/20 rounded-2xl text-cyan-400 font-bold uppercase italic tracking-tighter hover:bg-cyan-500/30 transition-all group"
                    >
                        <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" /> Generate AI Headlines
                    </button>
                </div>
            )
        },
        { 
            id: 'about', 
            label: 'About Section', 
            icon: Smile, 
            score: data.about.score,
            content: (
                <div className="space-y-6">
                    <div className="p-4 bg-gray-900 border border-white/5 rounded-2xl">
                        <p className="text-[10px] uppercase font-bold text-gray-500 mb-2">Existing Summary</p>
                        <p className="text-sm text-gray-300 leading-relaxed italic">"{data.about.current}"</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                            <h5 className="text-[10px] uppercase font-black text-red-500/80 mb-3 flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3" /> Buzzwords Found
                            </h5>
                            <div className="flex flex-wrap gap-2">
                                {data.about.buzzwords.map((word, i) => (
                                    <span key={i} className="px-2 py-1 bg-red-500/10 text-red-400 text-[10px] font-bold rounded-md">
                                        {word}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                            <h5 className="text-[10px] uppercase font-black text-emerald-500/80 mb-3 flex items-center gap-2">
                                <Sparkles className="w-3 h-3" /> AI Suggestion
                            </h5>
                            <p className="text-xs text-emerald-100/70 italic">
                                {data.about.suggestion}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => onGenerateAI('summary')}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600/20 border border-emerald-500/20 rounded-2xl text-emerald-400 font-bold uppercase italic tracking-tighter hover:bg-emerald-500/30 transition-all"
                    >
                        <Zap className="w-4 h-4" /> Rewrite with AI
                    </button>
                </div>
            )
        },
        { 
            id: 'experience', 
            label: 'Experience & Bullet Points', 
            icon: Briefcase, 
            score: data.experience.score,
            content: (
                <div className="space-y-4">
                    {data.experience.items.map((item, i) => (
                        <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4 group/item">
                            <div className="flex items-center justify-between">
                                <h4 className="font-black italic tracking-tighter text-white uppercase text-sm">{item.role}</h4>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${item.impact === 'High' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                    {item.impact} Impact
                                </span>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs text-gray-500 line-through italic">"{item.original}"</p>
                                <div className="p-4 bg-emerald-500/5 border border-dashed border-emerald-500/20 rounded-xl relative group-hover/item:border-emerald-500/40 transition-all">
                                    <ArrowRight className="absolute -left-3 top-1/2 -translate-y-1/2 text-emerald-500 bg-gray-950 p-1 rounded-full w-6 h-6 border border-emerald-500/20" />
                                    <p className="text-sm text-emerald-400 italic font-medium leading-relaxed">
                                        "{item.improved}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button className="w-full py-4 bg-gray-950 border border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:border-white/20 transition-all">
                        + Parse More Experience
                    </button>
                </div>
            )
        },
        { 
            id: 'skills', 
            label: 'Skills Gap Analysis', 
            icon: Target, 
            score: 0, // Not based on score
            content: (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500">Industry Top Skills</h4>
                        <div className="flex flex-wrap gap-2">
                            {data.skills.topSkills.map((s, i) => (
                                <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-400">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Missing to Reach Next Level</h4>
                        <div className="flex flex-wrap gap-2">
                            {data.skills.gapAnalysis.map((s, i) => (
                                <span key={i} className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs font-bold text-amber-400 flex items-center gap-2">
                                    <Layers className="w-3 h-3" /> {s}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-4">
            {sections.map((section) => (
                <div 
                    key={section.id} 
                    className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden transition-all duration-500 ${openSection === section.id ? 'shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-white/10' : 'hover:bg-white/10'}`}
                >
                    <button 
                        onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
                        className="w-full p-6 flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl transition-all duration-500 ${openSection === section.id ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'bg-white/5 text-gray-400 group-hover:text-white'}`}>
                                <section.icon className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <h3 className={`font-black italic tracking-tighter uppercase transition-colors ${openSection === section.id ? 'text-white text-lg' : 'text-gray-400'}`}>
                                    {section.label}
                                </h3>
                                {section.score > 0 && (
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${section.score >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        Section Strength: {section.score}%
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className={`transition-transform duration-500 ${openSection === section.id ? 'rotate-180' : ''}`}>
                            <ChevronDown className={`w-5 h-5 ${openSection === section.id ? 'text-cyan-400' : 'text-gray-500'}`} />
                        </div>
                    </button>

                    <AnimatePresence>
                        {openSection === section.id && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
                            >
                                <div className="px-6 pb-6 pt-2 border-t border-white/5">
                                    {section.content}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
};

export default AnalysisSection;
