const fs = require('fs');

const input = 'input.txt';
const polymer = fs.readFileSync(input, 'utf8').trim();

// const polymer = 'dabAcCaCBAcCcaDA';

const reactPolymer = polymer => {
	let newPoly = '';
	for (let unit of polymer.slice(0)) {
		if (newPoly !== ''
			&& unit.toLowerCase() === newPoly.slice(-1).toLowerCase() 
			&& unit !== newPoly.slice(-1) ) 
		{
			newPoly = newPoly.slice(0, -1);
		} else {
			newPoly += unit;
		}
	}
	return newPoly;
}

console.log('In: ', polymer.length);
console.log('Out:', reactPolymer(polymer).length);
