import * as ROT from 'rot-js';
import asciiArt from './asciiArt.ts';

// Render the game
function startGameRender() {
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
let player: Player;
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

abstract class Creature extends Entity {
    abstract takeDamage(amount: number): void;
}

class Player extends Creature {
    constructor() {
        super('@', '#0f0', '#000', 'player');
        this.coins = 0;
    }

    coins: number;

    public takeDamage(amount: number) {
        console.log(`ouch! The game wants you to take ${amount} damage!`);
    }

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
                    if (this.coins < 3) {
                        lastMessage = 'You need 3 coins to use the stairs.';
                    } else {
                        gameEngine.gameOver('You beat the bat! You win!');
                    }
                    break;
            }
        }

        if (map.get(`${xToMove},${yToMove}`.toString()).walkable) {
            this.x += xIndex;
            this.y += yIndex;

        } else {
            lastMessage = 'You bump into a wall.';
            this.takeDamage(1);
        }
    }
}

class Bat extends Creature {
    constructor() {
        super('b', '#f00', '#000', 'bat')
        this.coins = 0;
    }

    coins: number;

    takeDamage(amount: number) {
        console.log(`the bat takes ${amount} damage!`);
    }

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

    private getPathfindingStep() {
        let closestCoin = this.findClosestCoin();

        let batPath = new ROT.Path.Dijkstra(closestCoin.x, closestCoin.y, (x, y) => {
            return map.get(`${x},${y}`.toString()).walkable;
        }, {topology: 4})

        const batMovesArray: [number, number][] = [];
        batPath.compute(bat.x, bat.y, (x, y) => {
            batMovesArray.push([x, y])
        })
        return batMovesArray[1];
    }

    private getRandomStep(): [number, number] {
        const rando = ROT.RNG.getUniform();

        let dx = 0;
        let dy = 0;
        let xToMove = this.x;
        let yToMove = this.y;

        if (rando > 0 && rando < 0.25) {
            // move north
            dy += -1;
        } else if (rando > 0.25 && rando < 0.5) {
            // move east
            dx += 1;
        } else if (rando > 0.5 && rando < 0.75) {
            // move south
            dy += 1;
        } else if (rando > 0.75) {
            // move west
            dx -= 1;
        }

        xToMove = this.x + dx;
        yToMove = this.y + dy;

        // Move only if valid
        if (map.get(`${xToMove},${yToMove}`.toString()).walkable) {
            return [xToMove, yToMove];
        } else {
            this.takeDamage(1);
            return [this.x, this.y];
        }
    }

    private getStepToStairs(): [number, number] {
        let stairs: Entity | undefined;

        stairs = entityList.find(entity => entity['type'] === 'stairs');

        let stairsPath = new ROT.Path.Dijkstra(stairs.x, stairs.y, (x, y) => {
            return map.get(`${x},${y}`.toString()).walkable;
        }, {topology: 4});

        const batMovesArray: [number, number][] = [];
        stairsPath.compute(bat.x, bat.y, (x, y) => {
            batMovesArray.push([x, y]);
        })

        return batMovesArray[1];
    }

    public move() {

        let xToMove: number, yToMove: number;

        if (this.coins < 3) {
            // move toward the nearest coin
            [xToMove, yToMove] = this.getPathfindingStep();
        } else {
            // move toward the stairs
            [xToMove, yToMove] = this.getStepToStairs();
        }

        // Handle movement into other Entities
        const entityAtPosition = entityList.find(entity => entity.x === xToMove && entity.y === yToMove)

        if (entityAtPosition) {
            switch (entityAtPosition.type) {
                case 'coin':
                    this.coins += 1;
                    const indexToDelete = entityList.findIndex(entity => entity.x === xToMove && entity.y === yToMove)
                    entityList.splice(indexToDelete, 1);
                    break;
                case `stairs`:
                    gameEngine.gameOver('The Bat beat you! You lose!')
            }
        }

        this.x = xToMove;
        this.y = yToMove;

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

enum GameState {
    INSTRUCTIONS,
    MAIN,
    END
}

class GameEngine {

    GameState = GameState.INSTRUCTIONS;
    gameOverMessage = '';

    constructor() {
        console.log('adding event listener:')
        window.addEventListener('keydown', (event) => {
            this.gameLoop(event.key)
        });

        // Render the skull ASCII art
        // TODO: Do this with the rot.js display instead
        const container = document.getElementById('ascii-container');
        if (container) {
            console.log('drawing skull art')
            asciiArt.forEach((line, lineIndex) => {
                const lineElement = document.createElement('div');
                lineElement.textContent = line.join('');
                container.appendChild(lineElement);
            });
        } else {
            console.error("Container element not found. Could not render ASCII art.");
        }

        window.addEventListener('DOMContentLoaded', () => { // Wait for the DOM to load
            const asciiContainer = document.getElementById('ascii-container');

            if (asciiContainer) {
                const handleClick = () => {
                    console.log('holy crap you clicked on the ascii container.')
                    this.gameLoop('a');
                    asciiContainer.removeEventListener('click', handleClick);
                }
                asciiContainer.addEventListener('click', handleClick);
            } else {
                console.log('asciiContainer not found. Could not initialize game.');
            }
        });
    }

    gameLoop(keyPressed: string) {
        switch (this.GameState) {
            case GameState.INSTRUCTIONS:
                this.instructions();
                break;
            case GameState.MAIN:
                this.mainGame(keyPressed);
                break;
            case GameState.END:
                this.endGame(keyPressed);
                break;
        }
    }


    instructions() {
        console.log('instructions');
        lastMessage = '';
        entityList.length = 0;
        generateMap();
        placeEntities();
        startGameRender();
        display.drawText(0, 0, `Get 3 coins and escape before the Bat does!`);
        display.drawText(0, 1, `Press any key to start.`);
        this.GameState = GameState.MAIN;
    }

    mainGame(keyPressed: string) {
        switch (keyPressed) {
            case 'ArrowUp':
                this.handleTurn(0, -1);
                break;
            case 'ArrowDown':
                this.handleTurn(0, 1);
                break;
            case 'ArrowLeft':
                this.handleTurn(-1, 0);
                break;
            case 'ArrowRight':
                this.handleTurn(1, 0);
                break;
        }
        drawMap();
    }

    handleTurn(x: number, y: number) {
        player.move(x, y);
        bat.move();
    }

    endGame(keyPressed: string) {
        console.log('end game');
        display.clear();
        display.drawText(0, 0, this.gameOverMessage);
        display.drawText(0, 1, `Press 'r' to restart.`);
        if (keyPressed === 'r') {
            console.log('restarting game');
            this.GameState = GameState.INSTRUCTIONS;
            this.instructions();
        }
    }

    public gameOver(result: text) {
        this.gameOverMessage = result;
        this.GameState = GameState.END;
        this.endGame('');
    }
}

// TODO: Fix bug where extra keypress is needed after endgame
// TODO: Spend all your coins to teleport the bat to a random location
// TODO: If the player has 3 or more coins and is near the stairs, maybe the bat teleports the player
// TODO: Bat needs to handle situation where no coins are left
// TODO: Fully encapsulate game state into GameEngine class

export const gameEngine = new GameEngine();