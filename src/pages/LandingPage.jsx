import React, { useRef, useState, useEffect } from 'react';
import Scene from '../components/3d/Scene';
import SmoothScroll from '../components/layout/SmoothScroll';
import { Link } from 'react-router-dom';
import { motion, useSpring, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, FileText, Search, Mic, Users, Briefcase, Zap, Compass, ShieldCheck, PieChart, BarChart, CheckCircle2 } from 'lucide-react';

// Team Images
import kshitijImage from '../assets/Kshitij.png';
import rahulImage from '../assets/Rahul.png';
import diwakarImage from '../assets/Diwakar.png';

// Feature Illustrations
import resumeBuilderImg from '../assets/resume_builder.png';
import resumeAnalyzerImg from '../assets/resume_analyzer.png';
import mockInterviewImg from '../assets/mock_interview.png';
import linkedinOptimizationImg from '../assets/linkedin_optimization.png';


const MagneticButton = ({ children, className = "" }) => {
    const ref = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e) => {
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current.getBoundingClientRect();
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        setPosition({ x: middleX * 0.3, y: middleY * 0.3 });
    };

    const reset = () => setPosition({ x: 0, y: 0 });

    return (
        <motion.button
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className={className}
        >
            {children}
        </motion.button>
    );
};

const teamMembers = [
    { name: "Ishan Gupta", image: "https://i.postimg.cc/x8Kb5SDj/Whats-App-Image-2026-03-02-at-10-51-00.jpg" },
    { name: "Kshitij Garg", image: kshitijImage },
    { name: "Rahul Kumar", image: rahulImage },
    { name: "Diwakar Mishra", image: diwakarImage }
];

const PremiumSection = ({ children, className = "", id }) => (
    <section id={id} className={`min-h-[100vh] flex flex-col justify-center items-center px-6 lg:px-24 relative overflow-hidden ${className}`}>
        <div className="max-w-7xl mx-auto w-full z-10 py-20">
            {children}
        </div>
    </section>
);

const OrbitCard = ({ title, icon: Icon, delay = 0, className = "" }) => (
    <motion.div
        drag
        dragConstraints={{ left: -150, right: 150, top: -150, bottom: 150 }}
        dragElastic={0.1}
        whileDrag={{ scale: 1.1, cursor: 'grabbing', zIndex: 100 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
            opacity: [0, 1, 1, 0],
            scale: 1,
            y: [0, -10, 0]
        }}
        transition={{
            opacity: {
                duration: 6,
                repeat: Infinity,
                delay: delay,
                times: [0, 0.1, 0.9, 1]
            },
            y: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
            },
            scale: { duration: 1, delay }
        }}
        className={`absolute p-4 bg-black/80 backdrop-blur-2xl border border-white/20 rounded-2xl flex items-center gap-4 shadow-[0_0_30px_rgba(16,185,129,0.1)] z-20 hover:border-emerald-500/50 transition-colors group cursor-grab active:cursor-grabbing ${className}`}
        style={{ width: 'max-content' }}
    >
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors pointer-events-none">
            <Icon className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="pointer-events-none">
            <p className="text-sm font-bold text-white tracking-wide">{title}</p>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Interactive Module</p>
        </div>
    </motion.div>
);





const AppPreviewCarousel = () => {
    const [index, setIndex] = useState(0);
    const previews = [
        {
            title: "ATS Resume Builder",
            icon: FileText,
            color: "emerald",
            content: (
                <div className="space-y-3">
                    <div className="h-6 w-3/4 bg-emerald-500/20 rounded-md animate-pulse" />
                    <div className="h-24 w-full bg-white/5 border border-white/10 rounded-lg p-3 overflow-hidden">
                        <div className="flex gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20" />
                            <div className="flex-1 space-y-2">
                                <div className="h-2 w-1/2 bg-white/10 rounded" />
                                <div className="h-2 w-1/3 bg-white/10 rounded" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-2 w-full bg-white/5 rounded" />
                            <div className="h-2 w-full bg-white/5 rounded" />
                            <div className="h-2 w-2/3 bg-white/5 rounded" />
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Resume Analyzer",
            icon: Search,
            color: "blue",
            content: (
                <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                        <div className="h-4 w-1/3 bg-blue-500/20 rounded" />
                        <div className="text-[10px] text-blue-400 font-bold tracking-tighter">SCORE: 88%</div>
                    </div>
                    <div className="h-32 w-full bg-white/5 border border-white/10 rounded-lg p-3">
                        <div className="flex gap-4 h-full">
                            <div className="w-1/3 flex flex-col justify-end gap-1">
                                <div className="bg-blue-500/40 w-full rounded-t" style={{ height: '70%' }} />
                                <div className="text-[6px] text-center opacity-50 uppercase">Skills</div>
                            </div>
                            <div className="w-1/3 flex flex-col justify-end gap-1">
                                <div className="bg-blue-400/20 w-full rounded-t animate-pulse" style={{ height: '90%' }} />
                                <div className="text-[6px] text-center opacity-50 uppercase">ATS</div>
                            </div>
                            <div className="flex-1 flex flex-col gap-2 pt-2">
                                <div className="flex items-center gap-1"><CheckCircle2 className="w-2 h-2 text-emerald-400" /><div className="h-1 flex-1 bg-white/10 rounded" /></div>
                                <div className="flex items-center gap-1"><CheckCircle2 className="w-2 h-2 text-emerald-400" /><div className="h-1 flex-1 bg-white/10 rounded" /></div>
                                <div className="h-1 w-full bg-white/5 rounded" />
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "LinkedIn Optimizer",
            icon: Users,
            color: "purple",
            content: (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="h-2 w-1/2 bg-white/20 rounded" />
                            <div className="h-1.5 w-1/3 bg-white/10 rounded" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="h-16 bg-white/5 border border-white/10 rounded-lg p-2 flex flex-col justify-center gap-2">
                            <div className="h-1.5 w-full bg-white/10 rounded" />
                            <BarChart className="w-4 h-4 text-purple-400 opacity-60 ml-auto" />
                        </div>
                        <div className="h-16 bg-white/5 border border-white/10 rounded-lg p-2 flex flex-col justify-center gap-2">
                            <div className="h-1.5 w-2/3 bg-white/10 rounded" />
                            <PieChart className="w-4 h-4 text-purple-400 opacity-60 ml-auto" />
                        </div>
                    </div>
                </div>
            )
        }
    ];

    const colorMap = {
        emerald: {
            bg: "bg-emerald-500/20",
            border: "border-emerald-500/30",
            text: "text-emerald-400",
            indicator: "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
        },
        blue: {
            bg: "bg-blue-500/20",
            border: "border-blue-500/30",
            text: "text-blue-400",
            indicator: "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        },
        purple: {
            bg: "bg-purple-500/20",
            border: "border-purple-500/30",
            text: "text-purple-400",
            indicator: "bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
        }
    };

    const activeColor = colorMap[previews[index].color];

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % previews.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [previews.length]);

    return (
        <div className="relative w-[280px] h-[320px] flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity duration-700"
            style={{ perspective: '1500px', transformStyle: 'preserve-3d' }}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95, rotateX: 20, rotateY: 15, z: -50 }}
                    animate={{ opacity: 1, scale: 1, rotateX: 20, rotateY: 15, z: 0 }}
                    exit={{ opacity: 0, scale: 0.95, rotateX: 20, rotateY: 15, z: 50 }}
                    transition={{
                        duration: 1.5,
                        ease: [0.4, 0, 0.2, 1]
                    }}
                    className="absolute inset-0 p-5 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden"
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Glossy Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                    <div className="flex items-center gap-2 mb-5 relative z-10">
                        <div className={`p-2 rounded-xl ${activeColor.bg} border ${activeColor.border}`}>
                            {React.createElement(previews[index].icon, {
                                className: `w-5 h-5 ${activeColor.text}`
                            })}
                        </div>
                        <span className="text-[10px] font-black tracking-widest uppercase opacity-60">Internal Preview</span>
                    </div>

                    <h3 className="text-xl font-black mb-5 tracking-tight text-white leading-tight relative z-10">{previews[index].title}</h3>

                    <div className="flex-1 relative scale-95 origin-top z-10">
                        {previews[index].content}
                    </div>

                    <div className="mt-4 flex gap-2 relative z-10">
                        {previews.map((_, i) => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-1000 ${i === index ? activeColor.indicator : 'bg-white/5'}`} />
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Background Layered Effect */}
            <div className="absolute inset-0 bg-emerald-500/5 blur-[100px] -z-10 rounded-full" />
        </div>
    );
};

const HeroOrbitVisual = () => {
    return (
        <div className="relative w-full aspect-square max-w-[600px] mx-auto flex items-center justify-center overflow-visible">
            {/* Tilted Container for 3D effect */}
            <div className="absolute inset-0 preserve-3d" style={{ perspective: '1500px' }}>
                <div className="absolute inset-0 flex items-center justify-center animate-[spin_60s_linear_infinite]"
                    style={{ transform: 'rotateX(20deg) rotateY(15deg)' }}>

                    {/* Subtle Concentric Rings - Balanced size */}
                    <div className="absolute w-[118%] h-[118%] border border-emerald-500/10 rounded-full shadow-[0_0_40px_rgba(16,185,129,0.03)]" />
                    <div className="absolute w-[98%] h-[98%] border border-white/5 rounded-full" />
                    <div className="absolute w-[78%] h-[78%] border border-white/5 rounded-full" />

                    {/* Revolving Background Particle */}
                    <div className="absolute inset-0 animate-[spin_40s_linear_infinite_reverse]">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-emerald-500/20 rounded-full blur-[2px]" />
                    </div>
                </div>
            </div>

            {/* Central App Showcase Carousel */}
            <div className="relative z-10 scale-90 md:scale-100">
                <AppPreviewCarousel />
            </div>

            {/* Feature Cards - Floating Around the center */}
            <OrbitCard
                title="ATS Resume Builder"
                icon={FileText}
                className="top-[-5%] left-[5%]"
                delay={0.5}
            />
            <OrbitCard
                title="LinkedIn Optimizer"
                icon={Users}
                className="top-1/2 -right-8 translate-y-[-50%]"
                delay={0.8}
            />
            <OrbitCard
                title="AI Mock Interviews"
                icon={Mic}
                className="bottom-[-5%] left-[10%]"
                delay={1.1}
            />
        </div>
    );
};



const FeatureCard = ({ image, title, desc, delay }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateY,
                rotateX,
                transformStyle: "preserve-3d",
            }}
            className="relative group p-1 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent hover:from-emerald-500/20 transition-all duration-500"
        >
            <div
                style={{ transform: "translateZ(50px)" }}
                className="h-full bg-[#030712]/80 backdrop-blur-2xl border border-white/5 rounded-[2.4rem] p-6 flex flex-col items-center text-center overflow-hidden"
            >
                {/* Visual Header */}
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-6 border border-white/5 group-hover:border-emerald-500/30 transition-colors duration-500">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent opacity-60" />
                </div>

                {/* Content */}
                <div style={{ transform: "translateZ(30px)" }} className="relative z-10">
                    <h3 className="text-xl font-black mb-3 text-white tracking-tight italic uppercase">{title}</h3>
                    <p className="text-sm text-gray-400 font-light leading-relaxed">{desc}</p>
                </div>

                {/* Decorative Glow */}
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-emerald-500/10 blur-[80px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-700" />
            </div>
        </motion.div>
    );
};

const LandingPage = () => {
    return (
        <SmoothScroll>
            <div className="relative bg-[#020617] text-white selection:bg-emerald-500 selection:text-white">
                {/* Cinematic 3D Backdrop */}
                <Scene />

                {/* HERO - The Gateway */}
                <PremiumSection id="experience">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                            className="text-left"
                        >
                            <span className="inline-block py-2 px-4 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-sm font-medium mb-8">
                                The Future of Career Mentorship
                            </span>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-8">
                                DECODE YOUR <br />
                                <span className="bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                                    FUTURE.
                                </span>
                            </h1>
                            <p className="text-xl text-gray-400 max-w-xl mb-12 leading-relaxed font-light">
                                The intelligent ecosystem designed for high-ambition students to traverse the gap between education and global excellence.
                            </p>
                            <div className="flex flex-wrap gap-6">
                                <Link to="/signin">
                                    <MagneticButton className="px-10 py-5 bg-white text-black rounded-full font-bold text-lg hover:bg-emerald-400 transition-all flex items-center gap-2 group">
                                        Bring us to your journey <ArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </MagneticButton>
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.5, delay: 0.2 }}
                        >
                            <HeroOrbitVisual />
                        </motion.div>
                    </div>
                </PremiumSection>



                {/* WHAT YOU GET - Features */}
                <PremiumSection id="ecosystem">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">What You Get</h2>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto font-light">
                            Comprehensive AI-powered tools to accelerate your professional journey.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto px-4">
                        <FeatureCard
                            image={resumeBuilderImg}
                            title="Resume Builder"
                            desc="Craft ATS-optimized resumes with precision templates and expert guidance."
                            delay={0.1}
                        />
                        <FeatureCard
                            image={resumeAnalyzerImg}
                            title="Resume Analyzer"
                            desc="Get instant AI feedback on your resume's impact, keywords, and layout."
                            delay={0.2}
                        />
                        <FeatureCard
                            image={mockInterviewImg}
                            title="Interview Prep"
                            desc="Realistic AI-driven simulations tailored for your target industry and role."
                            delay={0.3}
                        />
                        <FeatureCard
                            image={linkedinOptimizationImg}
                            title="LinkedIn Pro"
                            desc="Dynamic optimization strategies to attract global scouts and recruiters."
                            delay={0.4}
                        />
                    </div>
                </PremiumSection>

                {/* MEET THE TEAM */}
                <PremiumSection id="team" className="bg-white/[0.02]">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Meet Our Team</h2>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                            The passionate innovators from Maharaja Agrasen Institute of Technology pioneering the future of talent.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                        {teamMembers.map((member) => (
                            <motion.div
                                key={member.name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="group relative flex flex-col items-center"
                            >
                                <div className="w-40 h-40 overflow-hidden rounded-full border-2 border-emerald-500/30 bg-gray-900 shadow-xl group-hover:border-emerald-500 transition-colors">
                                    {member.image ? (
                                        <img src={member.image} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-3xl font-bold text-gray-500">
                                            {member.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-6 text-center">
                                    <h4 className="font-bold text-xl text-white tracking-wide">{member.name}</h4>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </PremiumSection>

                {/* USER FEED - Testimonials Marquee */}
                <div className="py-24 overflow-hidden bg-black/40 border-y border-white/5">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold">What Our Users Say</h2>
                    </div>
                    <div className="flex whitespace-nowrap marquee-wrapper">
                        <div className="flex gap-10 marquee-content py-4">
                            {[
                                { name: "Arjun Mehta", comment: "CareerForge changed my resume game completely!" },
                                { name: "Priya Sharma", comment: "The mock interviews felt so real. Highly recommended." },
                                { name: "Rohan Gupta", comment: "Got my dream job at Zomato thanks to the roadmap." },
                                { name: "Ananya Iyer", comment: "The LinkedIn optimization is a hidden gem." },
                                { name: "Vikram Singh", comment: "Simplified my job search journey. 10/10." },
                                { name: "Sneha Reddy", comment: "The AI feedback is remarkably accurate and helpful." }
                            ].map((t, i) => (
                                <div key={i} className="inline-block p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                                    <p className="text-white font-medium mb-2 italic">"{t.comment}"</p>
                                    <p className="text-emerald-400 text-sm font-bold">— {t.name}</p>
                                </div>
                            ))}
                            {/* Duplicate for seamless loop */}
                            {[
                                { name: "Arjun Mehta", comment: "CareerForge changed my resume game completely!" },
                                { name: "Priya Sharma", comment: "The mock interviews felt so real. Highly recommended." },
                                { name: "Rohan Gupta", comment: "Got my dream job at Zomato thanks to the roadmap." },
                                { name: "Ananya Iyer", comment: "The LinkedIn optimization is a hidden gem." },
                                { name: "Vikram Singh", comment: "Simplified my job search journey. 10/10." },
                                { name: "Sneha Reddy", comment: "The AI feedback is remarkably accurate and helpful." }
                            ].map((t, i) => (
                                <div key={`${i}-dup`} className="inline-block p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                                    <p className="text-white font-medium mb-2 italic">"{t.comment}"</p>
                                    <p className="text-emerald-400 text-sm font-bold">— {t.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* FAQ - Common Questions */}
                <PremiumSection id="faq">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Common Questions</h2>
                        <p className="text-gray-400">Everything you need to know about the Forge.</p>
                    </div>
                    <div className="max-w-3xl mx-auto space-y-4">
                        {[
                            { q: "What is CareerForge?", a: "An AI-powered ecosystem designed to bridge the gap between education and high-tier industry roles." },
                            { q: "How does the Resume Analyzer work?", a: "Our AI scans your resume against thousands of real-world job descriptions to provide precise impact scores and optimization tips." },
                            { q: "Are the mock interviews realistic?", a: "Yes, we use advanced LLMs to simulate real technical and behavioral interview environments tailored to your specific role." },
                            { q: "Is LinkedIn optimization included?", a: "Absolutely. We provide data-driven strategies to make your profile stand out to top recruiters automatically." }
                        ].map((item, i) => (
                            <details key={i} className="group bg-white/5 border border-white/10 rounded-2xl p-6 cursor-pointer overflow-hidden transition-all duration-300 hover:bg-white/10">
                                <summary className="list-none flex justify-between items-center font-bold text-lg">
                                    {item.q}
                                    <span className="text-emerald-400 group-open:rotate-180 transition-transform">↓</span>
                                </summary>
                                <p className="mt-4 text-gray-400 leading-relaxed font-light">
                                    {item.a}
                                </p>
                            </details>
                        ))}
                    </div>
                </PremiumSection>

                <style dangerouslySetInnerHTML={{
                    __html: `
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(250%); }
          }
          @keyframes orbit {
            from { transform: rotate(0deg) translateX(100px) rotate(0deg); }
            to { transform: rotate(360deg) translateX(100px) rotate(-360deg); }
          }
          .marquee-content {
            display: flex;
            animation: marquee 30s linear infinite;
            width: fit-content;
          }
          .marquee-wrapper:hover .marquee-content {
            animation-play-state: paused;
          }
        `}} />


                {/* CTA - The Final Forge */}
                <PremiumSection className="bg-gradient-to-b from-[#020617] to-emerald-950/20">
                    <div className="relative text-center max-w-4xl mx-auto">
                        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full" />
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                        >
                            <h2 className="text-5xl md:text-7xl font-black mb-10 leading-none">
                                READY TO <br /> <span className="text-emerald-400">RISE?</span>
                            </h2>
                            <p className="text-xl text-gray-400 mb-12">
                                The gap between who you are and who you want to be is called <span className="text-white font-bold italic underline decoration-emerald-500">Forge.</span>
                            </p>
                            <button className="px-12 py-6 bg-emerald-500 text-black rounded-full font-black text-xl hover:bg-white hover:scale-105 transition-all shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                                INITIALIZE FORGE
                            </button>
                        </motion.div>
                    </div>
                </PremiumSection>


                {/* FOOTER */}
                <footer className="py-12 border-t border-white/10 bg-black/20 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="text-2xl font-black italic tracking-tighter">CAREERFORGE.</div>
                        <div className="flex gap-8 text-sm font-medium text-gray-400">
                            <a href="#" className="hover:text-emerald-400">Twitter</a>
                            <a href="#" className="hover:text-emerald-400">Discord</a>
                            <a href="#" className="hover:text-emerald-400">Privacy</a>
                        </div>
                        <p className="text-gray-500 text-xs">© 2026 FORGE PROTOCOL. ALL RIGHTS RESERVED.</p>
                    </div>
                </footer>
            </div >
        </SmoothScroll >
    );
};

export default LandingPage;
