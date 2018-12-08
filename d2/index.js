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

// star2
const getDiff = (a, b) => {
	// console.log(a, b);
	let diffs = 0;
	let shared = '';
	for (let i = 0; i < a.length; i++) {
		if (a.charAt(i) !== b.charAt(i)) {
			diffs++;
		
			if (diffs > 1) {
				return '';
			}
		} else {
			shared += a.charAt(i);
		}

	}
	return shared;
}

for(let i = 0, length = ids.length; i < length; i++) {
	for (let j = i + 1; j < length; j++) {
		let sharedChars = getDiff(ids[i], ids[j]);
		if (sharedChars !== '') console.log(sharedChars, ids[i], ids[j]);
		if (sharedChars.length === ids[i].length - 1) {
			console.log('Found hits: ', ids[i], ids[j], 'Shared: ', sharedChars);
			i = length;
			break;
		}
	}
}
