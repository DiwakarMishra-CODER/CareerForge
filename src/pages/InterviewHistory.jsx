import { useState, useEffect } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { api, getUserId } from '../api/client';
import interviewService from '../services/ai/interviewService';
import {
    ArrowLeft, Calendar, Clock, Target, TrendingUp, TrendingDown,
    AlertTriangle, CheckCircle, ChevronRight, Brain, Users, Zap,
    BarChart3, Award, BookOpen, RefreshCw
} from 'lucide-react';
import HistoryBackground from '../components/Interview/HistoryBackground';

const typeIcons = {
    hr: Users,
    dsa: Brain,
    coding: Zap,
    'system-design': Target
};

const typeColors = {
    hr: 'from-pink-500 to-rose-500',
    dsa: 'from-cyan-500 to-blue-500',
    coding: 'from-amber-500 to-orange-500',
    'system-design': 'from-purple-500 to-pink-500'
};

export default function InterviewHistory() {
    const navigate = useNavigate();
    const { user } = useOutletContext() || {};
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [weakPoints, setWeakPoints] = useState([]);
    const [stats, setStats] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const userId = getUserId();
            const [historyRes, statsRes] = await Promise.all([
                interviewService.getHistory({ limit: 50 }),
                interviewService.getPatternAnalysis()
            ]);

            const fetchedInterviews = historyRes.interviews || [];
            setInterviews(fetchedInterviews);
            setStats(statsRes);
            calculateWeakPoints(fetchedInterviews);
        } catch (error) {
            console.error('Failed to fetch interview data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateWeakPoints = (interviewsData) => {
        const wpMap = {};
        interviewsData.forEach(interview => {
            if (interview.weakPoints && Array.isArray(interview.weakPoints)) {
                interview.weakPoints.forEach(wp => {
                    const key = wp.trim();
                    if (!wpMap[key]) {
                        wpMap[key] = { topic: key, count: 0, lastSeen: interview.completedAt || interview.createdAt, improving: false };
                    }
                    wpMap[key].count++;
                    if (new Date(interview.completedAt || interview.createdAt) > new Date(wpMap[key].lastSeen)) {
                        wpMap[key].lastSeen = interview.completedAt || interview.createdAt;
                    }
                });
            }

            if (interview.strengths && Array.isArray(interview.strengths)) {
                interview.strengths.forEach(s => {
                    const key = s.trim();
                    if (wpMap[key]) wpMap[key].improving = true;
                });
            }
        });

        const sortedWp = Object.values(wpMap).sort((a, b) => b.count - a.count);
        setWeakPoints(sortedWp);
    };

    const filteredInterviews = filter === 'all'
        ? interviews
        : interviews.filter(i => i.interviewType === filter);

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-400';
        if (score >= 60) return 'text-amber-400';
        if (score >= 40) return 'text-orange-400';
        return 'text-red-400';
    };

    const getScoreBg = (score) => {
        if (score >= 80) return 'bg-emerald-500/20 border-emerald-500/30';
        if (score >= 60) return 'bg-amber-500/20 border-amber-500/30';
        if (score >= 40) return 'bg-orange-500/20 border-orange-500/30';
        return 'bg-red-500/20 border-red-500/30';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400 font-bold">Loading your interview history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-slate-950 text-white overflow-x-hidden">
            <HistoryBackground />

            <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-4">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate('/interview-prep')} className="p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-[1.5rem] hover:bg-white/10 hover:scale-105 transition-all shadow-xl active:scale-95">
                            <ArrowLeft className="w-6 h-6 text-white" />
                        </button>
                        <div>
                            <h1 className="text-4xl lg:text-5xl font-black italic tracking-tighter">
                                Interview <span className="text-blue-400">History</span>
                            </h1>
                            <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-2 flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                {interviews.length} sessions completed
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Stats & Growth */}
                    <div className="space-y-8">
                        {/* Quick Stats */}
                        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                            <h2 className="text-xl font-black mb-6 flex items-center gap-3 uppercase tracking-widest">
                                <BarChart3 className="w-6 h-6 text-cyan-400" /> Performance
                            </h2>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 font-bold">Total Attempts</span>
                                    <span className="font-black text-2xl">{interviews.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 font-bold">Avg. Accuracy</span>
                                    <span className={`font-black text-2xl ${getScoreColor(
                                        Math.round(interviews.reduce((a, b) => a + (b.overallScore || 0), 0) / Math.max(interviews.length, 1))
                                    )}`}>
                                        {Math.round(interviews.reduce((a, b) => a + (b.overallScore || 0), 0) / Math.max(interviews.length, 1))}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Weak Points */}
                        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                            <h2 className="text-xl font-black mb-6 flex items-center gap-3 uppercase tracking-widest text-amber-400">
                                <AlertTriangle className="w-6 h-6" /> Growth Areas
                            </h2>
                            {weakPoints.length === 0 ? (
                                <div className="text-center py-8">
                                    <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                                    <p className="text-slate-400 font-bold">Performance Optimized!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {weakPoints.slice(0, 6).map((wp, idx) => (
                                        <div key={idx} className={`p-4 rounded-2xl border ${wp.improving ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-sm">{wp.topic}</span>
                                                {wp.improving && <span className="text-[10px] font-black uppercase text-emerald-400">Improving</span>}
                                            </div>
                                            <div className="mt-2 text-[10px] text-slate-500 uppercase tracking-widest">Seen in {wp.count} sessions</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Interview List */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Filter Bar */}
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {['all', 'hr', 'dsa', 'system-design'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setFilter(t)}
                                    className={`px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all whitespace-nowrap border ${filter === t
                                        ? 'bg-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                                >
                                    {t === 'all' ? 'All Sessions' : t.replace('-', ' ')}
                                </button>
                            ))}
                        </div>

                        {/* Sessions Grid */}
                        <div className="space-y-4">
                            {filteredInterviews.length === 0 ? (
                                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-12 text-center">
                                    <Brain className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                                    <p className="text-slate-400 font-bold">No sessions found in this category.</p>
                                </div>
                            ) : (
                                filteredInterviews.map((interview, idx) => {
                                    const Icon = typeIcons[interview.interviewType] || Brain;
                                    const color = typeColors[interview.interviewType] || 'from-slate-500 to-slate-700';

                                    return (
                                        <div
                                            key={interview._id || idx}
                                            onClick={() => setSelectedInterview(selectedInterview === idx ? null : idx)}
                                            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all cursor-pointer group shadow-[0_10px_40px_rgba(0,0,0,0.3)]"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <div className={`w-16 h-16 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                                        <Icon className="w-8 h-8 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-xl italic tracking-tight">
                                                            {interview.interviewType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Round
                                                            {interview.customRole && <span className="text-blue-400 text-sm block font-bold mt-0.5">({interview.customRole})</span>}
                                                        </h3>
                                                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">
                                                            <span className="flex items-center gap-1.5 p-1 px-2 bg-white/5 rounded-lg"><Calendar className="w-3 h-3 text-blue-400" /> {new Date(interview.completedAt || interview.createdAt).toLocaleDateString()}</span>
                                                            <span className="flex items-center gap-1.5 p-1 px-2 bg-white/5 rounded-lg"><Clock className="w-3 h-3 text-blue-400" /> {Math.round((interview.timeTaken || 0) / 60)}m</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`flex flex-col items-center justify-center h-20 w-24 rounded-2xl border-2 font-black shadow-inner ${getScoreBg(interview.overallScore)}`}>
                                                    <span className={`text-3xl ${getScoreColor(interview.overallScore)} drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]`}>{interview.overallScore || 0}%</span>
                                                    <span className="text-[8px] uppercase tracking-tighter opacity-50 mt-1">Accuracy</span>
                                                </div>
                                            </div>

                                            {selectedInterview === idx && (
                                                <div className="mt-8 pt-8 border-t border-white/5 animate-in fade-in slide-in-from-top-4 duration-300">
                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <div className="space-y-4">
                                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Top Strengths</h4>
                                                            <div className="space-y-2">
                                                                {interview.strengths?.slice(0, 3).map((s, i) => (
                                                                    <div key={i} className="text-sm text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5 font-medium">{s}</div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-2"><Target className="w-4 h-4" /> For Improvement</h4>
                                                            <div className="space-y-2">
                                                                {interview.weakPoints?.slice(0, 3).map((w, i) => (
                                                                    <div key={i} className="text-sm text-slate-300 bg-white/5 p-3 rounded-xl border border-white/10 font-medium">{w}</div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
