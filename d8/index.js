const fs = require('fs');

const inputFile = 'input.txt';
let input = fs.readFileSync(inputFile, 'utf8').trim().split(' ').map(u => parseInt(u));

let pos = -1;
let nodeIdNonce = -1;
let nodes = [];

const readNode = () => {
    nodeIdNonce++;
    let nodeID = nodeIdNonce;
    // read head
    let numChildNodes = input[++pos];
    let numMetaFields = input[++pos];
    let children = [];
    let metaFields = [];
    
    for (let i = 0; i < numChildNodes; i++) {
        children.push(readNode());
    }

    for (let i = 0; i < numMetaFields; i++) {
        metaFields.push(input[++pos]);
    }
    
    nodes.push({
        nodeID,
        children,
        metaFields,
    });

    return nodeID;
}

const getNodeMetaSum = ({ metaFields }) => metaFields.reduce((acc, n) => acc + n, 0);

const getMetaSum = nodes => {
    return nodes.reduce((acc, node) => acc + getNodeMetaSum(node), 0);
}

readNode();
console.log('Meta sum: ', getMetaSum(nodes));

const getNodeValue = node => {
    if (node.children.length < 1) {
        return getNodeMetaSum(node);
    }

    // If node has children
    return node.metaFields.reduce((acc, childIndex) => {
        if (childIndex > node.children.length) {
            return acc;
        }
        return acc + getNodeValue(nodes[node.children[childIndex - 1]]);
    }, 0);
}

// Sort nodes, for easier ID access
nodes = nodes.sort((a,b) => a.nodeID - b.nodeID);

let rootValue = getNodeValue(nodes[0]);
console.log('Star 2 value:', rootValue);
