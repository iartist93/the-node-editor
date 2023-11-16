import {NodeObject} from "@/node";
import {SocketObject} from "@/socket";

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
