const DEPTH = parseInt(process.argv[2]) || 11820;
const TARGET = (process.argv[3] || '7,782').split(',').map(Number);
const MOUTH = [0,0];

const ROCKY = 0;
const WET = 1;
const NARROW = 2;

const NONE = 0;
const TORCH = 1;
const CLIMB = 2;

class Region {
    constructor(x, y, geo) {
        this.x = x;
        this.y = y;
        this.geo = geo;
        this.min = Number.MAX_SAFE_INTEGER;
    }

    get ero() {
        return (this.geo + DEPTH) % 20183;
    }

    get type() {
        return this.ero % 3;
    }
    
    toString() {
        if (this.x === currentPos[0] && this.y === currentPos[1]) {
            return 'X';
        }
        if (this.x === MOUTH[0] && this.y === MOUTH[1]) {
            return 'M';
        }
        if (this.x === TARGET[0] && this.y === TARGET[1]) {
            return 'T';
        }
        switch (this.type) {
            case ROCKY: return '.';
            case WET: return '=';
            case NARROW: return '|';
        }
    }
}

const map = new Map();
const hash = (x, y, gear = 0) => x * 10 * 10000 + y * 10 + gear;

const geo = ([x,y]) => {
    if ((x + y === 0) || (x === TARGET[0] && y === TARGET[1])) return 0;
    if (y === 0) return 16807 * x;
    if (x === 0) return 48271 * y;
    return map.get(hash(x - 1, y)) * map.get(hash(x, y - 1));
};


let width = TARGET[0] + 1 + 50;
let height = TARGET[1] + 1 + 5;

for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
        map.set(hash(x, y), (geo([x, y]) + DEPTH) % 20183);
    }
}

for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
        // Set terrain type
        map.set(hash(x, y), map.get(hash(x, y)) % 3);
    }
}

let gear = TORCH;
let root = [0, 0, 0, gear];
let stack = [root];
let adjecant = [[0, -1], [1, 0], [0, 1], [-1, 0]];

let costMap = new Map();

let count = 0;

while (stack.length > 0) {
    let [minCost, x, y, gear] = stack.shift();

    let bestCost = costMap.get(hash(x, y, gear)) || Number.MAX_SAFE_INTEGER;

    if (bestCost <= minCost) {
        continue;
    }

    if (x === TARGET[0] && y === TARGET[1] && gear === TORCH) {
        console.log('Lowest time', minCost);
        return;
    }

    costMap.set(hash(x, y, gear), minCost);

    // Set new best case for gear if required
    for (let i = 0; i < 3; i++) {
        // Skip invalid combinations Gear === Type
        if (i !== gear && i !== map.get(hash(x, y))) {
            let bestCostForGear = costMap.get(hash(x, y, i)) || Number.MAX_SAFE_INTEGER;
            if (bestCostForGear > minCost + 7) {
                stack.push([minCost + 7, x, y, i]);
            }
        }
    }

    // Check adjecant
    for (let [dx, dy] of adjecant) {
        if (x + dx < 0 || y + dy < 0 || x + dx >= width || y + dy >= height) {
            continue;
        }

        if (gear === map.get(hash(x + dx, y + dy))) {
            // Skip invalid
            continue;
        }
        
        let bestCostForRegion = costMap.get(hash(x + dx, y + dy, gear)) || Number.MAX_SAFE_INTEGER;

        if (bestCostForRegion > minCost + 1) {
            stack.push([minCost + 1, x + dx, y + dy, gear]);
        }
    }

    stack.sort((a, b) => {
        let [minA, , ,] = a;
        let [minB, , ,] = b;
        return minA - minB;
    });

    let temp = new Map();
    for (let [min, x, y, t] of stack) {
        if (!temp.get(hash(x, y, t))) {
            temp.set(hash(x, y, t), min);
        }
    }

    stack = []
    for (let [key, v] of [...temp.entries()]) {
        let t = key % 10;
        key = Math.floor(key / 10);
        let y = key % 10000;
        let x = Math.floor(key / 10000);
        stack.push([v, x, y, t])
    }
}

