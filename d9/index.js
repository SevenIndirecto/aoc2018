const fs = require('fs');

const inputFile = 'input.txt';
let input = fs.readFileSync(inputFile, 'utf8').trim();
let matches = input.match(/(\d+) players; last marble is worth (\d+) points/);
const NUM_PLAYERS = parseInt(matches[1]);
const LAST_MARBLE = parseInt(matches[2]) * 100;

const players = new Array(NUM_PLAYERS).fill(0);
console.log('Players', NUM_PLAYERS, 'Last marble', LAST_MARBLE);

// CW - Clockwise
// CCW - Counter Clockwise
class Marble {
    constructor(id, cw, ccw) {
        this.id = id;
        this.cw = cw;
        this.ccw = ccw;
    }
}


let current = new Marble(0, null, null);
let root = current;
current.cw = current;
current.ccw = current;
let n = 0;
let currentPlayer = -1;

while (n < LAST_MARBLE) {
    currentPlayer = (currentPlayer + 1) % players.length;
    n++;
   
    if ( n % 23 === 0 ) {
        // Remove marble 7 CCW from current
        let marbleToRemove = current;
        for (let i = 0; i < 7; i++) {
            marbleToRemove = marbleToRemove.ccw;
        }
        // Connect CCW and CW of marble to remove
        marbleToRemove.cw.ccw = marbleToRemove.ccw;
        marbleToRemove.ccw.cw = marbleToRemove.cw;

        // Score player
        players[currentPlayer] += n + marbleToRemove.id;
        
        current = marbleToRemove.cw;
        continue;
    }

    // Get 1 after current
    let marbleCcwToNew = current.cw;
    let marbleCwToNew = current.cw.cw;

    // Insert new Marble
    let newMarble = new Marble(n, marbleCwToNew, marbleCcwToNew);
    // Update marble CW to new
    marbleCwToNew.ccw = newMarble;
    // Update marble CCW to new
    marbleCcwToNew.cw = newMarble;

    current = newMarble;
}

console.log('Max', players.reduce((max, score) => score > max ? score : max, 0));
