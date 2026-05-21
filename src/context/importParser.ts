export class ImportParser {
    extractImports(
        content: string
    ): string[] {
        const matches = content.match(/import\s+.*?from\s+['"](.*?)['"]/g) || [];
        return matches.map((line) => {
            const match = line.match(/from\s+['"](.*?)['"]/);
            return match?.[1] || "";
        });
    }
}