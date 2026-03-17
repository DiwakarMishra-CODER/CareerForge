import React from 'react';
import { Target, Lightbulb, Heart, Rocket, Users, Shield } from 'lucide-react';
import careerForgeLogo from '../assets/logo.png';
import ThreeBackground from '../components/UI/ThreeBackground'; // ensure you have this file

// Import team member images (Using URL for Ishan)
const ishanImage = "https://i.postimg.cc/x8Kb5SDj/Whats-App-Image-2026-03-02-at-10-51-00.jpg";
import kshitijImage from '../assets/Kshitij.png';
import rahulImage from '../assets/Rahul.png';
import diwakarImage from '../assets/Diwakar.png';

const teamMembers = [
    { name: "Ishan Gupta", role: "Frontend Developer", image: ishanImage },
    { name: "Kshitij Garg", role: "Backend Developer", image: kshitijImage },
    { name: "Rahul Kumar", role: "UI/UX Designer", image: rahulImage },
    { name: "Diwakar Mishra", role: "AI Engineer", image: diwakarImage }
];

const features = [
    {
        icon: Rocket,
        title: "AI-Powered Roadmaps",
        description: "Experience dynamic progression paths curated specifically for your strengths and career goals.",
        color: "text-blue-400",
        bg: "bg-blue-500/10"
    },
    {
        icon: Users,
        title: "Community Driven",
        description: "Join thousands of learners in collaborative environments, sharing insights and growth hacking.",
        color: "text-purple-400",
        bg: "bg-purple-500/10"
    },
    {
        icon: Shield,
        title: "Enterprise Grade",
        description: "Built on robust architecture matching industry standards for privacy, speed, and real-time inference.",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10"
    }
];

export default function AboutUs() {
    return (
        <div className="relative min-h-screen text-white overflow-hidden bg-[#030014]">
            {/* 3D Moving Background */}
            <ThreeBackground />

            {/* Overlay Grid & Ambient Glow */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNHYtbjAwbTAtNDAwaDM2aC0zNnoiIHN0cm9rZT0iIzFmMjkzNyIgc3Ryb2tlLW9wYWNpdHk9IjAuNSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-20 pointer-events-none" />
            <div className="absolute top-1/4 -left-64 w-96 h-96 bg-purple-500/30 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-blue-500/30 rounded-full blur-[128px] pointer-events-none" />

            {/* Content Container */}
            <div className="relative z-10 p-6 lg:p-12 max-w-7xl mx-auto space-y-20 pt-20">

                {/* Hero Section */}
                <div className="text-center space-y-8 animate-fade-in-up">
                    <div className="flex justify-center mb-6">
                        <div className="w-28 h-28 relative group">
                            <div className="absolute inset-0 bg-emerald-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                            <img src={careerForgeLogo} alt="CareerForge Logo" className="relative w-full h-full object-contain filter drop-shadow-2xl" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 mb-6 drop-shadow-md pb-2 tracking-tight">
                            Forging Futures
                        </h1>
                        <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-loose font-light">
                            Welcome to <strong className="text-white">CareerForge</strong>. We're revolutionizing professional growth through deep artificial intelligence, empowering the next generation of pioneers to chart paths unseen.
                        </p>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10">
                    {features.map((feature, idx) => (
                        <div key={idx} className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all duration-300 group hover:-translate-y-2">
                            <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className={`w-6 h-6 ${feature.color}`} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                            <p className="text-base text-gray-400 leading-loose font-light">{feature.description}</p>
                        </div>
                    ))}
                </div>

                {/* Split Vision Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-10">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold tracking-wide">
                            <Target className="w-4 h-4" /> OUR MISSION
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight">
                            Democratizing elite <br /> career guidance.
                        </h2>
                        <p className="text-gray-400 text-base leading-loose font-light">
                            The gap between ambition and opportunity is widening. Traditional career advice is static and outdated. Our platform analyzes your unique skillset, dynamically compares it against real-time market demands, and constructs an evolving blueprint for success.
                        </p>
                        <ul className="space-y-4 pt-4">
                            {[
                                "Real-time market analytics",
                                "Iterative resume refinement",
                                "AI-driven mock interviews"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-gray-300">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-3xl blur-2xl opacity-20" />
                        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl space-y-6 shadow-2xl">
                            <Heart className="w-10 h-10 text-pink-500 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Built with empathy.</h3>
                            <p className="text-base text-gray-400 leading-loose font-light">
                                We know the job hunt is daunting. That’s why CareerForge is designed to be your steadfast companion. We celebrate your milestones, identify your blind spots without judgment, and provide actionable resources precisely when you need them.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Team Section */}
                <div className="text-center pt-10">
                    <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Meet The Architects</h2>
                    <p className="text-base text-gray-400 mb-20 max-w-2xl mx-auto font-light leading-loose">
                        The passionate innovators from Maharaja Agrasen Institute of Technology pioneering the future of talent.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                        {teamMembers.map((member) => (
                            <div key={member.name} className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="w-40 h-40 mx-auto overflow-hidden rounded-full bg-gray-900 border-2 border-emerald-500/30 relative mt-6 shadow-xl">
                                    {member.image ? (
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                            <span className="text-5xl font-bold text-gray-600">
                                                {member.name.split(' ').map(n => n[0]).join('')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-6 mb-6">
                                    <h4 className="font-bold text-xl text-white tracking-wide">{member.name}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}