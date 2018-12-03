var fs = require('fs');
// var lineReader = require('../shared/aoc-readline').lineReader;

const input = 'input.txt';
var contents = fs.readFileSync(input, 'utf8');

const commands = contents.split('\n');
const sum = commands.reduce((acc, freq) => {
  let op = freq.slice(0, 1);
  let num = parseInt(freq.slice(1));
  if(isNaN(num)) {
    return acc;
  }
  console.log(num);
  return op === '-' ? acc - num : acc + num;
}, 0);

console.log('Sum: ', sum);  
