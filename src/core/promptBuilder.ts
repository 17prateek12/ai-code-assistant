import * as vscode from "vscode";
import { ChatMessage, RetrievedContext } from "../share/types/types";
import { WorkspaceService } from "../context/workspaceService";
import { RetrievalOrchestrator } from "../context/retrievalOrchestrator";
import { ContextBlock } from "../share/types/types";
import { ContextRanker } from "../context/contextRanker";
import { AdaptiveBudgetManager } from "../context/adaptiveBudgetManager";
import { DiagnosticService } from "../context/diagnosticService";
import { DiagnosticFileExtractor } from "../context/diagnosticFileExtractor";
import { ContextBudgetManager } from "../context/contextBudgetManager";
import { FileService } from "../context/fileService";
import { ConversationIntentParser } from "../context/conversationIntentParser";
import { ChatHistoryManager } from "../context/chatHistoryManager";

export class PromptBuilder {
    private workspaceService = new WorkspaceService();
    private retrievalOrchestrator = new RetrievalOrchestrator();
    private contextRanker = new ContextRanker();
    private adaptiveBudgetManager = new AdaptiveBudgetManager();
    private diagnosticService = new DiagnosticService();
    private diagnosticFileExtractor = new DiagnosticFileExtractor();
    private contextBudgetManager = new ContextBudgetManager();
    private fileService = new FileService();
    private chatHistoryManager = new ChatHistoryManager();
    private conversationIntentParser = new ConversationIntentParser();

    async buildMessages(
        messages: ChatMessage[],
        context: any
    ) {

        const latestUserMessage = messages.filter((m) => m.role === "user").at(-1);
        const isCasual = this.conversationIntentParser.isCausal(latestUserMessage?.content || "");
        if (isCasual) {
            const systemMessages:ChatMessage =  {
                    role: "system",
                    content:
                        "You are a helpful AI assistant."
                }; 
            return [
                systemMessages,
                ...messages.slice(-6)
            ];
        }
        console.log("Casual conversation ", isCasual);
        const diagnostics = this.diagnosticService.getDiagnostics();
        const diagnosticFiles = this.diagnosticFileExtractor.extractFiles(diagnostics);
        const retrievalResult = await this.retrievalOrchestrator.retrieve(latestUserMessage?.content || "");
        console.log("Diagnostic Files ", diagnosticFiles);
        

        const workspaceSummary = await this.workspaceService.getWorkSpaceSummary();

        let diagnosticContext = "";

        for (const filePath of diagnosticFiles.slice(0, 3)) {

            try {

                const uri = vscode.Uri.file(filePath);
                const content = await this.fileService.readFiles(uri);
                diagnosticContext += `
        
        FILE:
        ${filePath}
        
        ${this.contextBudgetManager.trim(content)}
        
        =====================
        `;
            }
            catch (error) {

                console.log(
                    "Diagnostic retrieval failed:",
                    filePath
                );
            }
        }


        const formattedRetrievedContext = retrievalResult.contexts.
            map(
                (ctx) => `
                    SOURCE: ${ctx.source}
                    TYPE: ${ctx.type}
                    ${ctx.content}
                    `
            )
            .join(
                "\n\n====================\n\n"
            );

        const contextBlocks: ContextBlock[] = [

            {
                priority: 100,
                label: "Selected Code",
                content: context?.selection || "None",
                maxChars: 12000,
            },

            {
                priority: 99,
                label: "Diagnostic Related Code",
                content: diagnosticContext || "None",
                maxChars: 10000,
            },

            {
                priority: 98,
                label: "Diagnostics",
                content: diagnostics.join("\n") || "None",
                maxChars: 6000,
            },

            {
                priority: 95,
                label: "Current File",
                content: context?.fileName || "None",
                maxChars: 6000,
            },

            {
                priority: 90,
                label: "Retrieved Files",
                content: formattedRetrievedContext || "None",
                maxChars: 16000,
            },

            {
                priority: 70,
                label: "Workspace Summary",
                content: workspaceSummary.join("\n"),
                maxChars: 3000,
            },
        ];

        const rankedBlocks = this.contextRanker.rank(contextBlocks);
        const optimizedBlocks = this.adaptiveBudgetManager.apply(rankedBlocks);
        const formattedContext = optimizedBlocks.map((block) => `
        ### ${block.label}

        ${block.content}
        `).join("\n");



        let behaviorInstructions = "";

        if (
            retrievalResult.confidence < 40
        ) {

            behaviorInstructions = `
        You have LOW confidence in repository context.
        
        Avoid speculative explanations.
        
        Prefer:
        - asking clarifying questions
        - admitting uncertainty
        - explaining limitations clearly
        
        Do NOT invent architecture details.
        `;
        }
        else if (
            retrievalResult.confidence < 80
        ) {

            behaviorInstructions = `
        You have MEDIUM confidence.
        
        Clearly separate:
        - verified observations
        - inferred assumptions
        `;
        }
        else {

            behaviorInstructions = `
        You have HIGH confidence.
        
        You may confidently explain the implementation details found in the repository.
        `;
        }

        const systemMessage: ChatMessage = {
            role: "system",
            content: `
            You are a repository-aware AI coding assistant.

You MUST prioritize retrieved repository context over general knowledge.

If repository context exists:
- ONLY explain retrieved code
- NEVER generate hypothetical implementations
- NEVER explain generic examples
- NEVER assume missing code
- If context incomplete, explicitly say so

Always ground responses in retrieved repository files.
            
            ${behaviorInstructions}
            
            Use only retrieved context and conversation history.

            Rules:
            - Never assume files, functions, APIs, or architecture exist unless retrieved
            - Clearly separate verified facts from assumptions
            - Prefer phrases like:
              - "Based on retrieved files..."
              - "I could not find ..."
            - If a file, symbol, or feature is not retrieved, say:
              "It does not exist in the retrieved codebase."
            - Do not invent implementations
            - Do not speculate about project architecture
            - Keep answers concise and implementation-focused
            - Avoid long explanations unless explicitly requested
            - Ask clarifying questions only when required to continue
            - Prefer actionable fixes over theoretical discussion
            
            ${formattedContext}
            `,
        };
        const optimizedMessage = this.chatHistoryManager.optimize(messages);

        console.log(
            "Original messages:",
            messages.length
        );

        console.log(
            "Optimized messages:",
            optimizedMessage.length
        );
        return [
            systemMessage,
            ...optimizedMessage
        ];
    }
}