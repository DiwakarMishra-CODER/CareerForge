import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Sparkles, Zap, ArrowRight } from 'lucide-react';
import JobCard from '../components/JobFinder/JobCard';
import JobDetailsPanel from '../components/JobFinder/JobDetailsPanel';

const EditorialBackground = () => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Base Layer */}
            <div className="absolute inset-0 bg-[#0A0A0F]" />
            
            {/* Dynamic Mesh Glow */}
            <motion.div 
                animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                    x: [0, 50, 0],
                    y: [0, 30, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px]"
            />
            <motion.div 
                animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.4, 0.2],
                    x: [0, -40, 0],
                    y: [0, -50, 0]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[100px]"
            />

            {/* Glowing Particles */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                        opacity: [0, 0.2, 0],
                        scale: [0.5, 1, 0.5],
                        x: [Math.random() * 100 + "%", Math.random() * 100 + "%"],
                        y: [Math.random() * 100 + "%", Math.random() * 100 + "%"]
                    }}
                    transition={{ 
                        duration: Math.random() * 10 + 10,
                        repeat: Infinity,
                        delay: i * 2,
                        ease: "easeInOut"
                    }}
                    className="absolute w-1 h-1 bg-[#D4AF37] rounded-full blur-[1px]"
                />
            ))}

            {/* Static Grain Texture */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0F]/50 to-[#0A0A0F]" />
        </div>
    );
};

const MOCK_JOBS = [
    {
        id: 1,
        title: "Senior Product Architect",
        company: "Vanguard Systems",
        location: "Delhi, India",
        salary: "28L - 40L",
        type: "Full-time",
        tags: ["React", "System Design", "Leadership"],
        matchScore: 94,
        aiWhyMatch: "Your architectural background in high-scale platforms and design-first thinking aligns with their editorial product vision.",
        skillsRequired: [
            { name: "React Architecture", matched: true },
            { name: "Technical Strategy", matched: true },
            { name: "Cloud Infrastructure", matched: false }
        ]
    },
    {
        id: 2,
        title: "Creative Technologist",
        company: "Studio Narrative",
        location: "Remote",
        salary: "18L - 25L",
        type: "Contract",
        tags: ["Framer Motion", "WebGL", "UX"],
        matchScore: 89,
        aiWhyMatch: "They require a developer who understands the intersection of motion and brand storytelling—areas where you excel.",
        skillsRequired: [
            { name: "Motion Graphic design", matched: true },
            { name: "React Frontend", matched: true },
            { name: "Three.js", matched: false }
        ]
    },
    {
        id: 3,
        title: "Lead Backend Engineer",
        company: "Capital Core",
        location: "Bangalore, India",
        salary: "35L - 50L",
        type: "Full-time",
        tags: ["Node.js", "PostgreSQL", "Stability"],
        matchScore: 76,
        aiWhyMatch: "Strong backend performance focus matches their requirement for mission-critical banking systems stability.",
        skillsRequired: [
            { name: "Node.js Core", matched: true },
            { name: "Database Optimization", matched: true },
            { name: "Financial Compliance", matched: false }
        ]
    },
    {
        id: 4,
        title: "Editorial UI Designer",
        company: "Modern Ledger",
        location: "Mumbai, India",
        salary: "12L - 18L",
        type: "Hybrid",
        tags: ["Typography", "Layout", "Figma"],
        matchScore: 91,
        aiWhyMatch: "Your eye for high-contrast typography and structured layouts is exactly what their next-gen business magazine needs.",
        skillsRequired: [
            { name: "Grid Layout Systems", matched: true },
            { name: "Type Pairing", matched: true },
            { name: "Interactive Design", matched: true }
        ]
    }
];

const JobExplorer = () => {
    const [query, setQuery] = useState('');
    const [jobs, setJobs] = useState(MOCK_JOBS);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        setIsSearching(true);
        setTimeout(() => {
            setJobs(MOCK_JOBS.filter(j => 
                j.title.toLowerCase().includes(query.toLowerCase()) || 
                j.company.toLowerCase().includes(query.toLowerCase())
            ));
            setIsSearching(false);
        }, 1200);
    };

    return (
        <div className="job-explorer-theme bg-[#0A0A0F] min-h-screen relative overflow-hidden">
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
                    .job-explorer-theme { font-family: 'Inter', sans-serif; }
                `}
            </style>

            <EditorialBackground />

            <div className="relative z-10 max-w-7xl mx-auto px-8 pt-32 pb-20">
                <motion.header 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-24 space-y-8"
                >
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: 64 }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="h-1 bg-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]" 
                    />
                    <h1 className="text-7xl font-['Playfair_Display'] text-slate-100 leading-tight max-w-4xl tracking-tight">
                        The <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">ultimate jobs</span> for your next career move.
                    </h1>
                    
                    <form onSubmit={handleSearch} className="max-w-2xl group flex flex-col gap-6 pt-12">
                        <div className="relative border-b-2 border-slate-800 group-focus-within:border-[#D4AF37] transition-all duration-700">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="E.g. Senior Frontend Architect in Delhi"
                                className="w-full bg-transparent py-6 text-2xl font-['Playfair_Display'] text-slate-100 placeholder-slate-700 outline-none"
                            />
                            <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-[#D4AF37] transition-colors duration-500">
                                <Search size={28} />
                            </button>
                        </div>
                        
                        <div className="flex gap-4">
                            {['Strategic Management', 'FinTech Bangalore', 'Remote Engineering'].map((tag, i) => (
                                <motion.button
                                    key={tag}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 1 + (i * 0.1) }}
                                    onClick={() => { setQuery(tag); }}
                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border border-slate-800 px-5 py-2.5 hover:border-[#D4AF37]/40 hover:text-slate-200 transition-all duration-700 bg-slate-900/20 backdrop-blur-sm"
                                >
                                    {tag}
                                </motion.button>
                            ))}
                        </div>
                    </form>
                </motion.header>

                {isSearching ? (
                    <div className="h-64 flex flex-col items-center justify-center gap-4 text-[#D4AF37]">
                        <Loader2 className="animate-spin" size={40} />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] italic animate-pulse">Scrutinizing Opportunities...</p>
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.2 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-12"
                    >
                        <AnimatePresence>
                            {jobs.map((job, idx) => (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 1, delay: idx * 0.2, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    <JobCard job={job} onClick={(j) => setSelectedJob(j)} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>

            <JobDetailsPanel 
                job={selectedJob} 
                isOpen={!!selectedJob} 
                onClose={() => setSelectedJob(null)} 
            />
        </div>
    );
};

export default JobExplorer;
