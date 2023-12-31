import { type NodeType } from '@/node'
import { type SocketType } from '@/socket'
import { type ConnectionType } from '@/connection'

import { defineStore } from 'pinia'

export type RootState = {
  allNodes: NodeType[]
  allSockets: SocketType[]
  allConnections: ConnectionType[]
}

export const useEditorStore = defineStore({
  id: 'editorStore',
  state: () =>
    ({
      allNodes: [],
      allSockets: [],
      allConnections: []
    }) as RootState,

  actions: {
    addNode(node: NodeType) {
      this.allNodes.push(node)
    },
    addSocket(socket: SocketType) {
      this.allSockets.push(socket)
    },
    addConnection(connection: ConnectionType) {
      this.allConnections.push(connection)
      console.log('addConnection', this.allConnections.length)
    },

    getNode(nodeId: string): NodeType {
      // find node by id
      return this.allNodes.filter((node) => node.id === nodeId)[0]
    },
    getSocket(socketId: string): SocketType {
      return this.allSockets.filter((socket) => socket.id === socketId)[0]
    },
    getConnection(connectionId: string): ConnectionType {
      return this.allConnections.filter((connection) => connection.id === connectionId)[0]
    },

    removeNode(nodeId: string) {
      this.allNodes = this.allNodes.filter((node) => node.id !== nodeId)
    },
    removeSocket(socketId: string) {
      this.allSockets = this.allSockets.filter((socket) => socket.id !== socketId)
    },
    removeConnection(connectionId: string) {
      this.allConnections = this.allConnections.filter(
        (connection) => connection.id !== connectionId
      )
      console.log('removeConnection ', this.allConnections.length)
    }
  }
})
