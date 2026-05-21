import ReactMarkDown from "react-markdown";
import type { Message } from "../types/types";

type Props = {
    message: Message;
};

export default function MessageBubble({ message }: Props) {
    return (
        <div className={`mb-4 p-3 rounded-2xl ${message.role === "user" ? "bg-[#2b2b2b]" : "bg-[#1e1e1e]"}`}>
            <div className="mb-2 font-bold">
                {message.role}
            </div>
            <ReactMarkDown>
                {message.content}
            </ReactMarkDown>
        </div>
    );
}