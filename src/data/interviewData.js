// Fallback Questions - Used when all AI providers fail
// Ensures interview NEVER crashes

export const FALLBACK_QUESTIONS = {
    hr: [
        "Tell me about yourself and your background.",
        "What are your greatest strengths and how do they help you professionally?",
        "Describe a challenging situation you faced and how you handled it.",
        "Where do you see yourself in 5 years?",
        "Why do you want to work in this industry?",
        "Tell me about a time you worked in a team. What was your role?",
        "How do you handle pressure or stressful situations?",
        "What motivates you to do your best work?",
        "Describe a situation where you had to learn something quickly.",
        "Do you have any questions for us?"
    ],

    dsa: [
        "Explain the difference between an array and a linked list. When would you use each?",
        "What is time complexity? Explain Big O notation with examples.",
        "How does a hash table work? What are collision handling techniques?",
        "Explain the difference between BFS and DFS. When would you use each?",
        "What is dynamic programming? Give an example problem.",
        "Explain the two-pointer technique with an example.",
        "What is a binary search tree? What are its advantages?",
        "Explain the sliding window pattern. What problems does it solve?",
        "What is the difference between stack and queue? Give use cases.",
        "How would you detect a cycle in a linked list?"
    ],

    coding: [
        "Write a function to reverse a string without using built-in methods.",
        "Find the maximum element in an array. Optimize for time complexity.",
        "Write code to check if a string is a palindrome.",
        "Implement a function to find two numbers that add up to a target sum.",
        "Write a function to remove duplicates from a sorted array in-place.",
        "Implement binary search on a sorted array.",
        "Write code to check if parentheses in a string are balanced.",
        "Find the first non-repeating character in a string.",
        "Implement a queue using two stacks.",
        "Write a function to merge two sorted arrays."
    ],

    'system-design': [
        "How would you design a URL shortening service like bit.ly?",
        "Design a basic chat application. What components would you need?",
        "How would you design a cache system? What eviction policies exist?",
        "Explain how you would design a rate limiter.",
        "Design a notification system for a mobile app.",
        "How would you handle millions of file uploads efficiently?",
        "Design a simple recommendation system. What data would you need?",
        "How would you design an API gateway?",
        "Explain the trade-offs between SQL and NoSQL databases.",
        "How would you design a system to handle peak traffic?"
    ]
};

// CareerSaarthi resource mapping (adapted from Adhyaya)
export const CAREERSAARTHI_RESOURCES = {
    // DSA Patterns
    'sliding_window': {
        title: 'Sliding Window Pattern',
        type: 'dsa-pattern',
        path: '/interview-prep',
        description: 'Master fixed and variable window problems'
    },
    'two_pointer': {
        title: 'Two Pointer Technique',
        type: 'dsa-pattern',
        path: '/interview-prep',
        description: 'Learn to solve array problems efficiently'
    },
    'binary_search': {
        title: 'Binary Search Pattern',
        type: 'dsa-pattern',
        path: '/interview-prep',
        description: 'Search algorithms and variations'
    },
    'dp': {
        title: 'Dynamic Programming',
        type: 'dsa-pattern',
        path: '/interview-prep',
        description: 'Memoization, tabulation, and classic DP problems'
    },
    'graphs': {
        title: 'Graph Algorithms',
        type: 'dsa-pattern',
        path: '/interview-prep',
        description: 'BFS, DFS, shortest paths, and graph traversal'
    },
    'trees': {
        title: 'Tree Data Structures',
        type: 'dsa-pattern',
        path: '/interview-prep',
        description: 'Binary trees, BST, and tree traversal'
    },
    'recursion': {
        title: 'Recursion & Backtracking',
        type: 'dsa-pattern',
        path: '/interview-prep',
        description: 'Recursive thinking and backtracking patterns'
    },
    'stack_queue': {
        title: 'Stack & Queue',
        type: 'dsa-pattern',
        path: '/interview-prep',
        description: 'LIFO, FIFO, and monotonic stack'
    },
    'linked_list': {
        title: 'Linked List Patterns',
        type: 'dsa-pattern',
        path: '/interview-prep',
        description: 'Singly, doubly linked lists and common operations'
    },
    // Generic soft skills
    'communication': {
        title: 'Communication Skills',
        type: 'soft-skill',
        path: '/dashboard',
        description: 'Improve your verbal and non-verbal communication'
    },
    'confidence': {
        title: 'Interview Confidence',
        type: 'soft-skill',
        path: '/dashboard',
        description: 'Build confidence through repeated practice'
    }
};

export function mapWeakAreasToResources(weakTopics = []) {
    const resources = [];
    const processed = new Set();

    for (const topic of weakTopics) {
        if (!topic || processed.has(topic.toLowerCase())) continue;
        processed.add(topic.toLowerCase());

        const normalizedTopic = topic.toLowerCase().replace(/[^a-z0-9]/g, '_');
        let found = false;

        if (CAREERSAARTHI_RESOURCES[normalizedTopic]) {
            resources.push({
                ...CAREERSAARTHI_RESOURCES[normalizedTopic],
                originalTopic: topic,
                hasPath: true
            });
            found = true;
            continue;
        }

        if (!found) {
            resources.push({
                title: topic,
                type: 'external',
                path: null,
                hasPath: false,
                description: `Practice ${topic} through platform modules or external resources`,
                originalTopic: topic
            });
        }
    }

    return resources.slice(0, 6);
}

export function getRandomFallbackQuestion(interviewType, usedQuestions = []) {
    const questions = FALLBACK_QUESTIONS[interviewType] || FALLBACK_QUESTIONS['dsa'];
    const available = questions.filter(q => !usedQuestions.includes(q));

    if (available.length === 0) return questions[0];
    return available[Math.floor(Math.random() * available.length)];
}

export default {
    FALLBACK_QUESTIONS,
    CAREERSAARTHI_RESOURCES,
    mapWeakAreasToResources,
    getRandomFallbackQuestion
};
