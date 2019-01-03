const DEPTH = parseInt(process.argv[2]) || 11820;
const TARGET = (process.argv[3] || '7,782').split(',').map(Number);
const MOUTH = [0,0];

const ROCKY = 0;
const WET = 1;
const NARROW = 2;

const NONE = 0;
const TORCH = 1;
const CLIMB = 2;

let currentPos = [0, 0];

class Region {
    constructor(x, y, geo) {
        this.x = x;
        this.y = y;
        this.geo = geo;
        this.cheapestCost = Number.MAX_SAFE_INTEGER;
        this.minRunningCost = Number.MAX_SAFE_INTEGER;
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

const map = [];

const geo = ([x,y]) => {
    if ((x === 0 && y === 0) || (x === TARGET[0] && y === TARGET[1])) return 0;
    if (y === 0) return 16807 * x;
    if (x === 0) return 48271 * y;
    return map[y][x - 1].ero * map[y - 1][x].ero;
};

// Build map
let deltaY = TARGET[1] - MOUTH[1];
let deltaX = TARGET[0] - MOUTH[0];

for (let y = 0; y <= deltaY; y++) {
    map.push(new Array(deltaX + 1));

    for (let x = 0; x <= deltaX; x++) {
        map[y][x] = new Region(x, y, geo([x,y]));        
    }
}

map[0][0].cheapestCost = 0;

const drawMap = () => {
    for (let y = 0; y < map.length; y++) {
        console.log(map[y].join(''));
    }
};

const riskLevel = () => {
  return map.reduce((sum, row) => sum + row.reduce((sumRow, r) => sumRow + r.type, 0), 0);  
};

// console.log(TARGET, DEPTH, riskLevel());

const getGearAfterMove = (currentGear, typeFrom, typeTo) => {
    if (typeFrom === typeTo) return currentGear;

    switch (typeTo) {
        case ROCKY: return currentGear === NONE ? (typeFrom === WET ? CLIMB : TORCH) : currentGear;
        case WET: return currentGear === TORCH ? (typeFrom === NARROW ? NONE : CLIMB) : currentGear;
        case NARROW: return currentGear === CLIMB ? (typeFrom === ROCKY ? TORCH: NONE) : currentGear;
    }
}

const costToAdjecant = (currentGear, [fromX, fromY], [toX, toY]) => {
    // If adjecant does not exist, create it
    if (toY >= map.length) {
        map.push([]);
    }

    if (toX >= map[toY].length) {
        for (let y = 0; y < map.length; y++) {
            for (let x = map[y].length; x <= toX; x++) {
                map[y].push(new Region(x, y, geo([x, y])));
            }
        }
    }

    let typeFrom = map[fromY][fromX].type;
    let typeTo = map[toY][toX].type;
    let gearAfterMove = getGearAfterMove(currentGear, typeFrom, typeTo);
    
    return gearAfterMove === currentGear ? 1 : 8;
}

const minCostToTarget = ([fromX, fromY]) => {
    return Math.abs(TARGET[0] - fromX) + Math.abs(TARGET[1] - fromY);
}

const gearToString = (gear) => gear !== TORCH ? gear !== CLIMB ? 'None' : 'Climb' : 'Torch';

let currentMinCost = Number.MAX_SAFE_INTEGER;

const pathFrom = (gear, runningCost, [x,y], path) => {
    currentPos = [x, y];
    path.push([x,y, gearToString(gear)]);

    if (runningCost >= map[y][x].minRunningCost) {
        return Number.MAX_SAFE_INTEGER;
    }
    if (runningCost + (gear === TORCH ? 0 : 7) > currentMinCost) {
        return Number.MAX_SAFE_INTEGER;
    }


    if (x === TARGET[0] && y === TARGET[1]) {
        let cost = runningCost + (gear === TORCH ? 0 : 7);
        console.log('TARGET HIT at cost', cost, 'currentMin', currentMinCost);
        
        if (map[y][x].cheapestCost > cost) {
            
            map[y][x].cheapestCost = cost;
            map[y][x].path = [...path];
            map[y][x].minRunningCost = cost;
            currentMinCost = cost;
        }

        return cost;
    }

    if (map[y][x].minRunningCost > runningCost) {
        map[y][x].minRunningCost = runningCost;
    }
    
    let currentMaxCostToTarget = 8 * minCostToTarget([x, y]) + 7;
    let adjecant = [[x, y - 1], [x + 1, y], [x, y + 1], [x - 1, y]];
  
    // Remove out of bounds left / top
    adjecant = adjecant.filter(([dx, dy]) => dx >= 0 & dy >= 0);
  
    // Remove unusable regions due to cost contraints
    adjecant = adjecant.filter(([dx, dy]) => {
        let costTo = costToAdjecant(gear, [x, y], [dx, dy]);
        return costTo === 1 || minCostToTarget([dx, dy]) < minCostToTarget([x, y]);
    });

    // Filter out paths already visited with shorter path
    adjecant = adjecant.filter(([dx, dy]) => {
        if (!map[dy] || !map[dy][dx]) {
            return true;
        }

        return map[dy][dx].minRunningCost > runningCost;
    });

    // Sort adjecant regions by cost to move
    adjecant.sort(([xa, ya], [xb, yb]) => {
        // Prioritize target - TODO: ?
        if (xa === TARGET[0] && ya === TARGET[1]) {
            return -1;
        }
        if (xb === TARGET[0] && yb === TARGET[1]) {
            return 1;
        }

        let costA = costToAdjecant(gear, [x, y], [xa, ya]) + minCostToTarget([xa, ya]);
        let costB = costToAdjecant(gear, [x, y], [xb, yb]) + minCostToTarget([xb, yb]);

        return costA - costB;
    });

    let cheapestCost = Number.MAX_SAFE_INTEGER;
    let cheapestTarget = false;

    // Try to move to each adjecant
    for (let [nextX, nextY] of adjecant) {
        let costToMove = costToAdjecant(gear, [x, y], [nextX, nextY]);

        let newGear = getGearAfterMove(gear, map[y][x].type, map[nextY][nextX].type);
    
        if (currentMinCost < runningCost) {
            break;
        }

        let cost = pathFrom(newGear, runningCost + costToMove, [nextX, nextY], [...path]);
        
        if (cost < cheapestCost) {
            cheapestCost = cost;
            cheapestTarget = [nextX, nextY];
        }
    }

    let [cx, cy] = cheapestTarget || [-1,-1];
    
    if (cheapestTarget && map[cy][cx].cheapestCost > runningCost + cheapestCost) {
        map[cy][cx].cheapestCost = runningCost + cheapestCost;
    }

    return cheapestCost;
};

// Start with Torch
let shortestPath = pathFrom(TORCH, 0, [0, 0], []);
// console.log(map);
console.log('Shortest path: ', shortestPath, 'cur min cost',  currentMinCost);
console.log('Target', map[TARGET[1]][TARGET[0]]);
