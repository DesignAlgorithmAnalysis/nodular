# Nodular

Nodular is a lightweight and flexible library for building node-based programming interfaces. It allows you to easily create and manage interconnected nodes that can execute custom code and exchange data. With Nodular, you can create complex workflows and automate tasks without writing complex code.

## Installation

You can start using Nodular module by cloning file `nodular.js` and using require the function to import:

`const {nodeGraph} = require('./path/to/nodular.js')` 

## Getting started

Here's a simple example that demonstrates how to create and run nodes using Nodular:
```

`const {nodeGraph} = require('nodular');

// create a new node graph
const graph = new nodeGraph();

// create two nodes and add input and output ports
const node1 = graph.getNodeByID(graph.addNode('node1'));
const node2 = graph.getNodeByID(graph.addNode('node2'));
node2.addOutput('c');
node1.addOutput('b');
node1.addInput('a', {nodeID: node2.id, portID: node2.ports.output[0].id}, [node2]);

// set user-defined code for nodes
node1.code = 'b = a + 1;';
node2.code = 'c = 2;';

// initialize and run the nodes
graph.evaluateNodes();

// check output data
console.log(node1.ports.output[0].data); // should output 3
console.log(node2.ports.output[0].data); // should output 2` 
```
## Usage

### Creating nodes

You can create new nodes by calling the `addNode` method on a `nodeGraph` instance. The method takes one argument, the name of the node, and returns a unique ID that can be used to reference the node later. For example:

```
const node1ID = graph.addNode('node1');
const node2ID = graph.addNode('node2'); 
```

### Adding ports to nodes

You can add input and output ports to nodes using the `addInput` and `addOutput` methods respectively. The methods take two arguments: the name of the port, and an optional object that specifies the source node ID and port ID for input ports. For example:
```
node1.addInput('a', {nodeID: node2.id, portID: node2.ports.output[0].id}, [node2]);
node1.addOutput('b');
node2.addOutput('c');
```
### Setting user-defined code for nodes

You can set user-defined code for nodes using the `code` property. This property should be set to a string that contains valid JavaScript code that will be executed when the node is run. For example:

```
node1.code = "b = a + 1;";
node2.code = "c = 2;"; 
```
### Running nodes

You can run nodes using the `evaluateNodes` method. This method initializes all nodes, then runs them in order, with priority given to input nodes. For example:
```
graph.evaluateNodes();
```

### Retrieving nodes by ID

You can retrieve nodes by ID using the `getNodeByID` method. This method takes one argument, the ID of the node, and returns the node object or `false` if the node is not found. For example:


```
const node1 = graph.getNodeByID(node1ID);
```
### Removing nodes

You can remove nodes by ID using the `removeNode` method. This method takes one argument, the ID of the node, and removes the node from the graph. For example:

```
graph.removeNode(node1ID);
```
## Roadmap

Nodular is still under development and will soon include a visual.
