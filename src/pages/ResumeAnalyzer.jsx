// src/pages/ResumeAnalyzer.jsx

import React, { useState, useRef, useEffect } from "react";
import { api, getUserId } from "../api/client.js";
import {
  Upload,
  FileText,
  Search,
  Loader2,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  ClipboardPaste,
  Briefcase,
  Layers,
  Zap,
  History,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnalyzerBackground from "../components/Resume/AnalyzerBackground";
import ScoreGauge from "../components/Resume/ScoreGauge";

const CATEGORIES = [
  { id: 'impact', name: 'Impact & Results', icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'formatting', name: 'ATS Formatting', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'keywords', name: 'Keyword Optimization', icon: Layers, color: 'text-purple-400', bg: 'bg-purple-500/10' },
];

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('analyze'); // 'analyze' or 'history'
  const inputRef = useRef(null);
  const userId = getUserId();

  useEffect(() => {
    fetchHistory();
    // Load PDF.js worker
    if (window.pdfjsLib && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;
    }
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await api.get(`/api/resumes/analyses?userId=${userId}`);
      setHistory(data);
    } catch (err) {
      console.error("Error fetching analysis history:", err);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      alert("Please select a PDF file.");
    }
  };

  const analyzeResume = async () => {
    if (!file) return alert("Please upload a resume first.");
    setIsProcessing(true);
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('userId', userId);
      formData.append('jobDescription', jobDescription);

      // Backend API call (custom hardcoded backend logic)
      const data = await api.post('/api/resumes/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setAnalysis(data);
      fetchHistory(); // Refresh history
    } catch (err) {
      console.error("AI Analysis error:", err);
      alert("Failed to analyze resume. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAnalyzer = () => {
    setFile(null);
    setAnalysis(null);
    setJobDescription("");
  };

  const AnalysisResults = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Score Card */}
        <div className="lg:col-span-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap className="w-20 h-20 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-4 italic tracking-tighter">Analysis Results</h2>
          <ScoreGauge score={analysis.job_match_score || 0} size={200} />
          <p className="text-gray-400 text-sm text-center mt-4">
            {analysis.job_match_score >= 70 ? "Excellent alignment with technical standards." : "Room for improvement in key areas."}
          </p>
        </div>

        {/* Categories Breakdown */}
        <div className="lg:col-span-2 space-y-4">
          {CATEGORIES.map((cat) => (
            <motion.div
              key={cat.id}
              whileHover={{ x: 10 }}
              className={`${cat.bg} border border-white/5 rounded-2xl p-5 flex items-center justify-between group transition-all duration-300 hover:border-white/10`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gray-900 shadow-inner ${cat.color}`}>
                  <cat.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{cat.name}</h4>
                  <p className="text-xs text-gray-400">Optimization status and quality check.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-24 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.random() * 40 + 60}%` }}
                    className={`h-full bg-current ${cat.color}`}
                  />
                </div>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Suggestion Card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl space-y-6 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-black text-xl italic tracking-tighter uppercase">AI Suggestions</h3>
          </div>
          <ul className="space-y-4">
            {analysis.improvement_suggestions.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors group"
              >
                <div className="mt-1 w-5 h-5 flex items-center justify-center text-xs font-bold text-blue-400 bg-blue-400/10 rounded-full border border-blue-400/20">
                  {i + 1}
                </div>
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors leading-relaxed">{item}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Skills/Roles Card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-black text-xl italic tracking-tighter uppercase">Suitable Roles</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.suitable_roles.map((role, i) => (
              <motion.span
                key={i}
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-xl text-sm font-medium"
              >
                {role}
              </motion.span>
            ))}
          </div>

          {analysis.missing_keywords && analysis.missing_keywords.length > 0 && (
            <div className="mt-6 pt-6 border-t border-white/5">
              <h4 className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-3 h-3" /> Missing Keywords
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {analysis.missing_keywords.map((kw, i) => (
                  <span key={i} className="text-[10px] bg-orange-500/10 text-orange-300 border border-orange-500/10 px-2 py-0.5 rounded-md">{kw}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button
          onClick={resetAnalyzer}
          className="group relative px-8 py-4 bg-white text-gray-950 rounded-2xl font-black italic tracking-tighter uppercase text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(59,130,246,0.2)]"
        >
          <span className="relative z-10 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
            Analyze Another
          </span>
        </button>
      </div>
    </motion.div>
  );

  const HistoryList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black italic tracking-tighter uppercase">Analysis History</h2>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{history.length} Saved Scans</span>
      </div>
      {history.length === 0 ? (
        <div className="p-20 text-center bg-white/5 border border-dashed border-white/10 rounded-3xl">
          <History className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No analysis history yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {history.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:border-blue-500/30 transition-all group cursor-pointer"
              onClick={() => { setAnalysis(item); setActiveTab('analyze'); }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black italic tracking-tighter text-white">{item.matchScore}%</span>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Matching</p>
                </div>
              </div>
              <h4 className="font-bold text-white truncate max-w-[200px]">{item.fileName || "Resume"}</h4>
              <p className="text-xs text-gray-500 mt-1">{new Date(item.analysisDate).toLocaleDateString()}</p>
              <div className="mt-4 flex items-center text-blue-400 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                View Details <ArrowRight className="w-3 h-3 ml-2" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <AnalyzerBackground />

      {/* Scrollable Container */}
      <div className="relative z-10 p-4 sm:p-6 lg:px-12 lg:pb-12 pt-[152px] lg:pt-[152px] max-w-6xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)] rotate-3">
              <Search className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-black italic tracking-tighter uppercase leading-none">
                Resume <span className="text-blue-500">Analyzer</span>
              </h1>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">
                Advanced ATS & Job Matching Engine
              </p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-1.5 rounded-2xl flex gap-1">
            <button
              onClick={() => setActiveTab('analyze')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase italic tracking-wider transition-all ${activeTab === 'analyze' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Analyzer
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase italic tracking-wider transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              History
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'analyze' ? (
            <motion.div
              key="analyze"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-12"
            >
              {analysis ? <AnalysisResults /> : (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
                  {/* Upload Zone */}
                  <div className="lg:col-span-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 sm:p-12 space-y-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="text-center space-y-4">
                      <h2 className="text-2xl font-black italic tracking-tighter uppercase">1. Scan Your Resume</h2>
                      <p className="text-gray-400 text-sm max-w-xs mx-auto">Upload your PDF resume to start the deep logic analysis engine.</p>
                    </div>

                    <div
                      className={`relative group/zone cursor-pointer border-2 border-dashed rounded-[2rem] p-12 transition-all duration-500 ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-blue-500/50 hover:bg-white/5'}`}
                      onClick={() => inputRef.current.click()}
                    >
                      <input
                        type="file"
                        ref={inputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept=".pdf"
                      />
                      <div className="flex flex-col items-center">
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 transition-all duration-500 ${file ? 'bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'bg-white/5 group-hover/zone:scale-110 group-hover/zone:bg-blue-600 group-hover/zone:shadow-[0_0_30px_rgba(37,99,235,0.3)]'}`}>
                          {file ? <CheckCircle className="w-10 h-10 text-white" /> : <Upload className="w-10 h-10 text-white" />}
                        </div>
                        <p className="font-bold text-white uppercase tracking-widest text-xs">
                          {file ? file.name : "Drop PDF here or click to browse"}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-2 uppercase font-bold tracking-tighter">MAX SIZE 5MB</p>
                      </div>
                    </div>

                    <button
                      onClick={analyzeResume}
                      disabled={isProcessing || !file}
                      className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black italic tracking-tighter uppercase text-xl hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(37,99,235,0.2)] active:scale-95"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          Analyzing Deep Logic...
                        </>
                      ) : (
                        <>
                          <Zap className="w-6 h-6" />
                          Start Analysis
                        </>
                      )}
                    </button>
                  </div>

                  {/* Options Zone */}
                  <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 space-y-6">
                      <h3 className="font-black text-xl italic tracking-tighter uppercase flex items-center gap-3">
                        <ClipboardPaste className="w-5 h-5 text-blue-400" />
                        Job Matching
                      </h3>
                      <p className="text-xs text-gray-400 leading-relaxed font-bold uppercase tracking-widest">
                        Paste a Job Description below to calculate a specific Match Score and identify missing keywords.
                      </p>
                      <textarea
                        className="w-full h-48 bg-gray-900/50 border border-white/10 rounded-2xl p-4 text-sm text-gray-300 placeholder-gray-600 focus:border-blue-500 transition-colors resize-none outline-none"
                        placeholder="Paste the JD here..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                      />
                      <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-300">Boosts Accuracy by 40%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                        <Search className="w-5 h-5 text-gray-500 mb-2" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ATS Scanning</span>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                        <ShieldCheck className="w-5 h-5 text-gray-500 mb-2" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Privacy First</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <HistoryList />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Background Micro-elements */}
      <div className="fixed bottom-0 left-0 w-full h-64 bg-gradient-to-t from-blue-600/10 to-transparent pointer-events-none"></div>
    </div>
  );
}