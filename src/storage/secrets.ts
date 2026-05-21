import * as vscode from "vscode";

export class SecretStoreage {
    constructor(
        private context: vscode.ExtensionContext
    ) { }

    async saveAnthropicKey(key: string) {
        await this.context.secrets.store(
            "anthropic-api-key",
            key
        );
    }

    async getAnthropicKey() {
        return await this.context.secrets.get(
            "anthropic-api-key"
        );
    }
}