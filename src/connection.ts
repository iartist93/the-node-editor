import {type NodeType} from "@/node";
import {type SocketType} from "@/socket";
import {computed, type ComputedRef, type Ref} from "vue";
import type {ReactiveVariable} from "vue/macros";

export interface ConnectionType {
    id: number;
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    inputNode: NodeType | null;
    outputNode: NodeType | null;
    inputSocket: SocketType | null;
    outputSocket: SocketType | null;
}

interface useConnectionType {
    connection : ComputedRef<ConnectionType>;
}

interface  useConnectionUtilsType {
    drawConnection: (ctx: Ref<CanvasRenderingContext2D | null>, connection: ComputedRef<ConnectionType>) => void
}

export const useConnection = (
    id : number,
    inputNode: ReactiveVariable<NodeType>,
    outputNode: ReactiveVariable<NodeType>,
    inputSocket: ReactiveVariable<SocketType>,
    outputSocket: ReactiveVariable<SocketType>,
): useConnectionType => {
    const connection : ComputedRef<ConnectionType> = computed(() => ({
        id ,
        inputNode,
        outputNode,
        inputSocket,
        outputSocket,
        sourceX : inputSocket.x,
        sourceY : inputSocket.y,
        targetX : outputSocket.x,
        targetY : outputSocket.y,
    }));

    return {
        connection
    }
}
export const useConnectionUtils = (): useConnectionUtilsType => {
    const drawConnection = (ctx: Ref<CanvasRenderingContext2D | null>, connection: ComputedRef<ConnectionType>) => {
        if (!ctx.value) {
            console.error("You must provide CanvasRenderingContext2D");
            return;
        }

        const sourceX = connection.value.sourceX;
        const sourceY = connection.value.sourceY;
        const targetX = connection.value.targetX;
        const targetY = connection.value.targetY;

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

    return {
        drawConnection
    }
}

