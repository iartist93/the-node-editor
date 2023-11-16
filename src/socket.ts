export interface SocketType {
    id: number;
    name: String;
    label: string;
    x: number;
    y: number;
}

export class SocketObject implements SocketType {
    id = 1;
    name = "[SOCKET]";
    label = "[SOCKET]";
    x = 0;
    y = 0;

    constructor(socket?: Partial<SocketType>) {
        if (socket) {
            Object.assign(this, socket);
        }
    }
}
