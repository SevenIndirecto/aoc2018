const fs = require('fs');

const inputFile = process.argv[2] || 'input.txt';
let input = fs.readFileSync(inputFile, 'utf8').trim().split('\n');

class Unit {
    constructor(x, y) {
        this.startSquare = [y,x];
        this.y = y;
        this.x = x;
        this.hp = 200;
        this.attackPower = 3;
    }

    getTargetsInRange() {
        let targetSquares = [
            [this.y - 1, this.x], [this.y, this.x - 1], 
            [this.y, this.x + 1], [this.y + 1, this.x]
        ];
        
        let targets = [];        

        for (let [y,x] of targetSquares) {
            if (squareContainsAUnit([y, x], this.enemy)) {
                targets = [...targets, ...units.filter(u => u.y === y && u.x === x && u.isAlive())];
            }
        }

        return targets;
    }

    toString() {
        let out = `${this.isAlive() ? '[o]' : '[x]'} ${this.constructor.name}`;
        out += ` x: ${this.x} y: ${this.y}, hp: ${this.hp}, a: ${this.attackPower}`;

        return out;
    }

    getSquare() {
        return [this.y, this.x];
    }

    setSquare([y, x]) {
        this.x = x;
        this.y = y;
    }

    isAlive() {
        return this.hp > 0;
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
let units = [];

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

const squareContainsAUnit = ([y, x], unitType = false) => {
    for (unit of units) {
        if (unit.x === x && unit.y === y && unit.isAlive()) {
            if (unitType !== false ) {
                return unit.constructor.name === unitType;
            }
            return true;
        }
    }
    return false;
}

// Reset on each target square iteration when processing in 'processTurn()'
const checked = new Map();

const findShortestPathFromTo = ([ay, ax], [by, bx], depth) => {
    if (ay === by && ax === bx) {
        return [[ay,ax]];
    }

    if (ay < 0 || ax < 0) {         
        return false;
    }

    if (depth > 0 && (map[ay][ax] === '#' || squareContainsAUnit([ay, ax]))) {       
        return false;
    }

    let key = `${ay}-${ax}`;
    if (checked.has(key) && checked.get(key) <= depth) {
        return false;
    }
    checked.set(key, depth);

    let scanOrder = [[-1, 0], [0, -1], [0, 1], [1,0]];
    let shortestPath = false;

    for (delta of scanOrder) {
        let path = findShortestPathFromTo([ay + delta[0], ax + delta[1]], [by, bx], depth + 1);

        if (path !== false && (shortestPath === false || shortestPath.length > path.length)) {
            shortestPath = path;
        }
    }

    if (shortestPath !== false) {
        shortestPath.push([ay, ax]);
    }
    
    return shortestPath;
}

const drawMap = () => {
    for (let y = 0; y < map.length; y++) {
        let line = '';
        for (let x = 0; x < map[y].length; x++) {
            if (squareContainsAUnit([y, x], 'Elf')) {
                line += 'E';
            } else if (squareContainsAUnit([y, x], 'Goblin')) {
                line += 'G';
            } else {
                line += map[y][x];
            }
        }
        console.log(line);
    }
}

let turn = 0;
const processTurn = () => {
    turn++;
    console.log('START Processing turn', turn);

    for (let unitIndex = 0; unitIndex < units.length; unitIndex++) {        
        let unit = units[unitIndex];

        if (!unit.isAlive()) {
            continue;
        }
        
        // Identify all possible targets
        let squaresInRange = [];
        let enemy = unit.enemy;
        enemies = units.filter(target => target.constructor.name === enemy && target.isAlive());

        // Identify open squares in range of target, 1 square P/DOWN/LEFT/RIGHT of target
        let openSquares = [];
        enemies.forEach(enemy => {
            let x = enemy.x;
            let y = enemy.y;
            let squares = [[y-1,x], [y,x-1], [y,x+1], [y+1,x]];
            squares.forEach(([y,x]) => {
                if (y < 0 || x < 0) return false;

                if (!squareContainsAUnit([y, x]) 
                    && map[y][x] !== '#' 
                    && openSquares.filter(([sy,sx]) => sx === x && sy === y).length < 1) {
                    openSquares.push([y,x]);
                }
            });
        });

        // Move if no target in range
        if (unit.getTargetsInRange().length < 1) {
            let shortestPath = false;

            for (let target of openSquares) {
                checked.clear();
                let path = findShortestPathFromTo(unit.getSquare(), target, 0);
                if (path !== false && (shortestPath === false || path.length < shortestPath.length)) {
                    shortestPath = path;
                }
            }
            
            if (shortestPath !== false) {
                // Pop twice, since last element in path is itself;
                shortestPath.pop();            
                unit.setSquare(shortestPath.pop());
            }
        }

        let targets = unit.getTargetsInRange();
        if (targets.length > 0) {            
            let lowestHP = targets.reduce(
                (lowest, enemy) => {
                    if (lowest.hp < enemy.hp) {
                        return lowest;
                    } else if (lowest.hp === enemy.hp) {
                        if (lowest.y < enemy.y) {
                            return lowest;
                        } 
                        if (lowest.y === enemy.y && lowest.x < enemy.x) {
                            return lowest;
                        }
                        return enemy;
                    }
                    return enemy;                    
                },
                { hp: 201, x: 20000, y: 20000 }
            );

            lowestHP.hp -= unit.attackPower;
        }
    }

    units.sort((u1, u2) => {
        if (u1.y < u2.y || (u1.y === u2.y && u1.x < u2.x)) {
            return -1;
        }
        return 1;
    });
    console.log('END Processing turn', turn);
}

const groupWins = (group) => units.filter(u => u.enemy === group && u.isAlive()).length < 1;
const isAnElfDead = () => units.filter(u => u.constructor.name === 'Elf' && !u.isAlive()).length > 0;

let tested = [[3,false]];

const reset = (newAttackPower) => {
    turn = 0;
    console.log('Test power:', newAttackPower, tested);

    // New power has already been tested, end.
    if (tested.filter(([power]) => newAttackPower === power).length > 0) {
        // Get first
        console.log('Power has already been tested.');
        return false;
    }

    tested.push([newAttackPower, null]);

    for (u of units) {
        if (u.constructor.name === 'Elf') {
            u.attackPower = newAttackPower;
        }
        u.hp = 200;
        u.y = u.startSquare[0];
        u.x = u.startSquare[1];
    }

    return true;
}

// Start with testing 30
reset(30);
let lastTurn = 0;

while (true) {  
    processTurn();
    drawMap();
    
    for (unit of units) {
        console.log(unit.toString());
    }
    lastTurn = turn;

    if (groupWins('Elf')) {
        // Mask as victorious
        tested[tested.length - 1][1] = true;
        // Try to lower power
        let current = tested[tested.length - 1][0];
        let highestLower = tested.reduce((acc, test) => {
            if (!acc[0]) {
                return test; 
            }
            if (test[0] < acc[0]) {
                return test;
            }
            return acc;
        }, [false, false])[0];
       
        let newPower = Math.ceil((current + highestLower) / 2);        
    
        if(!reset(newPower)) break;
    }

    if (isAnElfDead()) {
        // Mark as fail
        tested[tested.length - 1][1] = false;
        let current = tested[tested.length - 1][0];
        
        // Get lowest higher
        let lowestHigher = tested
            .filter(([power, elvesWin]) => power > current && elvesWin)
            .reduce((acc, [power]) => power < acc ? power : acc, 205);
        
        let newPower;
        // Has won before
        if (lowestHigher < 205) {
            newPower = Math.ceil((current + lowestHigher) / 2);
        } else {
            newPower = current + 5;
        }       

        if(!reset(newPower)) break;
    }
}

let lowestWinning = tested.reduce((acc, test) => {
    if (!acc[1]) {
        return test;
    }
    if (test[1] && test[0] < acc[0]) {
        return test;
    }
    return acc;
}, [false, false]);

let totalHP = units.filter(u => u.isAlive()).reduce((sum, u) => u.hp + sum, 0);
console.log('Outcome: ', (lastTurn - 1) * totalHP, 'Total HP', totalHP);
console.log('Winners: ', groupWins('Elf') ? 'Elves' : 'Goblins');
console.log('Lowest winning power: ', lowestWinning, tested);

