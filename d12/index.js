const fs = require('fs');

const inputFile = 'input.txt';
let input = fs.readFileSync(inputFile, 'utf8').trim().split('\n');

class Pot {
    constructor(id, left, right, hasPlant) {
        this.id = id;
        this.left = left;
        this.right = right;
        this.hasPlant = hasPlant;
    }
}

class Rule {
    constructor(l2, l1, current, r1, r2, result, raw) {
        this.l1 = l1;
        this.l2 = l2;
        this.current = current;
        this.r1 = r1;
        this.r2 = r2;
        this.result = result;
        this.raw = raw;
    }
}

let rootPot = null;
let currentPot = null;

// Parse initial state
let inputState = input[0].match(/[#\.]+/)[0].split('');

inputState.forEach(type => {
    let hasPlant = type === '#';
    
    if (!currentPot) {
        rootPot = new Pot(0, null, null, hasPlant);
        currentPot = rootPot;
    }
    else {
        currentPot.right = new Pot(currentPot.id + 1, currentPot, null, hasPlant);
        currentPot = currentPot.right;
    }
});

// Add sentinel pots
rootPot.left = new Pot(-1, null, rootPot, false);
rootPot.left.left = new Pot(-2, null, rootPot.left, false);
currentPot.right = new Pot(currentPot.id + 1, currentPot, null, false);
currentPot.right.right = new Pot(currentPot.id + 2, currentPot.right, null, false);


// Parse rules
let rules = input.slice(2).map(rule => {
    let condition = rule.match(/([#.]+) =>/)[1].split('').map(c => c === '#');
    let result = rule.match(/=> ([#.])/)[1] === '#';
    // console.log(rule, new Rule(...condition, result));
    return new Rule(...condition, result, rule);
});

const stateAsString = (root) => {
    // Find leftmost pot
    // console.log(root);
    let pot = root;
    while (pot.left) {
        pot = pot.left;
    }

    let output = '';

    // Start output
    do {
        output += pot.hasPlant ? '#' : '.';
        pot = pot.right;
    } while (pot)

    return output;
}

const generations = [];
generations.push(rootPot);

const isRuleApplicable = (rule, pot) => {
    let leftBy2, leftBy1, rightBy1, rightBy2;

    if (!pot.left) {
        // Right of leftmost
        leftBy1 = false;
        leftBy2 = false;
    } else if (!pot.left.left) {
        // Leftmost
        leftBy1 = pot.left.hasPlant;
        leftBy2 = false;
    } else {
        leftBy1 = pot.left.hasPlant;
        leftBy2 = pot.left.left.hasPlant;
    }
    
    if (!pot.right) {
        // Left of rightmost
        rightBy1 = false;
        rightBy2 = false;
    } else if (!pot.right.right) {
        // Rightmost
        rightBy1 = pot.right.hasPlant;
        rightBy2 = false;
    } else {
        rightBy1 = pot.right.hasPlant;
        rightBy2 = pot.right.right.hasPlant;
    }
    
    return (rule.l2 === leftBy2 &&
           rule.l1 === leftBy1 &&
           rule.current === pot.hasPlant &&
           rule.r1 === rightBy1 &&
           rule.r2 === rightBy2);
}

const mutateCurrentGeneration = () => {
    // Apply all rules
    let leftMost = rootPot;
    while (leftMost.left) {
        leftMost = leftMost.left;
    }

    let pot = leftMost;
    let newRoot = null;
    let newCurrent = null;
    
    do {
        let hasPlant = false;

        for (rule of rules) {
            if (isRuleApplicable(rule, pot)) {
                hasPlant = rule.result;        
                break;
            }
        }

        if (!newCurrent) {
            newCurrent = new Pot(pot.id, null, null, hasPlant);
        }
        else {
            newCurrent.right = new Pot(pot.id, newCurrent, null, hasPlant);
            newCurrent = newCurrent.right;
        }
        

        if (pot.id === 0) {
            newRoot = newCurrent;
        }
        pot = pot.right;
    } while (pot);

    // Add sentinel pots when required
    leftMost = newRoot;
    while(leftMost.left) {
        leftMost = leftMost.left
    }
    
    if (leftMost.hasPlant || leftMost.right.hasPlant) {
        leftMost.left = new Pot(leftMost.id - 1, null, leftMost, false);

        if(leftMost.hasPlant) {
            leftMost.left.left = new Pot(leftMost.left.id - 2, null, leftMost.left, false);
        }
    }

    if (newCurrent.hasPlant || newCurrent.left.hasPlant) {
        newCurrent.right = new Pot(newCurrent.id + 1, newCurrent, null, false);

        if (newCurrent.hasPlant) {
            newCurrent.right.right = new Pot(newCurrent.id + 2, newCurrent.right, null, false); 
        }
    }


    generations.push(newRoot);
    rootPot = newRoot;
    currentPot = newRoot;
}


//console.log(stateAsString(generations[0]));

const getGenerationValue = (gen) => {
    let current = gen;
    while (current.left) {
        current = current.left;
    }

    let sum = 0;
    while (current.right) {
        sum += current.hasPlant ? current.id : 0;
        current = current.right;
    }

    return sum;
}

let previousDiff = 0;
let diffSameCount = 0;
const DIFF_SAME_BREAK = 100;
const GENERATIONS = 5e10; 

for (let i = 1; i <= GENERATIONS; i++) {
    mutateCurrentGeneration();
    
    let genCurrent = getGenerationValue(generations[generations.length - 1]);
    let genPrevious = getGenerationValue(generations[generations.length - 2]);
    let diff = genCurrent - genPrevious;
    console.log(i, genCurrent, 'diff: ', diff);

    if (previousDiff === diff) {
        diffSameCount++;
    }
    else {
        diffSameCount = 0;   
    }
    
    if (diffSameCount === DIFF_SAME_BREAK) {
        // Calculate remaining
        let finalPlants = genCurrent + (GENERATIONS - i) * diff;
        console.log(`Plants after ${GENERATIONS} generations`, finalPlants);
        break;
    }

    previousDiff = diff;
}

// console.log(getGenerationValue(generations[generations.length - 1]));
