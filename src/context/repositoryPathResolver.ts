import * as vscode from "vscode";
import * as path from "path";
import { ResolvedFileMatch, PathResolutionResult } from "../share/types/types";

export class RepositoryPathResolver {
    private normalized(input: string): string {
        return input
            .replace(/\\/g, "/")
            .toLowerCase()
            .trim();
    }

    async resolve(
        queryPath: string
    ): Promise<PathResolutionResult> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return {
                allMatches: [],
                requiresDisambiguation: false
            };
        }

        const normalizedQuery = this.normalized(queryPath);
        const files = await vscode.workspace.findFiles(
            "**/*",
            "**/{node_modules,.git,dist,out,build}/**",
            5000
        );

        const matches: ResolvedFileMatch[] = [];

        for (const file of files) {
            const relativePath = path.relative(
                workspaceFolder.uri.fsPath,
                file.fsPath
            );

            const normalizedRelative = this.normalized(relativePath);
            const normalizedFileName = this.normalized(path.basename(file.fsPath));

            let score = 0;

            // Exact relative path
            if (normalizedRelative === normalizedQuery) {
                score = 100;
            }

            // end with fullpath
            else if (normalizedRelative.endsWith(normalizedQuery)) {
                score = 90;
            }

            // exact file name
            else if (normalizedFileName === normalizedQuery) {
                score = 80;
            }

            // partial file name match
            else if (normalizedFileName.includes(normalizedQuery)) {
                score = 65;
            }

            // partial path match
            else if (normalizedRelative.includes(normalizedQuery)) {
                score = 55;
            }

            if (score > 0) {
                matches.push({
                    uri: file,
                    relativePath,
                    score
                });
            }
        }

        matches.sort((a, b) => b.score - a.score);

        const topMatches = matches.filter(m => matches.length > 0 && m.score >= matches[0].score - 5);

        return {
            bestMatch: matches[0],
            allMatches: matches,
            requiresDisambiguation: topMatches.length > 1
        };
    }
}
