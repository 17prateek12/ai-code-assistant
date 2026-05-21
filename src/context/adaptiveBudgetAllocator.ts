import { RetrievedContext } from "../share/types/types";

export class AdaptiveBudgetAllocator {
    allocate(
        contexts: {
            context: RetrievedContext;
            score: number;
        }[]
    ) {
        return contexts.map((item) => {
            let maxChar = 1000;

            if (item.score >= 80) {
                maxChar = 5000;
            } else if (item.score >= 60) {
                maxChar = 3500;
            } else if (item.score >= 40) {
                maxChar = 2000;
            }

            return {
                ...item,
                allocatedContent: item.context.content.slice(0, maxChar)
            };
        });
    }
}