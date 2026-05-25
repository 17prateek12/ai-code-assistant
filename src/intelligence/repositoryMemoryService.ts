import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class RepositoryMemoryService {

    private getWorkspaceRoot() {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            throw new Error("No workspace folder");
        }
        return workspaceFolder.uri.fsPath;
    }

    private ensureDirectories() {

        const repoPath = this.getWorkspaceRoot();
        const directories = [
            ".ai",
            ".ai/reviews",
            ".ai/onboarding",
            ".ai/graph",
            ".ai/memory"
        ];

        for (const dir of directories) {
            const fullPath = path.join(repoPath, dir);
            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(
                    fullPath,
                    { recursive: true }
                );
            }
        }
    }

    saveOnboarding(
        content: string
    ) {

        this.ensureDirectories();

        const onboardingPath = path.join(
            this.getWorkspaceRoot(),
            ".ai",
            "onboarding",
            "repository-summary.md"
        );

        fs.writeFileSync(
            onboardingPath,
            content
        );
    }

    saveReview(
        content: string
    ) {

        this.ensureDirectories();

        const reviewPath = path.join(
            this.getWorkspaceRoot(),
            ".ai",
            "reviews",
            "latest-review.md"
        );

        fs.writeFileSync(
            reviewPath,
            content
        );
    }

    appendMemory(
        content: string
    ) {

        this.ensureDirectories();

        const memoryPath = path.join(
            this.getWorkspaceRoot(),
            ".ai",
            "memory",
            "MEMORY.md"
        );

        fs.appendFileSync(
            memoryPath,
            `\n${content}\n`
        );
    }

    saveGraph(
        graph: unknown
    ) {

        this.ensureDirectories();

        const graphPath = path.join(
            this.getWorkspaceRoot(),
            ".ai",
            "graph",
            "repository-graph.json"
        );

        fs.writeFileSync(
            graphPath,
            JSON.stringify(graph, null, 2)
        );
    }
}