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

let elves = [new Elf(0), new Elf(1)];
// let scoreboard = [3, 7];

let scoreboards = [];
scoreboards.push([3,7]);



const createNewRecipes = (currentRecipes) => {
//     log.start();
    let sum = currentRecipes.reduce((sum, recipe) => sum + recipe, 0);

    return `${sum}`.split('').map(digit => parseInt(digit));
}

const pickNewRecipe = (elf) => {
    


    let index = (elf.currentRecipe + 1 + scoreboard[elf.currentRecipe]) % scoreboard.length;
    return index;
}

const drawState = () => {
    let recipeMap = {};
    for (let i = 0; i < elves.length; i++) {
        if (recipeMap[elves[i].currentRecipe]) {
            recipeMap[elves[i].currentRecipe].push(i);
        } else {
            recipeMap[elves[i].currentRecipe] = [i];
        }
    }
    let out = '';
    for (let i = 0; i < scoreboard.length; i++) {
        let delims;
        if (recipeMap[i]) {
            delims = (recipeMap[i] % 2) === 1 ? ['[',']'] : ['(',')'];
        }  else {
            delims = [' ', ' '];
        }
        out += `${delims[0]}${scoreboard[i]}${delims[1]}`;
    }
    console.log(out);
}

const getCurrentRecipes = () => {
    return elves.map(elf => {
       return scoreboard[elf.currentRecipe] 
    });
}

drawState();
const processTick = () => {
   // log.start();
    let newRecipes = createNewRecipes(getCurrentRecipes());
    //log.stop('New recipes');
    //log.start();
    for (recipe of newRecipes) {
        scoreboard.push(recipe);
    }
    // scoreboard = [...scoreboard, ...newRecipes];
   // log.stop('Merge scoreboards');
    //log.start();
    for (let i = 0; i < elves.length; i++) {
        elves[i].currentRecipe = pickNewRecipe(elves[i]);
    }
    if (elves[0].currentRecipe < 100 || elves[0].currentRecipe < 100) {
        console.log(elves, scoreboard.length, 
            require('v8').getHeapStatistics().total_available_size / 1024 / 1024);
    }
    //log.stop('Pick new recipe');
//    drawState();
}

const scoreboardEndsWithNeedle = () => {
    let num = '';
    if (scoreboard.length < NUM_TO_APPEAR_LENGTH) {
        return false;
    }

    for (let i = NUM_TO_APPEAR_LENGTH; i > 0; i--) {
        num += scoreboard[scoreboard.length - i];
    }

    return NUM_TO_APPEAR === num;
}

class Logger {
    constructor() {
        this.startTime = 0;
    }
    
    start() {
        this.startTime = Date.now();
    }

    getTimeDiff() {
        return Date.now() - this.startTime;
    }

    stop(tag = '') {
        console.log(`${tag} [${this.getTimeDiff()} ms]`);
    }
}

const log = new Logger();
const logInner = new Logger();

while (!scoreboardEndsWithNeedle()) {
    processTick()
    //logInner.stop('Inner log');
    //logInner.start();
    //console.log(scoreboard.length);
}

console.log('Appears after:', scoreboard.length - NUM_TO_APPEAR_LENGTH);
// console.log(scoreboard.splice(RECIPE_BEFORE, 10).join(''));
