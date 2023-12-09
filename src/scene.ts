import { addNewSocket, useNode } from '@/node'
import { useConnection } from '@/connection'
import { useEditorStore } from '@/stores'

export const useScene = () => {
  const { addNode, addConnection } = useEditorStore()

  // --------------------------
  // node 1
  //---------------------------

  const node1 = useNode({
    x: 47,
    y: 285,
    name: 'Sum'
  })

  addNewSocket(node1, {
    name: 'x',
    label: 'x',
    type: 'input'
  })

  addNewSocket(node1, {
    name: 'y',
    label: 'y',
    type: 'input'
  })

  addNewSocket(node1, {
    name: 'sum',
    label: 'sum',
    type: 'output'
  })

  // --------------------------
  // node 2
  //---------------------------

  const node2 = useNode({
    x: 900,
    y: 440,
    name: 'Math'
  })

  // add sockets to node 2
  addNewSocket(node2, {
    name: 'x',
    label: 'x',
    type: 'input'
  })

  addNewSocket(node2, {
    name: 'y',
    label: 'y',
    type: 'input'
  })

  addNewSocket(node2, {
    name: 'z',
    label: 'z',
    type: 'input'
  })

  addNewSocket(node2, {
    name: 'w',
    label: 'w',
    type: 'input'
  })

  addNewSocket(node2, {
    name: 'sum',
    label: 'sum',
    type: 'output'
  })

  addNewSocket(node2, {
    name: 'add',
    label: 'add',
    type: 'output'
  })

  // --------------------------
  // node 2
  //---------------------------

  const node3 = useNode({
    x: 506,
    y: 82,
    name: 'Add'
  })

  addNewSocket(node3, {
    name: 'x',
    label: 'x',
    type: 'input'
  })

  addNewSocket(node3, {
    name: 'y',
    label: 'y',
    type: 'input'
  })

  addNewSocket(node3, {
    name: 'add',
    label: 'add',
    type: 'output'
  })

  // create connections
  const connection1 = useConnection(node1.outputSocketIds[0], node2.inputSocketIds[0])
  const connection2 = useConnection(node1.outputSocketIds[0], node3.inputSocketIds[0])

  // add elements to the store
  addNode(node1)
  addNode(node2)
  addNode(node3)
  addConnection(connection1)
  addConnection(connection2)
}
