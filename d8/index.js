const fs = require('fs');

const inputFile = 'input.txt';
let input = fs.readFileSync(inputFile, 'utf8').trim().split(' ').map(u => parseInt(u));

let pos = -1;
let nodeIdNonce = 0;
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

const getMetaSum = (nodes) => {
    return nodes.reduce((acc, { metaFields }) => acc + metaFields.reduce((acc, n) => acc + n, 0), 0);
}

readNode();
console.log(nodes);
console.log('Meta sum: ', getMetaSum(nodes));
