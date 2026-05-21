import { ContextBlock } from "../share/types/types";

export class AdaptiveBudgetManager {
    apply(
        blocks: ContextBlock[]
    ) {
        return blocks.map((block) => {
            if (block.content.length <= block.maxChars) {
                return block;
            }
            return {
                ...block,
                content: block.content.slice(1, block.maxChars) + "\n\n[TRUNCATED]",
            };
        });
    }
}