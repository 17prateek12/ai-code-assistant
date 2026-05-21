import * as vscode from "vscode";
import * as path from "path";
import { FileService } from "./fileService";
import { FileIntentParser } from "../core/fileIntentParser";
import { SemanticSearchService } from "./semanticSearchService";
import { ImportParser } from "./importParser";
import { DependacyResolver } from "./dependencyResolver";
import { ContextBudgetManager } from "./contextBudgetManager";
import { RetrievalResult, RetrievedContext } from "../share/types/types";
import { ConfidenceService } from "./confidenceService";
import { SymbolParser } from "./symbolParser";
import { SymbolExtractor } from "./symbolExtractor";
import { SymbolIntentParser } from "./symbolIntentParser";
import { SymbolIndexer } from "./symbolIndexer";
import { RetrievalModeDecider } from "./retrievalModeDecider";
import { SmartChunkExtractor } from "./smartChunkExtractor";
import { ContextRelevanceScore } from "./contextRelevanceScorer";
import { ContextDeduplicator } from "./contextDeduplicator";
import { AdaptiveBudgetAllocator } from "./adaptiveBudgetAllocator";
import { PathIntentParser } from "./pathIntentParser";

export class RetrievalOrchestrator {

    private fileService = new FileService();
    private fileIntentParser = new FileIntentParser();
    private importParser = new ImportParser();
    private contextBudgetManager = new ContextBudgetManager();
    private semanticSearchService = new SemanticSearchService();
    private dependacyResolver = new DependacyResolver();
    private confidenceService = new ConfidenceService();
    private symbolParser = new SymbolParser();
    private symbolIntentParser = new SymbolIntentParser();
    private symbolExtractor = new SymbolExtractor();
    private symbolIndexer = SymbolIndexer.getInstance();
    private retrievalModeDecider = new RetrievalModeDecider();
    private smartChunkExtractor = new SmartChunkExtractor();
    private contextRelevanceScorer = new ContextRelevanceScore();
    private contextDeduplicator = new ContextDeduplicator();
    private adaptiveBudgetAllocator = new AdaptiveBudgetAllocator();
    private pathIntentParser = new PathIntentParser()

    async retrieve(
        query: string
    ): Promise<RetrievalResult> {
        const retrievedContexts: RetrievedContext[] = [];
        const retrievalMode = this.retrievalModeDecider.decide(query);
        const requestedFiles = this.fileIntentParser.extractFileName(query);
        const requestedSymbol = this.symbolIntentParser.extractSymbol(query);
        const requestedPath = this.pathIntentParser.extractPath(query);
        console.log("Requested Symbol ", requestedSymbol);
        console.log("Retrival Mode", retrievalMode);
        const index = await this.symbolIndexer.buildIndex();
        console.log("Explain index ", index);
        console.log("Requested path ",requestedPath);

        if(requestedPath){
            const uri = vscode.Uri.file(
            path.join(
                vscode.workspace
                    .workspaceFolders?.[0]
                    .uri.fsPath || "",

                requestedPath
            )
        );
            try {
                const content = await this.fileService.readFiles(uri);
                const finalContent = this.processContent(content,query,requestedSymbol);
                retrievedContexts.push({
                    source: uri.fsPath,
                    type: "explicit",
                    content: finalContent
                })
                console.log("Resolve Path");

            } catch {
                console.log("PAth Retrieval failed");
            }
        }
        for (const fileName of requestedFiles) {
            const matches = await this.fileService.findFileByName(fileName);
            console.log("Matches found:", matches);

            if (!matches.length) {
                continue;
            }

            const content = await this.fileService.readFiles(matches[0]);
            const symbols = this.symbolParser.extractSymbols(content);

            console.log("Detected symbols:", symbols);

            const finalContent = this.processContent(content, query, requestedSymbol);

            retrievedContexts.push({
                source: matches[0].fsPath,
                type: "explicit",
                content: this.contextBudgetManager.trim(finalContent),
            });

            if (retrievalMode === "exploration") {
                const imports = this.importParser.extractImports(content);
                for (const importPath of imports) {
                    const resolved = await this.dependacyResolver.resolveImport(
                        matches[0].fsPath,
                        importPath
                    );

                    if (!resolved) {
                        continue;
                    }
                    const importedContent = await this.fileService.readFiles(resolved);
                    retrievedContexts.push({
                        source: resolved.fsPath,
                        type: "semantic",
                        content: this.contextBudgetManager.trim(importedContent),
                    });
                }
            }
        }

        //const semanticMatches = await this.semanticSearchService.searchRelevantFiles(query)
        let semanticMatches: any[] = [];

        if (retrievalMode !== "focused") {
            semanticMatches = await this.semanticSearchService.searchRelevantFiles(query);
        }

        for (const file of semanticMatches.slice(0, 3)) {
            const content = await this.fileService.readFiles(file);
            const symbols = this.symbolParser.extractSymbols(content);

            const finalContent = this.processContent(content, query, requestedSymbol);

            console.log("Detect Symbol ", symbols);

            retrievedContexts.push({
                source: file.fsPath,
                type: "semantic",
                content: this.contextBudgetManager.trim(finalContent),
            });
        }

        const scoredContexts = retrievedContexts.map(
            (context) => {
                const score =
                    this.contextRelevanceScorer.score(context, query);
                return {
                    context,
                    score,
                };
            }
        );

        console.log(
            "Context scores:",
            scoredContexts.map(
                (s) => ({
                    source: s.context.source,
                    score: s.score,
                })
            )
        );

        const filteredContexts = scoredContexts.filter((item) => this.contextRelevanceScorer.shouldKeep(item.score));

        filteredContexts.sort(
            (a, b) =>
                b.score - a.score
        );

        const rankedContexts = filteredContexts.map((item) => item.context);
        const allocatedContexts = this.adaptiveBudgetAllocator.allocate(filteredContexts);
        console.log("Allocated Budget: ", allocatedContexts.map((a) => ({
            source: a.context.source,
            score: a.score,
            chars: a.allocatedContent.length,
        })))

        const confidenceResult = this.confidenceService.calculate(requestedFiles.length, semanticMatches.length);
        console.log("Confidence: ", confidenceResult);
        const deduplicatedContexts = this.contextDeduplicator.deduplicate(
            rankedContexts
        );

        return {
            contexts: deduplicatedContexts,
            confidence: confidenceResult.confidence,
            reasons: confidenceResult.reasons,
        };
    }

    private processContent(
        content: string,
        query: string,
        requestedSymbol: string | null
    ) {
        let finalContent = content;

        // Symbol extraction
        if (requestedSymbol) {
            const extracted = this.symbolExtractor.extractSymbolBlock(
                finalContent,
                requestedSymbol
            );

            if (extracted) {
                console.log("Extracted symbol block");
                finalContent = extracted;
            }
        }

        // Smart chunk extraction
        finalContent =
            this.smartChunkExtractor
                .extractRelevantContent(
                    finalContent,
                    query
                );

        // Final trimming
        finalContent =
            this.contextBudgetManager
                .trim(finalContent);

        return finalContent;
    }
}