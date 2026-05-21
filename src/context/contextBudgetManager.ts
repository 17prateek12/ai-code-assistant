export class ContextBudgetManager {
    private MAX_CHARS = 40000;

    trim(
        content: string
    ) {
        if (content.length <= this.MAX_CHARS) {
            return content;
        }
        return (
            content.slice(0, this.MAX_CHARS) + "\n\n[TRUNCATED]"
        );
    }
}