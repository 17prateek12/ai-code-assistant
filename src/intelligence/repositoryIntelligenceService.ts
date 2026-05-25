import { RepositoryGraphService }
from "./repositoryGraphService";

import { RepositoryMemoryService }
from "./repositoryMemoryService";

export class RepositoryIntelligenceService {

    private graphService =
        new RepositoryGraphService();

    private memoryService =
        new RepositoryMemoryService();

    async initializeRepositoryGraph() {

        const graph =
            await this.graphService.buildGraph();

        this.memoryService.saveGraph(graph);

        return graph;
    }
}