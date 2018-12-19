const fs = require('fs');

const inputFile = 'input.txt';
let input = fs.readFileSync(inputFile, 'utf8').split('\n');

const DIR_UP = 0;
const DIR_RIGHT = 1;
const DIR_DOWN = 2;
const DIR_LEFT = 3;

const STRAIGHT_HORIZONTAL = 5; // -
const STRAIGHT_VERTICAL = 6; // |
const CURVE_SLASH = 7; // /
const CURVE_BACKSLASH = 8; // \
const INTERSECTION = 9; // +

const BLANK = -1;

const STATE = {
    cartNonce: 0,
    grid: [],
    carts: [],
    tick: 0,
}


class Cart {
    constructor({x, y, direction, lastTick, lastTurn, id}) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.lastTick = lastTick;
        this.lastTurn = lastTurn;
        this.id = id;
    }

    turnAtIntersection() {
        this.lastTurn = (this.lastTurn + 1) % 3;
    }
}
       
const tileToCommand = tile => {
    switch (tile) {
        case '^': return DIR_UP;
        case '>': return DIR_RIGHT;
        case 'v': return DIR_DOWN;
        case '<': return DIR_LEFT;
        case '|': return STRAIGHT_VERTICAL;
        case '-': return STRAIGHT_HORIZONTAL;
        case '/': return CURVE_SLASH;
        case '\\': return CURVE_BACKSLASH;
        case '+': return INTERSECTION;
        default: return BLANK;
    }
}

STATE.grid = input.splice(0, input.length - 1).map(line => {
    let lineGrid = new Array(line.length).fill(BLANK);
    return line.split('').map(tile => tileToCommand(tile));
});

STATE.carts = [];
// Extract trains and replace with tracks
for (let y = 0; y < STATE.grid.length; y++) {
    for (let x = 0; x < STATE.grid[y].length; x++) {
        let tile = STATE.grid[y][x];
        if (tile === DIR_UP || tile === DIR_RIGHT || tile === DIR_DOWN || tile === DIR_LEFT) {
            STATE.cartNonce++;
            let newCart = new Cart({x, y, direction: tile, lastTick: -1, lastTurn: 0, id: STATE.cartNonce});
            STATE.carts.push(newCart);

            STATE.grid[y][x] = tile === DIR_UP || tile === DIR_DOWN ? STRAIGHT_VERTICAL : STRAIGHT_HORIZONTAL;
        }
    }
}

console.log(STATE.grid);
console.log(STATE.carts);

const getFirstCollision = () => {
    let positions = new Map();
    for (cart of STATE.carts) {
        let key = `${cart.x},${cart.y}`;
        if (positions.has(key)) {
            return key;
        }

        positions.set(key, true);
    }
    return false;
};

const clearCollisions = () => {
    let positions = new Map();
    for (cart of STATE.carts) {
        let key = `${cart.x},${cart.y}`;
        if (positions.has(key)) {
            // Clear collision
            STATE.carts = STATE.carts.filter(filterCart => {
                return filterCart.id !== cart.id && filterCart.id !== positions.get(key);
            });
            break;
        }
        positions.set(key, cart.id);
    }
}

const processTick = () => {
    STATE.tick++;
    STATE.carts = STATE.carts.sort((cartA, cartB) => {
        if (cartA.y === cartB.y) {
            return cartA.x - cartB.x;
        }
        return cartA.y - cartB.y;
    });

    for (cart of STATE.carts) {
        let nextX = cart.x;
        let nextY = cart.y;
        let newDirection = cart.direction;
        
        switch (cart.direction) {
            case DIR_UP:
                nextY--;
                break;
            case DIR_RIGHT:
                nextX++;
                break;
            case DIR_DOWN:
                nextY++;
                break;
            case DIR_LEFT:
                nextX--;
                break;
        }

        if (nextY < 0 || nextY >= STATE.grid.length || nextX < 0 || nextX >= STATE.grid[nextY].length) {
            // Invalid move
            console.log('Invalid move', nextX, nextY);
            continue;
        }

        let nextTile = STATE.grid[nextY][nextX];

        if (nextTile === BLANK) {
            // Invalid move
            console.log('Invalid move blank');
            continue;
        }

        switch (nextTile) {
            case CURVE_SLASH: {
                if (cart.direction === DIR_UP) {
                    newDirection = DIR_RIGHT;
                } else if (cart.direction === DIR_DOWN) {
                    newDirection = DIR_LEFT;
                } else if (cart.direction === DIR_RIGHT) {
                    newDirection = DIR_UP;
                } else {
                    newDirection = DIR_DOWN;
                }
                break;
            }
            case CURVE_BACKSLASH: {
                if (cart.direction === DIR_UP) {
                    newDirection = DIR_LEFT;
                } else if (cart.direction === DIR_DOWN) {
                    newDirection = DIR_RIGHT;
                } else if (cart.direction === DIR_RIGHT) {
                    newDirection = DIR_DOWN;
                } else {
                    newDirection = DIR_UP;
            }
                break;
            }    
            case INTERSECTION: {
                let delta = cart.lastTurn + 1;
                cart.turnAtIntersection();
                newDirection = (2 + cart.direction + delta) % 4;
                break;
            }
            case BLANK: {
                // Invalid move
                continue;
            }
        }

        cart.x = nextX;
        cart.y = nextY;
        cart.direction = newDirection;
        cart.lastTick = STATE.tick;

        
        clearCollisions()
        // if (getFirstCollision()) {
        //    console.log('Detected collision');
        //    return false;
        // }
    }

    console.log(STATE.carts);
}

let collision = false;

// while (!collision) {
//     processTick();
//     collision = getFirstCollision();
// }


// console.log('First collision', collision);

while (STATE.carts.length > 1) {
    processTick();
}

