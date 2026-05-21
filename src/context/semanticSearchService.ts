import * as vscode from "vscode"

export class SemanticSearchService {
    async searchRelevantFiles(
        query: string
    ) {
        const keywords = query.toLowerCase().split(/\s+/);
        const files = await vscode.workspace.findFiles(
            "**/*.{ts,tsx,js,jsx,java,cpp}",
            "**/node_modules/**",
            200
        );

        return files.filter((file) => {
            const path = file.fsPath.toLowerCase();
            return keywords.some((keyword) => path.includes(keyword));
        });
    }
}