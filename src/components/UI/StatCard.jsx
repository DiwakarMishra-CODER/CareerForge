import { FileText, Map, Brain, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const icons = {
    FileText,
    Map,
    Brain,
    Award
};

export default function StatCard({ icon, label, value, color, link, index = 0 }) {
    const colorClasses = {
        emerald: "text-emerald-400",
        blue: "text-blue-400",
        purple: "text-purple-400",
        pink: "text-pink-400",
    };
    
    const glowClasses = {
        emerald: "shadow-emerald-500/20",
        blue: "shadow-blue-500/20",
        purple: "shadow-purple-500/20",
        pink: "shadow-pink-500/20",
    };

    const IconComponent = icons[icon];

    const CardContent = (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className={`group bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl transition-all duration-300 hover:bg-white/10 ${glowClasses[color]}`}
        >
            <div className="flex items-center gap-5">
                <motion.div 
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    className={`w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-colors`}
                >
                    {IconComponent && <IconComponent className={`w-7 h-7 ${colorClasses[color]}`} />}
                </motion.div>
                <div>
                    <p className="text-3xl font-black text-white tracking-tighter leading-none mb-1">{value}</p>
                    <p className={`text-xs font-black uppercase tracking-widest ${colorClasses[color]} opacity-60 group-hover:opacity-100 transition-opacity`}>{label}</p>
                </div>
            </div>
        </motion.div>
    );

    if (link) {
        return <Link to={link}>{CardContent}</Link>;
    }

    return CardContent;
}