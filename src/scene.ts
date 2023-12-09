import { addNewSocket, runSocketFunctions, useNode } from '@/node'
import { addSocketToConnection, useConnection } from '@/connection'
import { useEditorStore } from '@/stores'
import type { SocketType } from '@/socket'

export const useScene = () => {
  const { addNode, addConnection } = useEditorStore()

  // --------------------------
  // node 1
  //---------------------------

  const node1 = useNode({
    x: 150,
    y: 185,
    name: 'Sum'
  })

  addNewSocket(node1, {
    name: 'x',
    label: 'x',
    type: 'input',
    value: 1
  })

  addNewSocket(node1, {
    name: 'y',
    label: 'y',
    type: 'input',
    value: 2
  })

  addNewSocket(node1, {
    name: 'sum',
    label: 'sum',
    type: 'output',
    func: function () {
      const node = useEditorStore().getNode((this as SocketType).nodeId)
      const x = useEditorStore().getSocket(node.inputSocketIds[0]).value
      const y = useEditorStore().getSocket(node.inputSocketIds[1]).value
      const outputSocket = useEditorStore().getSocket(node.outputSocketIds[0])
      outputSocket.value = x + y
    }
  })

  // --------------------------
  // node 2
  //---------------------------

  const node2 = useNode({
    x: 910,
    y: 340,
    name: 'Math'
  })

  // add sockets to node 2
  addNewSocket(node2, {
    name: 'x',
    label: 'x',
    type: 'input',
    value: 1
  })

  addNewSocket(node2, {
    name: 'y',
    label: 'y',
    type: 'input',
    value: 2
  })

  addNewSocket(node2, {
    name: 'z',
    label: 'z',
    type: 'input',
    value: 3
  })

  addNewSocket(node2, {
    name: 'w',
    label: 'w',
    type: 'input',
    value: 4
  })

  addNewSocket(node2, {
    name: 'sum',
    label: 'sum',
    type: 'output',
    func: function () {
      const node = useEditorStore().getNode((this as SocketType).nodeId)
      const x = useEditorStore().getSocket(node.inputSocketIds[0]).value
      const y = useEditorStore().getSocket(node.inputSocketIds[1]).value
      const z = useEditorStore().getSocket(node.inputSocketIds[2]).value
      const w = useEditorStore().getSocket(node.inputSocketIds[3]).value
      const outputSocket = useEditorStore().getSocket(node.outputSocketIds[0])
      outputSocket.value = x + y + z + w
    }
  })

  addNewSocket(node2, {
    name: 'multiply',
    label: 'multiply',
    type: 'output',
    func: function () {
      const node = useEditorStore().getNode((this as SocketType).nodeId)
      const x = useEditorStore().getSocket(node.inputSocketIds[0]).value
      const y = useEditorStore().getSocket(node.inputSocketIds[1]).value
      const z = useEditorStore().getSocket(node.inputSocketIds[2]).value
      const w = useEditorStore().getSocket(node.inputSocketIds[3]).value
      const outputSocket = useEditorStore().getSocket(node.outputSocketIds[1])
      outputSocket.value = x * y * z * w
    }
  })

  // --------------------------
  // node 2
  //---------------------------

  const node3 = useNode({
    x: 900,
    y: 82,
    name: 'Add'
  })

  addNewSocket(node3, {
    name: 'x',
    label: 'x',
    type: 'input',
    value: 1
  })

  addNewSocket(node3, {
    name: 'y',
    label: 'y',
    type: 'input',
    value: 2
  })

  addNewSocket(node3, {
    name: 'add',
    label: 'add',
    type: 'output',
    func: function () {
      const node = useEditorStore().getNode((this as SocketType).nodeId)
      const x = useEditorStore().getSocket(node.inputSocketIds[0]).value
      const y = useEditorStore().getSocket(node.inputSocketIds[1]).value
      const outputSocket = useEditorStore().getSocket(node.outputSocketIds[0])
      outputSocket.value = x + y
      console.log('==========> function for socket [ add - node 3 ]', x, y, outputSocket.value)
    }
  })

  // --------------------------
  // node 4
  //---------------------------

  const node4 = useNode({
    x: 150,
    y: 585,
    name: 'divide'
  })

  addNewSocket(node4, {
    name: 'x',
    label: 'x',
    type: 'input',
    value: 12
  })

  addNewSocket(node4, {
    name: 'y',
    label: 'y',
    type: 'input',
    value: 2
  })

  addNewSocket(node4, {
    name: 'divide',
    label: 'divide',
    type: 'output',
    func: function () {
      const node = useEditorStore().getNode((this as SocketType).nodeId)
      const x = useEditorStore().getSocket(node.inputSocketIds[0]).value
      const y = useEditorStore().getSocket(node.inputSocketIds[1]).value
      const outputSocket = useEditorStore().getSocket(node.outputSocketIds[0])
      outputSocket.value = x / y
    }
  })

  //===========================================================

  // add elements to the store
  addNode(node1)
  addNode(node2)
  // addNode(node3)
  addNode(node4)

  for (let node of useEditorStore().allNodes) {
    runSocketFunctions(node)
  }

  //===========================================================

  // create connections
  const connection1 = useConnection()
  addSocketToConnection(connection1, node1.outputSocketIds[0])
  addSocketToConnection(connection1, node2.inputSocketIds[0])
  addConnection(connection1)

  // const connection2 = useConnection()
  // addSocketToConnection(connection2, node1.outputSocketIds[0])
  // addSocketToConnection(connection2, node3.inputSocketIds[0])
  // addConnection(connection2)
}
