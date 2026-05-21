export class SymbolIntentParser {
    extractSymbol(
        query: string
    ) {
        const match = query.match(
            /(?:explain|fix|refactor|optimize)\s+(\w+)/i
        );
        return match?.[1] || null;
    }
}