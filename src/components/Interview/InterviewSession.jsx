import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Send, Clock, X, Volume2, VolumeX, MessageSquare, Sparkles, Brain, Target, Zap, AlertCircle, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import RealtimeAvatar from './RealtimeAvatar';
import CodeEditor from './CodeEditor';
import InterviewAntiCheat from './InterviewAntiCheat';
import speechService from '../../services/ai/speechService';
import openRouterService from '../../services/ai/openRouterService';
import geminiService from '../../services/ai/geminiService';
import interviewService from '../../services/ai/interviewService';
import { getRandomFallbackQuestion } from '../../data/interviewData';

export default function InterviewSession({
    interviewType,
    domain = '',
    config = null,
    onEnd,
    onResults
}) {
    const difficulty = config?.difficulty || 'intermediate';
    const companyTarget = config?.companyTarget || 'product';
    const configDuration = config?.duration || 30;
    const techStack = config?.techStack || 'javascript';

    const [currentStep, setCurrentStep] = useState('loading');
    const [conversation, setConversation] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [error, setError] = useState(null);

    const [problemResults, setProblemResults] = useState([]);
    const [patternsAsked, setPatternsAsked] = useState([]);
    const [strengths, setStrengths] = useState([]);
    const [improvements, setImprovements] = useState([]);
    const [overallScore, setOverallScore] = useState(0);
    const [questionNumber, setQuestionNumber] = useState(0);
    const [usedFallbackQuestions, setUsedFallbackQuestions] = useState([]);

    const [timeRemaining, setTimeRemaining] = useState(0);
    const [totalTimeUsed, setTotalTimeUsed] = useState(0);
    const timerRef = useRef(null);
    const chatEndRef = useRef(null);
    const startedRef = useRef(false);
    const sessionEndedRef = useRef(false);
    const processingRef = useRef(false);
    const followUpCountRef = useRef(0);
    const timeoutsRef = useRef([]);
    const conversationRef = useRef([]);

    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [avatarEmotion, setAvatarEmotion] = useState('neutral');
    const [isCodingQuestion, setIsCodingQuestion] = useState(false);
    const [showCodeEditor, setShowCodeEditor] = useState(false);
    const [antiCheatActive, setAntiCheatActive] = useState(false);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation, isThinking]);

    useEffect(() => {
        if (startedRef.current) return;
        startedRef.current = true;
        if (config?.voiceURI) speechService.setVoice(config.voiceURI);
        speechService.setSpeakingCallback(setIsSpeaking);
        startInterview();

        return () => {
            sessionEndedRef.current = true;
            timeoutsRef.current.forEach(clearTimeout);
            speechService.stopSpeaking();
            speechService.stopListening();
            if (timerRef.current) clearInterval(timerRef.current);
            if (window.speechSynthesis) window.speechSynthesis.cancel();
        };
    }, []);

    const startInterview = async () => {
        try {
            setCurrentStep('loading');
            setIsThinking(true);
            try {
                if (!document.fullscreenElement) {
                    await document.documentElement.requestFullscreen().catch(() => { });
                }
                setAntiCheatActive(true);
            } catch (fsErr) {
                setAntiCheatActive(true);
            }

            openRouterService.resetSession();
            let introMessage;
            try {
                introMessage = await openRouterService.generateIntro(interviewType, domain, { difficulty, companyTarget });
            } catch (err) {
                introMessage = `Welcome to your ${domain || interviewType} interview! Let's begin.`;
            }

            setCurrentStep('intro');
            setIsThinking(false);
            if (sessionEndedRef.current) return;
            addAIMessage(introMessage);
            if (soundEnabled && !sessionEndedRef.current) await speechService.speak(introMessage);
            if (sessionEndedRef.current) return;

            setTimeRemaining(configDuration * 60);
            const timeoutId = setTimeout(() => {
                if (!sessionEndedRef.current) askNextQuestion();
            }, 2000);
            timeoutsRef.current.push(timeoutId);
        } catch (err) {
            setIsThinking(false);
            setError(`Failed to start: ${err.message}`);
        }
    };

    const askNextQuestion = async () => {
        try {
            setIsThinking(true);
            setQuestionNumber(prev => prev + 1);
            followUpCountRef.current = 0;

            let questionText = "";
            try {
                const previousQuestions = conversation.filter(m => m.role === 'ai').map(m => m.text);
                questionText = await geminiService.generateInterviewQuestions(interviewType, domain, previousQuestions, config);
            } catch (err) {
                questionText = getRandomFallbackQuestion(interviewType, usedFallbackQuestions);
                setUsedFallbackQuestions(prev => [...prev, questionText]);
            }

            if (sessionEndedRef.current) return;

            // Only show coding for technical domains or explicitly requested
            let isCoding = false;
            const technicalDomains = ['Software Engineering', 'Data Science', 'Programming', 'Web Development'];
            const isTechnicalDomain = technicalDomains.includes(domain);

            if (questionText.includes('[TYPE:CODING]')) {
                isCoding = true;
                questionText = questionText.replace('[TYPE:CODING]', '');
            } else if (questionText.includes('[TYPE:CONCEPT]')) {
                isCoding = false;
                questionText = questionText.replace('[TYPE:CONCEPT]', '');
            } else if (isTechnicalDomain && (interviewType === 'coding' || interviewType === 'domain')) {
                // If it's a technical domain but not explicitly marked, assume concept unless it looks like code
                isCoding = questionText.toLowerCase().includes('write a') || questionText.toLowerCase().includes('implement');
            }
            setIsCodingQuestion(isCoding);
            setShowCodeEditor(isCoding);

            const patternMatch = questionText.match(/\[PATTERN:(.*?)\]/i);
            if (patternMatch) {
                setPatternsAsked(prev => [...prev, { pattern: patternMatch[1], score: 0, solved: false }]);
                questionText = questionText.replace(patternMatch[0], '');
            }

            let cleanQuestion = interviewService.cleanQuestionText(questionText);
            setIsThinking(false);
            setCurrentQuestion(cleanQuestion);
            addAIMessage(cleanQuestion);
            setCurrentStep(isCoding ? 'coding' : 'question');
            if (soundEnabled && !sessionEndedRef.current) await speechService.speak(cleanQuestion);
        } catch (err) {
            setError('Failed to generate question.');
            setIsThinking(false);
        }
    };

    const addAIMessage = (text) => {
        const newMsg = { role: 'ai', text, timestamp: Date.now() };
        conversationRef.current = [...conversationRef.current, newMsg];
        setConversation(prev => [...prev, newMsg]);
    };

    const addUserMessage = (text) => {
        const newMsg = { role: 'user', text, timestamp: Date.now() };
        conversationRef.current = [...conversationRef.current, newMsg];
        setConversation(prev => [...prev, newMsg]);
    };

    const handleSendMessage = async () => {
        if (!userInput.trim() || isThinking || processingRef.current) return;
        processingRef.current = true;
        const message = userInput;
        setUserInput('');
        addUserMessage(message);

        try {
            setIsThinking(true);
            setAvatarEmotion('curious');
            const evaluation = await geminiService.evaluateAnswer(currentQuestion, message, interviewType);

            setStrengths(prev => [...new Set([...prev, ...(evaluation.strengths || [])])]);
            setImprovements(prev => [...new Set([...prev, ...(evaluation.improvements || [])])]);
            setOverallScore(prev => prev === 0 ? evaluation.score : Math.round((prev + evaluation.score) / 2));
            setIsThinking(false);

            if (evaluation.score >= 80) setAvatarEmotion('happy');
            else if (evaluation.score < 50) setAvatarEmotion('concerned');

            let aiResponse = evaluation.feedback || '';
            if (evaluation.followUp && followUpCountRef.current < 2) {
                aiResponse += ' ' + evaluation.followUp;
                followUpCountRef.current += 1;
                setCurrentQuestion(evaluation.followUp);
            } else {
                aiResponse += " Good! Let's move on.";
                setTimeout(() => askNextQuestion(), 3000);
            }

            addAIMessage(aiResponse);
            if (soundEnabled && !sessionEndedRef.current) await speechService.speak(aiResponse);
        } catch (err) {
            setIsThinking(false);
            askNextQuestion();
        } finally {
            processingRef.current = false;
        }
    };

    const handleCodeSubmit = async (code, language) => {
        if (isThinking || processingRef.current) return;
        processingRef.current = true;
        setIsThinking(true);
        addUserMessage(`[Code Submitted: ${language}]`);

        try {
            const evaluation = await geminiService.evaluateCode(currentQuestion, code, language);
            setProblemResults(prev => [...prev, { title: 'Coding Problem', solved: evaluation.score >= 70, score: evaluation.score }]);
            setOverallScore(prev => prev === 0 ? evaluation.score : Math.round((prev + evaluation.score) / 2));
            setIsThinking(false);

            addAIMessage(evaluation.feedback);
            if (soundEnabled && !sessionEndedRef.current) await speechService.speak(evaluation.feedback);
            setTimeout(() => askNextQuestion(), 3000);
        } catch (err) {
            setIsThinking(false);
            askNextQuestion();
        } finally {
            processingRef.current = false;
        }
    };

    const endInterview = async () => {
        sessionEndedRef.current = true;
        timeoutsRef.current.forEach(clearTimeout);
        speechService.stopSpeaking();
        speechService.stopListening();
        setCurrentStep('complete');
        if (timerRef.current) clearInterval(timerRef.current);

        const results = {
            overallScore,
            scores: { problemSolving: overallScore, communication: Math.min(100, overallScore + 5), confidence: overallScore, accuracy: overallScore },
            problems: problemResults,
            patternsAsked,
            questionsAttempted: conversationRef.current.filter(m => m.role === 'user').length,
            questionsTotal: conversationRef.current.filter(m => m.role === 'ai').length,
            timeTaken: totalTimeUsed,
            strengths,
            weakPoints: improvements,
            suggestions: ['Practice more problems', 'Focus on edge cases'],
            conversation: conversationRef.current
        };

        try {
            await interviewService.saveInterview({
                interviewType, domain, config: { difficulty, companyTarget, techStack, duration: configDuration },
                ...results
            });
        } catch (e) {
            console.error('Failed to save interview:', e);
        }

        if (onResults) onResults(results);
    };

    const handleCheated = useCallback(async () => {
        sessionEndedRef.current = true;
        setAntiCheatActive(false);
        speechService.stopSpeaking();
        speechService.stopListening();
        if (timerRef.current) clearInterval(timerRef.current);

        try {
            const result = await interviewService.reportCheating({
                interviewType,
                domain,
                config: { difficulty, companyTarget, techStack, duration: configDuration },
                conversation: conversationRef.current,
                timeTaken: totalTimeUsed,
                questionsAttempted: conversationRef.current.filter(m => m.role === 'user').length
            });
            return result.data;
        } catch (err) {
            console.error('Failed to report cheating:', err);
            return { penaltyApplied: 100 };
        }
    }, [interviewType, customRole, difficulty, companyTarget, techStack, configDuration, totalTimeUsed]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
                <div className="bg-white/5 border border-red-500/30 p-8 rounded-3xl text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Error</h2>
                    <p className="text-slate-400 mb-6">{error}</p>
                    <button onClick={onEnd} className="px-6 py-2 bg-slate-700 text-white rounded-xl">Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex flex-col relative overflow-hidden">
            <InterviewAntiCheat isActive={antiCheatActive} onCheated={handleCheated} onWarning={() => toast.error('Stay in fullscreen!')} />

            <header className="px-6 py-4 border-b border-white/5 flex items-center justify-between relative z-50">
                <div className="flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-xl border ${timeRemaining < 300 ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-white'}`}>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-2 border border-white/10 rounded-xl text-white">
                        {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                    <button onClick={endInterview} className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl font-bold">End Session</button>
                </div>
            </header>

            <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col gap-6 overflow-hidden relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[300px]">
                        <RealtimeAvatar isSpeaking={isSpeaking} isThinking={isThinking} isListening={isListening} emotion={avatarEmotion} />
                    </div>
                    <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center">
                        {isListening ? (
                            <div className="flex items-end gap-1 h-12">
                                {[...Array(8)].map((_, i) => <div key={i} className="w-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ height: `${30 + Math.random() * 70}%`, animationDelay: `${i * 100}ms` }} />)}
                            </div>
                        ) : <Mic className="w-12 h-12 text-slate-500" />}
                        <button onClick={() => setIsListening(!isListening)} className={`mt-6 w-16 h-16 rounded-full flex items-center justify-center ${isListening ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`}>
                            {isListening ? <MicOff className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
                        </button>
                        <p className="mt-4 text-slate-500 text-sm">{isListening ? 'Listening...' : 'Click to speak'}</p>
                    </div>
                </div>

                <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl flex flex-col overflow-hidden min-h-[300px]">
                    <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase">Live Transcript</span>
                        {isCodingQuestion && (
                            <button onClick={() => setShowCodeEditor(!showCodeEditor)} className="text-xs px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">
                                {showCodeEditor ? 'Close Editor' : 'Open Editor'}
                            </button>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                        {conversation.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-cyan-500 text-white rounded-tr-none' : 'bg-white/10 text-slate-200 rounded-tl-none'}`}>
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isThinking && <div className="text-cyan-400 text-xs animate-pulse">AI is thinking...</div>}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="p-4 bg-white/5 border-t border-white/5 flex gap-3">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type your response..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                        />
                        <button onClick={handleSendMessage} className="p-2 bg-cyan-500 text-white rounded-xl"><Send className="w-5 h-5" /></button>
                    </div>
                </div>

                {showCodeEditor && isCodingQuestion && (
                    <div className="h-[500px] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                        <CodeEditor problem={{ description: currentQuestion }} onSubmit={handleCodeSubmit} />
                    </div>
                )}
            </main>

            {currentStep === 'loading' && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-white font-bold">Initializing Interview...</p>
                </div>
            )}
        </div>
    );
}
