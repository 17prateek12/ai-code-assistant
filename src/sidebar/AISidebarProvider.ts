import * as vscode from "vscode";
import { AIOrchestrator } from "../core/orchestrator";
import { ProviderManager } from "../providers/providerManager";

export class AISidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "ai.chat";

    constructor(
        private readonly extensionUri: vscode.Uri,
        private readonly context: vscode.ExtensionContext
    ) { }

    resolveWebviewView(webviewView: vscode.WebviewView) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(
                    this.extensionUri,
                    "webview-ui",
                    "dist"
                )
            ]
        };



        webviewView.webview.onDidReceiveMessage(
            async (message) => {

                console.log("Received:");
                console.log(message);

                // =========================
                // WEBVIEW READY
                // =========================

                if (message.type === "webview-ready") {

                    const history =
                        this.context.workspaceState.get(
                            "chat-history",
                            []
                        );

                    webviewView.webview.postMessage({
                        type: "load-chat",
                        payload: history,
                    });

                    return;
                }

                // =========================
                // SAVE CHAT
                // =========================

                if (message.type === "save-chat") {

                    await this.context.workspaceState.update(
                        "chat-history",
                        message.payload
                    );

                    return;
                }

                // =========================
                // CHAT
                // =========================

                if (message.type !== "chat") {
                    return;
                }

                if (!message.payload?.messages?.length) {

                    vscode.window.showErrorMessage(
                        "No messages provided"
                    );

                    return;
                }

                const apiKey =
                    await this.context.secrets.get(
                        "anthropic-api-key"
                    );

                if (!apiKey) {

                    vscode.window.showErrorMessage(
                        "Missing Anthropic API Key"
                    );

                    return;
                }

                const providerManager =
                    new ProviderManager(apiKey);

                const orchestrator =
                    new AIOrchestrator(
                        providerManager
                    );

                await orchestrator.handleChat(
                    message.payload.messages,
                    {
                        onToken: (token) => {

                            webviewView.webview.postMessage({
                                type: "token",
                                payload: token,
                            });

                        },

                        onComplete: () => {

                            webviewView.webview.postMessage({
                                type: "done",
                            });

                        },

                        onError: (error) => {

                            webviewView.webview.postMessage({
                                type: "error",
                                payload: error.message,
                            });

                        },
                    }
                );
            }
        );

        // webviewView.webview.onDidReceiveMessage(
        //     async (message) => {
        //         console.log("Received:");
        //         console.log(message);
        //         if (message.type !== "chat") {
        //             return;
        //         }

        //         if (!message.payload?.messages?.length) {
        //             vscode.window.showErrorMessage(
        //                 "No messages provided"
        //             );

        //             return;
        //         }

        //         console.log("message ", message);
        //         const apiKey = await this.context.secrets.get("anthropic-api-key");
        //         console.log("Apikey ", apiKey);
        //         if (!apiKey) {
        //             vscode.window.showErrorMessage("Missing Anthropic API Key");
        //             return;
        //         }

        //         const providerManager = new ProviderManager(apiKey);
        //         const orchestrator = new AIOrchestrator(providerManager);

        //         if (message.type === "save-chat") {
        //             await this.context.workspaceState.update(
        //                 "chat-history",
        //                 message.payload
        //             );

        //             return;
        //         }

        //         console.log(message.payload),
        //             console.log(message.payload.messages),


        //             await orchestrator.handleChat(
        //                 message.payload.messages,

        //                 {
        //                     onToken: (token) => {
        //                         webviewView.webview.postMessage({
        //                             type: "token",
        //                             payload: token,
        //                         });
        //                     },

        //                     onComplete: () => {
        //                         webviewView.webview.postMessage({
        //                             type: "done",
        //                         });
        //                     },

        //                     onError: (error) => {
        //                         webviewView.webview.postMessage({
        //                             type: "error",
        //                             payload: error.message,
        //                         });
        //                     },
        //                 }
        //             );
        //     }
        // );

        webviewView.webview.html = this.getHtml(webviewView.webview);
    }

    private getHtml(webview: vscode.Webview) {
        const webviewPath = vscode.Uri.joinPath(
            this.extensionUri,
            "webview-ui",
            "dist"
        );

        const indexPath = vscode.Uri.joinPath(
            webviewPath,
            "index.html"
        );

        let html = require("fs").readFileSync(
            indexPath.fsPath,
            "utf-8"
        );


        const baseUri = webview.asWebviewUri(
            webviewPath
        );

        html = html.replace(
            /(src|href)=\"(.*?)"/g,
            (_match: string, type: string, path: string) => {
                return `${type}=\"${baseUri}/${path}\"`
            }
        );

        return html;
    }
}