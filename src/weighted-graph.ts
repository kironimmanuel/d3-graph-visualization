namespace WeightedGraph {
    class Node {
        value: any;
        priority: number;

        constructor(value: any, priority: number) {
            this.value = value;
            this.priority = priority;
        }
    }

    class PriorityQueue {
        values: Node[];

        constructor() {
            this.values = [];
        }

        enqueue(value: any, priority: number): any {
            const newNode = new Node(value, priority);
            this.values.push(newNode);
            this.bubbleUp();

            return value;
        }

        bubbleUp(): void {
            let index = this.values.length - 1;
            const element = this.values[index];

            while (index > 0) {
                const parentIndex = Math.floor((index - 1) / 2);
                const parent = this.values[parentIndex];
                if (parent.priority <= element.priority) break;
                this.values[parentIndex] = element;
                this.values[index] = parent;
                index = parentIndex;
            }
        }

        dequeue(): Node | undefined {
            const min = this.values[0];
            const end = this.values.pop();
            if (this.values.length > 0) {
                this.values[0] = end!;
                this.sinkDown();
            }
            return min;
        }

        sinkDown(): void {
            let index = 0;
            const length = this.values.length;
            const element = this.values[0];

            while (true) {
                let leftChildIndex = 2 * index + 1;
                let rightChildIndex = 2 * index + 2;
                let leftChild, rightChild;
                let swap = null;

                if (leftChildIndex < length) {
                    leftChild = this.values[leftChildIndex];
                    if (leftChild.priority < element.priority) {
                        swap = leftChildIndex;
                    }
                }

                if (rightChildIndex < length) {
                    rightChild = this.values[rightChildIndex];
                    if (
                        (swap === null && rightChild.priority < element.priority) ||
                        (swap !== null && rightChild.priority < leftChild!.priority)
                    ) {
                        swap = rightChildIndex;
                    }
                }

                if (swap === null) break;
                this.values[index] = this.values[swap];
                this.values[swap] = element;
                index = swap;
            }
        }
    }

    export class WeightedGraph {
        adjacencyList: { [key: string]: { node: string; weight: number }[] };

        constructor() {
            this.adjacencyList = {};
        }

        addVertex(vertex: string): void {
            if (!this.adjacencyList[vertex]) this.adjacencyList[vertex] = [];
        }

        addEdge(vertex1: string, vertex2: string, weight: number): void {
            this.adjacencyList[vertex1].push({ node: vertex2, weight });
            this.adjacencyList[vertex2].push({ node: vertex1, weight });
        }

        shortestPath(start: string, finish: string): string[] {
            const nodes = new PriorityQueue();
            const distances: { [key: string]: number } = {};
            const previous: { [key: string]: string | null } = {};
            const path: string[] = [];
            let smallest: string = '';

            for (const vertex in this.adjacencyList) {
                if (vertex === start) {
                    distances[vertex] = 0;
                    nodes.enqueue(vertex, 0);
                } else {
                    distances[vertex] = Infinity;
                    nodes.enqueue(vertex, Infinity);
                }
                previous[vertex] = null;
            }

            while (nodes.values.length) {
                smallest = nodes.dequeue()!.value;
                if (smallest === finish) {
                    while (previous[smallest]) {
                        path.push(smallest);
                        smallest = previous[smallest]!;
                    }

                    break;
                }
                if (smallest || distances[smallest] !== Infinity) {
                    for (const neighbor of this.adjacencyList[smallest]) {
                        let nextNode = neighbor;
                        let candidate = distances[smallest] + nextNode.weight;
                        let nextNeighbor = nextNode.node;
                        if (candidate < distances[nextNeighbor]) {
                            distances[nextNeighbor] = candidate;
                            previous[nextNeighbor] = smallest;
                            nodes.enqueue(nextNeighbor, candidate);
                        }
                    }
                }
            }

            return path.concat(smallest).reverse();
        }

        toForceGraphData(): { nodes: { id: string }[]; links: { source: string; target: string; value: number }[] } {
            const nodes = Object.keys(this.adjacencyList).map(vertex => ({ id: vertex }));
            const links: { source: string; target: string; value: number }[] = [];

            Object.entries(this.adjacencyList).forEach(([source, targets]) => {
                targets.forEach(target => {
                    links.push({ source, target: target.node, value: target.weight });
                });
            });

            return { nodes, links };
        }
    }
}

const weightedGraph = new WeightedGraph.WeightedGraph();
weightedGraph.addVertex('A');
weightedGraph.addVertex('B');
weightedGraph.addVertex('C');
weightedGraph.addVertex('D');
weightedGraph.addVertex('E');
weightedGraph.addVertex('F');

weightedGraph.addEdge('A', 'B', 4);
weightedGraph.addEdge('A', 'C', 2);
weightedGraph.addEdge('B', 'E', 3);
weightedGraph.addEdge('C', 'D', 2);
weightedGraph.addEdge('C', 'F', 4);
weightedGraph.addEdge('D', 'E', 3);
weightedGraph.addEdge('D', 'F', 1);
weightedGraph.addEdge('E', 'F', 1);

// @ts-ignore
const weightedGraphInstance = ForceGraph()(document.getElementById('graph'));
const forceWeightedGraphData = weightedGraph.toForceGraphData();

weightedGraphInstance
    .graphData(forceWeightedGraphData)
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
    .linkCanvasObjectMode(() => 'after')
    .linkCanvasObject((link: any, ctx: any) => {
        const MAX_FONT_SIZE = 4;
        const LABEL_NODE_MARGIN = weightedGraphInstance.nodeRelSize() * 1.5;

        const start = link.source;
        const end = link.target;

        if (typeof start !== 'object' || typeof end !== 'object') return;

        const textPos = Object.assign(
            // @ts-ignore
            ...['x', 'y'].map(c => ({
                [c]: start[c] + (end[c] - start[c]) / 2,
            })),
        );

        const relLink = { x: end.x - start.x, y: end.y - start.y };

        const maxTextLength = Math.sqrt(Math.pow(relLink.x, 2) + Math.pow(relLink.y, 2)) - LABEL_NODE_MARGIN * 2;

        let textAngle = Math.atan2(relLink.y, relLink.x);
        if (textAngle > Math.PI / 2) textAngle = -(Math.PI - textAngle);
        if (textAngle < -Math.PI / 2) textAngle = -(-Math.PI - textAngle);

        const label = link.value.toString();

        ctx.font = '1px Sans-Serif';
        const fontSize = Math.min(MAX_FONT_SIZE, maxTextLength / ctx.measureText(label).width);
        ctx.font = `${fontSize}px Sans-Serif`;
        const textWidth = ctx.measureText(label).width;
        const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.75);

        ctx.save();
        ctx.translate(textPos.x, textPos.y);
        ctx.rotate(textAngle);

        ctx.fillStyle = 'transparent';
        ctx.fillRect(-bckgDimensions[0] / 2, -bckgDimensions[1] / 2, ...bckgDimensions);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = 'white';
        ctx.fillText(label, 0, 0);
        ctx.restore();
    })
    .linkColor(() => 'rgba(255,255,255,0.2)')
    .onNodeClick((node: any) => console.log(node));
