import { ContextBlock } from "../share/types/types";

export class ContextRanker {
    rank(
        blocks: ContextBlock[]
    ) {
        return blocks.sort(
            (a, b) => b.priority - a.priority
        );
    }
}