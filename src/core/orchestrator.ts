import { ProviderManager } from "../providers/providerManager";
import { ChatMessage } from "../share/types/types";
import { ContextService } from "../context/contextService";
import { PromptBuilder } from "./promptBuilder";

export class AIOrchestrator {
    constructor(
        private providerManager: ProviderManager
    ) { }

    private contextService = new ContextService();
    private promptBuilder = new PromptBuilder();

    async handleChat(
        messages: ChatMessage[],
        callbacks: {
            onToken: (token: string) => void;
            onComplete: () => void;
            onError: (error: Error) => void;
        }
    ) {
        const provider = this.providerManager.getProvider();
        const context = this.contextService.getActiveFileContext();
        const finalMessages = await this.promptBuilder.buildMessages(messages, context);

        await provider.streamChat(
            finalMessages,
            callbacks
        );
    }
}