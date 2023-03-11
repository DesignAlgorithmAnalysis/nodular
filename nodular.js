const vm = require('vm');

// ps object for managing subscriptions and notifications
class ps {
  // Collection of event listeners
  constructor() {
    this.events = {};
  }

  // Subscribe to a particular event
  subscribe(event, callback) {
    // Create an empty array for this event, if not already present
    if (!this.events[event]) this.events[event] = [];

    // Add the callback to the event listeners
    this.events[event].push(callback);
  }

  // Unsubscribe from a particular event
  unsubscribe(event, callback) {
    // Return if event does not exist
    if (!this.events[event]) return;

    // Remove the callback from the event listeners
    this.events[event] = this.events[event].filter(
      function(listener) {
        return listener !== callback;
      }
    );
  }

  // Publish an event, triggering all subscribed callbacks
  publish(event, data) {
    // Return if event does not exist
    if (!this.events[event]) return;

    // Trigger all event listeners with the given data
    this.events[event].forEach(function(listener) {
      listener(data);
    });
  }
};

// Node Object for making codes blocks containing the functions connected to other Node Objects
class Node {
  constructor(name) {
    this.name = name;
    this.id = Node.generateId();
    this.ports = {input:[],output:[]};
    this.code = "";
  }
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
  addInput(name,dataPortRef,nodeList) {
    const input = {
      id: Node.generateId(),
      name: name,
      dataPortRef: dataPortRef,
      data: undefined,
      updateData: (data)=>{
        input.data = data;
      }
    }
    this.ports['input'].push(input);
    //subscribe to refrenced port
    nodeList.forEach((node) => {
      if(node.id == dataPortRef.nodeID) {
        node.ports.output.forEach((output) => {
          if(output.id == dataPortRef.portID) {
            var updateFunction = this.ports['input'][this.ports['input'].length-1].updateData;
            output.pub.subscribe('update', updateFunction);
          }
        });
      }
    });
  };
  addOutput(name) {
    this.ports['output'].push(
      {
        id: Node.generateId(),
        name: name,
        pub: new ps(),
        data: undefined
      }
    );
  }
  removeInput(port) {
    // Remove the input port and unsubscribe from the output port
    this.ports.input = this.ports.input.filter((input) => input !== port);
    if (port.dataPortRef) {
      const node = nodeList.find((node) => node.id === port.dataPortRef.nodeID);
      if (node) {
        const output = node.output.find((output) => output.id === port.dataPortRef.portID);
        if (output && output.pub && port.subscription) {
          // Unsubscribe from the output port
          output.pub.unsubscribe('update', port.subscription);
        }
      }
    }
    this.usedPortNames.delete(port.name);
  }
  destroy() {
    // Unsubscribe from all input ports
    this.ports.input.forEach((input) => {
      if (input.dataPortRef && input.subscription) {
        const node = nodeList.find((node) => node.id === input.dataPortRef.nodeID);
        if (node) {
          const output = node.output.find((output) => output.id === input.dataPortRef.portID);
          if (output && output.pub) {
            // Unsubscribe from the output port
            output.pub.unsubscribe('update', input.subscription);
          }
        }
      }
    });
  }
  init() {
    //get the name of inputs and outputs
    const inputs = this.ports.input.map(port => port.name).join(',');
    const outputs = this.ports.output.map(port => port.name).join(',');
    var codeTemplate = `function ${this.name}(${inputs}){
      var ${outputs};
       ${this.code}
       return {${outputs}};
     }`;
    //initialize the function
    const sandbox = {};
    const script = new vm.Script(codeTemplate);
    script.runInNewContext(sandbox);
    this.box = sandbox[this.name];
  }
  run() {
    //get the data of inputs and outputs
    const inputs = this.ports.input.map((port) => port.data);
    //execute the funtion with input data
    var outputObj = this.box(...inputs);
    this.ports.output.forEach((port, i) => {
      port.data = outputObj[port.name];
      port.pub.publish('update',port.data);
    });
  }
}


// nodeGraph object store nodes and simulates them like a directional graph
class nodeGraph {
  constructor() {
    this.nodes = [];
    this.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
  addNode(nodeName) {
    const node = new Node(nodeName);
    this.nodes.push(node);
    return node.id;
  }
  removeNode(nodeID) {
    this.nodes = this.nodes.filter((node) => node.id !== nodeID);
  }
  getNodeByID(nodeID) {
    const node = this.nodes.find((node) => node.id === nodeID);
    if (!node) {
      throw new Error(`Node with ID ${nodeID} not found`);
    }
    return node;
  }
  evaluateNodes() {
    //initialize all nodes
    this.nodes.forEach((node) => {
      node.init();
    });

    //run all nodes with priority to input nodes
    this.nodes.forEach(this.runNode,this);
  }
  runNode(node) {
    if (node.ports.input.length > 0) {
      node.ports.input.forEach((port) => {
        this.runNode(this.getNodeByID(port.dataPortRef.nodeID));
      });
    }
    try {
      node.run();
      // UI function update here
    } catch (error) {
      console.error(`Error running node ${node.id}: ${error.message}`);
    }
  };
}

module.exports = { nodeGraph };
