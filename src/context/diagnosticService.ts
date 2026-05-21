import * as vscode from "vscode";

export class DiagnosticService {
    getDiagnostics() {
        const diagnostics = vscode.languages.getDiagnostics();
        const formatted: string[] = [];
        for (const [uri, issues] of diagnostics) {
            for (const issue of issues) {
                formatted.push(`
                FILE: ${uri.fsPath}
                MESSAGE: ${issue.message}
                SOURCE: ${issue.source}
                SEVERITY: ${issue.severity}
                LINE: ${issue.range.start.line + 1}
                `);
            }
        }

        return formatted;
    }
}