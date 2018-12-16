const fs = require('fs');

const inputFile = 'input.txt';
let input = fs.readFileSync(inputFile, 'utf8').trim().split('\n');

class Point {
    constructor({x, y, v_x, v_y}) {
        this.x = x || 0;
        this.y = y || 0; 
        this.v_x = v_x || 0;
        this.v_y = v_y || 0;
    }

    move() {
        this.x = this.x + this.v_x;
        this.y = this.y + this.v_y;
    }
}

let points = input.map(command => {
    let matches = command.match(/<\s*([\d\-]*),\s*([\d-]*).*<\s*([\d-]*),\s*([\d-]*)/);

    return new Point({
        x: parseInt(matches[1]),
        y: parseInt(matches[2]),
        v_x: parseInt(matches[3]),
        v_y: parseInt(matches[4])
    });
});

let currentTime = 0;

const processTick = () => {
    points.forEach(point => point.move());
}

let haveConvergedPreviously = false;
let diverging = false;

const drawPoints = (pointsToDraw) => {
    let extremes = pointsToDraw.reduce((acc, point) => ({
        minX: false === acc.minX || point.x < acc.minX ? point.x : acc.minX,
        minY: false === acc.minY || point.y < acc.minY ? point.y : acc.minY,
        maxX: false === acc.maxX || point.x > acc.maxX ? point.x : acc.maxX,
        maxY: false === acc.maxY || point.y > acc.maxY ? point.y : acc.maxY,
    }), {minX: false, minY: false, maxX: false, maxY: false});

    let width = Math.abs(extremes.minX - extremes.maxX) + 1;
    let height = Math.abs(extremes.minY - extremes.maxY) + 1;
    
    let viewPortWidth = 100;
    let viewPortHeight = 20;

    // console.log(extremes, width, height);
    if (width > 100 || height > 20) {
        diverging = true;
        return;
    }
    haveConvergedPreviously = true;
    diverging = false;
    
    let canvas = new Array(viewPortHeight).fill(0);
    canvas = canvas.map(n => new Array(viewPortWidth).fill('.'));

    let translateX = 0 - extremes.minX;
    let translateY = 0 - extremes.minY;

    points.forEach(point => {
        let x = point.x + translateX;
        let y = point.y + translateY;
        
        canvas[y][x] = '*';
    });

    canvas.forEach(row => {
       console.log(row.join('')); 
    });

    console.log(' ');
}

let seconds = 0;
while (true) {
    seconds++;
    if (haveConvergedPreviously) {
        console.log('Seconds passed', seconds);
    }
    processTick();
    drawPoints(points);

    if (haveConvergedPreviously && diverging) {
        break;
    }
}
