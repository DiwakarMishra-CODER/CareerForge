import { useState } from 'react';
import { Briefcase, Building2, ChevronRight, Sparkles, BookOpen, User } from 'lucide-react';

const EXPERIENCE_LEVELS = [
    { value: 'fresher', label: 'Fresher / Entry-level (0–1 yr)' },
    { value: 'junior', label: 'Junior (1–3 yrs)' },
    { value: 'mid', label: 'Mid-level (3–6 yrs)' },
    { value: 'senior', label: 'Senior (6–10 yrs)' },
    { value: 'lead', label: 'Lead / Principal (10+ yrs)' },
];

/**
 * InterviewSetup
 * Collects job context from the user before the interview session begins.
 *
 * Props:
 *   onStart(config) – called with { jobTitle, company, experienceLevel, jobDescription }
 */
export default function InterviewSetup({ onStart }) {
    const [form, setForm] = useState({
        jobTitle: '',
        company: '',
        experienceLevel: 'mid',
        jobDescription: '',
    });
    const [errors, setErrors] = useState({});
    const [focused, setFocused] = useState(null);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
    };

    const validate = () => {
        const next = {};
        if (!form.jobTitle.trim()) next.jobTitle = 'Job title is required.';
        if (!form.company.trim()) next.company = 'Company name is required.';
        if (!form.jobDescription.trim()) next.jobDescription = 'Please paste the job description.';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) onStart(form);
    };

    const inputBase =
        'w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none transition-all duration-300 text-sm font-medium';
    const inputIdle = 'border-white/10 hover:border-white/20';
    const inputActive = 'border-cyan-500/60 bg-white/8 shadow-[0_0_20px_rgba(6,182,212,0.08)]';
    const errorClass = 'border-red-500/60 bg-red-500/5';

    const fieldClass = (name) =>
        [
            inputBase,
            errors[name] ? errorClass : focused === name ? inputActive : inputIdle,
        ].join(' ');

    return (
        <div className="flex-1 flex items-center justify-center px-4 pt-12 pb-16 relative z-10">
            {/* Glow backdrop */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-600/8 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-2xl relative">
                {/* Header */}
                <div className="text-center mb-10 animate-in fade-in slide-in-from-top-6 duration-700">

                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-3">
                        Tell us about the{' '}
                        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                            role
                        </span>
                    </h1>
                    <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                        The more context you give, the more targeted your AI interviewer will be. Your answers will be
                        voice-first — hands-free and natural.
                    </p>
                </div>

                {/* Form card */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-white/[0.03] backdrop-blur-2xl border border-white/8 rounded-[2rem] p-8 md:p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100"
                >
                    <div className="space-y-6">
                        {/* Row 1: Job Title + Company */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Job Title */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                    <Briefcase className="w-3 h-3 text-cyan-400" />
                                    Job Title <span className="text-red-400">*</span>
                                </label>
                                <input
                                    id="interview-job-title"
                                    type="text"
                                    placeholder="e.g. Senior Backend Engineer"
                                    value={form.jobTitle}
                                    onChange={(e) => handleChange('jobTitle', e.target.value)}
                                    onFocus={() => setFocused('jobTitle')}
                                    onBlur={() => setFocused(null)}
                                    className={fieldClass('jobTitle')}
                                    autoFocus
                                />
                                {errors.jobTitle && (
                                    <p className="mt-1.5 text-xs text-red-400 font-semibold">{errors.jobTitle}</p>
                                )}
                            </div>

                            {/* Company Name */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                    <Building2 className="w-3 h-3 text-purple-400" />
                                    Company <span className="text-red-400">*</span>
                                </label>
                                <input
                                    id="interview-company"
                                    type="text"
                                    placeholder="e.g. Google, Infosys, Startup…"
                                    value={form.company}
                                    onChange={(e) => handleChange('company', e.target.value)}
                                    onFocus={() => setFocused('company')}
                                    onBlur={() => setFocused(null)}
                                    className={fieldClass('company')}
                                />
                                {errors.company && (
                                    <p className="mt-1.5 text-xs text-red-400 font-semibold">{errors.company}</p>
                                )}
                            </div>
                        </div>

                        {/* Experience Level */}
                        <div>
                            <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                <User className="w-3 h-3 text-green-400" />
                                Experience Level
                            </label>
                            <div className="relative">
                                <select
                                    id="interview-experience"
                                    value={form.experienceLevel}
                                    onChange={(e) => handleChange('experienceLevel', e.target.value)}
                                    onFocus={() => setFocused('experienceLevel')}
                                    onBlur={() => setFocused(null)}
                                    className={[
                                        fieldClass('experienceLevel'),
                                        'appearance-none cursor-pointer pr-10',
                                    ].join(' ')}
                                >
                                    {EXPERIENCE_LEVELS.map((lvl) => (
                                        <option
                                            key={lvl.value}
                                            value={lvl.value}
                                            className="bg-[#0f172a] text-white"
                                        >
                                            {lvl.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 rotate-90 pointer-events-none" />
                            </div>
                        </div>

                        {/* Job Description */}
                        <div>
                            <label className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                <BookOpen className="w-3 h-3 text-amber-400" />
                                Job Description <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                id="interview-job-description"
                                rows={6}
                                placeholder="Paste the full job description here. The AI will tailor every question to this specific role and company culture."
                                value={form.jobDescription}
                                onChange={(e) => handleChange('jobDescription', e.target.value)}
                                onFocus={() => setFocused('jobDescription')}
                                onBlur={() => setFocused(null)}
                                className={[fieldClass('jobDescription'), 'resize-none leading-relaxed'].join(' ')}
                            />
                            {errors.jobDescription && (
                                <p className="mt-1.5 text-xs text-red-400 font-semibold">{errors.jobDescription}</p>
                            )}
                        </div>

                        {/* Tips callout */}
                        <div className="flex items-start gap-3 bg-cyan-500/5 border border-cyan-500/15 rounded-xl p-4">
                            <Sparkles className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-slate-400 leading-relaxed">
                                <span className="text-cyan-300 font-bold">Pro tip:</span> The interview is voice-first.
                                Speak your answers naturally — the AI listens, detects 2.5 s of silence, and
                                automatically moves on. You can also type at any time.
                            </p>
                        </div>

                        {/* Submit */}
                        <button
                            id="interview-setup-submit"
                            type="submit"
                            className="w-full group relative overflow-hidden flex items-center justify-center gap-2.5 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
                        >
                            <span className="relative z-10">Start My Interview</span>
                            <ChevronRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            {/* shine */}
                            <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-in-out pointer-events-none" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
