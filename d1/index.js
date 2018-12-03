var fs = require('fs');

const input = 'input.txt';
const contents = fs.readFileSync(input, 'utf8');
const commands = contents.split('\n').filter(v => v !== '');

const addDelta = (base, delta) => {
  let op = delta.slice(0, 1);
  delta = parseInt(delta.slice(1));
  
  if (isNaN(delta)) {
    return base;
  }
  
  return op === '-' ? base - delta : base + delta;
}

let freq = 0;
let duplicateFound = false;
let i = 0;
let commandLength = commands.length;
let map = new Map();

while (!duplicateFound) {
  freq = addDelta(freq, commands[i]);
  
  if (map.has(freq)) {
    duplicateFound = true;	  
    break;
  }
  
  map.set(freq, true);
  i = i >= commandLength - 1 ? 0 : i + 1;
}

if (duplicateFound) {
  console.log('Duplicate found at: ', freq);
}
else {
  console.log('Duplicate NOT found');
}

const sum = commands.reduce((acc, freq) => addDelta(acc, freq), 0);
console.log('Sum: ', sum);  
