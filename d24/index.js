const fs = require('fs');

const inputFile = process.argv[2] || 'input.txt';
let input = fs.readFileSync(inputFile, 'utf8').trim().split('\n');

class Group {
    constructor(opts) {
        this.units = opts.units;
        this.power = opts.power;
        this.hp = opts.hp;
        this.attackType = opts.attackType || SLASHING;
        this.initiative = opts.initiative || 1;
        this.weakTo = opts.weakTo || [];
        this.immuneTo = opts.immuneTo || [];
        this.type = opts.type;
    }

    get effectivePower() {
        return this.units * this.power;
    }
    
    isWeakTo(type) {
        return this.weakTo.includes(type);
    }

    isImmuneTo(type) {
        return this.immuneTo.includes(type);
    }
    
    isAlive() {
        return this.units > 0;
    }
}

let immunesys = [];
let infections = [];

let mode = 'immunesys';
for (let line of input) {
    if (line.includes('Infection')) {
        mode = 'infection';
    }
    

    let match = line.match(
        /(\d+) units each with (\d+) hit points.*with an attack that does (\d+)* (\w+) damage at initiative (\d+)*/);

    if (!match) continue;

    let opts = {
        units: Number(match[1]),
        hp: Number(match[2]),
        power: Number(match[3]),
        attackType: match[4],
        initiative: Number(match[5]),
    };

    let immuneTo = line.match(/immune to ([^);]*)/);
    if (immuneTo) {
        opts.immuneTo = immuneTo[1].split(', ');
    }

    let weakTo = line.match(/weak to ([^);]*)/);
    if (weakTo) {
        opts.weakTo = weakTo[1].split(', ');
    }
    
    if (mode === 'immunesys') {
        immunesys.push(new Group({...opts, type: 'immune'}));
    } else {
        infections.push(new Group({...opts, type: 'infection'}));
    }
}

const selectTargets = () => {
    const sortGroup = (a, b) => {
        if (a.effectivePower === b.effectivePower) {
            return b.initiative - a.initiative;
        }
        return b.effectivePower - a.effectivePower;
    };
    
    immunesys.sort(sortGroup);
    infections.sort(sortGroup);
    
    let immunesysTargets = immunesys.filter(g => g.isAlive());
    let infectionsTargets = infections.filter(g => g.isAlive());

    for (let group of [{ a: immunesys, d: infectionsTargets}, {a: infections, d: immunesysTargets }]) {
        for (let attacker of group.a) {
            attacker.target = null;

            if (!attacker.isAlive()) {
                continue;
            }

            let maxDamage = 0;
            let maxTarget = null;
            let maxMultiplier = 0;

            for (let defender of group.d) {
                let damageMultiplier = 0;
                let damage = 0;
                
                if (defender.isImmuneTo(attacker.attackType)) {
                    damage = 0;
                    damageMultiplier = 0;
                } else if (defender.isWeakTo(attacker.attackType)) {
                    damage = attacker.effectivePower * 2;
                    damageMultiplier = 2;
                } else {
                    damage = attacker.effectivePower;
                    damageMultiplier = 1;
                }

                if (damage !== 0 && maxDamage === damage) {
                    if (defender.effectivePower > maxTarget.effectivePower) {
                        maxTarget = defender;
                        maxDamage = damage;
                        maxMultiplier = damageMultiplier;
                    } else if (defender.effectivePower === maxTarget.effectivePower) {
                        if (defender.initiative > maxTarget.initiative) {
                            maxTarget = defender;
                            maxDamage = damage;
                            maxMultiplier = damageMultiplier;
                        }
                    }
                } else if (damage > 0 && damage > maxDamage) {
                    maxTarget = defender;
                    maxDamage = damage;
                    maxMultiplier = damageMultiplier;
                }
            }

            attacker.target = maxTarget;
            attacker.targetMultiplier = maxMultiplier;

            if (maxTarget) {
                group.d.splice(group.d.indexOf(maxTarget), 1);
            }
        }
    }
};

const fight = () => {
    const attackOrder = [...immunesys, ...infections];
    attackOrder.sort((a, b) => b.initiative - a.initiative);
    
    for (let att of attackOrder) {
        let def = att.target;
        if (!def || !att.isAlive() || !def.isAlive() || att.targetMultiplier === 0) continue;
        
        console.log(`${count} Attacking with ${att.effectivePower * att.targetMultiplier} on ${def.hp} per unit`);

        // let killed = Math.min(Math.floor(att.effectivePower * att.targetMultiplier / def.hp), def.units);

        // def.units -= killed;
        let before = def.units;
        def.units = Math.ceil(
           (def.units * def.hp - att.effectivePower * att.targetMultiplier) / def.hp
        );
        console.log(`${count} ${att.type} #${att.hp} attacks group ${def.hp}, killing ${before - def.units}`);
        
        if (def.units <= 0) {
            if ('infection' === att.type) {
                immunesys.splice(immunesys.indexOf(def), 1);
            } else {
                infections.splice(infections.indexOf(def), 1);
            }
        }
    }
};

const isArmyAlive = (army) => army.filter(g => g.isAlive()).length > 0;

let count = 0;
console.log('Start');
    for (let group of [...immunesys, ...infections].sort((a, b) => b.units - a.units)) {
        console.log(`HP: ${group.hp}, units: ${group.units}, ${group.type}`);
    }

while (isArmyAlive(immunesys) && isArmyAlive(infections)) {
    selectTargets();
    fight();
    
    count++;
    for (let group of [...immunesys, ...infections].sort((a, b) => b.units - a.units)) {
        console.log(`HP: ${group.hp}, units: ${group.units}, ${group.type}`);
    }
}

console.log('Winner: ', isArmyAlive(immunesys) ? 'immunesys' : 'infections');
console.log('Infections', infections.reduce((sum, g) => g.units + sum, 0));
console.log('Immunesys', immunesys.reduce((sum, g) => g.units + sum, 0));
