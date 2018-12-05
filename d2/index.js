const fs = require('fs');

const input = 'input.txt';
const contents = fs.readFileSync(input, 'utf8');
const ids = contents.split('\n').filter(v => v != '');
console.log(ids.length);
const finder = desiredRepeats => haystack => {
	const map = new Map();
	for(let letter of haystack.split('')) {
		if (!map.has(letter)) {
			map.set(letter, 1);
		}
		else {
			map.set(letter, map.get(letter) + 1);
		}
	}

	return [...map.values()].filter(n => n === desiredRepeats).length > 0;
}

const finder2 = finder(2);
const finder3 = finder(3);
let hits2 = 0;
let hits3 = 0;

for(let id of ids) {
	hits2 = finder2(id) ? hits2 + 1 : hits2;
	hits3 = finder3(id) ? hits3 + 1 : hits3;
}

console.log('Hits 2:', hits2, 'Hits 3:', hits3);
