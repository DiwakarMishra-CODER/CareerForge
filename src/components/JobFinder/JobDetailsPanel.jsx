import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, IndianRupee, MapPin, Briefcase, Zap, FileText, Sparkles, Target } from 'lucide-react';

const JobDetailsPanel = ({ job, isOpen, onClose }) => {
    const [pitch, setPitch] = useState('');
    const [isWriting, setIsWriting] = useState(false);

    const draftPitch = () => {
        setIsWriting(true);
        setPitch('');
        const text = `I am writing to express my profound interest in the ${job.title} role at ${job.company}. My expertise in ${job.tags.join(', ')} aligns seamlessly with your organizational vision. I am eager to leverage my strategic problem-solving skills to drive excellence within your team.`;
        let i = 0;
        const interval = setInterval(() => {
            setPitch(prev => prev + text.charAt(i));
            i++;
            if (i >= text.length) { clearInterval(interval); setIsWriting(false); }
        }, 12);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-[#030014]/90 backdrop-blur-md z-[100]"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed right-0 top-0 h-full w-full max-w-2xl bg-[#0A0A0F] border-l border-slate-800 z-[101] overflow-y-auto"
                    >
                        {/* Static Grain Over Slide-over */}
                        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />
                        
                        <div className="relative z-10 p-16 space-y-16">
                            <div className="flex justify-between items-center">
                                <button onClick={onClose} className="p-3 bg-slate-900/50 hover:bg-slate-800 transition-colors rounded-full text-slate-400 hover:text-white border border-slate-800">
                                    <X size={20} />
                                </button>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Compatibility</p>
                                    <h4 className="text-5xl font-['Playfair_Display'] text-[#D4AF37] italic">{job.matchScore}%</h4>
                                </div>
                            </div>

                            <header className="space-y-6">
                                <motion.div 
                                    initial={{ width: 0 }} 
                                    animate={{ width: 48 }} 
                                    className="h-1 bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.3)]" 
                                />
                                <h2 className="text-6xl font-['Playfair_Display'] text-slate-100 leading-[1.1] tracking-tight">
                                    {job.title}
                                </h2>
                                <h3 className="text-xl font-['Inter'] font-light text-slate-400 tracking-[0.2em] uppercase flex items-center gap-3">
                                    {job.company} <span className="w-12 h-[1px] bg-slate-800" />
                                </h3>
                            </header>

                            <div className="grid grid-cols-2 gap-12 border-y border-slate-800/50 py-12">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Remuneration</p>
                                    <p className="text-2xl font-['Inter'] font-bold text-slate-200 flex items-center gap-3"><IndianRupee size={20} className="text-emerald-500/50" /> {job.salary}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Location</p>
                                    <p className="text-2xl font-['Inter'] font-bold text-slate-200 flex items-center gap-3"><MapPin size={20} className="text-purple-500/50" /> {job.location}</p>
                                </div>
                            </div>

                            <section className="space-y-8">
                                <h4 className="text-[11px] font-black text-slate-200 uppercase tracking-[0.3em] flex items-center gap-4">
                                    <Target size={18} className="text-[#D4AF37]" /> The AI Synthesis
                                </h4>
                                <div className="p-10 bg-slate-900/30 border border-slate-800 rounded-sm relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]/30" />
                                    <p className="text-lg font-['Inter'] text-slate-300 italic leading-relaxed">
                                        "{job.aiWhyMatch}"
                                    </p>
                                </div>
                            </section>

                            <section className="space-y-8">
                                <h4 className="text-[11px] font-black text-slate-200 uppercase tracking-[0.3em]">Technical Competency Analysis</h4>
                                <div className="space-y-3">
                                    {job.skillsRequired.map(skill => (
                                        <div key={skill.name} className="flex justify-between items-center bg-slate-900/20 p-5 border border-slate-800/50 hover:border-[#D4AF37]/30 transition-all duration-500">
                                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{skill.name}</span>
                                            {skill.matched ? 
                                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] bg-emerald-500/5 px-3 py-1 border border-emerald-500/20">Verified</span> :
                                                <span className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] bg-amber-500/5 px-3 py-1 border border-amber-500/20">Strategic Gap</span>
                                            }
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="pt-12 border-t border-slate-800/50 space-y-10">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[11px] font-black text-slate-200 uppercase tracking-[0.3em]">Strategic Proposal Draft</h4>
                                    <button 
                                        onClick={draftPitch}
                                        className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2"
                                    >
                                        <Sparkles size={12} /> {pitch ? 'Regenerate' : 'Initialize Pitch'}
                                    </button>
                                </div>
                                {pitch && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }} 
                                        animate={{ opacity: 1, y: 0 }} 
                                        className="p-10 bg-slate-900/50 border border-slate-800 font-['Inter'] text-slate-400 italic leading-relaxed text-base relative"
                                    >
                                        <QuoteIcon className="absolute top-4 left-4 text-slate-800 w-12 h-12 -z-10" />
                                        {pitch}
                                        <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.8, repeat: Infinity }} className="inline-block w-2 h-5 bg-[#D4AF37] ml-1" />
                                    </motion.div>
                                )}
                            </section>

                            <button className="w-full py-7 bg-[#D4AF37] text-black font-black uppercase tracking-[0.4em] text-xs hover:bg-white transition-all transform active:scale-[0.98] shadow-[0_20px_40px_rgba(212,175,55,0.2)]">
                                Submit Formal Inquiry
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const QuoteIcon = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V12C14.017 12.5523 13.5693 13 13.017 13H11.017V21H14.017ZM5.017 21L5.017 18C5.017 16.8954 5.91243 16 7.017 16H10.017C10.5693 16 11.017 15.5523 11.017 15V9C11.017 8.44772 10.5693 8 10.017 8H6.017C5.46472 8 5.017 8.44772 5.017 9V12C5.017 12.5523 4.56929 13 4.017 13H2.017V21H5.017Z" />
    </svg>
);

export default JobDetailsPanel;
