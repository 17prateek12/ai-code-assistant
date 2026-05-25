export class SmartChunkExtractor {

    extractRelevantContent(
        content: string,
        query: string
    ) {

        const lines = content.split("\n");

        const queryWords = query
                .toLowerCase()
                .split(/\s+/)
                .filter(
                    word =>
                        word.length > 2
                );

        let matchIndex = -1;

        for (let i = 0; i < lines.length; i++) {
            const lowerLine = lines[i].toLowerCase();
            const matched =
                queryWords.some(
                    word =>
                        lowerLine.includes(word)
                );

            if (matched) {
                matchIndex = i;
                break;
            }
        }

        // No relevant match
        if (matchIndex === -1) {
            return content.slice(0, 3000);
        }

        // Wider context window
        const start = Math.max(0, matchIndex - 40);

        const end = Math.min(lines.length,matchIndex + 80);

        return lines
            .slice(start, end)
            .join("\n");
    }
}

// export class SmartChunkExtractor {
//     extractRelevantContent(
//         content: string,
//         query: string
//     ) {
//         const lines = content.split("\n");
//         const lowerQuery = query.toLowerCase();

//         const matchIndex = lines.findIndex((line) =>
//             lowerQuery.split(/\s+/).some((word) =>
//                 line.toLowerCase().includes(word)));

//         // No match
//         if (matchIndex === -1) {
//             return content.slice(0, 3000);
//         }

//         const start = Math.max(0, matchIndex - 20);
//         const end = Math.min(lines.length + matchIndex + 40);
//         return lines.slice(start, end).join("\n");
//     }
// }