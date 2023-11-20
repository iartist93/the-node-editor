import {type SocketType} from "@/socket";
import {type ReactiveVariable} from "vue/macros";
import * as Vue from "vue-demi";
import {reactive, type Ref} from "vue";

export interface NodeType {
    id: number;
    name: string;
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
    inputs: number;
    outputs: number;
    socketSpacing: number;
    headerHeight: number;
    inputSockets: SocketType[];
    outputSockets: SocketType[];
}

interface useNodeType {
    node: ReactiveVariable<NodeType>;
    defaultNode: NodeType;
}

interface useNodeUtilsType {
    drawNode: (ctx: Ref<CanvasRenderingContext2D | null>, node: ReactiveVariable<NodeType>) => void;
    initNode: (node: ReactiveVariable<NodeType>) => void;
    isInsideNode: (node: NodeType, x: number, y: number) => boolean;
}

export const useNode = (newNode?: Partial<NodeType>): useNodeType => {
    const defaultNode: NodeType = {
        id: 1,
        name: "Sum",
        x: 1,
        y: 285,
        width: 200,
        height: 200,
        headerHeight: 40,
        unit: 50,
        fill: '#4b4b4b',
        stroke: 'gray',
        strokeWidth: 5,
        borderRadius: 10,
        draggable: true,
        socketRadius: 10,
        inputs: 2,
        outputs: 5,
        socketSpacing: 50,
        inputSockets: [],
        outputSockets: [],
    };

    const node: ReactiveVariable<NodeType> = reactive({...defaultNode, ...newNode});

    return {
        node,
        defaultNode,
    }
}

export const useNodeUtils = (): useNodeUtilsType => {
    /**
     * Track if the mouse cursor is inside a node
     * @param node node to check if mouse is inside
     * @param x mouse x
     * @param y mouse y
     */
    const isInsideNode = (node: NodeType, x: number, y: number) => {
        return (
            x >= node.x - node.socketRadius &&
            x <= node.x + node.width + node.socketRadius &&
            y >= node.y - node.socketRadius &&
            y <= node.y + node.height + node.socketRadius
        );
    };

    const initNode = (node: ReactiveVariable<NodeType>) => {
        node.outputs = node.outputSockets.length;
        node.inputs = node.inputSockets.length;

        // set the height dynamically based on how many sockets
        const maxSocketsNum = Math.max(node.outputs, node.inputs);
        node.height = node.unit * (maxSocketsNum + 1) + node.headerHeight;
    }

    const drawNode = (ctx: Ref<CanvasRenderingContext2D | null>, node: ReactiveVariable<NodeType>) => {
        if (!ctx.value) {
            console.error("You must provide CanvasRenderingContext2D");
            return;
        }

        // draw the node body
        ctx.value.globalAlpha = 0.93;
        ctx.value.beginPath();
        ctx.value.fillStyle = node.fill;
        ctx.value.strokeStyle = node.stroke;
        ctx.value.lineWidth = node.strokeWidth;
        ctx.value.roundRect(node.x, node.y, node.width, node.height, node.borderRadius);
        ctx.value.stroke();
        ctx.value.fill();
        ctx.value.closePath();

        // draw the node title
        ctx.value.textAlign = "center";
        ctx.value.font = 'bold 14px Courier New';
        ctx.value.fillStyle = "white";
        ctx.value.fillText(node.name, node.x + node.width / 2, node.y + node.headerHeight / 1.6);

        // draw divider
        ctx.value.beginPath();
        ctx.value.strokeStyle = "#8c8c8c";
        ctx.value.lineWidth = 1;
        ctx.value.moveTo(node.x, node.y + node.headerHeight);
        ctx.value.lineTo(node.x + node.width, node.y + node.headerHeight);
        ctx.value.stroke();
        ctx.value.closePath();

        // reset alpha
        ctx.value.globalAlpha = 1.0;
    };

    return {
        isInsideNode,
        initNode,
        drawNode
    }
}