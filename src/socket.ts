import {type NodeType} from "@/node";
import type {ReactiveVariable} from "vue/macros";
import {reactive} from "vue";

export interface SocketType {
    id: number;
    name: String;
    label: string;
    x: number;
    y: number;
    node: NodeType | null
}

interface useSocketType {
    socket: ReactiveVariable<SocketType>;
    defaultSocket: SocketType;
}

interface useSocketUtilsType {
    isInsideSocket: (node: NodeType, socket: SocketType, x: number, y: number) => boolean;
}

export const useSocket = (newSocket?: Partial<SocketType>): useSocketType => {
    const defaultSocket: SocketType = {
        id: 1,
        name: "[SOCKET]",
        label: "[SOCKET]",
        x: 0,
        y: 0,
        node: null,
    }

    const socket: ReactiveVariable<SocketType> = reactive({...defaultSocket, ...newSocket});

    return {
        socket,
        defaultSocket
    }
}
export const useSocketUtils = () => {
    /**
     * Track if the mouse cursor is inside a socket
     *
     * @param node node that include the socket
     * @param socket socket to check if mouse is inside
     * @param x mouse x
     * @param y mouse y
     */
    const isInsideSocket = (node: NodeType, socket: SocketType, x: number, y: number) => {
        return (
            x >= socket.x - node.socketRadius &&
            x <= socket.x + node.socketRadius &&
            y >= socket.y - node.socketRadius &&
            y <= socket.y + node.socketRadius
        );
    };

    return {
        isInsideSocket
    }
}