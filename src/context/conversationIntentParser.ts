import { FuzzyMatcher } from "../utils/fuzzyMatcher";

export class ConversationIntentParser {
    private fuzzyMatcher = new FuzzyMatcher();

    private causalPattern = [

        // Greetings
        "hello",
        "hi",
        "hey",
        "heya",
        "yo",
        "hola",

        // Small talk
        "how are you",
        "how's your day",
        "how are things",
        "what's up",
        "wassup",

        // Greetings by time
        "good morning",
        "good evening",
        "good afternoon",
        "good night",

        // Gratitude
        "thanks",
        "thank you",
        "thank",
        "thx",
        "ty",

        // Acknowledgements
        "ok",
        "okay",
        "cool",
        "nice",
        "great",
        "awesome",
        "perfect",
        "sounds good",

        // Farewell
        "bye",
        "goodbye",
        "see you",
        "take care",

        // Casual confirmations
        "got it",
        "understood",
        "makes sense",

        // Very short conversational prompts
        "who are you",
        "what can you do",
    ];
    
    isCausal(query: string): boolean {
        const lower = query.toLowerCase();

        for (const pattern of this.causalPattern) {
            if (lower.includes(pattern)) {
                return true;
            }
        }

        //Fuzzy Matches
        const words = lower.split(/\s+/);
        for (const word of words) {
            for (const pattern of this.causalPattern) {
                const patternWords = pattern.split(/\s+/);
                for (const patternWord of patternWords) {
                    if (this.fuzzyMatcher.matches(word, patternWord)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}