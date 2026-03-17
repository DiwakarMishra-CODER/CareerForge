import { api, getUserId } from '../../api/client';

// Interview Service for API calls
export const interviewService = {
    // Save completed interview
    saveInterview: async (data) => {
        try {
            const userId = getUserId();
            const response = await api.post('/api/interviews', { ...data, userId });
            return response;
        } catch (error) {
            console.error('Error saving interview:', error);
            throw error;
        }
    },

    // Get interview history
    getHistory: async (params = {}) => {
        try {
            const userId = getUserId();
            const { limit = 10, page = 1, type } = params;
            let url = `/api/interviews/history?userId=${userId}&limit=${limit}&page=${page}`;
            if (type) url += `&type=${type}`;

            const response = await api.get(url);
            return response;
        } catch (error) {
            console.error('Error fetching interview history:', error);
            throw error;
        }
    },

    // Get pattern analysis
    getPatternAnalysis: async () => {
        try {
            const userId = getUserId();
            const response = await api.get(`/api/interviews/stats/patterns?userId=${userId}`);
            return response;
        } catch (error) {
            console.error('Error fetching pattern analysis:', error);
            throw error;
        }
    },

    // Extract pattern from AI response
    extractPattern: (questionText) => {
        const match = questionText.match(/\[PATTERN:([\w-]+)\]/i);
        if (match) {
            return match[1].toLowerCase();
        }
        return null;
    },

    // Clean question text (remove pattern tag)
    cleanQuestionText: (questionText) => {
        return questionText.replace(/\[PATTERN:[\w-]+\]/gi, '').trim();
    },

    // Report cheating incident
    reportCheating: async (data) => {
        try {
            const userId = getUserId();
            const response = await api.post('/api/interviews/cheat-report', { ...data, userId });
            return response;
        } catch (error) {
            console.error('Error reporting cheating:', error);
            throw error;
        }
    }
};

export default interviewService;
