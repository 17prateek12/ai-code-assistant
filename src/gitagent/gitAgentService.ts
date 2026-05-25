import { exec } from "child_process";
import { promisify } from "util";
import * as vscode from "vscode";
import { WorkspaceService } from "../context/workspaceService";
import { RepositoryGraphService } from "../intelligence/repositoryGraphService";
import * as fs from "fs";
import * as path from "path";

const execAsync = promisify(exec);

export class GitAgentCliService {

    private workspaceService = new WorkspaceService();
    private graphService = new RepositoryGraphService();

    async getDiagnosticFilesContent(
    files: string[]
) {

    const workspaceFolder =
        vscode.workspace.workspaceFolders?.[0];

    if (!workspaceFolder) {
        return [];
    }

    const repoPath =
        workspaceFolder.uri.fsPath;

    const chunks: string[] = [];

    for (const file of files) {

        try {

            const fullPath =
                path.isAbsolute(file)
                    ? file
                    : path.join(repoPath, file);

            const rawContent =
                fs.readFileSync(
                    fullPath,
                    "utf-8"
                );

            const content =
                rawContent.slice(0, 5000);

            chunks.push(`

FILE:
${file}

CODE:
${content}

`);
        }

        catch (error) {

            console.error(
                "Diagnostic file read error:",
                error
            );
        }
    }

    return chunks;
}


    chunkArray<T>(
    items: T[],
    size: number
): T[][] {

    const chunks: T[][] = [];

    for (let i = 0; i < items.length; i += size) {

        chunks.push(
            items.slice(i, i + size)
        );
    }

    return chunks;
}


async getChangedFilesChunks() {

    const changedFiles =
        await this.getRecentChangedFiles();

    const fileChunks =
        this.chunkArray(
            changedFiles,
            3
        );

    const workspaceFolder =
        vscode.workspace.workspaceFolders?.[0];

    if (!workspaceFolder) {
        return [];
    }

    const repoPath =
        workspaceFolder.uri.fsPath;

    const result: string[] = [];

    for (const chunk of fileChunks) {

        let combined = "";

        for (const file of chunk) {

            try {

                const fullPath =
                    path.join(repoPath, file);

                const rawContent =
                    fs.readFileSync(
                        fullPath,
                        "utf-8"
                    );

                const content =
                    rawContent.slice(0, 4000);

                combined += `

FILE:
${file}

CODE:
${content}

`;
            }

            catch { }
        }

        result.push(combined);
    }

    return result;
}

    async getChangedFilesContent() {

    const changedFiles =
        await this.getRecentChangedFiles();

    const workspaceFolder =
        vscode.workspace.workspaceFolders?.[0];

    if (!workspaceFolder) {
        return "";
    }

    const repoPath =
        workspaceFolder.uri.fsPath;

    let combined = "";

    for (const file of changedFiles) {

        try {

            const fullPath =
                path.join(repoPath, file);

            // const content =
            //     fs.readFileSync(
            //         fullPath,
            //         "utf-8"
            //     );

            const rawContent =
    fs.readFileSync(
        fullPath,
        "utf-8"
    );

const content =
    rawContent.slice(0, 4000);

            combined += `

FILE:
${file}

CODE:
${content}

`;
        }

        catch { }
    }

    return combined;
}

    async onboardRepository() {

        const files = await this.workspaceService.getWorkSpaceSummary();
        const graph = await this.graphService.buildGraph();

        return `
Repository analysis complete.

Detected:
- TypeScript/JavaScript workspace
- ${files.length} repository files
- ${graph.length} graph nodes

Architecture:
- Workflow-driven AI assistant
- Retrieval orchestration system
- Repository memory layer
- Provider abstraction layer

Generated:
- repository graph
- onboarding memory
- repository intelligence

Saved into:
.ai/
`;
    }

    async getRecentChangedFiles() {

        try {

            const workspaceFolder =
    vscode.workspace.workspaceFolders?.[0];

if (!workspaceFolder) {
    return [];
}

const repoPath =
    workspaceFolder.uri.fsPath;

const { stdout } =
    await execAsync(
        "git diff --name-only HEAD~1",
        {
            cwd: repoPath
        }
    );

            return stdout
                .split("\n")
                .filter(Boolean);

        } catch (error) {

            console.error(
                "Git diff error:",
                error
            );

            return [];
        }
    }
}

// import * as vscode from "vscode";
// import { spawn } from "child_process";
// import * as fs from "fs";
// import * as path from "path";
// import { RepositoryGraphService } from "../intelligence/repositoryGraphService";
// import { RepositoryMemoryService } from "../intelligence/repositoryMemoryService";

// export class GitAgentCliService {

//     constructor() { }
     
//     async reviewRepository(
//     query: string,
//     repositoryContext: string
// ) {

//     const workspaceFolder =
//         vscode.workspace.workspaceFolders?.[0];

//     if (!workspaceFolder) {

//         throw new Error(
//             "No workspace folder found"
//         );
//     }

//     const repoPath =
//         workspaceFolder.uri.fsPath;

//     console.log(
//         "Review Repo Path:",
//         repoPath
//     );

//     const openaiApiKey = OPEN_API_KEY;
        
//     if (!openaiApiKey) {

//         throw new Error(
//             "OPENAI_API_KEY missing"
//         );
//     }

//     return new Promise<string>(
//         (resolve, reject) => {

//             const reviewPrompt = `
// You are reviewing a real repository.

// Focus on:

// 1. Architecture quality
// 2. App flow
// 3. State management
// 4. Reusability
// 5. Performance
// 6. Security
// 7. Maintainability
// 8. Refactoring opportunities

// USER REQUEST:
// ${query}

// REPOSITORY CONTEXT:

// ${repositoryContext}

// IMPORTANT:
// - Review ONLY the provided repository code
// - Do NOT ask user for files
// - Do NOT generate hypothetical examples
// - Base review strictly on provided repository context

// Return structured markdown.
// `;

//             const child = spawn(

//                 "gitagent",

//                 [
//                     "query",

//                     reviewPrompt,

//                     "--model",

//                     "openai:gpt-4o-mini"
//                 ],

//                 {
//                     cwd: repoPath,

//                     shell: true,

//                     env: {
//                         ...process.env,

//                         OPENAI_API_KEY:
//                             openaiApiKey,
//                     },
//                 }
//             );

//             let output = "";

//             let errors = "";

//             child.stdout.on(
//                 "data",
//                 (data) => {

//                     const text =
//                         data.toString();

//                     console.log(
//                         "REVIEW STDOUT:",
//                         text
//                     );

//                     output += text;
//                 }
//             );

//             child.stderr.on(
//                 "data",
//                 (data) => {

//                     const text =
//                         data.toString();

//                     console.error(
//                         "REVIEW STDERR:",
//                         text
//                     );

//                     errors += text;
//                 }
//             );

//             child.on(
//                 "close",
//                 (code) => {

//                     console.log(
//                         "Review exit code:",
//                         code
//                     );

//                     if (code !== 0) {

//                         reject(errors);

//                         return;
//                     }

//                     resolve(output);
//                 }
//             );
//         }
//     );
// }

//     async onboardRepository() {

//         const graphService =
//     new RepositoryGraphService();

// const graph =
//     await graphService.buildGraph();

// const memoryService =
//     new RepositoryMemoryService();

// memoryService.saveGraph(graph);

//         const workspaceFolder =
//             vscode.workspace.workspaceFolders?.[0];

//         if (!workspaceFolder) {

//             throw new Error(
//                 "No workspace folder found"
//             );
//         }

//         const repoPath =
//             workspaceFolder.uri.fsPath;

//         console.log(
//             "Repo path:",
//             repoPath
//         );

//         // Get Claude API Key
//         // const anthropicApiKey =
//         //     await this.context.secrets.get(
//         //         "anthropic-api-key"
//         //     );

//         // if (!anthropicApiKey) {

//         //     throw new Error(
//         //         "Anthropic API key not found"
//         //     );
//         // }

//         // console.log("Anthropic api key", anthropicApiKey);

//         // Get OpenAI API Key
// const openaiApiKey = OPEN_API_KEY;

// if (!openaiApiKey) {

//     throw new Error(
//         "OpenAI API key not found"
//     );
// }

// console.log(
//     "OpenAI key loaded"
// );

//         // Create agent.yaml automatically
//         const configPath =
//             path.join(
//                 repoPath,
//                 "agent.yaml"
//             );

//         if (!fs.existsSync(configPath)) {

//             fs.writeFileSync(

//                 configPath,

//                 `model: openai:gpt-4o-mini`
//             );

//             console.log(
//                 "Created agent.yaml"
//             );
//         }

//         return new Promise<string>(
//             (resolve, reject) => {

// const prompt = `
// You are GitAgent running inside a VSCode AI assistant.

// You already have full repository access.

// DO NOT ask the user:
// - to paste files
// - to share source code
// - to explain project structure

// Your job is to:
// - analyze the repository automatically
// - summarize architecture
// - explain workflows
// - identify important modules
// - infer engineering patterns
// - explain repository structure

// Behave like an intelligent repository analysis agent,
// NOT a chatbot assistant.

// Generate a concise onboarding report.
// `;
//                 const child = spawn(

//                     "gitagent",

//                     [
//                         "query",

//                         prompt,

//                         "--model",

//                         `model: openai:gpt-4o-mini`
//                     ],

//                     {
//                         cwd: repoPath,

//                         shell: true,

//                         env: {
//                             ...process.env,

//                             OPENAI_API_KEY: openaiApiKey,
//                         },
//                     }
//                 );

//                 let output = "";

//                 let errors = "";

//                 child.stdout.on(
//                     "data",
//                     (data) => {

//                         const text =
//                             data.toString();

//                         console.log(
//                             "STDOUT:",
//                             text
//                         );

//                         output += text;
//                     }
//                 );

//                 child.stderr.on(
//                     "data",
//                     (data) => {

//                         const text =
//                             data.toString();

//                         console.error(
//                             "STDERR:",
//                             text
//                         );

//                         errors += text;
//                     }
//                 );

//                 child.on(
//                     "close",
//                     (code) => {

//                         console.log(
//                             "GitAgent exit code:",
//                             code
//                         );

//                         if (code !== 0) {

//                             reject(errors);

//                             return;
//                         }

//                         resolve(output);
//                     }
//                 );
//             }
//         );
//     }
// }

// import * as vscode from "vscode";

// import { exec } from "child_process";

// export class GitAgentCliService {

//     async onboardRepository() {

//         const workspaceFolder =
//             vscode.workspace.workspaceFolders?.[0];

//         if (!workspaceFolder) {

//             throw new Error(
//                 "No workspace folder found"
//             );
//         }

//         const repoPath =
//             workspaceFolder.uri.fsPath;

//         return new Promise<string>(
//             (resolve, reject) => {

//                 const prompt = `
// Analyze this repository and explain:
// - architecture
// - frameworks
// - modules
// - entry points
// - workflows
//                 `;

//                 const command = `
// gitagent query "${prompt}"
//                 `;

//                 exec(

//                     command,

//                     {
//                         cwd: repoPath,
//                     },

//                     (
//                         error,
//                         stdout,
//                         stderr
//                     ) => {

//                         if (error) {

//                             reject(error);

//                             return;
//                         }

//                         if (stderr) {

//                             console.error(stderr);
//                         }

//                         resolve(stdout);
//                     }
//                 );
//             }
//         );
//     }
// }