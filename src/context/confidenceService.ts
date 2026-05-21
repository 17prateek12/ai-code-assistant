import { RetrievalResult, RetrievedContext } from "../share/types/types";

export class ConfidenceService {
    calculate(
        explicitMatches: number,
        semanticMatches: number
    ) {
        let confidence = 0;
        const reasons: string[] = [];

        if (explicitMatches > 0) {
            confidence += 70;
            reasons.push("Explicit File name match found");
        }

        if (semanticMatches > 0) {
            confidence += 20;
            reasons.push("Semantic matches found");
        }

        if (explicitMatches === 0 && semanticMatches === 0) {
            reasons.push("No relevant files found");
        }

        return {
            confidence,
            reasons,
        };
    }
}