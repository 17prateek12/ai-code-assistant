import { ProviderManager } from "../providers/providerManager";
import { ChatMessage } from "../share/types/types";
import { ContextService } from "../context/contextService";
import { PromptBuilder } from "./promptBuilder";
import { WorkflowEngine } from "../workflows/workflowEngine";
import { GitAgentCliService } from "../gitagent/gitAgentService";
import { RetrievalOrchestrator } from "../context/retrievalOrchestrator";
import { RepositoryMemoryService } from "../intelligence/repositoryMemoryService";
import { RepositoryGraphService } from "../intelligence/repositoryGraphService";
import { DiagnosticService } from "../context/diagnosticService";
import { DiagnosticFileExtractor } from "../context/diagnosticFileExtractor";

export class AIOrchestrator {

    private contextService = new ContextService();
    private promptBuilder = new PromptBuilder();
    private workflowEngine = new WorkflowEngine();
    private gitAgentService = new GitAgentCliService();
    private repositoryMemoryService = new RepositoryMemoryService();
    private graphService = new RepositoryGraphService();
    private diagnosticService = new DiagnosticService();
    private diagnosticFileExtractor =
    new DiagnosticFileExtractor();


    constructor(
        private providerManager: ProviderManager,
    ) { }

    async handleChat(
        messages: ChatMessage[],
        callbacks: {
            onToken: (token: string) => void;
            onComplete: () => void;
            onError: (error: Error) => void;
        }
    ) {
        try {
            const provider = this.providerManager.getProvider();
            console.log("UPcoming message", messages);
            const usermessage = messages.filter((m)=>m.role==="user");
            const latestMessage = usermessage[usermessage.length - 1];
            console.log(
    "RAW MESSAGE:",
    JSON.stringify(latestMessage.content)
);
            const workflow = this.workflowEngine.detectWorkflow(latestMessage.content);
            console.log(
    "WORKFLOW:",
    workflow
);

console.log(
    "MESSAGE:",
    latestMessage.content
);


            // =========================
            // ONBOARD
            // =========================

            if (workflow === "onboard") {

                const result =
                    await this.gitAgentService
                        .onboardRepository();

                const graph =
                    await this.graphService
                        .buildGraph();

                this.repositoryMemoryService
                    .saveOnboarding(result);

                this.repositoryMemoryService
                    .saveGraph(graph);

                callbacks.onToken(result);

                callbacks.onComplete();

                return;
            }

            // =========================
            // REVIEW
            // =========================

            if (workflow === "review") {

    const provider =
        this.providerManager
            .getProvider();

    const changedFiles =
        await this.gitAgentService
            .getRecentChangedFiles();

    const contextChunks =
        await this.gitAgentService
            .getChangedFilesChunks();

    const diagnostics =
        this.diagnosticService
            .getDiagnostics()
            .slice(0, 10)
            .join("\n");

    const graph =
        await this.graphService
            .buildGraph();

    const partialReviews: string[] = [];

    for (const chunk of contextChunks) {

        let chunkReview = "";

        await provider.streamChat(
            [
                {
                    role: "system",
                    content: `
You are a Git-aware review agent.

Review ONLY the provided files.
`
                },

                {
                    role: "user",
                    content: `
Changed Files:
${changedFiles.join("\n")}

Diagnostics:
${diagnostics}

Repository Graph:
${JSON.stringify(graph).slice(0, 3000)}

Review these changed files:

${chunk}
`
                }
            ],

            {
                onToken: (token) => {
                    chunkReview += token;
                },

                onComplete: () => { },

                onError: (error) => {
                    throw error;
                }
            }
        );

        partialReviews.push(
            chunkReview
        );
    }

    const combinedReviews =
        partialReviews.join("\n\n");

    let finalResponse = "";

    await provider.streamChat(
        [
            {
                role: "system",
                content: `
You are a senior repository review agent.

Combine partial reviews into one final coherent repository review.
`
            },

            {
                role: "user",
                content: `
Combine these partial reviews:

${combinedReviews}
`
            }
        ],

        {
            onToken: (token) => {

                finalResponse += token;

                callbacks.onToken(token);
            },

            onComplete: () => { },

            onError: (error) => {
                throw error;
            }
        }
    );

    this.repositoryMemoryService
        .saveReview(finalResponse);

    callbacks.onComplete();

    return;
}

if (workflow === "debug") {

    const provider =
        this.providerManager
            .getProvider();

    const diagnostics =
        this.diagnosticService
            .getDiagnostics();

            console.log(
    "DIAGNOSTICS:",
    diagnostics
);

    const files =
        this.diagnosticFileExtractor
            .extractFiles(
                diagnostics
            );


            console.log(
    "DIAGNOSTIC FILES:",
    files
);

    const chunks =
        await this.gitAgentService
            .getDiagnosticFilesContent(
                files
            );


            console.log(
    "DEBUG CHUNKS:",
    chunks
);
    const partialDebugs: string[] = [];

    for (const chunk of chunks) {

        let debugResult = "";

        await provider.streamChat(
            [
                {
                    role: "system",
                    content: `
You are an intelligent debugging agent.

Analyze:
- TypeScript errors
- runtime issues
- architecture problems
- possible fixes

Be concise and practical.
`
                },

                {
                    role: "user",
                    content: `
Diagnostics:
${diagnostics.slice(0, 10).join("\n")}

Debug this code:

${chunk}
`
                }
            ],

            {
                onToken: (token) => {
                    debugResult += token;
                },

                onComplete: () => { },

                onError: (error) => {
                    throw error;
                }
            }
        );

        partialDebugs.push(
            debugResult
        );
    }

    const combinedDebugs =
        partialDebugs.join("\n\n");

    let finalDebugResponse = "";

    await provider.streamChat(
        [
            {
                role: "system",
                content: `
You are a senior debugging engineer.

Combine partial debugging analyses into one final debugging report.

Deduplicate repeated findings.
Prioritize critical issues first.
`
            },

            {
                role: "user",
                content: `
Combine these debugging analyses:

${combinedDebugs}
`
            }
        ],

        {
            onToken: (token) => {

                finalDebugResponse += token;

                callbacks.onToken(token);
            },

            onComplete: () => { },

            onError: (error) => {
                throw error;
            }
        }
    );

    this.repositoryMemoryService
        .appendMemory(`
# Debug Session

${finalDebugResponse}
`);

    callbacks.onComplete();

    return;
}


//             if (workflow === "review") {

// //                 const changedFiles =
// //                     await this.gitAgentService
// //                         .getRecentChangedFiles();

// //                 const retrievalResult =
// //                     await this.retrievalOrchestrator
// //                         .retrieve(
// //                             latestMessage.content
// //                         );

// //                 const repositoryContext =
// //                     retrievalResult.contexts
// //                         .map(
// //                             (ctx) => `

// // FILE:
// // ${ctx.source}

// // CODE:
// // ${ctx.content}

// // `
// //                         )
// //                         .join("\n\n");

// const changedFiles =
//         await this.gitAgentService
//             .getRecentChangedFiles();

// const contextChunks  =
//     await this.gitAgentService
//         .getChangedFilesChunks();

//         const partialReviews: string[] = [];
// const provider =
//                     this.providerManager
//                         .getProvider();
// for (const chunk of contextChunks) {

//     let chunkReview = "";

//     await provider.streamChat(
//         [
//             {
//                 role: "system",
//                 content: `
// You are a Git-aware review agent.

// Review ONLY the provided files.
// `
//             },

//             {
//                 role: "user",
//                 content: `
// Review these changed files:

// ${chunk}
// `
//             }
//         ],

//         {
//             onToken: (token) => {
//                 chunkReview += token;
//             },

//             onComplete: () => {},

//             onError: (error) => {
//                 throw error;
//             }
//         }
//     );

//     partialReviews.push(
//         chunkReview
//     );
// }


//                 const diagnostics =
//                     this.diagnosticService
//                         .getDiagnostics()
//                         .join("\n");

//                 const graph =
//                     await this.graphService
//                         .buildGraph();

                

//                 let finalResponse = "";

//                 const reviewPrompt = `
// You are an intelligent Git-aware code review agent.

// Review the repository changes.

// Focus on:
// - bugs
// - architectural issues
// - maintainability
// - performance
// - security
// - dependency impact

// Changed Files:
// ${changedFiles.join("\n")}

// Diagnostics:
// ${diagnostics}

// Repository Graph:
// ${JSON.stringify(graph).slice(0, 10000)}

// Repository Context:
// ${repositoryContext}
// `;

//                 await provider.streamChat(
//                     [
//                         {
//                             role: "system",
//                             content: `
// You are a repository intelligence review agent.

// You already have repository context.

// Do NOT ask the user for files.

// Perform an intelligent repository review.
// `
//                         },

//                         {
//                             role: "user",
//                             content: reviewPrompt
//                         }
//                     ],

//                     {
//                         onToken: (token) => {

//                             finalResponse += token;

//                             callbacks.onToken(token);
//                         },

//                         onComplete: () => { },

//                         onError: (error) => {
//                             throw error;
//                         }
//                     }
//                 );

//                 this.repositoryMemoryService
//                     .saveReview(finalResponse);

//                 this.repositoryMemoryService
//                     .appendMemory(`
// # Review Learning

// Changed Files:
// ${changedFiles.join("\n")}
// `);

//                 callbacks.onComplete();

//                 return;
//             }

            
            const context = this.contextService.getActiveFileContext();
            const finalMessages = await this.promptBuilder.buildMessages(messages, context);

            await provider.streamChat(
                finalMessages,
                callbacks
            );
        } catch (error) {
            callbacks.onError(error as Error);
        }
    }
}