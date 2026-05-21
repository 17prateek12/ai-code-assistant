export class FileIntentParser {
    extractFileName(
        prompt: string
    ): string[] {
        const regex = /\b[A-Za-z0-9_-]+\.(ts|tsx|js|jsx|java|py)\b/g;
        return prompt.match(regex) || [];
    }
}