import * as vscode from "vscode";

export class ContextService {
    getActiveFileContext() {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            return null;
        }

        return {
            fileName: editor.document.fileName,
            language: editor.document.languageId,
            content: editor.document.getText(),
            selection: editor.document.getText(editor.selection),
        };
    }
}