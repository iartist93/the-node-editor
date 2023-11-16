import {NodeObject} from "@/node";

export interface SocketType {
    id: number;
    name: String;
    label: string;
    x: number;
    y: number;
    node: NodeObject | null
}

export class SocketObject implements SocketType {
    id = 1;
    name = "[SOCKET]";
    label = "[SOCKET]";
    x = 0;
    y = 0;
    node: NodeObject | null = null;

    constructor(socket?: Partial<SocketType>) {
        if (socket) {
            Object.assign(this, socket);
        }
    }

}

/**
 * Track if the mouse cursor is inside a socket
 *
 * @param node node that include the socket
 * @param socket socket to check if mouse is inside
 * @param x mouse x
 * @param y mouse y
 */
export const isInsideSocket = (node: NodeObject, socket: SocketObject, x: number, y: number) => {
    return (
        x >= socket.x - node.socketRadius &&
        x <= socket.x + node.socketRadius &&
        y >= socket.y - node.socketRadius &&
        y <= socket.y + node.socketRadius
    );
};
