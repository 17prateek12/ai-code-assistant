export class SymbolExtractor {

    extractSymbolBlock(
        content: string,
        symbol: string
    ) {

        const lines = content.split("\n");

        const startIndex =
            lines.findIndex(
                line =>
                    line.includes(symbol)
            );

        if (startIndex === -1) {
            return null;
        }

        let braceCount = 0;

        let started = false;

        const extracted: string[] = [];

        // Hard safety limit
        const MAX_LINES = 500;

        for (
            let i = startIndex;
            i < lines.length &&
            i < startIndex + MAX_LINES;
            i++
        ) {

            const line = lines[i];

            extracted.push(line);

            // Ignore comments
            const cleanLine =
                line
                    .replace(/\/\/.*$/g, "")
                    .replace(/\/\*.*?\*\//g, "");

            for (const char of cleanLine) {

                if (char === "{") {
                    braceCount++;
                    started = true;
                }

                if (char === "}") {
                    braceCount--;
                }
            }

            // Prevent early JSX exits
            if (
                started &&
                braceCount === 0 &&
                i > startIndex + 20
            ) {

                // Common component/function endings
                const nextLines =
                    lines
                        .slice(i, i + 10)
                        .join("\n");

                const probableEnd =
                    nextLines.includes("export default") ||
                    nextLines.includes("module.exports") ||
                    nextLines.includes("};") ||
                    nextLines.includes("return (") === false;

                if (probableEnd) {
                    break;
                }
            }
        }

        return extracted.join("\n");
    }
}

// export class SymbolExtractor {

//     extractSymbolBlock(
//         content: string,
//         symbol: string
//     ) {

//         const lines = content.split("\n");

//         const startIndex = lines.findIndex((line) => line.includes(symbol));

//         if (startIndex === -1) {
//             return null;
//         }

//         let braceCount = 0;

//         let started = false;

//         const extracted: string[] = [];

//         for (let i = startIndex; i < lines.length; i++) {
//             const line = lines[i];
//             extracted.push(line);
//             for (const char of line) {
//                 if (char === "{") {
//                     braceCount++;
//                     started = true;
//                 }

//                 if (char === "}") {
//                     braceCount--;
//                 }
//             }

//             if (started && braceCount === 0) {
//                 break;
//             }
//         }

//         return extracted.join("\n");
//     }
// }