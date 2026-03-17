const mongoose = require('mongoose');

const InterviewPatternSchema = new mongoose.Schema({
    category: {
        type: String,
        enum: ['dsa', 'system-design'],
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    examples: [String],
    tips: [String],
    resources: [{
        title: String,
        url: String,
        type: { type: String, enum: ['video', 'article', 'course'] }
    }]
}, {
    timestamps: true
});

InterviewPatternSchema.statics.seedPatterns = async function () {
    const dsaPatterns = [
        {
            category: 'dsa',
            name: 'Sliding Window',
            slug: 'sliding_window',
            description: 'Technique for finding subarrays/substrings that satisfy certain conditions',
            difficulty: 'medium',
            examples: ['Maximum Sum Subarray of Size K', 'Longest Substring Without Repeating Characters', 'Minimum Window Substring'],
            tips: ['Identify the window boundaries', 'Expand/shrink based on condition', 'Track window state with hash map']
        },
        {
            category: 'dsa',
            name: 'Two Pointer',
            slug: 'two_pointer',
            description: 'Using two pointers to traverse array from different positions',
            difficulty: 'easy',
            examples: ['Two Sum II', 'Container With Most Water', 'Three Sum'],
            tips: ['Sort array if needed', 'Move pointers based on comparison', 'Handle duplicates carefully']
        },
        {
            category: 'dsa',
            name: 'Binary Search',
            slug: 'binary_search',
            description: 'Divide and conquer search in sorted arrays',
            difficulty: 'medium',
            examples: ['Search in Rotated Sorted Array', 'Find First and Last Position', 'Median of Two Sorted Arrays'],
            tips: ['Always check for sorted condition', 'Handle edge cases carefully', 'Consider lower_bound vs upper_bound']
        },
        {
            category: 'dsa',
            name: 'Dynamic Programming',
            slug: 'dp',
            description: 'Breaking problems into overlapping subproblems',
            difficulty: 'hard',
            examples: ['Climbing Stairs', 'Coin Change', 'Longest Common Subsequence'],
            tips: ['Define state clearly', 'Write recurrence relation first', 'Consider memoization vs tabulation']
        },
        {
            category: 'dsa',
            name: 'Graphs',
            slug: 'graphs',
            description: 'Graph traversal and shortest path algorithms',
            difficulty: 'hard',
            examples: ['Number of Islands', 'Course Schedule', 'Dijkstra\'s Algorithm'],
            tips: ['Choose BFS for shortest path in unweighted graphs', 'Use DFS for exhaustive search', 'Track visited nodes']
        },
        {
            category: 'dsa',
            name: 'Trees',
            slug: 'trees',
            description: 'Binary tree and BST operations',
            difficulty: 'medium',
            examples: ['Invert Binary Tree', 'Lowest Common Ancestor', 'Serialize and Deserialize'],
            tips: ['Consider recursive vs iterative', 'Use level-order for breadth problems', 'Handle null nodes carefully']
        },
        {
            category: 'dsa',
            name: 'Stack & Queue',
            slug: 'stack_queue',
            description: 'LIFO and FIFO data structure problems',
            difficulty: 'medium',
            examples: ['Valid Parentheses', 'Next Greater Element', 'Implement Queue using Stacks'],
            tips: ['Stack for matching pairs', 'Monotonic stack for next greater/smaller', 'Queue for BFS']
        }
    ];

    const sdPatterns = [
        {
            category: 'system-design',
            name: 'Scalability',
            slug: 'scalability',
            description: 'Designing for horizontal and vertical scaling',
            difficulty: 'hard',
            examples: ['Design Twitter', 'Design URL Shortener', 'Design Netflix'],
            tips: ['Consider read vs write ratio', 'Use caching strategically', 'Partition data effectively']
        }
    ];

    for (const pattern of [...dsaPatterns, ...sdPatterns]) {
        await this.findOneAndUpdate(
            { slug: pattern.slug },
            pattern,
            { upsert: true, new: true }
        );
    }
};

module.exports = mongoose.model('InterviewPattern', InterviewPatternSchema);
