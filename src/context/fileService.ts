import * as vscode from "vscode"

export class FileService {
    async findFileByName(
        fileName: string
    ) {

        const allFiles =
            await vscode.workspace.findFiles(
                "**/*",
                "**/node_modules/**",
                500
            );

        console.log(
            "Total workspace files:",
            allFiles.length
        );

        const matches =
            allFiles.filter((file) => {

                const normalizedPath =
                    file.fsPath.toLowerCase();

                const normalizedFileName =
                    fileName.toLowerCase();

                return normalizedPath.includes(
                    normalizedFileName
                );
            });

        console.log(
            "Matched files:",
            matches.map(
                (m) => m.fsPath
            )
        );

        return matches;
    }

    async readFiles(
        uri: vscode.Uri
    ) {
        const bytes = await vscode.workspace.fs.readFile(uri);

        return Buffer.from(bytes).toString("utf-8");
    }
}