import * as vscode from "vscode";
import { ImportParser } from "../context/importParser";
import { DependacyResolver } from "../context/dependencyResolver";

export interface GraphNode {
    file: string;
    imports: string[];
    resolvedDependencies: string[];
}

export class RepositoryGraphService {

    private importParser = new ImportParser();

    private dependencyResolver = new DependacyResolver();

    async buildGraph(): Promise<GraphNode[]> {
        const files = await vscode.workspace.findFiles(
            "**/*.{ts,tsx,js,jsx,py,java,cpp}",
            "**/node_modules/**"
        );

        const graph: GraphNode[] = [];

        for (const file of files) {

            try {

                const document =
                    await vscode.workspace.openTextDocument(file);

                const content =
                    document.getText();

                const imports =
                    this.importParser.extractImports(content);

                const resolvedDependencies: string[] = [];

                for (const importPath of imports) {

                    const resolved =
                        await this.dependencyResolver.resolveImport(
                            file.fsPath,
                            importPath
                        );

                    if (resolved) {
                        resolvedDependencies.push(
                            resolved.fsPath
                        );
                    }
                }

                graph.push({
                    file: file.fsPath,
                    imports,
                    resolvedDependencies
                });

            } catch (error) {

                console.error(
                    "RepositoryGraphService Error:",
                    error
                );
            }
        }

        return graph;
    }
}