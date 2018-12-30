const fs = require('fs');

const inputFile = process.argv[2] || 'input.txt';
let input = fs.readFileSync(inputFile, 'utf8').trim();

class Room {
    constructor() {
        // ROOMS 0 = N, 1 = E, 2 = S, 3 = W
        this.rooms = new Array(4).fill(null);
        this.shortest = '';
    }
}

let state = {
    root: null,
    current: null,
    rooms: [],
}

const MODE_APPEND = 0;
const MODE_EXTRACT_GROUP = 1;
const MODE_EXTRACT_BRANCHES = 2;

const appendPaths = (pathsToAppendTo, pathsToAppend) => {
    let paths = [];
    for (appendee of pathsToAppendTo) {
        for (appendix of pathsToAppend) {
            paths.push(appendee + appendix);
        }
    }

    return paths;
};

const getPaths = (regex) => {
    let cp = 0;
    let segment = '';
    let paths = [''];
    let branches = [];
    let mode = MODE_APPEND;

    let braceBalance = 0;

    while (cp < regex.length) {
        let ch = regex.charAt(cp);

        switch (ch) {
            case '$':
            case '^':
                break;
            case '(':
                braceBalance++;
                segment += ch;
                break;
            case ')':
                braceBalance--;
                segment += ch;
                break;
            case '|':
                if (mode === MODE_APPEND) {
                    // Start extracting branches
                    branches = [...appendPaths(paths, [segment])];
                    mode = MODE_EXTRACT_BRANCHES;
                    segment = '';
                } else if (mode === MODE_EXTRACT_BRANCHES) {
                    if (braceBalance === 0) {
                        // TODO: Handle empty?
                        branches = [...branches, ...getPaths(segment)];
                        segment = '';
                    } else {
                        segment += ch;
                    }
                } else {
                    segment += ch;
                }
                break;
            default:
                segment += ch;
        }

        // If we're extracting a group, keep extracting until we find an even balance for braces
        if (mode === MODE_EXTRACT_GROUP) {
            if (braceBalance === 0) {
                // Finished extracting string to parse
                paths = appendPaths(paths, getPaths(segment.slice(0, -1)));
                mode = MODE_APPEND;
                segment = '';
            }
        } else if (mode === MODE_APPEND) {
            if (braceBalance > 0) {
                // Start extracting a group
                mode = MODE_EXTRACT_GROUP;
                paths = appendPaths(paths, [segment.slice(0, -1)]);
                segment = '';
            }
        }

        cp++;
    }

    if (mode === MODE_EXTRACT_BRANCHES) {
        // Append current segmenet as last branch
        // TODO: If ends with | or ) problem?
        
        return [...branches, ...getPaths(segment)];
    }
    
    return appendPaths(paths, [segment]);
};

// For each path construct rooms
state.root = new Room();
state.current = state.root;
state.rooms = [state.current];

const processPath = (path) => {
    let moves = path.split('');
    let nextRoom = 0;
    let pathSegment = '';
    
    for (move of moves ) {
        pathSegment += move;

        switch (move) {
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

        if (!state.current.rooms[nextRoom]) {
            state.current.rooms[nextRoom] = new Room();
            state.rooms.push(state.current.rooms[nextRoom]);
        }
        // Set current room as predecessor of the room we're entering
        state.current.rooms[nextRoom].rooms[(nextRoom + 2) % 4] = state.current;
        state.current = state.current.rooms[nextRoom];

        if (state.current.shortest.length > pathSegment.length 
            || state.current.shortest.length < 1) {
            state.current.shortest = pathSegment;
        }
    }
}

state.paths = getPaths(input);
console.log('INPUT: ', input);
// console.log('Result', state.paths);

for (path of state.paths) {
    state.current = state.root;
    processPath(path);
}

let shortestPath = state.rooms.reduce((furthest, room) => {
    return room.shortest.length > furthest.length ? room.shortest : furthest;
}, '');

console.log('Shorest path to furthest', shortestPath, 'Length', shortestPath.length);
