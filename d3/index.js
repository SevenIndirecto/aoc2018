const fs = require('fs');

const input = 'input.txt';
const contents = fs.readFileSync(input, 'utf8');
const claims = contents.split('\n').filter(v => v != '').map(input => {
	let matches = input.match(/#(\d+)[\s@]+(\d+),(\d+)[:\s]+(\d+)x(\d+)/);
	if (matches.length < 6) {
		console.log('Error for string', input);
		exit;
	}
	return {
		id: matches[1],
		left: parseInt(matches[2]),
		top: parseInt(matches[3]),
		width: parseInt(matches[4]),
		height: parseInt(matches[5]),
	}
});

// #1 @ 872,519: 18x18

const fabricSize = 1000;
const claimedSquares = new Array(fabricSize);
const copy = new Array(fabricSize).fill(0);
for (let i = 0; i < fabricSize; i++) {
	claimedSquares[i] = copy.slice(0);
}
let claimed = new Map();

let overlaps = [];
for (claim of claims) {
	for (let x = claim.left; x < claim.left + claim.width; x++) {
		for (let y = claim.top; y < claim.top + claim.height; y++) {
			let key = `${x},${y}`;
			if (claimed.has(key)) {
				if (claimed.get(key) === 1) {
					overlaps.push(claim.id);
				}
				claimed.set(key, claimed.get(key) + 1);
			} else {
				claimed.set(key, 1);
			}

		}
	}
}

console.log('Overlapping squares: ', overlaps.length);
