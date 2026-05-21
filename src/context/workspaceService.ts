import * as vscode from "vscode";
import * as path from "path";

export class WorkspaceService {
    async getWorkSpaceSummary() {
        const files = await vscode.workspace.findFiles(
            "**/*.{ts, tsx, js, jsx, py, java, cpp}",
            "**/node_modules/**",
            100
        );

        return files.slice(0,100).map((file) => {
            const workspacefolder = vscode.workspace.workspaceFolders?.[0];

            if (!workspacefolder) { return file.fsPath; }

            return path.relative(
                workspacefolder.uri.fsPath,
                file.fsPath
            );
        });
    }
}