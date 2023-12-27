class UnweightedGraph {
    adjacencyList: { [key: string]: string[] };

    constructor() {
        this.adjacencyList = {};
    }

    graphError(message: string): void {
        console.error(`Graph Error: ${message}`);
    }

    addVertex(vertex: string): void {
        if (this.adjacencyList.hasOwnProperty(vertex)) {
            this.graphError(`Vertex ${vertex} already exists in the graph`);
            return;
        }

        this.adjacencyList[vertex] = [];
    }

    removeVertex(vertex: string): void {
        if (!this.adjacencyList.hasOwnProperty(vertex)) {
            this.graphError(`Vertex ${vertex} does not exist in the graph`);
            return;
        }

        while (this.adjacencyList[vertex].length) {
            const adjacentVertex = this.adjacencyList[vertex].pop();
            if (adjacentVertex) {
                this.removeEdge(vertex, adjacentVertex);
            }
        }
        delete this.adjacencyList[vertex];
    }

    addEdge(vertex1: string, vertex2: string): void {
        if (!this.adjacencyList.hasOwnProperty(vertex1) || !this.adjacencyList.hasOwnProperty(vertex2)) {
            this.graphError(`One or more vertices do not exist in the graph`);
            return;
        }

        if (!this.adjacencyList[vertex1].includes(vertex2)) {
            this.adjacencyList[vertex1].push(vertex2);
            this.adjacencyList[vertex2].push(vertex1);
        } else {
            this.graphError(`Edge ${vertex1}-${vertex2} already exists in the graph`);
        }
    }

    removeEdge(vertex1: string, vertex2: string): void {
        if (!this.adjacencyList.hasOwnProperty(vertex1) || !this.adjacencyList.hasOwnProperty(vertex2)) {
            this.graphError(`One or more vertices do not exist in the graph`);
            return;
        }

        this.adjacencyList[vertex1] = this.adjacencyList[vertex1].filter(v => v !== vertex2);
        this.adjacencyList[vertex2] = this.adjacencyList[vertex2].filter(v => v !== vertex1);
    }

    depthFirstSearchRecursive(startingVertex: string): string[] {
        if (!this.adjacencyList.hasOwnProperty(startingVertex)) {
            this.graphError(`Vertex ${startingVertex} does not exist in the graph`);
            return [];
        }

        const result: string[] = [];
        const visited: { [key: string]: boolean } = {};
        const adjacencyList = this.adjacencyList;

        (function dfs(vertex) {
            if (!vertex) return null;
            visited[vertex] = true;
            result.push(vertex);
            adjacencyList[vertex].forEach(neighbor => {
                if (!visited[neighbor]) {
                    return dfs(neighbor);
                }
            });
        })(startingVertex);

        return result;
    }

    depthFirstSearchIterative(startingVertex: string): string[] {
        if (!this.adjacencyList.hasOwnProperty(startingVertex)) {
            this.graphError(`Vertex ${startingVertex} does not exist in the graph`);
            return [];
        }

        const stack: string[] = [startingVertex];
        const result: string[] = [];
        const visited: { [key: string]: boolean } = {};
        let currentVertex: string | undefined;

        visited[startingVertex] = true;

        while (stack.length) {
            currentVertex = stack.pop();
            result.push(currentVertex!);

            this.adjacencyList[currentVertex as string].forEach(neighbor => {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    stack.push(neighbor);
                }
            });
        }

        return result;
    }

    breadthFirstSearch(startingVertex: string): string[] {
        if (!this.adjacencyList.hasOwnProperty(startingVertex)) {
            this.graphError(`Vertex ${startingVertex} does not exist in the graph`);
            return [];
        }

        const queue: string[] = [startingVertex];
        const result: string[] = [];
        const visited: { [key: string]: boolean } = {};

        visited[startingVertex] = true;

        while (queue.length) {
            let currentVertex = queue.shift()!;
            result.push(currentVertex);

            this.adjacencyList[currentVertex].forEach(neighbor => {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    queue.push(neighbor);
                }
            });
        }
        return result;
    }

    toForceGraphData(): { nodes: { id: string }[]; links: { source: string; target: string }[] } {
        const nodes = Object.keys(this.adjacencyList).map(vertex => ({ id: vertex }));
        const links: { source: string; target: string }[] = [];
        Object.entries(this.adjacencyList).forEach(([source, targets]) => {
            targets.forEach(target => {
                links.push({ source, target });
            });
        });

        return { nodes, links };
    }
}

const unweightedGraph = new UnweightedGraph();
unweightedGraph.addVertex('A');
unweightedGraph.addVertex('B');
unweightedGraph.addVertex('C');
unweightedGraph.addVertex('D');
unweightedGraph.addVertex('E');
unweightedGraph.addVertex('F');

unweightedGraph.addEdge('A', 'B');
unweightedGraph.addEdge('A', 'C');
unweightedGraph.addEdge('B', 'D');
unweightedGraph.addEdge('C', 'E');
unweightedGraph.addEdge('D', 'E');
unweightedGraph.addEdge('D', 'F');
unweightedGraph.addEdge('E', 'F');

// @ts-ignore
const unweightedGraphInstance = ForceGraph()(document.getElementById('graph'));
const forceUnweightedGraphData = unweightedGraph.toForceGraphData();

unweightedGraphInstance
    .graphData(forceUnweightedGraphData)
    .backgroundColor('#101020')
    .nodeLabel((node: { [key: string]: any }) => 'Vertex: ' + node.id)
    .nodeRelSize(8)
    .linkDirectionalParticles(2)
    .linkDirectionalParticleWidth(2)
    .nodeVisibility(true)
    .nodeAutoColorBy('group')
    .nodeCanvasObjectMode(() => 'after')
    .nodeCanvasObject((node: { [key: string]: any }, ctx: { [key: string]: any }, globalScale: number) => {
        const label = node.id;
        const fontSize = 12 / globalScale;
        ctx.font = `${fontSize}px Sans-Serif`;
        const textWidth = ctx.measureText(label).width;
        const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

        ctx.fillStyle = 'transparent';
        ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'white';
        ctx.fillText(label, node.x, node.y + 1);

        node.__bckgDimensions = bckgDimensions;
    })
    .linkColor(() => 'rgba(255,255,255,0.2)')
    .onNodeClick((node: { [key: string]: any }) => console.log(node));
