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