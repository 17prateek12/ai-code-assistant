import * as vscode from "vscode";

export interface ChatMessage {
    role:
        | "system"
        | "user"
        | "assistant";

    content: string;
}

export interface StreamCallbacks {
    onToken: (token: string) => void;
    onComplete: () => void;
    onError: (error: Error) => void;
}

export interface AIProvider {
    streamChat(
        messages: ChatMessage[],
        callbacks: StreamCallbacks
    ): Promise<void>;
}

export interface ContextBlock {
    priority: number;
    label: string;
    content: string;
    maxChars: number;
}

export interface RetrievedContext {
    source: string;
    type: "explicit" | "semantic" | "active-file";
    content: string;
}

export interface RetrievalResult {
    contexts: RetrievedContext[];
    confidence: number;
    reasons: string[];
}

export interface IndexedSymbol {
    name: string;
    filePath: string;
    type:
        | "function"
        | "class"
        | "component"
        | "interface";
}

export type RetrievalMode =
    | "focused"
    | "balanced"
    | "exploration";


export interface IndexedFile {
    fileName: string;
    fullPath: string;
    extension: string;
    symbols: string[];
}    

export type ResolvedFileMatch = {
    uri: vscode.Uri;
    relativePath: string;
    score: number;
}

export type PathResolutionResult = {
    bestMatch?: ResolvedFileMatch;
    allMatches: ResolvedFileMatch[];
    requiresDisambiguation: boolean;
};

export type WorkflowType =

	| "onboard"
	| "review"
	| "debug"
	| "explain"
	| null;

export interface RepositoryNode {
    id: string;
    filePath: string;
    symbol?: string;
    type: "file" | "class" | "function" | "service" | "component";
    dependencies: string[];
}

export interface RepositoryGraph {
    nodes: RepositoryNode[];
    generatedAt: number;
}

export interface RepositoryMemory {
    architecture?: string;
    conventions?: string[];
    workflows?: string[];
    importantFiles?: string[];
    generatedAt: number;
}

export interface ReviewIssue {
    severity: "critical" | "warning" | "info";
    title: string;
    description: string;
    file?: string;
    suggestion?: string;
}

export interface ReviewResult {
    summary: string;
    issues: ReviewIssue[];
    score?: number;
    generatedAt: number;
}    
