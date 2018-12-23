const NUM_ELVES = 2;
const RECIPE_BEFORE = 5;
const NUM_TO_APPEAR = '360781';
const NUM_TO_APPEAR_LENGTH = NUM_TO_APPEAR.length;
const ARRAY_SIZE_LIMIT = 5e7;

class Elf {
    constructor(currentRecipe) {
        this.currentRecipe = currentRecipe;
    }
}

let elves = [new Elf({i1: 0, i2: 0}), new Elf({i1: 0, i2: 1})];
// Splitting into multiple arrays due to v8 limits.
// This was... due to a wrong implementation of 'ends with string checking' instead of contains.
let scoreboards = [[3,7]];

const scoreboardLength = () => {
    return (scoreboards.length - 1) * ARRAY_SIZE_LIMIT + scoreboards[scoreboards.length - 1].length;
}

const createNewRecipes = (currentRecipes) => {
    let sum = currentRecipes.reduce((sum, recipe) => sum + recipe, 0);

    return `${sum}`.split('').map(digit => parseInt(digit));
}

const pickNewRecipe = (elf) => {
    let index = elf.currentRecipe.i1 * ARRAY_SIZE_LIMIT + elf.currentRecipe.i2;
    index += 1;
    index = (index + scoreboards[elf.currentRecipe.i1][elf.currentRecipe.i2]) % scoreboardLength();

    // Convert to split array
    return {
        i1: Math.floor(index / ARRAY_SIZE_LIMIT),
        i2: index % ARRAY_SIZE_LIMIT,
    }
}

const getCurrentRecipes = () => {
    return elves.map(elf => {
       return scoreboards[elf.currentRecipe.i1][elf.currentRecipe.i2]; 
    });
}

const processTick = () => {
    let newRecipes = createNewRecipes(getCurrentRecipes());
    
    for (recipe of newRecipes) {
        if (scoreboards[scoreboards.length - 1].length === ARRAY_SIZE_LIMIT) {
            scoreboards.push([recipe]);
        }
        else {
            scoreboards[scoreboards.length - 1].push(recipe);
        }
    }
    
    for (let i = 0; i < elves.length; i++) {
        elves[i].currentRecipe = pickNewRecipe(elves[i]);
    }
}

const scoreboardContainsNeedle = () => {
    let num = '';
    if (scoreboardLength() < NUM_TO_APPEAR_LENGTH + 1) {
        return false;
    }

    // Let's assume the digits we're looking for can only be present
    // in the last 2 scoreboards
    for (let i = NUM_TO_APPEAR_LENGTH + 1; i > 0; i--) {
        if (i > scoreboards[scoreboards.length - 1].length) {
            // Look into previous scoreboard
            num += 
                scoreboards[scoreboards.length - 2][scoreboards[scoreboards.length - 2].length 
                    - (i - scoreboards[scoreboards.length - 1].length)];
        }
        else {
            num += 
                scoreboards[scoreboards.length - 1][scoreboards[
                    scoreboards.length - 1].length - i];
        }
    }

    return num.includes(NUM_TO_APPEAR);
}

while (!scoreboardContainsNeedle()) {
    processTick();
}

console.log('Appears after:', scoreboardLength() - NUM_TO_APPEAR_LENGTH - 1, 
    scoreboardLength() - NUM_TO_APPEAR_LENGTH);
// console.log(scoreboard.splice(RECIPE_BEFORE, 10).join(''));
