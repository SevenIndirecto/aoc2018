const fs = require('fs');

const inputFile = process.argv[2] || 'input.txt';
let input = fs.readFileSync(inputFile, 'utf8').trim();

class Room {
    constructor(id) {
        // ROOMS 0 = N, 1 = E, 2 = S, 3 = W
        this.rooms = new Array(4).fill(null);
        // this.shortest = '';
        this.distance = -1;
        this.id = id;
    }
}

let s = {
    root: null,
    current: null,
    rooms: new Map(),
    input,
    roomNonce: 0,
}

s.root = new Room(s.roomNonce++);
s.root.distance = 0;
s.rooms.set(0, s.root);

const buildRooms = () => {
    // char position
    let cp = 0;
    let braceBalance = 0;
    let roots = new Map();
    roots.set(0, [s.root.id]);
    let branches = new Map();

    while (cp < s.input.length) {
        let ch = s.input.charAt(cp);

        switch (ch) {
            case '$':
            case '^':
                break;
            case '(':
                braceBalance++;
                roots.set(braceBalance, [...roots.get(braceBalance - 1)]);
                branches.set(braceBalance, []);
                break;
            case ')':
                if (s.input.charAt(cp - 1) === '|') {
                    branches.set(
                        braceBalance, 
                        [...branches.get(braceBalance), ...roots.get(braceBalance)]
                    );
                }
                roots.set(braceBalance - 1, [...branches.get(braceBalance)]);
                branches.delete(braceBalance);
                roots.delete(braceBalance);
                braceBalance--;
                break;
            case '|':
                branches.set(
                    braceBalance, 
                    [...branches.get(braceBalance), ...roots.get(braceBalance)]
                );
                roots.set(braceBalance, [...roots.get(braceBalance - 1)]);
                break;
            default:
                let nextRoom = -1;
                switch (ch) {
                    case 'N':
                        nextRoom = 0;
                        break;
                    case 'E':
                        nextRoom = 1;
                        break;
                    case 'S':
                        nextRoom = 2;
                        break;
                    case 'W':
                        nextRoom = 3;
                        break;
                    default:
                        console.log('INVALID MOVE', move);
                        process.exit();
                }

                let currentRoomIDs = roots.get(braceBalance);

                for (let i = 0; i < currentRoomIDs.length; i++) {
                    let current = s.rooms.get(currentRoomIDs[i]);

                    if (!current.rooms[nextRoom]) {                        
                        current.rooms[nextRoom] = new Room(s.roomNonce++);
                        s.rooms.set(current.rooms[nextRoom].id, current.rooms[nextRoom]);
                    }
                    // Set current room as predecessor of the room we're entering
                    current.rooms[nextRoom].rooms[(nextRoom + 2) % 4] = current;
                    // Set new current in roots for level
                    currentRoomIDs[i] = current.rooms[nextRoom].id;
                }
        }
        cp++
    }
};

const setDistanceOnNeighbours = (room) => {
    for (let neighbour of room.rooms) {
        if (!neighbour) continue;
        
        if (neighbour.distance === -1 || neighbour.distance > room.distance + 1) {
            neighbour.distance = room.distance + 1;
            setDistanceOnNeighbours(neighbour);
        }
    }
};

buildRooms();
console.log('START Determining distance');
setDistanceOnNeighbours(s.root);
console.log(s.rooms);

let shortestPath = Array.from(s.rooms.values()).reduce((furthest, room) => {
    return room.distance > furthest ? room.distance : furthest;
}, 0);

console.log('Shorest path to furthest', shortestPath);
