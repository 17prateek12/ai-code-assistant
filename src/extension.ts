import * as vscode from 'vscode';
import { AISidebarProvider } from './sidebar/AISidebarProvider';

export async function activate(context: vscode.ExtensionContext) {
	

	const setApiKeyCommand = vscode.commands.registerCommand(
		"hybrid-ai-assistant.setApiKey",
		async () => {
			const key = await vscode.window.showInputBox({
				prompt: "Enter the Anthropic API Key",
				password: true,
			});
			if (!key) return;
			await context.secrets.store(
				"anthropic-api-key",
				key
			);

			vscode.window.showInformationMessage(
				"API Key Saved"
			);
		}
	);

	const deleteApiKeyCommand = vscode.commands.registerCommand(
		"hybrid-ai-assistant.deleteApiKey",
		async () => {
			await context.secrets.delete(
				"anthropic-api-key"
			);

			vscode.window.showInformationMessage(
				"API Key Deleted"
			);
		}
	);

	console.log('Congratulations, your extension "hybrid-ai-assistant" is now active!');
	const provider = new AISidebarProvider(context.extensionUri, context);

	const disposable = vscode.commands.registerCommand('hybrid-ai-assistant.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from hybrid-ai-assistant!');

	});

	context.subscriptions.push(
		disposable,
		setApiKeyCommand,
		deleteApiKeyCommand,
		vscode.window.registerWebviewViewProvider(
			AISidebarProvider.viewType,
			provider
		)
	);
}

// This method is called when your extension is deactivated
export function deactivate() { }
