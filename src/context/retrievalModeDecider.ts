import { RetrievalMode } from "../share/types/types";
import { FuzzyMatcher } from "../utils/fuzzyMatcher";

export class RetrievalModeDecider {
    private fuzzyMatcher = new FuzzyMatcher();

    decide(
        query: string
    ): RetrievalMode {
        const lower = query.toLowerCase();

        if (
            lower.includes(".tsx") ||
            lower.includes(".ts") ||
            lower.includes(".js") ||
            lower.includes(".jsx") ||
            this.fuzzyMatcher.matches(lower, "explain") ||
            this.fuzzyMatcher.matches(lower, "fix") ||
            this.fuzzyMatcher.matches(lower, "error")
        ) {
            return "focused";
        }

        if (
            this.fuzzyMatcher.matches(lower, "architecture") ||
            this.fuzzyMatcher.matches(lower, "flow") ||
            this.fuzzyMatcher.matches(lower, "how")
        ) {
            return "exploration";
        }
        return "balanced";
    }
}