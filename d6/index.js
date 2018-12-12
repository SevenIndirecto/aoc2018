const fs = require('fs');

const input = 'input.txt';
let points = fs.readFileSync(input, 'utf8').trim().split('\n');
points = points.map(point => point.split(', ').map(u => parseInt(u)));

// const points = [[1,1],[1,6],[8,3],[3,4],[5,5],[8,9]];

let maxX = points.reduce((maxX, [x,]) => x > maxX ? x : maxX, 0);
let maxY = points.reduce((maxY, [,y]) => y > maxY ? y : maxY, 0);
console.log('Max X:', maxX, 'Max Y:', maxY);

const getDistance = (p1, p2) => {
    return Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1]);
}
const getClosestPoint = (searchPoint) => {
    let minDistance = false;
    let minId = false;
    let id = 0;
    for (point of points) {
        let distance = getDistance(searchPoint, point);
        
        if (distance === 0) {
            return id;
        }
        if (minDistance === false) {
            minDistance = distance;
            minId = id;
        }
        else if (distance === minDistance) {
            minId = -1;
        }
        else if (distance < minDistance) {
            minId = id;
            minDistance = distance;
        }

        id++;
    }
    return minId;
}

const grid = new Array(maxY + 1);

for (let y = 0; y < maxY + 1; y++) {
    grid[y] = new Array(maxX + 1);

    for (let x = 0; x < maxX + 1; x++) {
        grid[y][x] = getClosestPoint([x,y]);
    }
}

const getInfiniteIds = grid => {
    let infinitePoints = new Set();

    let horizontalEdges = [0, grid.length - 1];
    for (y of horizontalEdges) {
        for (let x = 0; x < grid[y].length; x++) {
            infinitePoints.add(grid[y][x]);
        }
    }

    for (let y = 1; y < grid.length - 1; y++) {
        infinitePoints.add(grid[y][0]);
        infinitePoints.add(grid[y][grid[y].length - 1]);
    }

    infinitePoints.delete(-1);
    return infinitePoints;
}

let infinites = getInfiniteIds(grid);

// Count each point
const finitePoints = new Map();

for (let y = 1; y < grid.length - 1; y++) {
    for (let x = 1; x < grid[y].length - 1; x++) {
        let point = grid[y][x];
        if (infinites.has(point) || point < 0) {
            continue;
        }

        if (finitePoints.has(point)) {
            finitePoints.set(point, finitePoints.get(point) + 1);
        } else {
            finitePoints.set(point, 1);
        }
    }
}

console.log(finitePoints);

const maxArea = Array.from(finitePoints.values()).reduce(
    (max, count) => count > max ? count : max, 
    0
);
console.log('Max Area:', maxArea);

// STAR 2 
const MAX_DISTANCE = 1e4;

let regionSize = 0;

const isSumDistanceInRange = (checkPoint, range) => {
    let sum = 0;

    for (point of points) {
        sum += getDistance(checkPoint, point);
        
        if (sum >= range) {
            return false;
        }
    }
    return sum < range;
}

for(let x = 0; x < maxX; x++) {
    for(let y = 0; y <= maxY; y++) {
        if (isSumDistanceInRange([x,y], MAX_DISTANCE)) {
            regionSize++;
        }
    }
}

console.log('Start 2 region size:', regionSize);
