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

const initStepMap = () => new Map([...steps.entries()].sort((a,b) => a[0] > b[0] ? 1 : -1));
let sortedMap = initStepMap();

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

console.log('STAR 1: ', executionOrder);

console.log('------------------ START STAR 2 **');
sortedMap = initStepMap();

const NUM_WORKERS = 5;
const BASE_TASK_DURATION = 60;
const BASE_CHAR_OFFSET = 'A'.charCodeAt(0) - 1;

let workers = new Array(NUM_WORKERS).fill(0).map(() => ({startTime: 0, taskID: null}));
executionOrder = '';

const isTaskCompleted = (startTime, currentTime, taskID) => {
    const taskLength = BASE_TASK_DURATION + taskID.charCodeAt(0) - BASE_CHAR_OFFSET;
    return currentTime - startTime >= taskLength;
}

const processOngoing = (currentTime) => {
    for (worker of workers) {
        if (!worker.taskID) {
            continue;
        }

        if (isTaskCompleted(worker.startTime, currentTime, worker.taskID)) {
            executeStep(worker.taskID);
            worker.taskID = null;
        }
    }
}

const getExecutableStepParallel = steps => {
    let tasksInProgress = workers.reduce((acc, { taskID }) => taskID ? [...acc, taskID] : acc, []);
    
    for ([taskID, dependencies] of steps.entries()) {
        if (dependencies.length < 1
            && executionOrder.indexOf(taskID) === -1
            && !tasksInProgress.includes(taskID))
        {
            return taskID;
        }
    }
    return false;
}

let time = -1;
while (executionOrder.length < sortedMap.size) {
    time++; 
    processOngoing(time);
   
    for (let i = 0; i < workers.length; i++) {
        if (workers[i].taskID !== null) {
            continue;
        }

        let task = getExecutableStepParallel(sortedMap);

        if (task !== false) {
            workers[i].startTime = time;
            workers[i].taskID = task;
        } else {
            break;
        }
    }

}

console.log("Star 2:", executionOrder, 'Time:', time);

