import { ChatMessage } from "../share/types/types";

export class ChatHistoryManager {
    optimize(
        messages: ChatMessage[]
    ): ChatMessage[] {

        //Small chat don't need compression
        if (messages.length <= 10) {
            return messages;
        }

        // Recent message kept raw
        const recent = messages.slice(-6);

        // Older message summarized
        const older = messages.slice(0, -6);

        const summarized = older.map((m) => {
            return {
                role: m.role,
                content: m.content.length > 200 ? m.content.slice(0, 200) + "..." : m.content,
            };
        });

        //keep only 1st few messages
        const compressed = summarized.slice(-4);

        return [
            ...compressed, ...recent,
        ];
    }
}