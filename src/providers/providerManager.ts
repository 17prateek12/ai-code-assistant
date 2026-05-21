import { AnthropicProvider } from "./anthropic";
import { AIProvider } from "../share/types/types";

export class ProviderManager {
    private provider: AIProvider;

    constructor(apiKey: string) {
        this.provider = new AnthropicProvider(apiKey);
    }

    getProvider(): AIProvider {
        return this.provider;
    }
}