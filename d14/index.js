const NUM_ELVES = 2;
const RECIPE_BEFORE = 360781;

class Elf {
    constructor(currentRecipe) {
        this.currentRecipe = currentRecipe;
    }
}

let elves = [new Elf(0), new Elf(1)];
let scoreboard = [3, 7];

const createNewRecipes = (currentRecipes) => {
    let sum = currentRecipes.reduce((sum, recipe) => sum + recipe, 0);

    return `${sum}`.split('').map(digit => parseInt(digit));
}

const pickNewRecipe = (elf, recipes) => {
    let index = (elf.currentRecipe + 1 + recipes[elf.currentRecipe]) % recipes.length;
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

const getCurrentRecipes = (elves, recipes) => {
    return elves.map(elf => {
       return recipes[elf.currentRecipe] 
    });
}

drawState();
const processTick = () => {
    scoreboard = [...scoreboard, ...createNewRecipes(getCurrentRecipes(elves, scoreboard))];

    for (let i = 0; i < elves.length; i++) {
        elves[i].currentRecipe = pickNewRecipe(elves[i], scoreboard);
    }

    // drawState();
}

while ( scoreboard.length < RECIPE_BEFORE + 10 ) {
    processTick()
    console.log(scoreboard.length);
}

console.log(scoreboard.splice(RECIPE_BEFORE, 10).join(''));
