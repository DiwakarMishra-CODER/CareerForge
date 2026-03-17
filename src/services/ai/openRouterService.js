// OpenRouter AI Service - Interview Question Generation with Multi-Provider Fallback
// Fallback chain: OpenRouter → Groq → Gemini

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODELS = [
    import.meta.env.VITE_OPENROUTER_MODEL_1 || 'mistralai/mistral-7b-instruct',
    import.meta.env.VITE_OPENROUTER_MODEL_2 || 'meta-llama/llama-3-8b-instruct',
];

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

class OpenRouterService {
    constructor() {
        this.conversationHistory = [];
    }

    async generateResponse(prompt, interviewType = 'dsa', requiresEvaluation = false) {
        if (!OPENROUTER_API_KEY) {
            throw new Error('OpenRouter API key not configured');
        }

        const messages = [
            { role: 'system', content: `You are a technical interviewer for ${interviewType} interviews.` },
            ...this.conversationHistory,
            { role: 'user', content: prompt }
        ];

        try {
            const response = await fetch(OPENROUTER_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                },
                body: JSON.stringify({
                    model: OPENROUTER_MODELS[0],
                    messages: messages,
                    max_tokens: 1000,
                })
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            const text = data.choices[0].message.content;

            this.conversationHistory.push({ role: 'user', content: prompt });
            this.conversationHistory.push({ role: 'assistant', content: text });

            return { text, evaluation: null };
        } catch (error) {
            console.error('OpenRouter failed:', error);
            throw error;
        }
    }

    async generateIntro(interviewType, domain = '', config = {}) {
        const prompt = `You are a friendly AI interviewer starting a ${interviewType} interview${domain ? ` for the ${domain} domain` : ''}.
        
        Generate a warm, professional greeting (2-3 sentences) that:
        1. Introduces yourself as an AI interviewer
        2. Briefly explains what the interview will cover
        3. Encourages the candidate
        
        Keep it natural and friendly. Respond with ONLY the greeting text.`;

        const response = await this.generateResponse(prompt, interviewType);
        return response.text;
    }

    resetSession() {
        this.conversationHistory = [];
    }
}

const openRouterService = new OpenRouterService();
export default openRouterService;
