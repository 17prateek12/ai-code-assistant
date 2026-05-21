import * as vscode from "vscode";
import { SymbolParser } from "./symbolParser";
import { IndexedSymbol } from "../share/types/types";

export class SymbolIndexer {

    private static instance:SymbolIndexer;
    private symbolParser = new SymbolParser();
    private cachedIndex:IndexedSymbol[] = [];
    private cachedFileCount = 0;
    private constructor() {}

    static getInstance() {
        if (!this.instance) {
            this.instance = new SymbolIndexer();
        }
        return this.instance;
    }

    async buildIndex(): Promise<IndexedSymbol[]> {
        
        const files =
            await vscode.workspace.findFiles(
                "**/*.{ts,tsx,js,jsx,py,java,cpp}",
                "**/{node_modules,dist,build,out,.next,coverage,.turbo,.git}/**"
            );

        // CACHE HIT
        if (this.cachedIndex.length && this.cachedFileCount === files.length) {
            console.log("Using cached symbol index");
            return this.cachedIndex;
        }

        console.log("Building fresh symbol index...");
        const indexed:IndexedSymbol[] = [];

        for (const file of files) {
            try {
                const bytes = await vscode.workspace.fs.readFile(file);
                const content = new TextDecoder().decode(bytes);
                const symbols = this.symbolParser.extractSymbols(content);

                for (const symbol of symbols) {
                    indexed.push({
                        name: symbol,
                        filePath: file.fsPath,
                        type: "function",
                    });
                }
            } catch {
                console.log(
                    "Failed:",
                    file.fsPath
                );
            }
        }

        this.cachedIndex = indexed;
        this.cachedFileCount = files.length;
        console.log("Cached symbols:", indexed.length);
        return indexed;
    }

    clearCache() {
        this.cachedIndex = [];
        this.cachedFileCount = 0;
        console.log("Symbol cache cleared");
    }
}

// import * as vscode from "vscode";
// import { SymbolParser } from "./symbolParser";
// import { IndexedSymbol } from "../share/types/types";

// export class SymbolIndexer {

//     private symbolParser = new SymbolParser();
//     private cachcedIndex: IndexedSymbol[] = [];
//     private cachedFileCount = 0;

//     async buildIndex():
//         Promise<IndexedSymbol[]> {

//         const files =
//             await vscode.workspace.findFiles(
//                 "**/*.{ts,tsx,js,jsx}",
//                 "**/{node_modules,dist,build,out,.next,coverage,.turbo,.git}/**"
//             );


//         if (this.cachcedIndex.length && this.cachedFileCount === files.length) {
//             console.log("using Cached index");
//             return this.cachcedIndex;
//         }
//         console.log("Building fresh index...");
//         console.log("Indexing files:", files.length);

//         const indexed: IndexedSymbol[] = [];

//         for (const file of files) {
//             try {
//                 const bytes = await vscode.workspace.fs.readFile(file);
//                 const content = new TextDecoder().decode(bytes);
//                 const symbols = this.symbolParser.extractSymbols(content);
//                 if (symbols.length > 0) {
//                     console.log("Indexed:", file.fsPath, symbols)
//                 }

//                 for (const symbol of symbols) {
//                     indexed.push({
//                         name: symbol,
//                         filePath: file.fsPath,
//                         type: "function",
//                     });
//                 }
//             } catch (error) {
//                 console.log(
//                     "Index error:",
//                     file.fsPath,
//                     error
//                 );
//             }
//         }

//         this.cachcedIndex = indexed;
//         this.cachedFileCount = files.length;
//         console.log("Cache symbol", indexed.length);
//         return indexed;
//     }
//     clearCache() {
//         console.log("Clearing Symbol cahce");
//         this.cachcedIndex = [];
//         this.cachedFileCount = 0;
//     }
// }