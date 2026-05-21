export class PathIntentParser {

    extractPath(
        query: string
    ) {

        const normalized =
            query.replace(/\\/g, "/");

        const match =
            normalized.match(

                /([\w\-.]+\/)+[\w\-.]+\.[a-zA-Z]+/
            );

        return match?.[0];
    }
}