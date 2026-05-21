import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider, ChatMessage, StreamCallbacks } from "../share/types/types";

export class AnthropicProvider implements AIProvider {
    private client: Anthropic;

    constructor(apiKey: string) {
        this.client = new Anthropic({
            apiKey,
        });
    }

    async streamChat(messages: ChatMessage[], callbacks: StreamCallbacks): Promise<void> {
        try {
            const systemMessage = messages.find(
                (m) => m.role === "system"
            );

            const formattedMessage = messages
                .filter(
                    (
                        m
                    ): m is {
                        role: "user" | "assistant";
                        content: string;
                    } => m.role !== "system"
                )
                .map((m) => ({
                    role: m.role,
                    content: m.content,
                }));
                
            const stream = await this.client.messages.stream({
                model: "claude-haiku-4-5",
                max_tokens: 4096,
                system: systemMessage?.content,
                messages: formattedMessage,
            });

            stream.on("text", (text) => {
                callbacks.onToken(text);
            });

            stream.on("end", async() => {
                try {
                    const finalMessage = await stream.finalMessage();
                    console.log("Input Token: ",finalMessage.usage.input_tokens);
                    console.log("Output Token: ",finalMessage.usage.output_tokens);
                    const estimation_cost = (finalMessage.usage.input_tokens/1_000_000)*1+(finalMessage.usage.output_tokens/1_000_000)*5;
                    console.log("Estimation cost ($):",estimation_cost.toFixed(6));
                    callbacks.onComplete();
                } catch (error) {
                    callbacks.onError(error as Error);
                }
                
            });

            stream.on("error", (error) => {
                callbacks.onError(error as Error);
            });
        } catch (error) {
            callbacks.onError(error as Error);
        }
    }
}