export interface NodeType {
    id: number;
    name: String;
    x: number;
    y: number;
    width: number;
    height: number;
    unit: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    borderRadius: number;
    draggable: boolean;
    socketRadius: number;
    socketColor: string;
    socketColorIn: string;
    socketColorOut: string;
    inputs: number;
    outputs: number;
    socketSpacing: number;
    headerHeight: number;
    inputSockets: any[]; // TODO: Socket[]
    outputSockets: any[]; // TODO: Socket[]
}

export class NodeObject implements NodeType {
    id = 1;
    x = 1;
    y = 285;
    width = 200;
    height = 200;
    headerHeight= 40;
    unit = 50;
    fill = '#4b4b4b';
    stroke = 'gray';
    strokeWidth = 5;
    borderRadius = 10;
    draggable = true;
    socketRadius = 10;
    socketColor = "gray";
    socketColorIn = "#ad89b5";
    socketColorOut = "#f7aa69";
    inputs = 2;
    outputs = 5;
    socketSpacing = 50;
    name = "Sum";
    inputSockets = [];
    outputSockets = [];

    constructor(node?: Partial<NodeType>) {
        if (node) {
            Object.assign(this, node);
        }
    }
}
