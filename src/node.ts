import {SocketObject} from "@/socket";
import {type ReactiveVariable} from "vue/macros";
import * as Vue from "vue-demi";
import {type Ref} from "vue";

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
    inputSockets: SocketObject[];
    outputSockets: SocketObject[];
}

export class NodeObject implements NodeType {
    id = 1;
    name = "Sum";
    x = 1;
    y = 285;
    width = 200;
    height = 200;
    headerHeight = 40;
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
    inputSockets: SocketObject[] = [];
    outputSockets: SocketObject[] = [];

    constructor(node?: Partial<NodeType>) {
        if (node) {
            Object.assign(this, node);
        }
    }


}

/**
 * Track if the mouse cursor is inside a node
 *
 * @param node node to check if mouse is inside
 * @param x mouse x
 * @param y mouse y
 */
export const isInsideNode = (node: NodeObject, x: number, y: number) => {
    return (
        x >= node.x - node.socketRadius &&
        x <= node.x + node.width + node.socketRadius &&
        y >= node.y - node.socketRadius &&
        y <= node.y + node.height + node.socketRadius
    );
};



export const initNode = (node: ReactiveVariable<NodeObject>) => {
    node.outputs = node.outputSockets.length;
    node.inputs = node.inputSockets.length;

    // set the height dynamically based on how many sockets
    const maxSocketsNum = Math.max(node.outputs, node.inputs);
    node.height = node.unit * (maxSocketsNum + 1) + node.headerHeight;
}


export const drawNode = (ctx: Ref<CanvasRenderingContext2D | null>, node: ReactiveVariable<NodeObject>) => {
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

    // draw inputs
    for (let i = 1; i <= node.inputSockets.length; i++) {
        const x = node.x;
        const y = node.y + (i * node.socketSpacing) + node.headerHeight;

        ctx.value.beginPath();
        ctx.value.arc(x, y, node.socketRadius, 0, 2 * Math.PI);
        ctx.value.fillStyle = node.socketColorIn;
        ctx.value.fill();
        ctx.value.strokeStyle = "#24232c";
        ctx.value.lineWidth = 2;
        ctx.value.stroke();
        ctx.value.closePath();

        ctx.value.textAlign = "left";
        ctx.value.font = '14px Courier New';
        ctx.value.fillStyle = "#e4e4ea";
        ctx.value.fillText(node.inputSockets[i - 1].label, x + node.socketRadius * 1.5, y + node.socketRadius / 2, 500);

        Vue.set(node.inputSockets[i - 1], 'x', x);
        Vue.set(node.inputSockets[i - 1], 'y', y);
    }

    // draw outputs
    for (let i = 1; i <= node.outputSockets.length; i++) {
        const x = node.x + node.width;
        const y = node.y + (i * node.socketSpacing) + node.headerHeight;

        ctx.value.beginPath();
        ctx.value.arc(x, y, node.socketRadius, 0, 2 * Math.PI);
        ctx.value.fillStyle = node.socketColorOut;
        ctx.value.fill();
        ctx.value.strokeStyle = "#24232c";
        ctx.value.lineWidth = 2;
        ctx.value.stroke();
        ctx.value.closePath();

        ctx.value.textAlign = "right";
        ctx.value.font = '14px Courier New';
        ctx.value.fillStyle = "#e4e4ea";
        ctx.value.fillText(node.outputSockets[i - 1].label, x - node.socketRadius * 1.5, y + node.socketRadius / 2, 500);

        Vue.set(node.outputSockets[i - 1], 'x', x);
        Vue.set(node.outputSockets[i - 1], 'y', y);
    }
};

