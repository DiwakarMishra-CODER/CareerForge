// Gemini AI Service - Interview Question Generation with API Key Rotation
// Uses multiple API keys with automatic fallback to Groq AI
// API keys are loaded from environment variables to prevent exposure

const GEMINI_API_KEYS = [
    import.meta.env.VITE_GEMINI_API_KEY_1,
    import.meta.env.VITE_GEMINI_API_KEY_2,
    import.meta.env.VITE_GEMINI_API_KEY_3,
    import.meta.env.VITE_GEMINI_API_KEY_4,
    import.meta.env.VITE_GEMINI_API_KEY_5,
    import.meta.env.VITE_GEMINI_API_KEY_6,
].filter(key => key); // Filter out undefined keys

// Groq API keys for fallback (free tier with Llama models)
const GROQ_API_KEYS = [
    import.meta.env.VITE_GROQ_API_KEY_1,
    import.meta.env.VITE_GROQ_API_KEY_2,
    import.meta.env.VITE_GROQ_API_KEY_3,
    import.meta.env.VITE_GROQ_API_KEY_4,
    import.meta.env.VITE_GROQ_API_KEY_5,
    import.meta.env.VITE_GROQ_API_KEY_6,
    import.meta.env.VITE_GROQ_API_KEY_7,
    import.meta.env.VITE_GROQ_API_KEY_8,
].filter(key => key);

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';


class GeminiService {
    constructor() {
        this.currentKeyIndex = 0;
        this.currentGroqKeyIndex = 0;
        this.failedKeys = new Set();
        this.failedGroqKeys = new Set();
        this.useGroqFallback = false;
    }

    // Get current API key
    getCurrentKey() {
        return GEMINI_API_KEYS[this.currentKeyIndex];
    }

    // Get current Groq API key
    getCurrentGroqKey() {
        return GROQ_API_KEYS[this.currentGroqKeyIndex];
    }

    // Rotate to next available key
    rotateKey() {
        const startIndex = this.currentKeyIndex;
        do {
            this.currentKeyIndex = (this.currentKeyIndex + 1) % GEMINI_API_KEYS.length;
            if (!this.failedKeys.has(this.currentKeyIndex)) {
                return true;
            }
        } while (this.currentKeyIndex !== startIndex);
        return false; // All keys exhausted
    }

    // Rotate to next available Groq key
    rotateGroqKey() {
        if (GROQ_API_KEYS.length === 0) return false;
        const startIndex = this.currentGroqKeyIndex;
        do {
            this.currentGroqKeyIndex = (this.currentGroqKeyIndex + 1) % GROQ_API_KEYS.length;
            if (!this.failedGroqKeys.has(this.currentGroqKeyIndex)) {
                return true;
            }
        } while (this.currentGroqKeyIndex !== startIndex);
        return false;
    }

    // Mark current key as failed
    markKeyFailed() {
        this.failedKeys.add(this.currentKeyIndex);
    }

    // Mark current Groq key as failed
    markGroqKeyFailed() {
        this.failedGroqKeys.add(this.currentGroqKeyIndex);
    }

    // Reset failed keys (call after some time)
    resetFailedKeys() {
        this.failedKeys.clear();
    }

    // Reset failed Groq keys
    resetFailedGroqKeys() {
        this.failedGroqKeys.clear();
    }

    // Helper to extract retry delay from error message
    extractRetryDelay(errorMessage) {
        const match = errorMessage.match(/retry in (\d+\.?\d*)s/i);
        if (match) {
            return Math.ceil(parseFloat(match[1]) * 1000) + 1000; // Add 1s buffer
        }
        return 45000; // Default 45 seconds if not specified
    }

    // Helper to sleep
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Make request to Groq API (fallback)
    async makeGroqRequest(prompt) {
        if (GROQ_API_KEYS.length === 0) {
            throw new Error('No Groq API keys configured');
        }

        let lastError = null;
        const maxAttempts = GROQ_API_KEYS.length * 2;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            if (this.failedGroqKeys.size >= GROQ_API_KEYS.length) {
                // All Groq keys exhausted, wait and retry once
                console.log('⏳ All Groq keys exhausted. Waiting 30s before retry...');
                await this.sleep(30000);
                this.resetFailedGroqKeys();
            }

            const apiKey = this.getCurrentGroqKey();
            if (!apiKey) break;

            try {
                console.log(`🔄 Trying Groq API Key ${this.currentGroqKeyIndex + 1}...`);
                const response = await fetch(GROQ_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',
                        messages: [
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        temperature: 0.9,
                        max_tokens: 2048,
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
                    console.warn(`Groq API Key ${this.currentGroqKeyIndex + 1} failed: ${errorMessage}`);

                    if (response.status === 429 || response.status === 503) {
                        this.markGroqKeyFailed();
                        this.rotateGroqKey();
                        lastError = new Error(errorMessage);
                        continue;
                    }

                    this.markGroqKeyFailed();
                    this.rotateGroqKey();
                    lastError = new Error(errorMessage);
                    continue;
                }

                const data = await response.json();

                if (data.choices && data.choices[0]?.message?.content) {
                    console.log('✅ Groq API request successful!');
                    return data.choices[0].message.content;
                }

                throw new Error('Invalid response format from Groq API');
            } catch (error) {
                console.error(`Groq Service Error (Key ${this.currentGroqKeyIndex + 1}):`, error.message);
                lastError = error;
                this.markGroqKeyFailed();
                if (!this.rotateGroqKey()) break;
            }
        }

        throw lastError || new Error('Failed to get response from Groq API');
    }

    // Make API request with INSTANT fallback to Groq on failure
    async makeRequest(prompt) {
        const apiKey = this.getCurrentKey();

        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.9,
                        topP: 0.95,
                        topK: 40,
                        maxOutputTokens: 2048,
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();

            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
                let text = data.candidates[0].content.parts[0].text;
                // Clean up potential system tokens or artifacts
                return text.replace(/^<s>\[SYSTEM\]\s*/i, '')
                    .replace(/^\[SYSTEM\]\s*/i, '')
                    .replace(/^System:\s*/i, '')
                    .trim();
            }

            throw new Error('Invalid response format from Gemini API');

        } catch (error) {
            console.warn(`Gemini API Key ${this.currentKeyIndex + 1} failed: ${error.message}`);

            // Mark current key as failed and rotate for NEXT time
            this.markKeyFailed();
            this.rotateKey();

            // INSTANT FALLBACK to Groq
            console.log('⚡ Instant fallback: Switching to Groq API...');

            try {
                return await this.makeGroqRequest(prompt);
            } catch (groqError) {
                console.error('Groq fallback also failed:', groqError.message);
                throw new Error('All AI providers exhausted. Please check your connection.');
            }
        }
    }

    // Fallback questions when API is unavailable
    getFallbackQuestion(interviewType, index = 0) {
        const fallbacks = {
            'dsa': [
                "[TYPE:CODING] Let's start with a warm-up. Given an integer array, return true if any value appears at least twice in the array, and return false if every element is distinct.\n\n**Example:**\nInput: nums = [1, 2, 3, 1]\nOutput: true\n\nInput: nums = [1, 2, 3, 4]\nOutput: false\n\n**Constraints:**\n- 1 <= nums.length <= 10^5\n- -10^9 <= nums[i] <= 10^9\n\n[PATTERN:hash_table]",
                "[TYPE:CODING] Here's a problem for you. Given a string containing only parentheses characters - round (), square [], and curly {} brackets - determine if the brackets are balanced and properly nested.\n\n**Example:**\nInput: s = '()[]{}'\nOutput: true\n\nInput: s = '([)]'\nOutput: false\n\n**Constraints:**\n- The string only contains bracket characters\n- An empty string is considered valid\n\n[PATTERN:stack_queue]",
                "[TYPE:CODING] Let's try this one. Given an integer array, find the contiguous subarray with the largest sum and return that sum.\n\n**Example:**\nInput: nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]\nOutput: 6\nExplanation: The subarray [4, -1, 2, 1] has the largest sum.\n\n**Constraints:**\n- Array can contain negative numbers\n- At least one element exists\n\n[PATTERN:dp]"
            ],
            'system-design': [
                "Let's design a URL shortening service like bit.ly. How would you approach the system design? Consider the scale of handling millions of URLs.",
                "Can you walk me through designing a real-time chat application like WhatsApp? Focus on message delivery guarantees and scalability.",
                "How would you design a video streaming platform like YouTube? Consider upload, storage, transcoding, and CDN aspects."
            ],
            'dbms': [
                "Explain the difference between INNER JOIN, LEFT JOIN, and RIGHT JOIN with examples. When would you use each?",
                "What are ACID properties in databases? Can you explain each with a real-world transaction example?",
                "What is database normalization? Explain 1NF, 2NF, and 3NF with examples."
            ],
            'custom': [
                "Tell me about a challenging project you worked on. What was your role and how did you overcome obstacles?",
                "How do you approach debugging a complex issue in production? Walk me through your process.",
                "Explain a technical concept you're passionate about to someone non-technical."
            ]
        };

        const questions = fallbacks[interviewType] || fallbacks['custom'];
        return questions[index % questions.length];
    }

    // DSA Patterns for tagging
    dsaPatterns = [
        'sliding-window', 'two-pointers', 'fast-and-slow-pointers', 'merge-intervals', 'cyclic-sort', 'in-place-reversal-of-a-linked-list', 'tree-breadth-first-search', 'tree-depth-first-search', 'two-heaps', 'subsets', 'modified-binary-search', 'bitwise-xor', 'top-k-elements', 'k-way-merge', '0-1-knapsack', 'topological-sort-graph', 'dynamic-programming', 'graphs', 'trees', 'stack-queue', 'recursion', 'greedy', 'trie'
    ];

    // System Design patterns
    sdPatterns = [
        'scalability', 'caching', 'load_balancing', 'database_design',
        'microservices', 'cdn', 'message_queues', 'rate_limiting'
    ];

    // Get difficulty modifier for prompts
    getDifficultyPrompt(difficulty, companyTarget) {
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
    }

    // Generate interview questions based on type with config support
    async generateInterviewQuestions(interviewType, domain = '', previousQuestions = [], config = {}) {
        const { difficulty = 'intermediate', companyTarget = 'product', techStack = 'javascript' } = config;
        const difficultyContext = this.getDifficultyPrompt(difficulty, companyTarget);

        const prompts = {
            'behavioral': `You are an expert HR and behavioral interviewer. Generate a unique behavioral interview question.
            
Context: This is a ${interviewType} interview for the ${domain || 'general'} area.
${difficultyContext}
${previousQuestions.length > 0 ? `Previously asked: ${previousQuestions.slice(-2).join(', ')}. Give something DIFFERENT.` : ''}

Focus on:
- Situation, Task, Action, Result (STAR) scenarios
- Leadership, conflict resolution, cultural fit, and adaptability
- Communication skills and empathy

Respond with ONLY the question text.`,

            'case-study': `You are an expert strategy consultant and interviewer. Generate a unique case study or strategic problem-solving question.

Context: This is a ${interviewType} interview for the ${domain || 'general'} role.
${difficultyContext}
${previousQuestions.length > 0 ? `Previously asked: ${previousQuestions.slice(-2).join(', ')}. Give something DIFFERENT.` : ''}

Focus on:
- Structural thinking and logic
- Market entry, profitability, estimation, or product teardowns
- Strategic decision making and trade-offs

Respond with ONLY the question text.`,

            'domain': `You are an expert interviewer for the ${domain} field. Generate a unique domain-specific technical or functional interview question.

Context: This is a ${domain} interview round.
${difficultyContext}
${previousQuestions.length > 0 ? `Previously asked: ${previousQuestions.slice(-2).join(', ')}. Give something DIFFERENT.` : ''}

Generate a question that tests deep knowledge in ${domain}. 
If it's a technical role (engineering/data), you can include a coding challenge by adding the [TYPE:CODING] tag.
Otherwise, focus on expert-level concepts, tools (e.g., Salesforce for Sales, Bloomberg for Finance, DSM for Law), and workflows.

Respond with ONLY the question text.`,

            'system-design': `You are an expert technical interviewer at a top tech company. Generate a unique system design interview question.

Context: This is a ${interviewType} interview.
${difficultyContext}
${previousQuestions.length > 0 ? `Previously asked: ${previousQuestions.slice(-2).join(', ')}. Give something DIFFERENT.` : ''}

Generate ONE thoughtful system design question. Examples of topics:
- Design a URL shortener, video streaming platform, chat system, payment system, notification system, search engine, etc.
- Focus on scalability, availability, consistency, and performance.

At the end of your question, add a hidden tag in this format: [PATTERN:scalability] or [PATTERN:caching] etc.
Available patterns: ${this.sdPatterns.join(', ')}

Respond with ONLY the question text, nothing else. Make it conversational like a real interviewer would ask.`,

            'dbms': `You are an expert database and SQL interviewer. Generate a unique DBMS interview question.

Context: This is a ${interviewType} interview.
${difficultyContext}
${previousQuestions.length > 0 ? `Previously asked: ${previousQuestions.slice(-2).join(', ')}. Give something DIFFERENT.` : ''}

Topics can include:
- SQL queries (joins, subqueries, aggregations)
- Normalization (1NF, 2NF, 3NF, BCNF)
- ACID properties and transactions
- Indexes and query optimization
- CAP theorem, sharding, replication
- NoSQL vs SQL comparison

Respond with ONLY the question text, nothing else. Make it conversational.`,

            'dsa': `You are an expert DSA interviewer at a ${companyTarget === 'faang' ? 'FAANG' : companyTarget} company conducting a REAL technical coding interview.

${difficultyContext}
Preferred language: ${techStack}
Question number: ${previousQuestions.length + 1}
${previousQuestions.length > 0 ? `Previously discussed topics:\n${previousQuestions.slice(-3).join('\n')}\n\nIMPORTANT: Ask about a COMPLETELY DIFFERENT pattern/topic.` : ''}

=== FAANG DSA INTERVIEW FORMAT ===

This interview should feel like a REAL FAANG coding interview:
1. CODING IS PRIMARY - Every main question should be a coding problem
2. Theory comes as FOLLOW-UP questions about the code (complexity, edge cases, optimization)

INTERVIEW STRUCTURE:
${previousQuestions.length === 0 ? `
QUESTION 1 - START WITH CODING (Easy/Medium)
- Present a proper LeetCode-style coding problem
- Include: Problem statement, 1-2 examples with input/output, constraints
- Topics: Arrays, Strings, Hash Maps, Two Pointers (warm-up patterns)
- END TAG: [TYPE:CODING]
` : previousQuestions.length === 1 ? `
QUESTION 2 - CODING (Medium difficulty)
- Present another coding problem, DIFFERENT pattern from before
- Include: Problem statement, examples, constraints
- Topics: Sliding Window, Binary Search, Stack/Queue, Linked Lists
- If they solved Q1 well, increase difficulty slightly
- END TAG: [TYPE:CODING]
` : `
QUESTION 3+ - CODING (Medium/Hard)
- Continue with challenging coding problems
- Include: Clear problem statement, examples, constraints
- Topics: Trees, Graphs, DP, Recursion, Backtracking
- Match difficulty to candidate's performance
- END TAG: [TYPE:CODING]
`}

DSA PATTERNS TO COVER: ${this.dsaPatterns.join(', ')}

QUESTION FORMAT:
\`\`\`
[Natural intro like "Alright, here's a problem for you..."]

[Problem description - describe the task clearly in 2-4 sentences WITHOUT naming the problem]

**Example 1:**
Input: [input]
Output: [output]
Explanation: [brief explanation]

**Constraints:**
- [constraint 1]
- [constraint 2]

[PATTERN:pattern_name] [TYPE:CODING]
\`\`\`

CRITICAL RULES:
1. ALWAYS start with a coding problem, not theory
2. Be conversational ("Let's try this one...", "Here's a problem for you...")
3. Keep problems focused - one clear objective
4. MUST include [TYPE:CODING] tag at the end
5. Theory questions come ONLY as follow-ups after they submit code
6. **NEVER reveal the famous problem name** (don't say "Two Sum", "Valid Parentheses", etc.) - describe the problem naturally instead
7. **Do NOT ask 'Two Sum' as the first question.** Choose a different easy/medium problem involving Arrays/Strings/HashMaps.`,

            'custom': `You are an expert domain interviewer. Generate a unique interview question for a ${domain || 'professional'} position.

${difficultyContext}
${previousQuestions.length > 0 ? `Previously asked: ${previousQuestions.slice(-2).join(', ')}. Give something DIFFERENT.` : ''}

The question should be relevant to the role and can be:
- Technical concepts related to the role
- Problem-solving scenarios
- System design (if senior role)
- Behavioral/situational questions

Respond with ONLY the question text, nothing else. Make it conversational like a real interviewer.`
        };

        const prompt = prompts[interviewType] || prompts['custom'];
        try {
            return await this.makeRequest(prompt);
        } catch (error) {
            console.warn('API failed, using fallback question:', error.message);
            return this.getFallbackQuestion(interviewType, previousQuestions.length);
        }
    }

    // Generate intro message
    async getIntroMessage(interviewType, domain = '') {
        const prompt = `You are a friendly AI interviewer starting a ${interviewType} interview${domain ? ` for a ${domain} position` : ''}.

Generate a warm, professional greeting (2-3 sentences) that:
1. Introduces yourself as an AI interviewer
2. Briefly explains what the interview will cover
3. Encourages the candidate

Keep it natural and friendly. Respond with ONLY the greeting text.`;

        try {
            return await this.makeRequest(prompt);
        } catch (error) {
            // Fallback greeting
            const greetings = {
                'behavioral': "Hello! I'm your AI interviewer for this Behavioral round. We'll talk about your experiences and how you handle different situations. Let's get started!",
                'domain': `Welcome! I'm your AI interviewer for the ${domain || 'technical'} expertise round. I'll ask you questions relevant to the role. Relax and be yourself!`,
                'case-study': "Greetings! I'm your AI interviewer for the Strategy and Case Study round. We'll work through some complex problems together. I want to understand your approach and logic. Ready?",
                'custom': `Welcome! I'm your AI interviewer. I'll ask you questions relevant to the ${domain || 'role'}. Relax, be yourself, and let's have a great conversation! All the best!`
            };
            return greetings[interviewType] || greetings['domain'] || greetings['custom'];
        }
    }

    // Evaluate answer
    async evaluateAnswer(question, answer, interviewType) {
        const prompt = `You are a friendly technical interviewer. Evaluate the candidate's answer.
        
Question: ${question}
Answer: ${answer}

Respond in this JSON format ONLY:
{
    "score": <number 0-100>,
    "feedback": "<short sentence reacting to answer>",
    "strengths": ["strength1", "strength2"],
    "improvements": ["improvement1", "improvement2"],
    "followUp": "<natural follow-up question>"
}`;

        try {
            const response = await this.makeRequest(prompt);
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
            throw new Error('Invalid JSON');
        } catch (error) {
            return {
                score: 70,
                feedback: "Thanks for that explanation.",
                strengths: ["Attempted the question"],
                improvements: ["Could be more detailed"],
                followUp: "Can you elaborate more on how that would work in practice?"
            };
        }
    }

    // Evaluate code
    async evaluateCode(question, code, language) {
        const prompt = `You are an expert technical interviewer. Evaluate the candidate's code.
        
Problem: ${question}
Code (${language}):
${code}

Respond in this JSON format ONLY:
{
    "score": <number 0-100>,
    "feedback": "<short feedback>",
    "timeComplexity": "O(?)",
    "spaceComplexity": "O(?)",
    "correctness": "true/false",
    "strengths": ["string"],
    "improvements": ["string"],
    "followUp": "<follow-up question about technical implementation or complexity>"
}`;

        try {
            const response = await this.makeRequest(prompt);
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
            throw new Error('Invalid JSON');
        } catch (error) {
            return {
                score: 70,
                feedback: "Thanks for submitting your code.",
                timeComplexity: "O(n)",
                spaceComplexity: "O(1)",
                correctness: true,
                strengths: ["Code submitted"],
                improvements: ["Add more comments"],
                followUp: "Can you explain the time complexity of your solution?"
            };
        }
    }
}

// Export singleton
const geminiService = new GeminiService();
export default geminiService;
