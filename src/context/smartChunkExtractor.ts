export class SmartChunkExtractor {
    extractRelevantContent(
        content: string,
        query: string
    ) {
        const lines = content.split("\n");
        const lowerQuery = query.toLowerCase();

        const matchIndex = lines.findIndex((line) =>
            lowerQuery.split(/\s+/).some((word) =>
                line.toLowerCase().includes(word)));

        // No match
        if (matchIndex === -1) {
            return content.slice(0, 3000);
        }

        const start = Math.max(0, matchIndex - 20);
        const end = Math.min(lines.length + matchIndex + 40);
        return lines.slice(start, end).join("\n");
    }
}