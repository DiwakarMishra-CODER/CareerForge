import { api, getUserId } from '../../api/client';
import { generateAIResponse } from './openRouterService';

const dsaPatterns = [
    'sliding-window', 'two-pointers', 'fast-and-slow-pointers', 'merge-intervals', 'cyclic-sort', 'in-place-reversal-of-a-linked-list', 'tree-breadth-first-search', 'tree-depth-first-search', 'two-heaps', 'subsets', 'modified-binary-search', 'bitwise-xor', 'top-k-elements', 'k-way-merge', '0-1-knapsack', 'topological-sort-graph', 'dynamic-programming', 'graphs', 'trees', 'stack-queue', 'recursion', 'greedy', 'trie'
];

const sdPatterns = [
    'scalability', 'caching', 'load_balancing', 'database_design',
    'microservices', 'cdn', 'message_queues', 'rate_limiting'
];

const getDifficultyPrompt = (difficulty, companyTarget) => {
    const difficultyMap = {
        beginner: 'easy difficulty, focusing on fundamentals. Keep explanations simple. Ask straightforward questions.',
        intermediate: 'medium difficulty with some edge cases. Include follow-up probes. Test practical understanding.',
        advanced: 'hard difficulty with complex scenarios. Deep dive into trade-offs. Expect optimal solutions and edge case handling.'
    };

    const companyMap = {
        faang: 'This is for a FAANG/Big Tech interview. Expect high standards, optimal solutions, and strong system design thinking.',
        product: 'This is for a product-based company. Focus on practical problem-solving and real-world applications.',
        service: 'This is for a service-based company. Focus on fundamental concepts and clear communication.',
        startup: 'This is for a startup interview. Focus on practical, quick solutions and adaptability.'
    };

    return `${difficultyMap[difficulty] || difficultyMap.intermediate}\n${companyMap[companyTarget] || companyMap.product}`;
};

export const interviewService = {
    // ---------------------------------------------------------
    // Backend API Calls
    // ---------------------------------------------------------
    saveInterview: async (data) => {
        try {
            const userId = getUserId();
            return await api.post('/api/interviews', { ...data, userId });
        } catch (error) {
            console.error('Error saving interview:', error);
            throw error;
        }
    },

    getHistory: async (params = {}) => {
        try {
            const userId = getUserId();
            const { limit = 10, page = 1, type } = params;
            let url = `/api/interviews/history?userId=${userId}&limit=${limit}&page=${page}`;
            if (type) url += `&type=${type}`;
            return await api.get(url);
        } catch (error) {
            console.error('Error fetching interview history:', error);
            throw error;
        }
    },

    getPatternAnalysis: async () => {
        try {
            const userId = getUserId();
            return await api.get(`/api/interviews/stats/patterns?userId=${userId}`);
        } catch (error) {
            console.error('Error fetching pattern analysis:', error);
            throw error;
        }
    },

    reportCheating: async (data) => {
        try {
            const userId = getUserId();
            return await api.post('/api/interviews/cheat-report', { ...data, userId });
        } catch (error) {
            console.error('Error reporting cheating:', error);
            throw error;
        }
    },

    // ---------------------------------------------------------
    // AI Generation Calls (Using OpenRouter)
    // ---------------------------------------------------------
    generateInterviewQuestions: async (interviewType, domain = '', previousQuestions = [], config = {}) => {
        const { difficulty = 'intermediate', companyTarget = 'product', techStack = 'javascript' } = config;
        const difficultyContext = getDifficultyPrompt(difficulty, companyTarget);

        const prompts = {
            'behavioral': `You are an expert HR and behavioral interviewer. Generate a unique behavioral interview question.\nContext: This is a ${interviewType} interview for the ${domain || 'general'} area.\n${difficultyContext}\n${previousQuestions.length > 0 ? `Previously asked: ${previousQuestions.slice(-2).join(', ')}. Give something DIFFERENT.` : ''}\nFocus on:\n- Situation, Task, Action, Result (STAR) scenarios\n- Leadership, conflict resolution, cultural fit, and adaptability\n- Communication skills and empathy\nRespond with ONLY the question text.`,

            'case-study': `You are an expert strategy consultant and interviewer. Generate a unique case study or strategic problem-solving question.\nContext: This is a ${interviewType} interview for the ${domain || 'general'} role.\n${difficultyContext}\n${previousQuestions.length > 0 ? `Previously asked: ${previousQuestions.slice(-2).join(', ')}. Give something DIFFERENT.` : ''}\nFocus on:\n- Structural thinking and logic\n- Market entry, profitability, estimation, or product teardowns\n- Strategic decision making and trade-offs\nRespond with ONLY the question text.`,

            'domain': `You are an expert interviewer for the ${domain} field. Generate a unique domain-specific technical or functional interview question.\nContext: This is a ${domain} interview round.\n${difficultyContext}\n${previousQuestions.length > 0 ? `Previously asked: ${previousQuestions.slice(-2).join(', ')}. Give something DIFFERENT.` : ''}\nGenerate a question that tests deep knowledge in ${domain}. \nIf it's a technical role (engineering/data), you can include a coding challenge by adding the [TYPE:CODING] tag.\nOtherwise, focus on expert-level concepts, tools, and workflows.\nRespond with ONLY the question text.`,

            'system-design': `You are an expert technical interviewer at a top tech company. Generate a unique system design interview question.\nContext: This is a ${interviewType} interview.\n${difficultyContext}\n${previousQuestions.length > 0 ? `Previously asked: ${previousQuestions.slice(-2).join(', ')}. Give something DIFFERENT.` : ''}\nGenerate ONE thoughtful system design question.\nAt the end of your question, add a hidden tag in this format: [PATTERN:scalability] or [PATTERN:caching] etc.\nAvailable patterns: ${sdPatterns.join(', ')}\nRespond with ONLY the question text, nothing else. Make it conversational.`,

            'dbms': `You are an expert database and SQL interviewer. Generate a unique DBMS interview question.\nContext: This is a ${interviewType} interview.\n${difficultyContext}\n${previousQuestions.length > 0 ? `Previously asked: ${previousQuestions.slice(-2).join(', ')}. Give something DIFFERENT.` : ''}\nTopics can include SQL queries, Normalization, ACID properties, Indexes, etc.\nRespond with ONLY the question text, nothing else. Make it conversational.`,

            'dsa': `You are an expert DSA interviewer at a ${companyTarget === 'faang' ? 'FAANG' : companyTarget} company conducting a REAL technical coding interview.\n${difficultyContext}\nPreferred language: ${techStack}\nQuestion number: ${previousQuestions.length + 1}\n${previousQuestions.length > 0 ? `Previously discussed topics:\n${previousQuestions.slice(-3).join('\n')}\nIMPORTANT: Ask about a COMPLETELY DIFFERENT pattern/topic.` : ''}\n\nThis interview should feel like a REAL FAANG coding interview:\n1. CODING IS PRIMARY - Every main question should be a coding problem\n2. Theory comes as FOLLOW-UP questions about the code\n\nDSA PATTERNS TO COVER: ${dsaPatterns.join(', ')}\n\nCRITICAL RULES:\n1. ALWAYS start with a coding problem, not theory\n2. Be conversational ("Let's try this one...")\n3. MUST include [TYPE:CODING] tag at the end\n4. NEVER reveal the famous problem name (describe it naturally instead).\n5. End with [PATTERN:pattern_name] [TYPE:CODING]\n\nRespond ONLY with the question text.`
        };

        const prompt = prompts[interviewType] || prompts['domain'];
        const systemPrompt = "You are an expert technical and behavioral interviewer.";
        return await generateAIResponse(prompt, systemPrompt, "interview");
    },

    evaluateAnswer: async (question, answer, interviewType) => {
        const prompt = `You are a friendly technical interviewer. Evaluate the candidate's answer.\nQuestion: ${question}\nAnswer: ${answer}\n\nRespond in this JSON format ONLY:\n{\n    "score": <number 0-100>,\n    "feedback": "<short sentence reacting to answer>",\n    "strengths": ["strength1", "strength2"],\n    "improvements": ["improvement1", "improvement2"],\n    "followUp": "<natural follow-up question>"\n}`;
        
        const response = await generateAIResponse(prompt, "You are a JSON-only response bot.", "resume"); // Using resume type to force JSON mode
        try {
            // Even if we forced JSON, we parse it
            const parsed = typeof response === 'string' ? JSON.parse(response) : response;
            return parsed;
        } catch(e) {
            console.error("Failed to parse evaluation JSON", e);
            return {
                score: 70, feedback: "Thanks for that explanation.",
                strengths: ["Attempted the question"], improvements: ["Could be more detailed"],
                followUp: "Can you elaborate more on how that would work in practice?"
            };
        }
    },

    evaluateCode: async (question, code, language) => {
        const prompt = `You are an expert technical interviewer. Evaluate the candidate's code.\nProblem: ${question}\nCode (${language}):\n${code}\n\nRespond in this JSON format ONLY:\n{\n    "score": <number 0-100>,\n    "feedback": "<short feedback>",\n    "timeComplexity": "O(?)",\n    "spaceComplexity": "O(?)",\n    "correctness": "true/false",\n    "strengths": ["string"],\n    "improvements": ["string"],\n    "followUp": "<follow-up question>"\n}`;
        
        const response = await generateAIResponse(prompt, "You are a JSON-only response bot.", "resume"); // Force JSON format
        try {
            return typeof response === 'string' ? JSON.parse(response) : response;
        } catch(e) {
            return {
                score: 70, feedback: "Thanks for submitting your code.",
                timeComplexity: "O(n)", spaceComplexity: "O(1)", correctness: true,
                strengths: ["Code submitted"], improvements: ["Add more comments"],
                followUp: "Can you explain the time complexity of your solution?"
            };
        }
    },

    generateIntro: async (interviewType, domain = '', config = {}) => {
        const prompt = `You are a friendly AI interviewer starting a ${interviewType} interview${domain ? ` for the ${domain} domain` : ''}.\nGenerate a warm, professional greeting (2-3 sentences) that:\n1. Introduces yourself as an AI interviewer\n2. Briefly explains what the interview will cover\n3. Encourages the candidate\nKeep it natural and friendly. Respond with ONLY the greeting text.`;
        return await generateAIResponse(prompt, "You are an interviewer", "interview");
    },

    // ---------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------
    extractPattern: (questionText) => {
        const match = questionText.match(/\[PATTERN:([\w-]+)\]/i);
        return match ? match[1].toLowerCase() : null;
    },

    cleanQuestionText: (questionText) => {
        return questionText.replace(/\[PATTERN:[\w-]+\]/gi, '').trim();
    }
};

export default interviewService;
