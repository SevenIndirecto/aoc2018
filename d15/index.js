const fs = require('fs');

const inputFile = 'input-test2.txt';
let input = fs.readFileSync(inputFile, 'utf8').trim().split('\n');

class Unit {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    getTargetInRange() {
        let targetSquares = [
            [this.y - 1, this.x], [this.y, this.x - 1], 
            [this.y, this.x + 1], [this.y + 1, this.x]
        ];
        
        for (let [y,x] of targetSquares) {
            console.log('blah', y, x, this.enemy);
            if (squareContainsAUnit(x, y, this.enemy)) {
                return [y,x];
            }
        }

        return false;
    }
}
class Elf extends Unit {
    constructor(x,y) {
        super(x,y);
        this.enemy = 'Goblin';
    }
}
class Goblin extends Unit {
    constructor(x,y) {
        super(x,y);
        this.enemy = 'Elf';
    }
}

const map = [];
const units = [];

// Read map
for (let y = 0; y < input.length; y++) {
    let line = input[y].split('');
    map.push(line);

    for (let x = 0; x < line.length; x++) {
        if (line[x] === 'G') {
            units.push(new Goblin(x,y));
            map[y][x] = '.';
        } else if (line[x] === 'E') {
            units.push(new Elf(x,y));
            map[y][x] = '.';
        } else {
            map[y][x] = line[x];
        }
    }
}

const squareContainsAUnit = (x, y, unitType = false) => {
    for (unit of units) {
        if (unit.x === x && unit.y === y) {
            if (unitType !== false ) {
                return unit.constructor.name === unitType;
            }
            return true;
        }
    }
    return false;
}

let checkedSquares = [];

const getPathLengthToSquare = ([sy, sx], [ty, tx], depth, shortestPath = false) => {
    if (shortestPath !== false && depth >= shortestPath) {
        console.log('Depth charge triggered');
        return false;
    }
    console.log(depth, 'Check path from ', sy, sx, 'to', ty, tx);
    if (checkedSquares.filter(([cy, cx]) => cy === sy && cx === sx).length > 0) {
        console.log(depth, 'Checked square');
        return false;
    }

    checkedSquares.push([sy, sx]);

    // Hit
    if (sy === ty && sx === tx) {
        console.log(depth, 'HIT');
        return 0;
    }

    // Is illegal move?
    if (squareContainsAUnit(sx, sy) || map[sy][sx] === '#') {
        console.log(depth, 'Illegal move');
        return false;
    }
    
    // Get possible moves
    let moves = [[sy - 1, sx], [sy, sx - 1], [sy, sx + 1], [sy + 1, sx]];
    
    let pathLength = false;
    for ([my, mx] of moves) {
        let movePathLength = getPathLengthToSquare([my, mx], [ty, tx], depth + 1, pathLength);
        if (movePathLength === 0) {
            console.log(depth, 'Path Return 1');
            return 1;
        }

        if (movePathLength === false) {
            continue;
        }
        
        if (pathLength === false || movePathLength < pathLength) {
            pathLength = movePathLength;
        }
    }
    // console.log('Checked squares', checkedSquares);
    console.log(depth, 'Return path', pathLength);

    return pathLength === false ? false : pathLength + 1;
}

const drawMap = () => {
    for (let y = 0; y < map.length; y++) {
        let line = '';
        for (let x = 0; x < map[y].length; x++) {
            if (squareContainsAUnit(x, y, 'Elf')) {
                line += 'E';
            } else if (squareContainsAUnit(x, y, 'Goblin')) {
                line += 'G';
            } else {
                line += map[y][x];
            }
        }
        console.log(line);
    }
}

const processTurn = () => {

    for (let unitIndex = 0; unitIndex < units.length; unitIndex++) {
        let unit = units[unitIndex];
        drawMap();
        console.log('Processing unit: ', unit);
        
        // Identify all possible targets
        let squaresInRange = [];
        let enemy = unit.enemy;
        enemies = units.filter(target => target.constructor.name === enemy);

        // Identify open squares in range of target, 1 square P/DOWN/LEFT/RIGHT of target
        let openSquares = [];
        enemies.forEach(enemy => {
            let x = enemy.x;
            let y = enemy.y;
            console.log(enemy); 
            let squares = [[y-1,x], [y,x-1], [y,x+1], [y+1,x]];
            squares.forEach(([y,x]) => {
                if (y < 0 || x < 0) return false;

                if (!squareContainsAUnit(x, y) 
                    && map[y][x] !== '#' 
                    && openSquares.filter(([sy,sx]) => sx === x && sy === y).length < 1) {
                    openSquares.push([y,x]);
                }
            });
        });

        // Is in range of a target?
        let target = unit.getTargetInRange();
        if (target) {
           console.log('TARGET IN RANGE');
           continue;
           // TODO: Attack target
           // console.log('Target in range', target);          
        }

        let moves = [
            [unit.y - 1, unit.x], [unit.y, unit.x - 1], 
            [unit.y, unit.x + 1], [unit.y + 1, unit.x]
        ];

        
        let totalShortestMove = false;
        let totalShortestMoveIndex = -1;

        for (targetSquare of openSquares) {
            let shortestMove = false;            
            let shortestMoveIndex = -1;

console.log('Target square', targetSquare);

            let move = getPathLengthToSquare([unit.y, unit.x], targetSquare, 0, totalShortestMove);
            
            if (move !== false && (totalShortestMove === false || move < totalShortestMove) {
                totalShortestMove = move;
            }
            
            continue;
            // Move to target
            let i = 0;
            for ([my, mx] of moves) {
                checkedSquares = [];
                if (my < 0 || mx < 0) {
                    continue;
                }

                let move = getPathLengthToSquare([my, mx], targetSquare, 0);
                console.log('Move', move);
                if (move !== false) {
                    move++;
                }
                console.log('Actual move', move);
                if ((shortestMove === false && move !== false) 
                    || (move !== false && move < shortestMove)) {
                    shortestMove = move;
                    shortestMoveIndex = i;
                }
    
                i++;
            }
            
            if (shortestMove !== false) {
                shortestMove +=1;
            }


            if (shortestMove !== false 
                && (totalShortestMove === false || shortestMove < totalShortestMove)) {

                totalShortestMove = shortestMove;
                totalShortestMoveIndex = shortestMoveIndex;
            }
        }

        console.log('Unit pre move:', unit, totalShortestMove);
        if (totalShortestMove) { 
                unit.y = moves[totalShortestMoveIndex][0];            
                unit.x = moves[totalShortestMoveIndex][1];  
        }
        console.log('Unit post move: ', unit, totalShortestMove);
    };
}

drawMap();
processTurn();
drawMap();
// processTurn();
// drawMap();
