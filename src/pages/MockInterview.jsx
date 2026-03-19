import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Users, Brain, Target, Sparkles, Monitor, LineChart, Briefcase, ChevronRight, Video } from 'lucide-react';
import InterviewSetup from '../components/Interview/InterviewSetup';
import InterviewSession from '../components/Interview/InterviewSession';
import InterviewResults from '../components/Interview/InterviewResults';
import InterviewBackground from '../components/Interview/InterviewBackground';

const interviewCategories = [
    {
        id: 'behavioral',
        title: 'Behavioral & Leadership',
        description: 'Practice soft skills, STAR method, leadership scenarios, and interpersonal communication.',
        icon: Users,
        color: 'from-pink-500 to-rose-500',
        duration: '30 mins',
        difficulty: 'All Levels',
    },
    {
        id: 'domain',
        title: 'Domain Expertise',
        description: 'Specific knowledge for your field: Finance, Law, Marketing, Engineering, Medicine, and more.',
        icon: Target,
        color: 'from-cyan-500 to-blue-500',
        duration: '45 mins',
        difficulty: 'Intermediate+',
        isUniversal: true,
    },
    {
        id: 'case-study',
        title: 'Strategy & Case Study',
        description: 'Analytical problem solving, business case studies, and strategic decision making rounds.',
        icon: LineChart,
        color: 'from-purple-500 to-pink-500',
        duration: '60 mins',
        difficulty: 'Advanced',
    },
];

const popularDomains = [
    { name: 'Software Engineering', icon: Monitor },
    { name: 'Data Science', icon: Brain },
    { name: 'Marketing & Sales', icon: Briefcase },
    { name: 'Finance & Banking', icon: LineChart },
    { name: 'Product Management', icon: Target },
    { name: 'Healthcare & Medicine', icon: Sparkles },
];

export default function MockInterview() {
    const navigate = useNavigate();
    const [step, setStep] = useState('selection'); // selection, setup, session, results
    const [selectedType, setSelectedType] = useState(null);
    const [selectedDomain, setSelectedDomain] = useState('');
    const [interviewConfig, setInterviewConfig] = useState(null);
    const [results, setResults] = useState(null);

    const handleCategorySelect = (typeId) => {
        setSelectedType(typeId);
        if (typeId !== 'domain') {
            setStep('setup');
        } else {
            setStep('domain-selection');
        }
    };

    const handleDomainSelect = (domain) => {
        setSelectedDomain(domain);
        setStep('setup');
    };

    const handleStart = (config) => {
        setInterviewConfig({ ...config, domain: selectedDomain });
        setStep('session');
    };

    const handleResults = (data) => {
        setResults(data);
        setStep('results');
    };

    const handleRetry = () => {
        setResults(null);
        setStep('session');
    };

    const handleEnd = () => {
        setStep('selection');
        setSelectedType(null);
        setSelectedDomain('');
        setResults(null);
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
            <InterviewBackground />

            {step === 'selection' && (
                <main className="max-w-7xl mx-auto px-6 relative z-10 pt-36 pb-16">
                    <div className="text-center mb-12 animate-in fade-in slide-in-from-top-10 duration-1000">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-6">
                            <Sparkles className="w-3.5 h-3.5" />
                            Universal Interview Platform
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter leading-tight">
                            Master Any <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">Career Path</span>
                        </h1>
                        <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-8">
                            The world's first truly universal AI mock interview platform.
                            <span className="text-white font-bold ml-2">Real talk. Real scenarios. Real success.</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                        {interviewCategories.map((cat) => (
                            <div
                                key={cat.id}
                                onClick={() => handleCategorySelect(cat.id)}
                                className="group relative cursor-pointer"
                            >
                                <div className={`absolute -inset-1 bg-gradient-to-r ${cat.color} rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-20 transition-all duration-700`}></div>
                                <div className="relative h-full bg-white/5 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/5 group-hover:border-white/20 transition-all duration-500 flex flex-col shadow-2xl">
                                    <div className={`w-16 h-16 bg-gradient-to-br ${cat.color} rounded-2xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-white/10`}>
                                        <cat.icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-black mb-2 tracking-tight">{cat.title}</h3>
                                    <p className="text-slate-400 text-sm mb-6 flex-1 leading-relaxed">{cat.description}</p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 bg-white/5 text-slate-300 text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/5 flex items-center gap-1.5">
                                                <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                                                {cat.duration}
                                            </span>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                            <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <button
                            onClick={() => navigate('/interview-history')}
                            className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all text-sm font-bold group"
                        >
                            <History className="w-4 h-4 group-hover:-rotate-12 transition-transform" />
                            Analyze Your Preparation History
                        </button>
                    </div>
                </main>
            )}

            {step === 'domain-selection' && (
                <main className="max-w-6xl mx-auto py-20 px-6 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <button onClick={() => setStep('selection')} className="mb-12 text-slate-400 hover:text-white flex items-center gap-2 font-bold transition-colors">
                        <ChevronRight className="w-5 h-5 rotate-180" /> Back to Categories
                    </button>

                    <h2 className="text-xl md:text-2xl font-black mb-2 tracking-tighter">Choose Your <span className="text-cyan-400">Expertise</span></h2>
                    <p className="text-slate-400 text-sm mb-8">The AI interviewer will adapt specifically to the nuances of your chosen field.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
                        {popularDomains.map((domain) => (
                            <button
                                key={domain.name}
                                onClick={() => handleDomainSelect(domain.name)}
                                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 p-6 rounded-3xl transition-all group text-left flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                                        <domain.icon className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <span className="font-black text-base">{domain.name}</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                            </button>
                        ))}
                    </div>

                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 max-w-xl">
                        <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                            <Monitor className="w-4 h-4 text-purple-400" />
                            Other Field?
                        </h4>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Enter your specific role (e.g., Civil Engineer, Chef, Lawyer...)"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && e.target.value.trim() && handleDomainSelect(e.target.value)}
                                className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all text-sm font-bold placeholder:text-slate-600"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase text-slate-500 tracking-widest">Press Enter</div>
                        </div>
                    </div>
                </main>
            )}

            {step === 'setup' && (
                <InterviewSetup
                    selectedType={selectedType}
                    selectedDomain={selectedDomain}
                    onStart={handleStart}
                    onBack={() => selectedType === 'domain' ? setStep('domain-selection') : setStep('selection')}
                />
            )}

            {step === 'session' && (
                <InterviewSession
                    interviewType={selectedType}
                    domain={selectedDomain}
                    config={interviewConfig}
                    onResults={handleResults}
                    onEnd={handleEnd}
                />
            )}

            {step === 'results' && (
                <InterviewResults
                    results={results}
                    interviewType={selectedType}
                    domain={selectedDomain}
                    onRetry={handleRetry}
                    onClose={handleEnd}
                />
            )}
        </div>
    );
}
