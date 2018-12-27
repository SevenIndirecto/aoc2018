const fs = require('fs');
const inputFile = process.argv[2] || 'input.txt';
let input = fs.readFileSync(inputFile, 'utf8').trim().split('\n');

let state = {
    map: [],
    minute: 0,
};

const OPEN = '.';
const TREES = '|';
const LUMBERYARD = '#';

state.map = input.map(row => row.split(''));

const threeAdjecantOfType = ([x,y], type) => {
    let openCount = 0;
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) {
                continue;
            }

            if (state.map[y + dy] && state.map[y + dy][x + dx] === type) {
                openCount++;
            }
        }
    }
    
    return openCount >= 3;
}

const remainLumberyard = ([x,y]) => {
    let hasAdjecantLumberyard = false;
    let hasAdjecantTrees = false;

    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {            
            if (dx === 0 && dy === 0) {
                continue;
            }

            let checkY = y + dy;
            let checkX = x + dx;

            if (state.map[checkY] && state.map[checkY][checkX] === LUMBERYARD) {
                hasAdjecantLumberyard = true;
            }
            if (state.map[checkY] && state.map[checkY][checkX] === TREES) {
                hasAdjecantTrees = true;
            }
        }
    }
    
    return hasAdjecantTrees && hasAdjecantLumberyard;
}

const tick = (part2 = false) => {
    state.minute++;
    let newMap = state.map.map(row => [...row]);

    for (let y = 0; y < state.map.length; y++) {
        for (let x = 0; x < state.map[y].length; x++) {
            switch (state.map[y][x]) {
                case OPEN:
                    if (threeAdjecantOfType([x,y], TREES)) {
                        newMap[y][x] = TREES;
                    }
                    break;
                case TREES:
                    if (threeAdjecantOfType([x,y], LUMBERYARD)) {
                        newMap[y][x] = LUMBERYARD;
                    }
                    break;

                case LUMBERYARD:
                    if (!remainLumberyard([x,y])) {
                        newMap[y][x] = OPEN;
                    }
                    break;
            }
        }
    }

    state.map = newMap;
}

const drawMap = () => {
    for (let line of state.map) {
        console.log(line.join(''));
    }
}

while (state.minute < 10) {
    tick();
}

const countByType = type => state.map.reduce((sum, row) => sum + row.filter(acre => acre === type).length, 0);
const checksum = () => countByType(LUMBERYARD) * countByType(TREES);
console.log('Part 1 Lumberyards', countByType(LUMBERYARD), 'Wooded', countByType(TREES), 'Checksum', checksum());

// Part 2
// reset
state.map = input.map(row => row.split(''));
state.minute = 0;
state.patterns = new Map();

const mapsEqual = (stateA, stateB) => {
    for (let y = 0; y < stateA.length; y++) {
        for (let x = 0; x < stateA[y].length; x++) {
            if (stateA[y][x] !== stateB[y][x]) {
                return false;
            }
        }
    }
    return true;
};

while (true) {
    tick();

    if (state.minute > 5000) {
        let periods = Array.from(state.patterns.entries()).filter(
            ([, periods]) => periods.filter(period => period.last > 2000).length > 0
        );

        for ([testCheck, testPeriods] of periods) {
            for (period of testPeriods) {
                if ((1e9 - period.start) % period.period === 0) {
                    console.log('Part 2 Checksum: ', testCheck);
                }
            }
        }

        break;
    }

    let check = checksum();
    if (state.patterns.has(check)) {
        let patterns = state.patterns.get(check);
        let fits = false;

        for ( pattern of patterns ) {
            if (pattern.period) {
                // Does current occurence fit with this period?
                if ((state.minute - pattern.start) % pattern.period === 0) {
                    // Yes
                    fits = true;
                    pattern.last = state.minute;
                    break;
                }
            } else {                
                pattern.period = state.minute - pattern.start;
                pattern.last = state.minute;
                fits = true;
            }
        }

        if (!fits) {
            state.patterns.set(check, [...patterns, {
                start: state.minute,
                last: state.minute,
                period: false,
            }]);
        }
    }
    else {
        state.patterns.set(check, [{ start: state.minute, period: false, last: state.minute }]);
    }
}
