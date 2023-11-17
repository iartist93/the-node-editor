import {NodeObject} from "@/node";
import {SocketObject} from "@/socket";
import {type Ref} from "vue";

// TODO: Man!!! I think it's better to use Composable here !!! = useConnection()


export interface ConnectionType {
    id: number;
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    inputNode: NodeObject | null;
    outputNode: NodeObject | null;
    inputSocket: SocketObject | null;
    outputSocket: SocketObject | null;
}

export class ConnectionObject implements ConnectionType {
    id = 1;
    sourceX = 0;
    sourceY = 0;
    targetX = 0;
    targetY = 0;
    inputNode: NodeObject | null = null;
    outputNode: NodeObject | null = null;
    inputSocket: SocketObject | null = null;
    outputSocket: SocketObject | null = null;

    constructor(connection?: Partial<ConnectionType>) {
        if (connection) {
            Object.assign(this, connection);
        }
    }
}


export const drawConnection = (ctx: Ref<CanvasRenderingContext2D | null>, connection: ConnectionObject) => {
    if (!ctx.value) {
        console.error("You must provide CanvasRenderingContext2D");
        return;
    }

    const sourceX = connection.sourceX;
    const sourceY = connection.sourceY;
    const targetX = connection.targetX;
    const targetY = connection.targetY;

    // control points
    const cp1X = sourceX + (targetX - sourceX) * (5 / 10);
    const cp2X = sourceX + (targetX - sourceX) * (5 / 10);
    const cp1Y = sourceY;
    const cp2Y = targetY;

    ctx.value.beginPath();
    ctx.value.moveTo(sourceX, sourceY);
    ctx.value.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, targetX, targetY);
    ctx.value.lineWidth = 3;
    ctx.value.strokeStyle = "white";
    ctx.value.stroke();
    ctx.value.closePath();
}


