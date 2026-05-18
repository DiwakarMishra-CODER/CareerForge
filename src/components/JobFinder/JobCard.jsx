import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, IndianRupee, ArrowRight, Sparkles, Compass } from 'lucide-react';

const JobCard = ({ job, onClick }) => {
    return (
        <motion.div
            layout
            whileHover={{ y: -10, scale: 1.01 }}
            onClick={() => onClick(job)}
            className="group relative bg-[#0d0d15]/50 backdrop-blur-3xl border border-slate-800/80 rounded-2xl p-8 cursor-pointer transition-all duration-700 hover:border-cyan-500/40 shadow-[0_30px_60px_rgba(0,0,0,0.4)] hover:shadow-[0_0_60px_rgba(6,182,212,0.15)] overflow-hidden"
        >
            {/* 1. Neon Accent Glow Behind */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-transparent blur-3xl pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-gradient-to-tr from-blue-500/10 via-teal-500/10 to-transparent blur-3xl pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity duration-1000" />

            {/* 2. Left-Side Glowing Brand bar */}
            <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-blue-500 via-cyan-400 to-teal-400 rounded-l-2xl transform scale-y-[0.4] group-hover:scale-y-100 transition-transform duration-700 origin-center" />

            {/* 3. Static Subtle Noise Over Card */}
            <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none" />

            <div className="relative z-10 space-y-8">
                
                {/* TOP HEADER ROW */}
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-2xl font-black font-['Playfair_Display'] text-slate-100 leading-tight group-hover:text-cyan-300 transition-colors duration-500">
                                {job.title}
                            </h3>
                            {job.matchScore > 90 && (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-cyan-500/30 rounded-full text-[9px] font-black uppercase tracking-widest text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-pulse">
                                    <Sparkles size={10} /> Prime Fit
                                </div>
                            )}
                        </div>
                        
                        <p className="text-[11px] font-['Inter'] font-black tracking-[0.25em] text-slate-400 uppercase flex items-center gap-2">
                            <span className="w-5 h-[1px] bg-slate-700 group-hover:w-8 group-hover:bg-cyan-500 transition-all duration-700" /> 
                            <span className="group-hover:text-white transition-colors">{job.company}</span>
                        </p>
                    </div>

                    {/* RADIAL SCORE EMBLEM */}
                    <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0 group-hover:rotate-6 transition-transform duration-700">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="rgba(6, 182, 212, 0.03)" />
                            <motion.circle
                                cx="32"
                                cy="32"
                                r="26"
                                stroke="#22d3ee"
                                strokeWidth="4"
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * 26}
                                initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                                animate={{ strokeDashoffset: (2 * Math.PI * 26) - (job.matchScore / 100) * (2 * Math.PI * 26) }}
                                transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-xs font-black text-white leading-none">
                                {job.matchScore}%
                            </span>
                            <span className="text-[6px] font-black text-cyan-400 uppercase tracking-widest mt-0.5 leading-none">
                                MATCH
                            </span>
                        </div>
                    </div>
                </div>

                {/* INFO GRID (LOCATION / SALARY) */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/5 rounded-xl group-hover:bg-white/10 group-hover:border-white/10 transition-all duration-500">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <MapPin size={14} className="text-blue-400" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Market</p>
                            <p className="text-xs font-bold text-slate-300 truncate">{job.location}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/5 rounded-xl group-hover:bg-white/10 group-hover:border-white/10 transition-all duration-500">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                            <IndianRupee size={14} className="text-emerald-400" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Package</p>
                            <p className="text-xs font-bold text-emerald-400 truncate">{job.salary}</p>
                        </div>
                    </div>
                </div>

                {/* BOTTOM FOOTER ROW */}
                <div className="flex justify-between items-center border-t border-slate-800/60 pt-6 mt-4">
                    <div className="flex gap-2.5">
                        {job.tags.slice(0, 2).map(tag => (
                            <span 
                                key={tag} 
                                className="px-3.5 py-1.5 bg-white/5 text-[9px] font-black uppercase tracking-wider text-slate-300 border border-white/5 rounded-lg group-hover:border-cyan-500/20 group-hover:text-cyan-300 transition-all duration-500"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                    
                    <a
                        href={job.job_url || job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-400 group-hover:text-white transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                        Apply <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>
            </div>
            
            {/* Glowing bottom line */}
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400/0 to-transparent group-hover:via-cyan-400/60 transition-all duration-1000" />
        </motion.div>
    );
};

export default JobCard;
