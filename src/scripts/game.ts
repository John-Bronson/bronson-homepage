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
    height: 33,
};

// Initialize ROT.js display
const display = new ROT.Display({
    width: config.width,
    height: config.height + 4,
    fontSize: 18
});

// Game variables
// ROT.RNG.setSeed(52123134);
console.log('RNG seed is: ', ROT.RNG.getSeed())
const map = new Map();
const entityList: Entity[] = [];
let gameStarted = false;
let player: Entity;
let bat: Bat;
let lastMessage = '';

class Entity {
    x: number;
    y: number;
    char: string;
    fg: string;
    bg: string;
    type: string;

    constructor(char: string, fg: string, bg: string, type: string) {
        const [x, y] = findBlankPosition();
        this.x = x;
        this.y = y;

        this.char = char;
        this.fg = fg;
        this.bg = bg;
        this.type = type;
    }
}

class Player extends Entity {
    constructor() {
        super('@', '#0f0', '#000', 'player');
        this.coins = 0;
    }

    coins: number;

    public move(xIndex: number, yIndex: number) {
        const xToMove = this.x + xIndex;
        const yToMove = this.y + yIndex;

        const entityAtPosition = entityList.find(entity => entity.x === xToMove && entity.y === yToMove)

        if (entityAtPosition) {
            switch (entityAtPosition.type) {
                case 'coin':
                    this.coins += 1;
                    console.log(`you got a coin! You now have ${this.coins} coins.`)
                    lastMessage = `you got a coin! You now have ${this.coins} coins.`

                    const indexToDelete = entityList.findIndex(entity => entity.x === xToMove && entity.y === yToMove)
                    entityList.splice(indexToDelete, 1);
                    break;
                case 'bat':
                    lastMessage = 'You touch a bat!';
                    break;
                case 'stairs':
                    lastMessage = 'You found the stairs!';
                    break;
            }
        }

        if (map.get(`${xToMove},${yToMove}`.toString()).walkable) {
            this.x += xIndex;
            this.y += yIndex;

        } else {
            lastMessage = 'You bump into a wall.';
        }
    }
}

class Bat extends Entity {
    constructor() {
        super('b', '#f00', '#000', 'bat')
        this.coins = 0;
    }

    coins: number;

    private findClosestCoin(): Entity {
        let closestCoin: Entity;
        let shortestDistance = Infinity;

        for (const currentEntity of entityList) {
            if (currentEntity.type === 'coin') {
                const distance =
                    Math.abs(this.x - currentEntity.x) +
                    Math.abs(this.y - currentEntity.y);

                if (distance < shortestDistance) {
                    shortestDistance = distance;
                    closestCoin = currentEntity;
                }
            }
        }

        return closestCoin;
    }

    public move() {
        const closestCoin = this.findClosestCoin();

        if (closestCoin) {
            const dx = closestCoin.x - this.x;
            const dy = closestCoin.y - this.y;

            const xStep = dx !== 0 ? dx / Math.abs(dx) : 0;
            const yStep = dy !== 0 ? dy / Math.abs(dy) : 0;

            const xToMove = this.x + xStep;
            const yToMove = this.y + yStep;

            // TODO: Check for valid movement. For now he'll be a ghost that goes through the walls

            // if moving onto the coin, grab it

            const entityAtPosition = entityList.find(entity => entity.x === xToMove && entity.y === yToMove)

            if (entityAtPosition) {
                switch (entityAtPosition.type) {
                    case 'coin':
                        this.coins += 1;
                        const indexToDelete = entityList.findIndex(entity => entity.x === xToMove && entity.y === yToMove)
                        entityList.splice(indexToDelete, 1);
                }
            }

            this.x = xToMove;
            this.y = yToMove;
        }

        // const rando = ROT.RNG.getUniform();
        //
        // let dx = 0;
        // let dy = 0;
        //
        // if (rando > 0 && rando < 0.25) {
        //     // move north
        //     dy += -1;
        // } else if (rando > 0.25 && rando < 0.5) {
        //     // move east
        //     dx += 1;
        // } else if (rando > 0.5 && rando < 0.75) {
        //     // move south
        //     dy += 1;
        // } else if (rando > 0.75) {
        //     // move west
        //     dx -= 1;
        // }
        //
        // const xToMove = this.x + dx;
        // const yToMove = this.y + dy;
        //
        // // Check if the move is valid
        //
        // if (map.get(`${xToMove},${yToMove}`.toString()).walkable) {
        //     this.x = xToMove;
        //     this.y = yToMove;
        // }
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
    player = new Player();
    bat = new Bat();
    entityList.push(player);
    entityList.push(bat)

    for (let i = 0; i < 10; i++) {
        const coin = new Entity('$', '#FFFF00', '#000', 'coin');
        entityList.push(coin);
    }

    const stairs = new Entity('>', '#00f', '#000', 'stairs');
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

function handleTurn(x: number, y: number) {
    player.move(x, y);
    bat.move();
    drawMap();
}

function drawMap() {
    display.clear();
    map.forEach((value, key) => {
        const [x, y] = key.split(',').map(Number);
        display.draw(x, y, value.char, value.fg, value.bg);
    });

    entityList.forEach(entity => {
        display.draw(entity.x, entity.y, entity.char, entity.fg, entity.bg);
    })

    display.drawText(0, 33, `Your Coins: ${player.coins}`);
    display.drawText(0, 34, ` Bat Coins: ${bat.coins}`);
    display.drawText(0, 35, lastMessage);
}

// function movePlayer(dx, dy) {
//     const newX = player.x + dx;
//     const newY = player.y + dy;
//
//     const movingTo = map.get(`${newX},${newY}`.toString());
//
//     if (map.get(`${newX},${newY}`.toString()).walkable) {
//         player.x = newX;
//         player.y = newY;
//     }
// }

// Handle input
function handleInput(event: Event) {
    switch (event.key) {
        case 'ArrowUp':
            handleTurn(0, -1);
            break;
        case 'ArrowDown':
            handleTurn(0, 1);
            break;
        case 'ArrowLeft':
            handleTurn(-1, 0);
            break;
        case 'ArrowRight':
            handleTurn(1, 0);
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
            if (asciiContainer) {
                asciiContainer.addEventListener('click', () => {
                    init(); // Run the game initialization when the container is clicked
                });
            }
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
