const fs = require('fs');

const input = 'input.txt';
const instructions = fs.readFileSync(input, 'utf8').trim().split('\n');

const steps = new Map();

for (cmd of instructions) {
    const matches = cmd.match(/Step (\w) must be finished before step (\w)/);
    const dependsOn = matches[1];
    const step = matches[2];
  
    if (!steps.has(step)) {
        steps.set(step, [dependsOn]);
    }
    else {
        steps.set(step, [...steps.get(step),dependsOn]);
    }

    if (!steps.has(dependsOn)) {
        steps.set(dependsOn, []);
    }
};

let sortedMap = new Map([...steps.entries()].sort((a,b) => a[0] > b[0] ? 1 : -1));

console.log(sortedMap);

let executionOrder = '';

const executeStep = executedStep => {
    executionOrder += executedStep;

    for ([step, dependencies] of sortedMap.entries()) {
        if (dependencies.includes(executedStep)) {
            sortedMap.set(step, sortedMap.get(step).filter(s => s !== executedStep));
        }
    }
}

const getExecutableStep = steps => {
    // Find first executable step
    for ([step, dependencies] of steps.entries()) {
        if (dependencies.length < 1 && executionOrder.indexOf(step) === -1) {
            return step;
        }
    }
}

while (executionOrder.length < sortedMap.size) {
    let step = getExecutableStep(sortedMap);
    executeStep(step);
}

console.log(executionOrder);
