const fs = require('fs');

const inputFile = process.argv[2] || 'input.txt';
let input = fs.readFileSync(inputFile, 'utf8').trim().split('\n');

const R = new Array(4).fill(0);

const addr = (a, b, c) => R[c] = R[a] + R[b];
const addi = (a, b, c) => R[c] = R[a] + b;
const mulr = (a, b, c) => R[c] = R[a] * R[b];
const muli = (a, b, c) => R[c] = R[a] * b;
const banr = (a, b, c) => R[c] = R[a] & R[b];
const bani = (a, b, c) => R[c] = R[a] & b;
const borr = (a, b, c) => R[c] = R[a] | R[b];
const bori = (a, b, c) => R[c] = R[a] | b;
const setr = (a, b, c) => R[c] = R[a];
const seti = (a, b, c) => R[c] = a;
const gtir = (a, b, c) => R[c] = a > R[b] ? 1 : 0;
const gtri = (a, b, c) => R[c] = R[a] > b ? 1 : 0;
const gtrr = (a, b, c) => R[c] = R[a] > R[b] ? 1 : 0;
const eqir = (a, b, c) => R[c] = a === R[b] ? 1 : 0;
const eqri = (a, b, c) => R[c] = R[a] === b ? 1 : 0;
const eqrr = (a, b, c) => R[c] = R[a] === R[b] ? 1 : 0;

const OPCODES = [
    addr, addi,
    mulr, muli,
    banr, bani,
    borr, bori,
    setr, seti,
    gtir, gtri, gtrr,
    eqir, eqri, eqrr,
];

const testSample = (registersBefore, [opcode, a, b, c], registersAfter) => {
    let count = 0;
   
    for (let op of OPCODES) {
        // Set register
        for (let i = 0; i < R.length; i++) {
            R[i] = registersBefore[i];
        }

        // Apply opcode
        op(a, b, c);

        // Does register after equal new state?
        let fits = true;
        for (let i = 0; i < R.length; i++) {
            fits = R[i] === registersAfter[i];
            
            if (!fits) break;
        }

        if (fits) count++;
    }

    return count;
};

let samples = [];
let sample = null;
let testProgram = [];

for (line of input) {
    let before = line.match(/Before:\s+\[(\d+), (\d+), (\d+), (\d+)\]/);
    if (before) {
        sample = {};        
        sample.before = before.slice(1).map(e => parseInt(e));
        continue;
    }

    let after = line.match(/After:\s+\[(\d+), (\d+), (\d+), (\d+)\]/);
    if (after) {     
        sample.after = after.slice(1).map(e => parseInt(e));
        if (sample) {
            samples.push(sample);
        }
        sample = null;
        continue;
    }

    let instruction = line.match(/(\d+) (\d+) (\d+) (\d+)/);
    if (instruction) {
        if (!sample) {
            // Read test program
            testProgram.push(instruction.slice(1).map(e => parseInt(e)));
        }
        else {
            // Read samples
            sample.op = instruction.slice(1).map(e => parseInt(e));
        }
    }
}

let count = 0;
for (sample of samples) {
    let THRESHOLD = 3;
    if (testSample(sample.before, sample.op, sample.after) >= THRESHOLD) {
        count++;
    }
}

// console.log(samples.slice(-1));
// console.log('Samples that match 3 or more ops', count, samples.length);

// Star 2
const sampleAppliesToOp = ({ before, op: [opcode, a, b, c], after }, op) => {
    // Set register
    for (let i = 0; i < R.length; i++) {
        R[i] = before[i];
    }

    // Apply opcode
    op(a, b, c);

    // Does register after equal new state?
    let fits = true;
    for (let i = 0; i < R.length; i++) {
        fits = R[i] === after[i];
        
        if (!fits) break;
    }

    return fits;
};

// Group samples by OPCode
const samplesByOpcode = new Array(16).fill(0).map(() => []);
const candidates = new Array(16).fill(0).map(() => []);

for (sample of samples) {
    samplesByOpcode[sample.op[0]].push(sample);
}

for (op of OPCODES) {
    for (let opcode = 0; opcode < 16; opcode++) {
        // Test op on all samples for given opcode
        
        let allSamplesApply = true;
        for (sample of samplesByOpcode[opcode]) {
            if (!sampleAppliesToOp(sample, op)) {
                allSamplesApply = false;
                break;
            }
        }

        if (allSamplesApply) {
            // mark opcode as candidate for op
            candidates[opcode].push(op);
        }
    }
}

const normalize = (candidates) => {   
    let normalized = [];
    let singleOpsCandidates;

    while (
        (
            singleOpsCandidates = candidates.filter(ops => {
                return ops.length === 1 && !normalized.includes(ops[0]);
            })
        ).length > 0
    ) {
        let opToRemove = singleOpsCandidates[0][0];
        candidates = candidates.map(ops => ops.length === 1 ? ops :  ops.filter(op => op !== opToRemove));
        normalized.push(opToRemove);
    }
    return candidates.map(([u]) => u);
}

let opMap = normalize(candidates);

// Execute test program
R.fill(0);
console.log('Registers before', R);

for ([op, ...rest] of testProgram) { 
    opMap[op](...rest);
}

console.log('Registers after', R);




























