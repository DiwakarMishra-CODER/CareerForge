import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, Search, Link as LinkIcon, FileText, Sparkles, Loader2, Upload, CheckCircle } from 'lucide-react';

const LinkedInInput = ({ onStartAnalysis }) => {
    const [file, setFile] = useState(null);
    const [url, setUrl] = useState('');
    const [inputType, setInputType] = useState('pdf'); // 'pdf' or 'url'
    const [isScanning, setIsScanning] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === "application/pdf") {
            setFile(selectedFile);
        } else if (selectedFile) {
            alert("Please upload a PDF file.");
        }
    };

    const handleStart = () => {
        if (inputType === 'pdf' && !file) return;
        if (inputType === 'url' && !url.trim()) return;

        setIsScanning(true);
        // The actual API call will be handled in the parent component
        onStartAnalysis(inputType === 'pdf' ? file : url, inputType);
    };

    // Note: Analysis state in parent will handle the actual scanning animation long-term,
    // but we keep the local state for immediate UI feedback if needed.
    // However, the prompt says "isScanning" is used here.

    return (
        <div className="w-full max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden group"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="text-center space-y-4 mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-semibold tracking-wide mb-2">
                        <Sparkles className="w-4 h-4" /> AI PROFILE SCANNER
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter uppercase text-white">
                        Optimize Your <span className="text-cyan-400">LinkedIn Presence</span>
                    </h2>
                    <p className="text-gray-400 text-sm max-w-lg mx-auto leading-relaxed">
                        Upload your LinkedIn Profile PDF (Save to PDF from LinkedIn) for a deep AI analysis of your professional brand.
                    </p>
                </div>

                <div className="space-y-6 relative">
                    <div className="flex gap-2 p-1.5 bg-gray-950/50 border border-white/10 rounded-2xl w-fit mx-auto sm:mx-0">
                        <button
                            onClick={() => setInputType('pdf')}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase italic tracking-wider transition-all ${inputType === 'pdf' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-gray-400 hover:text-white'}`}
                        >
                            <FileText className="w-3 h-3 inline mr-2" /> Profile PDF
                        </button>
                        <button
                            onClick={() => setInputType('url')}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase italic tracking-wider transition-all ${inputType === 'url' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-gray-400 hover:text-white'}`}
                        >
                            <LinkIcon className="w-3 h-3 inline mr-2" /> LinkedIn URL
                        </button>
                    </div>

                    <div className="relative group/input">
                        {inputType === 'pdf' ? (
                            <div 
                                onClick={() => fileInputRef.current.click()}
                                className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-10 transition-all duration-500 ${file ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-white/10 hover:border-cyan-500/50 hover:bg-white/5'}`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    accept=".pdf"
                                />
                                <div className="flex flex-col items-center text-center">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${file ? 'bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'bg-white/5 group-hover:scale-110 group-hover:bg-cyan-600'}`}>
                                        {file ? <CheckCircle className="w-8 h-8 text-white" /> : <Upload className="w-8 h-8 text-white" />}
                                    </div>
                                    <p className="font-bold text-white uppercase tracking-widest text-xs">
                                        {file ? file.name : "Drop Profile PDF Here or Click to Browse"}
                                    </p>
                                    <p className="text-[10px] text-gray-500 mt-2 uppercase font-bold tracking-tighter">LinkedIn &gt; More &gt; Save to PDF</p>
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
                                <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500" size={20} />
                                <input
                                    type="text"
                                    placeholder="https://linkedin.com/in/yourprofile"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all outline-none"
                                />
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleStart}
                        disabled={(inputType === 'pdf' && !file) || (inputType === 'url' && !url.trim())}
                        className="w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl font-black italic tracking-tighter uppercase text-xl hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-cyan-500/20 active:scale-[0.98]"
                    >
                        <Search className="w-6 h-6" />
                        Analyze Profile
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default LinkedInInput;
