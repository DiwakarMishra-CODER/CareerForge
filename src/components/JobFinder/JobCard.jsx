import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, IndianRupee, ArrowRight, Sparkles } from 'lucide-react';

const JobCard = ({ job, onClick }) => {
    const circumference = 2 * Math.PI * 24;
    const offset = circumference - (job.matchScore / 100) * circumference;

    return (
        <motion.div
            layout
            whileHover={{ y: -8 }}
            onClick={() => onClick(job)}
            className="group relative bg-[#111119]/60 backdrop-blur-xl border border-slate-800/80 rounded-sm p-8 cursor-pointer transition-all duration-700 hover:border-[#D4AF37]/50 shadow-2xl overflow-hidden"
        >
            {/* Hover Glow Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-10">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <h3 className="text-3xl font-['Playfair_Display'] text-slate-100 leading-tight group-hover:text-[#D4AF37] transition-colors duration-700">
                                {job.title}
                            </h3>
                            {job.matchScore > 90 && (
                                <Sparkles size={16} className="text-[#D4AF37] animate-pulse" />
                            )}
                        </div>
                        <p className="text-[11px] font-['Inter'] font-black tracking-[0.2em] text-slate-500 uppercase flex items-center gap-2">
                            <span className="w-4 h-[1px] bg-slate-700 group-hover:bg-[#D4AF37]/40 transition-colors" /> {job.company}
                        </p>
                    </div>
                    
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.03)" strokeWidth="1" fill="transparent" />
                            <motion.circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="#D4AF37"
                                strokeWidth="1.5"
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * 28}
                                initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                                animate={{ strokeDashoffset: (2 * Math.PI * 28) - (job.matchScore / 100) * (2 * Math.PI * 28) }}
                                transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
                                strokeLinecap="butt"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-[11px] font-black text-[#D4AF37] tracking-tighter">
                                {job.matchScore}%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-y-4 mb-10 text-[10px] font-['Inter'] font-black text-slate-500 uppercase tracking-widest">
                    <span className="flex items-center gap-3"><MapPin size={14} className="text-slate-700" /> {job.location}</span>
                    <span className="flex items-center gap-3 text-emerald-500/80"><IndianRupee size={14} /> {job.salary}</span>
                </div>

                <div className="flex justify-between items-end border-t border-slate-800/50 pt-8">
                    <div className="flex gap-3">
                        {job.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="px-4 py-1.5 bg-slate-900/50 text-[9px] font-black uppercase tracking-widest text-slate-400 border border-slate-800 group-hover:border-[#D4AF37]/20 transition-colors">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <button
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#D4AF37] group-hover:translate-x-1 transition-transform duration-500"
                    >
                        Inquire <ArrowRight size={14} />
                    </button>
                </div>
            </div>
            
            {/* Border Accent */}
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/0 to-transparent group-hover:via-[#D4AF37]/40 transition-all duration-1000" />
        </motion.div>
    );
};

export default JobCard;
