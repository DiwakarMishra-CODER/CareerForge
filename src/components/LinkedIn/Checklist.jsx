import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Zap, Sparkles } from 'lucide-react';

const Checklist = ({ items, onToggle }) => {
    return (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col h-full shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" /> Quick Wins
                </h3>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400 font-sans">Level Up</span>
                </div>
            </div>

            <div className="space-y-3 flex-1">
                {items.map((item) => (
                    <motion.button
                        key={item.id}
                        onClick={() => onToggle(item.id)}
                        whileHover={{ x: 5 }}
                        whileActive={{ scale: 0.98 }}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 text-left ${item.completed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                    >
                        <div className="flex-shrink-0">
                            {item.completed ? (
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                >
                                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                </motion.div>
                            ) : (
                                <Circle className="w-6 h-6 text-gray-600" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className={`text-xs font-bold transition-all ${item.completed ? 'text-emerald-100/90 line-through' : 'text-gray-300'}`}>
                                {item.text}
                            </p>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${item.completed ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                +{item.value} Points
                            </span>
                        </div>
                    </motion.button>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center leading-relaxed">
                    Check these off to dynamically increase your <br />
                    <span className="text-cyan-400">Profile Strength Score</span>
                </p>
            </div>
        </div>
    );
};

export default Checklist;
