const fs = require('fs');

const inputFile = process.argv[2] || 'input.txt';
let input = fs.readFileSync(inputFile, 'utf8').trim().split('\n');
let points = input.map(line => line.split(',').map(Number));

let unprocessed = [...points];
let constellations = [];
const MIN_DISTANCE = 3;

const distance = (a, b) => { 
    let dist = 0;
    for (let i = 0; i < a.length; i++) {
        dist += Math.abs(a[i] - b[i]);
    }
    return dist;
}

const belongsToConst = (point, constellation) => {
    for (let constPoint of constellation) {
        if (distance(constPoint, point) <= MIN_DISTANCE) {
            return true;
        }
    }
    return false;
}

while (unprocessed.length > 0) {
    let point = unprocessed.pop();

    // Find all constellations we can connect with
    let constsPointFits = constellations.filter(c => belongsToConst(point, c));

    if (constsPointFits.length > 0) {
        // Add point to each and merge them
        constellations = constellations.filter(c => !constsPointFits.includes(c));
        let newConst = constsPointFits.reduce((acc, c) => [...acc, ...c]);

        newConst.push(point);
        constellations.push(newConst);
        continue;
    }
    
    // Find first point in range and form a new constellation
    let pointInRange = null;

    for (let p of unprocessed) {
        if (distance(p, point) <= MIN_DISTANCE) {
            pointInRange = p;
            break;
        }
    }

    if (pointInRange) {
        // Check if point in range can connect to a constellation
        constsPointInRangeFits = constellations.filter(c => belongsToConst(pointInRange, c));
        
        if (constsPointInRangeFits.length > 0) {
            // Merge all constellations which fit
            constellations = constellations.filter(c => !constsPointInRangeFits.includes(c));
            let newConst = constsPointInRangeFits.reduce((acc, c) => [...acc, ...c]);
            newConst.push(point);
            newConst.push(pointInRange);
            constellations.push(newConst);
            
        } else {
            // Form new constellation with point and pointInRange
            constellations.push([point, pointInRange]);
        }

        // Remove pointInRange from unprocessed as well
        unprocessed.splice(unprocessed.indexOf(pointInRange), 1);

    } else {
        // No point in range, form a singleton constellation
        constellations.push([point]);
    }
}

let count = 0;
for (let c of constellations) {
    console.log(`Constellation ${count}, length ${c.length}`);
    for (let p of c) {
        console.log(JSON.stringify(p));
    }
    count++;
}

console.log('Constellations:', constellations.length);
