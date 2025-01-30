import * as ROT from 'rot-js';
import asciiArt from './asciiArt.ts';

// Render the game
function startGameRender() {
    // document.body.appendChild(display.getContainer());
    const container = document.getElementById('ascii-container');
    if (container) {
        container.innerHTML = '';
        container.appendChild(display.getContainer());
    } else {
        console.error("Container element not found. Could not render game.");
    }
}

// Game configuration
const config = {
    width: 58,
    height: 37,
};

// Initialize ROT.js display
const display = new ROT.Display({
    width: config.width,
    height: config.height,
    fontSize: 18
});

// Game variables
// ROT.RNG.setSeed(52123134);
console.log('RNG seed is: ', ROT.RNG.getSeed())
const map = new Map();
const entityList: Entity[] = [];
let gameStarted = false;
let player: Entity;
let bat: Entity;

class Entity {
    x: number;
    y: number;
    char: string;
    fg: string;
    bg: string;

    constructor(char: string, fg: string, bg: string) {
        const [x, y] = findBlankPosition();
        this.x = x;
        this.y = y;

        this.char = char;
        this.fg = fg;
        this.bg = bg;
    }

    public move(xIndex: number, yIndex: number) {
        const xToMove = this.x + xIndex;
        const yToMove = this.y + yIndex;


        if (map.get(`${xToMove},${yToMove}`.toString()).walkable) {
            this.x += xIndex;
            this.y += yIndex;
        } else {
            console.log('Cannot move to that location');
        }


    }
}

class Bat extends Entity {
    public move() {
        const rando = ROT.RNG.getUniform();
        console.log('bat tryna move')

        if (rando > 0 && rando < 0.25) {
            // move north
            this.y += -1;
        } else if (rando > 0.25 && rando < 0.5) {
            // move east
            this.x += 1;
        } else if (rando > 0.5 && rando < 0.75) {
            // move south
            this.y += 1;
        } else if (rando > 0.75) {
            // move west
            this.x -= 1;
        }
    }
}

// Generate a simple random dungeon map
function generateMap() {
    const digger = new ROT.Map.Digger(config.width, config.height);
    digger.create((x, y, wall) => {
        map.set(`${x},${y}`, {
            walkable: !wall,
            description: wall ? 'Wall' : 'Floor',
            char: wall ? '#' : '.',
            fg: wall ? '#666' : '#333',
            bg: '#000'
        });
    });
}

function placeEntities() {
    player = new Entity('@', '#0f0', '#000');
    bat = new Bat('b', '#f00', '#000');
    entityList.push(player);
    entityList.push(bat)

    for (let i = 0; i < 10; i++) {
        const coin = new Entity('$', '#FFFF00', '#000');
        entityList.push(coin);
    }

    const stairs = new Entity('>', '#00f', '#000');
    entityList.push(stairs);
}

function findBlankPosition() {
    let foundIt = false;
    while (!foundIt) {
        const x = Math.floor(ROT.RNG.getUniform() * config.width);
        const y = Math.floor(ROT.RNG.getUniform() * config.height);

        // find a floor tile
        if (map.get(`${x},${y}`.toString()).walkable) {
            // check to see if any entities currently occupy this floor tile
            let entityFound = entityList.some(entity => entity.x === x && entity.y === y);
            if (!entityFound) {
                foundIt = true;
                return [x, y];
            }
        }
    }
}

function drawMap() {
    bat.move(0,0);
    display.clear();
    map.forEach((value, key) => {
        const [x, y] = key.split(',').map(Number);
        display.draw(x, y, value.char, value.fg, value.bg);

    });

    entityList.forEach(entity => {
        display.draw(entity.x, entity.y, entity.char, entity.fg, entity.bg);
    })
}

function movePlayer(dx, dy) {
    const newX = player.x + dx;
    const newY = player.y + dy;

    const movingTo = map.get(`${newX},${newY}`.toString());

    if (map.get(`${newX},${newY}`.toString()).walkable) {
        player.x = newX;
        player.y = newY;
    }
}

// Handle input
function handleInput(event) {
    switch (event.key) {
        case 'ArrowUp':
            player.move(0, -1);
            break;
        case 'ArrowDown':
            player.move(0, 1);
            break;
        case 'ArrowLeft':
            player.move(-1, 0);
            break;
        case 'ArrowRight':
            player.move(1, 0);
            break;
    }
    drawMap();
}

// Game initialization
export function init() {
    if (!gameStarted) {
        generateMap();
        placeEntities();
        startGameRender();
        drawMap();
        window.addEventListener('keydown', handleInput);
        gameStarted = true;
    }

}

function renderSkullArt() {
    // Wait for the DOM to load
    window.addEventListener('DOMContentLoaded', () => {
        if (!gameStarted) {
            const asciiContainer = document.getElementById('ascii-container');

            // Attach the click event to the container
            asciiContainer.addEventListener('click', () => {
                init(); // Run the game initialization when the container is clicked
            });

        }

    });

    const container = document.getElementById('ascii-container');
    if (container) {
        asciiArt.forEach((line, lineIndex) => {
            const lineElement = document.createElement('div');
            lineElement.textContent = line.join('');
            container.appendChild(lineElement);
        });
    } else {
        console.error("Container element not found. Could not render ASCII art.");
    }
}

// Start the game
renderSkullArt()
