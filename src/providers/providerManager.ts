import { AnthropicProvider } from "./anthropic";
import { OpenAIProvider } from "./openai";
import { AIProvider } from "../share/types/types";

export class ProviderManager {
    private provider: AIProvider;

    constructor(apiKey: string) {
        this.provider = new AnthropicProvider(apiKey);
        //this.provider = new OpenAIProvider(apiKey);

    }

    getProvider(): AIProvider {
        return this.provider;
    }
}