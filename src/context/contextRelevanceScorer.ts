import { RetrievedContext } from "../share/types/types";

export class ContextRelevanceScore {
    score(
        context: RetrievedContext,
        query: string
    ) {
        let score = 0;
        const lowerQuery = query.toLowerCase();
        const lowerContent = context.content.toLowerCase();
        const sourceLower = context.source.toLowerCase();

        // Explicit retrieval boost
        if (context.type === "explicit") {
            score += 50;
        }

        // Query word matches
        const words = lowerQuery.split(/\s+/);

        for (const word of words) {
            if (word.length < 3) {
                continue;
            }
            if (lowerContent.includes(word)) {
                score += 10;
            }
            if(sourceLower.includes(word)){
                score+=40;
            }
        }

        //Symbol Boost
        const capitalizedWords = query.match(/[A-Z][a-zA-Z]+/g) || [];
        for(const symbol of capitalizedWords){
            if(lowerContent.includes(symbol.toLowerCase())){
                score+=35;
            }
        }

        //short focus content
        if (context.content.length > 3000) {
            score += 10;
        }
        return score;
    }

    shouldKeep(
        score: number
    ) {
        return score >= 25;
    }

}