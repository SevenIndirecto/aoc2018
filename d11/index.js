const SERIAL_NUMBER = 7672;

const getCellPowerLevel = (x, y) => {
	let rackID = x + 10;
	let plvl = rackID * y + SERIAL_NUMBER;
	plvl *= rackID / 100;
	plvl = `${parseInt(`${plvl}`)}`;
	plvl = parseInt(plvl.charAt(plvl.length - 1)) - 5;

	return plvl;
}

let GRID_SIZE = 300;
let squarePowers = new Array(GRID_SIZE).fill(0);
squarePowers = squarePowers.map(n => new Array(GRID_SIZE).fill(0));

// includes previous run's square power mapped as x,y
const cache = new Array(GRID_SIZE * GRID_SIZE).fill(0);

const getSquarePower = (x, y, squareSize) => {
	let sum = 0;
    let cacheKey = GRID_SIZE * (x - 1) + y - 1;
    let previousSquare = cache[cacheKey];
    sum += previousSquare;

    for (let offset = 0; offset < squareSize - 1; offset++) {
        sum += getCellPowerLevel(x + squareSize - 1, y + offset);
        sum += getCellPowerLevel(x + offset, y + squareSize - 1);
    }
    sum += getCellPowerLevel(x + squareSize - 1, y + squareSize - 1);
    cache[cacheKey] = sum;
	return sum;
}

let bestSquare = {
	id: {x: -1, y: -1},
	power: -10,
    squareSize: -1,
}

const setBestSquareForSize = (squareSize) => {
    for (let x = 1; x <= GRID_SIZE - (squareSize - 1); x++) {
    	for (let y = 1; y <= GRID_SIZE - (squareSize - 1); y++) {
    		let sPower = getSquarePower(x, y, squareSize);
    		if (bestSquare.power < sPower) {
	    		bestSquare.id = {x, y};
		    	bestSquare.power = sPower;
                bestSquare.squareSize = squareSize;
		    }
	    }
    }
}

// To get STAR 1 set squareSize <= 3

// STAR 2
for (let squareSize = 1; squareSize <= 300; squareSize++) {
    setBestSquareForSize(squareSize);
    console.log(bestSquare);
}
console.log(bestSquare);
