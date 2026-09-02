/**
 * ELIZA - Simulated Psychotherapist
 * Pattern matching and response generation engine
 */

class ELIZA {
    constructor() {
        this.patterns = this.initializePatterns();
        this.memory = [];
        this.reflections = {
            'am': 'are',
            'are': 'am',
            'were': 'was',
            'was': 'were',
            'i': 'you',
            'you': 'I',
            'me': 'you',
            'my': 'your',
            'your': 'my',
            'myself': 'yourself',
            'yourself': 'myself',
            'i\'ve': 'you\'ve',
            'you\'ve': 'I\'ve',
            'i\'m': 'you\'re',
            'you\'re': 'i\'m',
            'i\'ll': 'you\'ll',
            'you\'ll': 'i\'ll',
            'my': 'your',
            'your': 'my'
        };
    }
    
    /**
     * Initialize pattern matching rules
     */
    initializePatterns() {
        return [
            {
                pattern: /hello|hi|hey|greetings/i,
                responses: [
                    "Hello. How are you feeling today?",
                    "Hi there. What brings you here?",
                    "Hello. I'm listening."
                ]
            },
            {
                pattern: /(.*)mother(.*)/i,
                responses: [
                    "Tell me more about your mother.",
                    "How does your mother make you feel?",
                    "What is your relationship with your mother like?"
                ]
            },
            {
                pattern: /(.*)father(.*)/i,
                responses: [
                    "Tell me more about your father.",
                    "How does your father make you feel?",
                    "What is your relationship with your father like?"
                ]
            },
            {
                pattern: /i feel (.*)/i,
                responses: [
                    "You feel {1}? Tell me more about that.",
                    "Why do you feel {1}?",
                    "Is there something specific making you feel {1}?"
                ]
            },
            {
                pattern: /i (.*)/i,
                responses: [
                    "You {1}? Tell me more.",
                    "Why do you {1}?",
                    "How long have you been {1}ing?",
                    "What made you {1}?"
                ]
            },
            {
                pattern: /i am (.*)/i,
                responses: [
                    "You are {1}? How long have you been {1}?",
                    "Why do you say you are {1}?",
                    "I hear you are {1}. Tell me more.",
                    "Being {1} must be interesting."
                ]
            },
            {
                pattern: /are you (.*)/i,
                responses: [
                    "I am here to listen. Why do you ask if I'm {1}?",
                    "Would you like me to be {1}?",
                    "That's an interesting question."
                ]
            },
            {
                pattern: /what is (.*)/i,
                responses: [
                    "That's an interesting question about {1}.",
                    "Why do you want to know about {1}?",
                    "What would {1} mean to you?"
                ]
            },
            {
                pattern: /why (.*)/i,
                responses: [
                    "That's a deep question. Why indeed?",
                    "I'm not sure. Why do you ask?",
                    "What reason do you have for asking?",
                    "Have you thought about that yourself?"
                ]
            },
            {
                pattern: /yes|yep|yeah|sure/i,
                responses: [
                    "That's good. Tell me more.",
                    "I see. What else?",
                    "Interesting. Continue..."
                ]
            },
            {
                pattern: /no|nope|nah/i,
                responses: [
                    "Why not? Tell me about it.",
                    "I see. What's your reasoning?",
                    "That's interesting. Go on."
                ]
            },
            {
                pattern: /quit|exit|goodbye|bye/i,
                responses: [
                    "Goodbye. Our session was productive. Take care.",
                    "It was good talking to you. Farewell.",
                    "Thank you for sharing with me. Goodbye."
                ]
            },
            {
                pattern: /(.+)/,
                responses: [
                    "I see. Tell me more about that.",
                    "That's interesting. Go on.",
                    "How does that make you feel?",
                    "Can you elaborate?",
                    "Why do you mention {1}?",
                    "What does that have to do with your feelings?",
                    "Tell me more.",
                    "Is there something else on your mind?"
                ]
            }
        ];
    }
    
    /**
     * Process user input and generate response
     */
    getResponse(userInput) {
        userInput = userInput.trim();
        
        if (!userInput) {
            return "Please say something.";
        }
        
        // Check for quit
        if (/quit|exit|goodbye|bye/i.test(userInput)) {
            return "Goodbye. Our session was productive. Take care.";
        }
        
        // Try to match patterns
        for (let rule of this.patterns) {
            const match = userInput.match(rule.pattern);
            if (match) {
                // Get random response
                const response = rule.responses[Math.floor(Math.random() * rule.responses.length)];
                
                // Replace placeholders
                let result = response;
                for (let i = 1; i < match.length; i++) {
                    let captured = match[i];
                    if (captured) {
                        // Reflect pronouns
                        captured = this.reflectPronouns(captured);
                        result = result.replace(`{${i}}`, captured);
                    }
                }
                
                // Store in memory
                this.remember(userInput);
                
                return result;
            }
        }
        
        return "I see. Tell me more.";
    }
    
    /**
     * Reflect pronouns in response
     */
    reflectPronouns(text) {
        const words = text.split(/\s+/);
        return words.map(word => {
            const lower = word.toLowerCase();
            return this.reflections[lower] ? this.reflections[lower] : word;
        }).join(' ');
    }
    
    /**
     * Remember key phrases
     */
    remember(input) {
        if (this.memory.length < 10) {
            this.memory.push(input);
        }
    }
    
    /**
     * Recall memory
     */
    recall() {
        if (this.memory.length > 0) {
            return this.memory[Math.floor(Math.random() * this.memory.length)];
        }
        return null;
    }
}
