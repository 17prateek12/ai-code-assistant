export class SymbolExtractor {

    extractSymbolBlock(
        content: string,
        symbol: string
    ) {

        const lines = content.split("\n");

        const startIndex = lines.findIndex((line) => line.includes(symbol));

        if (startIndex === -1) {
            return null;
        }

        let braceCount = 0;

        let started = false;

        const extracted: string[] = [];

        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i];
            extracted.push(line);
            for (const char of line) {
                if (char === "{") {
                    braceCount++;
                    started = true;
                }

                if (char === "}") {
                    braceCount--;
                }
            }

            if (started && braceCount === 0) {
                break;
            }
        }

        return extracted.join("\n");
    }
}