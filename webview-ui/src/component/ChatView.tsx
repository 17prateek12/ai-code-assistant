import { useState, useEffect, useRef } from 'react';
import { vscode } from '../vscode';
import type { ChatMessage as Message } from '../../../src/share/types/types';
import MessageBubble from './MessageBubble';

const ChatView = () => {

    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);
    const messagesRef = useRef<Message[]>([]);

    //     const sendPrompt = () => {
    //   const payload = {
    //     type: "chat",
    //     payload: {
    //       messages: [
    //         {
    //           role: "user",
    //           content: "hello",
    //         },
    //       ],
    //     },
    //   };

    //   console.log("SENDING:");
    //   console.log(payload);

    //   vscode.postMessage(payload);
    // };

    const sendPrompt = () => {
        if (!input.trim()) return;

        if (isGenerating) return;

        setIsGenerating(true);

        const userMessage: Message = {
            role: "user",
            content: input,
        };

        const assistantMessage: Message = {
            role: "assistant",
            content: "",
        };

        const updatedMessages = [
            ...messages,
            userMessage,
            assistantMessage,
        ];

        setMessages(updatedMessages);

        vscode.postMessage({
            type: "chat",
            payload: {
                messages: updatedMessages,
            },
        });

        setInput("");
    };

    useEffect(() => {
        vscode.postMessage({
            type: "webview-ready",
        });
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

    useEffect(() => {
    messagesRef.current = messages;
}, [messages]);

    useEffect(() => {
        const handler = (
            event: MessageEvent
        ) => {
            const message = event.data;

            if (message.type === "done") {
                setIsGenerating(false);
                vscode.postMessage({
                    type: "save-chat",
                    payload: messagesRef.current,
                });
            }

            if (message.type === "error") {
                setError(message.payload);

                setIsGenerating(false);
            }

            if (message.type === "load-chat") {
                setMessages(message.payload);
            }

            if (message.type === "token") {
                setMessages((prev) => {
                    const updated = [...prev];

                    for (
                        let i =
                            updated.length - 1;
                        i >= 0;
                        i--
                    ) {
                        if (
                            updated[i].role ===
                            "assistant"
                        ) {
                            updated[i] = {
                                ...updated[i],
                                content:
                                    updated[i]
                                        .content +
                                    message.payload,
                            };

                            break;
                        }
                    }

                    return updated;
                });
            }
        };

        window.addEventListener(
            "message",
            handler
        );

        return () => {
            window.removeEventListener(
                "message",
                handler
            );
        };
    }, []);


    return (
        <div className='h-screen flex flex-col p-4 text-white'>
            <h1>AI Assistant Phase 2</h1>
            <div className='flex-1 overflow-y-auto mb-4'>
                {messages.map((msg, i) => {
                    return (
                        <MessageBubble key={i} message={msg} />
                    )
                })}
                <div ref={bottomRef} />
            </div>
            <div className='flex gap-2 w-full items-center'>
                {error && (
                    <div className='text-red-500 mb-3'>
                        {error}
                    </div>
                )}
                <input
                    disabled={isGenerating}
                    value={input}
                    type='text'
                    className='h-8 flex-1 p-2 text-white border-white border-2 rounded-2xl focus:outline-0'
                    onChange={(e) => setInput(e.target.value)}
                />
                <button
                    disabled={isGenerating}
                    onClick={sendPrompt}
                    className='h-8 w-8 border border-white rounded-2xl flex items-center justify-center'
                >
                    {isGenerating ? (
                        <div className="flex gap-1 items-center justify-center">
                            <span className="w-1 h-1 bg-white rounded-full animate-bounce" />
                            <span className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:0.15s]" />
                            <span className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:0.3s]" />
                        </div>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-5 h-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 12 3 3l18 9-18 9 3-9Zm0 0h7"
                            />
                        </svg>
                    )}
                </button>
            </div>

        </div>
    );
}

export default ChatView