const SERIAL_NUMBER = 7672;

const getCellPowerLevel = (x, y, serialNumber) => {
	let rackID = x + 10;
	let plvl = rackID * y + serialNumber;
	plvl *= rackID / 100;
	plvl = `${parseInt(`${plvl}`)}`;
	plvl = parseInt(plvl.charAt(plvl.length - 1)) - 5;

	return plvl;
}

let GRID_SIZE = 300;
let squarePowers = new Array(GRID_SIZE).fill(0);
squarePowers = squarePowers.map(n => new Array(GRID_SIZE).fill(0));

const getSquarePower = (x, y, serialNumber) => {
	let sum = 0;
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			sum += getCellPowerLevel(x + i, y + j, serialNumber);	
		}
	}
	return sum;
}

let bestSquare = {
	id: {x: -1, y: -1},
	power: -10,
}

for (let x = 1; x <= GRID_SIZE - 2; x++) {
	for (let y = 1; y <= GRID_SIZE - 2; y++) {
		let sPower = getSquarePower(x, y, SERIAL_NUMBER);
		if (bestSquare.power < sPower) {
			bestSquare.id = {x, y};
			bestSquare.power = sPower;
		}
	}
}

console.log(bestSquare);
