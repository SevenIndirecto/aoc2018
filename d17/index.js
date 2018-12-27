const fs = require('fs');
console.time('Day17');
const inputFile = process.argv[2] || 'input.txt';
let input = fs.readFileSync(inputFile, 'utf8').trim().split('\n');

// [[x,y]]
let blocks = [];
let minMax = { minX: Number.MAX_SAFE_INTEGER, maxX: Number.MIN_SAFE_INTEGER, minY: Number.MAX_SAFE_INTEGER, maxY: Number.MIN_SAFE_INTEGER };

const SAND = 0;
const SPRING = 1;
const WATER = 2;
const WET_SAND = 3;
const CLAY = 4;
const TOUCHED = 5;

for (vein of input) {
    let [all, baseAxis, baseOffset, veinAxis, veinFrom, veinTo] = vein.match(/([xy])=(\d+), ([xy])=(\d+)..(\d+)/);
    veinFrom = Number(veinFrom);
    veinTo = Number(veinTo);
    baseOffset = Number(baseOffset);

    if (veinAxis === 'x') {        
        for (let x = veinFrom; x <= veinTo; x++) {
            blocks.push([x, baseOffset]);
        }
    } else {
        for (let y = veinFrom; y <= veinTo; y++) {
            blocks.push([baseOffset, y]);
       }
    }
}

minMax = blocks.reduce((acc, block) => {
    return {
        minX: Math.min(acc.minX, block[0]),
        maxX: Math.max(acc.maxX, block[0]),
        minY: Math.min(acc.minY, block[1]),
        maxY: Math.max(acc.maxY, block[1]),
    }

}, minMax);

// Create map
const map = [];
for (let y = 0; y <= minMax.maxY; y++) {
    map.push(new Array(minMax.maxX - minMax.minX + 3).fill(SAND));
}

for ([x,y] of blocks) {
    // +1 for gutter
    map[y][x - minMax.minX + 1] = CLAY;
}

// Add spring of water
const springSquareX = 500 - minMax.minX + 1;
map[0][springSquareX] = SPRING;

let bottomHitCount = 0;

const drawMap = () => {
    let y = 0;
    for (row of map) {
        let line = '';
        for (square of row) {
            switch (square) {
                case CLAY:
                    line += '#';
                    break;
                case SPRING:
                    line += '*';
                    break;
                case WATER: 
                    line += '~';
                    break;
                case WET_SAND:
                    line += '|';
                    break;
                case SAND:
                    line += '.';
                    break;
                default:
                    line += '!';
            }
        }
        console.log(line + y);
        y++;
    }
    console.log('');
}

const SPRING_SQUARE = [springSquareX, 0];
const isBarrier = ([x, y]) => map[y][x] === CLAY || map[y][x] === WATER;
const dirtyCount = () => map.reduce((sum, row) => sum + row.filter(s => s === WATER || s === WET_SAND || s === TOUCHED).length, (minMax.minY - 1) * -1);
let previousDirtyCount = 0;

const fillBatch = ([sx, sy], caller) => {
    let x = sx;
    let y = sy;
   
    // Find vertical barrier
    while (y < minMax.maxY && !isBarrier([x, y + 1])) {
        y++;
        map[y][x] = WET_SAND;
    }

    if (y >= minMax.maxY) {
        let count = dirtyCount();
        if (previousDirtyCount === count) {
            console.log('Part 1:', dirtyCount());
            console.log('Part 2:', map.reduce((sum, row) => sum + row.filter(s => s === WATER).length, 0));
            console.timeEnd('Day17');
            process.exit();
        }

        previousDirtyCount = count;
        return true;
    }
    
    let fillLevel = true;
    let hitBottom = false;

    // check left for horizontal barrier
    let xCenter = x;
    while (x > -1) {
        map[y][x] = TOUCHED;

        if (!isBarrier([x, y + 1])) {
            hitBottom = fillBatch([x, y], [sx, sy]);
            fillLevel = false;
            break;
        }
        if (isBarrier([x - 1, y])) {
            break;
        }
        x--;
    }

    x = xCenter;
    // check right
    while (x < minMax.maxX) {
        if (x !== xCenter) {
            map[y][x] = TOUCHED;
        }

        if (!isBarrier([x, y + 1])) {
            hitBottom = fillBatch([x, y], [sx, sy]) || hitBottom;
            fillLevel = false;
            break;
        }
        if (isBarrier([x + 1, y])) {
            // Hit wall right
            break;
        }
        x++;
    }

    for (let dx = 0; dx < map[y].length - 1; dx++) {        
        if (map[y][dx] === TOUCHED) {
            map[y][dx] = fillLevel ? WATER : WET_SAND;
        }
    }

    return hitBottom;
}

let hitBottom = false;

while (!hitBottom) {
    hitBottom = fillBatch(SPRING_SQUARE);
}

