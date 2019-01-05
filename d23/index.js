const fs = require('fs');

const inputFile = process.argv[2] || 'input.txt';
let input = fs.readFileSync(inputFile, 'utf8').trim().split('\n');
let bots = [];

for (line of input) {
    [all, x, y, z, r] = line.match(/<(-?\d+),(-?\d+),(-?\d+)>, r=(\d+)/).map(Number);
    bots.push([x, y, z, r]);
}

bots.sort((botA, botB) => botB[3] - botA[3]);
let strongestBot = bots[0];

const distance = ([ax, ay, az], [bx, by, bz]) => {
    return Math.abs(ax - bx) + Math.abs(ay - by) + Math.abs(az - bz);
}

let botsInRange = bots.filter(bot => distance(bot, strongestBot) <= strongestBot[3]);
console.log('Bots In range of strongest: ', botsInRange.length);

// Part 2
let [min, max] = bots.reduce(
    ([[minX, minY, minZ], [maxX, maxY, maxZ]], [x, y, z]) => 
        [[minX > x ? x : minX, minY > y ? y : minY, minZ > z ? z : minZ],
        [maxX < x ? x : maxX, maxY < y ? y : maxY, maxY < y ? y : maxY]]
, 
[
    [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
    [Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]
]);

let gridSize = Math.abs(max[0] - min[0]);
let best = null;

while (gridSize > 0) {
    let countMax = 0;
    
    for (let x = min[0]; x <= max[0]; x += gridSize) {
        for (let y = min[1]; y <= max[1]; y += gridSize) {
            for (let z = min [2]; z <= max[2]; z += gridSize) {
                let count = 0;
                for (let [bx, by, bz, r] of bots) {
                    count += distance([x, y, z], [bx, by, bz]) <= r ? 1 : 0;
                }
                
                if (count > countMax) {
                    countMax = count;
                    best = [x, y, z];
                } else if (count === countMax) {
                    if (!best || distance([0, 0, 0], [x, y, z]) < distance([0, 0, 0], best)) {
                        best = [x, y, z];
                    }
                }
            }
        }
    }
    
    for (let i = 0; i < 3; i++) {
        min[i] = best[i] - gridSize;
        max[i] = best[i] + gridSize;
    }

    gridSize = Math.floor(gridSize / 2);
}

console.log('Distance to best pos', distance([0, 0, 0], best), best);
