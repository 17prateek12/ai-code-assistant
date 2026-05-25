import OpenAI from "openai";

import type {

    AIProvider,

    ChatMessage,

    StreamCallbacks

} from "../share/types/types";

export class OpenAIProvider
    implements AIProvider {

    private client: OpenAI;

    constructor(
        apiKey: string
    ) {

        this.client =
            new OpenAI({
                apiKey: "",
            });
    }

    async streamChat(

        messages: ChatMessage[],

        callbacks: StreamCallbacks

    ): Promise<void> {

        try {

            const systemMessage =
                messages.find(
                    (m) =>
                        m.role === "system"
                );

            const formattedMessages =
                messages
                    .filter(
                        (m) =>
                            m.role !== "system"
                    )
                    .map((m) => ({

                        role: m.role,

                        content: m.content,
                    }));
            const model = "gpt-4o-mini";

            const stream =
                await this.client
                    .chat.completions.create({

                        model: model,

                        messages: [
    ...(systemMessage
        ? [{
            role: "system" as const,
            content:
                systemMessage.content
        }]
        : []),

    ...formattedMessages],

                        stream: true,

                        stream_options: {
                            include_usage: true
                        },

                        temperature: 0.2,
                    });


            let inputTokens = 0;
            let outputTokens = 0;


            for await (
                const chunk of stream
            ) {

                const content =
                    chunk.choices?.[0]
                        ?.delta?.content;

                if (content) {

                    callbacks.onToken(
                        content
                    );
                }

                if (chunk.usage) {

                    inputTokens =
                        chunk.usage
                            .prompt_tokens || 0;

                    outputTokens =
                        chunk.usage
                            .completion_tokens || 0;


                }
            }

            console.log(
                "Input Tokens:",
                inputTokens
            );

            console.log(
                "Output Tokens:",
                outputTokens
            );

                        console.log("Moddel which is working", model);

            let inputCost = 0;

let outputCost = 0;
            if (model === "gpt-4o-mini") {

    inputCost =
        (inputTokens / 1_000_000) * 0.15;

    outputCost =
        (outputTokens / 1_000_000) * 0.60;
}

const totalCost =
    inputCost + outputCost;

console.log(
    "Estimated Cost ($):",
    totalCost.toFixed(6)
);

            callbacks.onComplete();

        } catch (error) {

            callbacks.onError(
                error as Error
            );
        }
    }
}