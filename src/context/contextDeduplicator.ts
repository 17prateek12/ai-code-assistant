import { RetrievedContext } from "../share/types/types";

export class ContextDeduplicator {
    deduplicate(
        contexts: RetrievedContext[]
    ) {

        const seen = new Set<string>();

        const unique: RetrievedContext[] = [];

        for (const context of contexts) {

            // Fingerprint
            const key = `${context.source}-${context.content.slice(0, 200)}`;

            if (seen.has(key)) {
                continue;
            }
            seen.add(key);
            unique.push(context);
        }

        return unique;
    }
}