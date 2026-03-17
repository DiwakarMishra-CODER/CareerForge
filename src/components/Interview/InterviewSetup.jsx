import { ArrowLeft, ArrowRight, Brain, Target, Users, Sparkles, Clock, Zap, Building2, Code2, Volume2, Play, LineChart, Briefcase } from 'lucide-react';
import speechService from '../../services/ai/speechService';
import { useEffect, useState } from 'react';

// Interview Setup Component - Universalized for any career field
export default function InterviewSetup({
    selectedType,
    selectedDomain = '',
    onStart,
    onBack
}) {
    const [config, setConfig] = useState({
        difficulty: 'intermediate',
        companyTarget: 'product',
        duration: 30,
        skillFocus: 'general',
        voiceURI: ''
    });

    const [availableVoices, setAvailableVoices] = useState([]);

    useEffect(() => {
        const loadVoices = () => {
            if (!window.speechSynthesis) return;
            const voices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
            setAvailableVoices(voices);
            if (voices.length > 0 && !config.voiceURI) {
                const defaultVoice =
                    voices.find(v => v.name.includes('Aria')) ||
                    voices.find(v => v.name.includes('Google')) ||
                    voices[0];

                if (defaultVoice) {
                    setConfig(prev => ({ ...prev, voiceURI: defaultVoice.voiceURI }));
                }
            }
        };

        loadVoices();
        if (window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    const handleTestVoice = (voiceURI) => {
        speechService.speak("Ready to help you master your session.");
    };

    // Category metadata - Domain agnostic
    const categoryInfo = {
        'behavioral': {
            title: 'Behavioral & Leadership',
            color: 'from-pink-500 to-rose-500',
            description: 'Focus on soft skills, situation handling, and cultural fit.'
        },
        'domain': {
            title: selectedDomain || 'Domain Expertise',
            color: 'from-cyan-500 to-blue-500',
            description: `Deep dive into the core knowledge required for ${selectedDomain || 'your field'}.`
        },
        'case-study': {
            title: 'Strategy & Case Study',
            color: 'from-purple-500 to-pink-500',
            description: 'Solve complex business problems and strategic scenarios.'
        }
    };

    const currentCat = categoryInfo[selectedType] || categoryInfo['domain'];

    const difficulties = [
        { id: 'beginner', label: 'Junior / Entry', desc: 'Fundamentals & basic scenarios', color: 'emerald' },
        { id: 'intermediate', label: 'Mid-Level', desc: 'Situational challenges & depth', color: 'amber' },
        { id: 'advanced', label: 'Senior / Expert', desc: 'Strategic & leadership depth', color: 'red' }
    ];

    const companies = [
        { id: 'standard', label: 'Corporate / Big Co', desc: 'Process & structure focused', icon: '🏢' },
        { id: 'boutique', label: 'Boutique / Specialist', desc: 'Niche & expertise focused', icon: '💎' },
        { id: 'startup', label: 'Fast-Paced Startup', desc: 'Action & agility focused', icon: '🚀' },
        { id: 'consulting', label: 'Advisory / Consulting', desc: 'Solution & client focused', icon: '🤝' }
    ];

    const durations = [
        { value: 15, label: '15 min', desc: 'Quick Pulse' },
        { value: 30, label: '30 min', desc: 'Standard Round' },
        { value: 45, label: '45 min', desc: 'Full Performance' }
    ];

    const handleStart = () => {
        onStart({
            ...config,
            interviewType: selectedType,
            domain: selectedDomain
        });
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center py-20 px-6">
            <main className="container mx-auto max-w-4xl relative z-10">
                {/* Header - Icon Removed as requested */}
                <div className="text-center mb-16 animate-in fade-in slide-in-from-top-8 duration-700">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-white mb-10 transition-colors font-bold uppercase tracking-widest text-[10px]"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Adjust Selection
                    </button>

                    <h1 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tighter">
                        Setup Your <span className={`bg-gradient-to-r ${currentCat.color} bg-clip-text text-transparent`}>Session</span>
                    </h1>
                    <p className="text-slate-400 text-sm max-w-xl mx-auto font-medium">
                        {currentCat.description}
                    </p>
                </div>

                {/* Configuration Cards */}
                <div className="space-y-8">
                    {/* Experience Level */}
                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight">Experience Level</h2>
                                <p className="text-slate-500 text-sm">Tailors the question depth and complexity</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {difficulties.map((diff) => (
                                <button
                                    key={diff.id}
                                    onClick={() => setConfig(prev => ({ ...prev, difficulty: diff.id }))}
                                    className={`relative p-6 rounded-3xl border-2 transition-all duration-300 text-left ${config.difficulty === diff.id
                                        ? `border-${diff.color}-500 bg-${diff.color}-500/10`
                                        : 'border-white/5 hover:border-white/20 bg-white/5'
                                        }`}
                                >
                                    <h3 className={`font-black text-lg mb-1 ${config.difficulty === diff.id ? `text-${diff.color}-400` : 'text-white'}`}>
                                        {diff.label}
                                    </h3>
                                    <p className="text-slate-400 text-xs leading-relaxed">{diff.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Target Environment */}
                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms' }}>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight">Work Environment</h2>
                                <p className="text-slate-500 text-sm">Adjusts the interview style and cultural context</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {companies.map((company) => (
                                <button
                                    key={company.id}
                                    onClick={() => setConfig(prev => ({ ...prev, companyTarget: company.id }))}
                                    className={`relative p-6 rounded-3xl border-2 transition-all duration-300 text-center flex flex-col items-center gap-3 ${config.companyTarget === company.id
                                        ? 'border-cyan-500 bg-cyan-500/10'
                                        : 'border-white/5 hover:border-white/20 bg-white/5'
                                        }`}
                                >
                                    <div className="text-4xl mb-1">{company.icon}</div>
                                    <h3 className={`font-bold text-sm leading-tight ${config.companyTarget === company.id ? 'text-cyan-400' : 'text-white'}`}>
                                        {company.label}
                                    </h3>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Audio Configuration */}
                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '200ms' }}>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-pink-500/20 rounded-2xl flex items-center justify-center">
                                <Volume2 className="w-6 h-6 text-pink-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight">AI Persona Voice</h2>
                                <p className="text-slate-500 text-sm">Select the voice that best fits your practice comfort</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                            {availableVoices.map((voice) => (
                                <div
                                    key={voice.voiceURI}
                                    className={`p-5 rounded-3xl border-2 transition-all duration-300 flex items-center justify-between group ${config.voiceURI === voice.voiceURI
                                        ? 'border-pink-500 bg-pink-500/10'
                                        : 'border-white/5 hover:border-white/20 bg-white/5'
                                        }`}
                                >
                                    <button
                                        onClick={() => setConfig(prev => ({ ...prev, voiceURI: voice.voiceURI }))}
                                        className="flex-1 text-left mr-4"
                                    >
                                        <h3 className={`font-bold text-base truncate ${config.voiceURI === voice.voiceURI ? 'text-pink-400' : 'text-white'}`}>
                                            {voice.name.split(' ')[1] || voice.name}
                                        </h3>
                                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">{voice.lang}</p>
                                    </button>
                                    <button
                                        onClick={() => handleTestVoice(voice.voiceURI)}
                                        className="p-3 rounded-xl bg-pink-500/20 text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-pink-500/40"
                                    >
                                        <Play className="w-4 h-4 fill-current" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Final Launch Button */}
                <div className="mt-16 text-center">
                    <button
                        onClick={handleStart}
                        className="group relative inline-flex items-center gap-4 px-16 py-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black uppercase tracking-[0.2em] text-sm rounded-full hover:scale-105 transition-all shadow-2xl hover:shadow-cyan-500/40"
                    >
                        Initiate Session
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        {/* Subtle glow effect */}
                        <div className="absolute inset-0 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                    <p className="mt-6 text-slate-500 text-sm font-medium">Ready when you are. AI is preparing your tailored questions.</p>
                </div>
            </main>
        </div>
    );
}
