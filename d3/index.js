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

let claimed = new Map();

let overlaps = [];
let overlappingIds = new Set();

for (claim of claims) {
	for (let x = claim.left; x < claim.left + claim.width; x++) {
		for (let y = claim.top; y < claim.top + claim.height; y++) {
			let key = `${x},${y}`;
			if (claimed.has(key)) {
				if (claimed.get(key)[0] === 1) {
					overlaps.push(claim.id);
					// Add previous id
					overlappingIds.add(claimed.get(key)[1]);
				}
				overlappingIds.add(claim.id);
				claimed.set(key, [claimed.get(key)[0] + 1]);
			} else {
				claimed.set(key, [1,claim.id]);
			}

		}
	}
}

console.log('Overlapping squares: ', overlaps.length);
let unique = claims.filter(({id}) => !overlappingIds.has(id)); 
console.log('Non-overlapping: ', unique);
