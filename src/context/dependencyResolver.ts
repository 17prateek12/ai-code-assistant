import * as path from "path"
import * as vscode from "vscode"

export class DependacyResolver {
    async resolveImport(
        currentFile: string,
        importPath: string
    ) {
        if (!importPath.startsWith(".")) {
            return null;
        }

        const currentDir = path.dirname(currentFile);
        const possiblePaths = [
            path.resolve(currentDir, importPath + ".ts"),
            path.resolve(currentDir, importPath + ".tsx"),
            path.resolve(currentDir, importPath + ".js"),
            path.resolve(currentDir, importPath + ".jsx"),
        ];

        for (const filePath of possiblePaths) {
            try {
                await vscode.workspace.fs.stat(vscode.Uri.file(filePath));
                return vscode.Uri.file(filePath);
            } catch { }
        }
        return null;
    }
}