import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Copy, Check, Info, ArrowRight } from 'lucide-react';

const AI_SUGGESTIONS = {
    headline: [
        "Full-Stack Architect | React & Node.js Specialist | Building Scalable Web Solutions at NexaGen",
        "Frontend Engineer @ NexaGen | UI/UX Performance Optimization | 40% Efficiency Gain Specialist",
        "Full Stack Developer | Turning Complex Problems into Seamless Digital Experiences with Modern Tech"
    ],
    summary: [
        "Passionate Full-Stack Developer with a track record of building high-performance web applications. At NexaGen, I led the development of complex dashboards and improved system efficiency by 40%. Specialized in React, Node.js, and cloud-native architectures.",
        "Experienced Engineer focused on creating intuitive user experiences and scalable backends. I thrive at the intersection of UI/UX design and core systems logic, helping teams deliver value through clean, maintainable code."
    ]
};

const AIGeneratorModal = ({ isOpen, onClose, type }) => {
    const [copiedIndex, setCopiedIndex] = useState(null);

    const handleCopy = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    if (!isOpen) return null;

    const suggestions = AI_SUGGESTIONS[type] || [];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-gray-950/80 backdrop-blur-md"
                />
                
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-2xl bg-gray-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="relative p-8 border-b border-white/5 bg-white/5">
                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl flex items-center justify-center">
                                <Sparkles className="text-cyan-400 w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">
                                    AI <span className="text-cyan-400">{type === 'headline' ? 'Headline' : 'Summary'} Generator</span>
                                </h2>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-1">Refined by CareerSaarthi Engine</p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        <div className="flex gap-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                            <Info className="text-blue-400 w-5 h-5 flex-shrink-0" />
                            <p className="text-xs text-blue-100/70 italic leading-relaxed">
                                Our AI analyzed your top skills and experience to craft these high-impact alternatives. Choose one to replace your current {type}.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {suggestions.map((text, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-6 bg-white/5 border border-white/5 rounded-3xl group hover:border-cyan-500/30 transition-all cursor-pointer relative"
                                    onClick={() => handleCopy(text, i)}
                                >
                                    <p className="text-sm text-gray-300 group-hover:text-white transition-colors leading-relaxed pr-10 italic font-medium">
                                        "{text}"
                                    </p>
                                    <div className="absolute top-6 right-6">
                                        {copiedIndex === i ? (
                                            <Check className="text-emerald-400 w-5 h-5" />
                                        ) : (
                                            <Copy className="text-gray-600 group-hover:text-cyan-400 w-5 h-5 transition-colors" />
                                        )}
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-cyan-500/0 group-hover:text-cyan-500/100 transition-all">
                                        Click to Copy for LinkedIn <ArrowRight className="w-2 h-2" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-8 bg-white/5 border-t border-white/5 flex justify-end">
                        <button 
                            onClick={onClose}
                            className="px-8 py-3 bg-white text-gray-950 rounded-xl font-black italic tracking-tighter uppercase text-sm hover:scale-105 active:scale-95 transition-all shadow-xl"
                        >
                            Continue Optimizing
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AIGeneratorModal;
