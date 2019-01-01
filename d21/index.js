const fs = require('fs');

const inputFile = process.argv[2] || 'input.txt';
let input = fs.readFileSync(inputFile, 'utf8').trim().split('\n');

// Registers
const R = new Array(6).fill(0);
let ip = 0;
let ipRegister = -1;
let program = [];

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

const instructions = {
    addr, addi,
    mulr, muli,
    banr, bani,
    borr, bori,
    setr, seti,
    gtir, gtri, gtrr,
    eqir, eqri, eqrr,
};

const readProgram = () => {
    program = [];

    for (line of input) {
        let data = line.trim().split(' ');
        
        if (data.length === 2) {
            // Assume this is the #ip 0 pragma
            ipRegister = data[1];
        } else {
            program.push([data[0], instructions[data[0]], ...data.slice(1).map(Number)]);
        }
    }
};

let registerFiveMap = new Map();
let lastNonDuplicte = false;
let sinceLastDup = 0;
let part1 = false;
const CHANGE_THRESHOLD = 10000;

const executeNext = () => {
    if (!program[ip]) {
        console.log('HALT');
        return false;
    }

    if (ip === 28) {
        if (!part1) {
            part1 = R[5];
        }
        // Check if R3 masked has already been tested
        if (registerFiveMap.has(R[5])) {
            sinceLastDup++;
            registerFiveMap.set(R[5], registerFiveMap.get(R[5]) + 1);
            
            if (sinceLastDup > CHANGE_THRESHOLD) {
                R[0] = lastNonDuplicte;
            }
        } else {
            registerFiveMap.set(R[5], 1);
            lastNonDuplicte = R[5];
            sinceLastDup = 0;
        }
    }
    
    if (ip === 18) {
        // console.log('Speed up bitwise shift');
        R[3] = R[3] >> 8;
        ip = R[ipRegister] = 8; 
    }

    // Set IP REGISTER to current IP
    R[ipRegister] = ip;
    let out = `ip=${ip}`;

    // Execute instruction
    out += ` [${R.join(', ')}] ${program[ip][0]} ${program[ip].slice(2).join(' ')}`;
    program[ip][1](program[ip][2], program[ip][3], program[ip][4]);
    out += ` [${R.join(', ')}]`;
    
    // Set IP to value of IP REGISTER
    ip = R[ipRegister];
    
    // IP += 1:
    ip++;
    // console.log(out);
    return true;
};

readProgram();
console.log(program, ipRegister);

let goal = false;
let goalRepeat = 0;

while (executeNext());

console.log(R, 'Part 1', part1, 'Part 2', R[0]);
