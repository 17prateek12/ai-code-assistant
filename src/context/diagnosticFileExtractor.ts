export class DiagnosticFileExtractor {

    extractFiles(
        diagnostics: string[]
    ) {

        const files: string[] = [];

        for (const diagnostic of diagnostics) {
            const match = diagnostic.match(
                    /FILE:\s*(.*)/i
                );

            if (match?.[1]) {
                files.push(
                    match[1].trim()
                );
            }
        }

        return [...new Set(files)];
    }
}