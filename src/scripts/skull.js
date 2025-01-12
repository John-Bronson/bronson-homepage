import matrix from './skull_art.mjs';

let asciiArt = [
    ['. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .'],
    ['. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .'],
    ['. . . . . . . . . . . . . . ? @ @ @ @ @ @ ? . . . . . . . . . . . . . .'],
    ['. . . . . . . . . . . . @ @ @ @ @ @ @ @ @ @ @ @ . . . . . . . . . . . .'],
    ['. . . . . . . . . . ? @ @ @ @ @ @ @ @ @ @ @ @ @ @ ? . . . . . . . . . .'],
    ['. . . . . . . . ? ? @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ . . . . . . . . .'],
    ['. . . . . . . ? ? ? @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ ? . . . . . . .'],
    ['. . . . . . ? ? ? @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ ? . . . . . .'],
    ['. . . . . ? ? ? @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ . . . . .'],
    ['. . . . ? ? ? @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ ? . . . .'],
    ['. . . . ? ? ? @ @ ? @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ ? . . . .'],
    ['. . . . ? ? ? @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ ? . . . .'],
    ['. . . ? ? ? ? @ @ @ ? @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ ? ? . . .'],
    ['. . . ? ? ? ? @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ ? @ ? . . .'],
    ['. . . ? . ? ? @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ @ ? ? ? ? . . .'],
    ['. . . ? ? ? . ? @ @ @ ? ? ? ? @ @ @ @ @ @ @ @ ? @ @ @ @ @ @ ? ? ? . . .'],
    ['. . . . ? ? . @ @ @ @ @ . ? ? ? @ @ @ @ @ @ ? . . . @ @ @ @ ? ? @ . . .'],
    ['. . . . . . . ? ? . . . . . . ? ? @ @ @ @ ? . . . . . . ? @ ? ? @ . . .'],
    ['. . . . . . . . . . . . . . . . ? ? @ ? ? ? . . . . . . . ? ? ? ? . . .'],
    ['. . . . . . . ? . . . . . . . . ? ? @ @ @ @ . . . . . . . ? @ ? . . . .'],
    ['. . . . . . . ? . . . . . . . . @ ? @ @ @ ? . . . . . . . ? @ ? ? . . .'],
    ['. . . . . . . ? ? . . . . . . . @ ? @ @ @ ? . . . . . . . ? @ . ? . . .'],
    ['. . . . . . ? ? ? ? . . . . . . ? . . . @ ? . . . . . ? . @ ? ? ? . . .'],
    ['. . . . . . ? @ ? ? ? ? . . . @ ? . . . ? @ ? ? . ? ? ? ? @ @ ? . . . .'],
    ['. . . . . . ? @ @ ? ? ? . ? @ ? . . . . . ? @ @ ? ? ? @ ? @ @ @ . . . .'],
    ['. . . . . ? ? ? @ @ @ ? @ @ ? ? . . . . . ? @ @ @ @ @ @ @ @ @ @ . . . .'],
    ['. . . . . ? ? ? ? ? . ? . ? ? @ . . . . . ? @ ? . ? ? ? ? @ @ ? . . . .'],
    ['. . . . . ? ? ? ? ? . . ? . ? @ . . . . . . @ @ @ ? ? @ @ ? ? ? . . . .'],
    ['. . . . . . ? ? ? ? ? ? ? ? @ @ . . . . . ? @ @ @ @ @ ? ? ? ? . . . . .'],
    ['. . . . . . . . . . . ? @ ? @ @ . . . . . @ @ @ @ @ . . . ? . . . . . .'],
    ['. . . . . . . . . . . . @ ? @ @ @ ? ? @ @ @ @ @ @ ? . . . . . . . . . .'],
    ['. . . . . . . . . . . . ? ? @ ? . . . . ? ? @ @ @ ? . . . . . . . . . .'],
    ['. . . . . . . . . . . ? ? . . ? . . . . . . . ? ? @ . . . . . . . . . .'],
    ['. . . . . . . . . . . @ ? . . . . . . . . . . . ? @ . . . . . . . . . .'],
    ['. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .'],
    ['. . . . . . . . . . . . . . . . . . . . . . . . . @littlebitspace 06-21'],
];

matrix.forEach((line, index) => {
    console.log(line.join(''));
});


let isRunning = false;
let interval = null;

export function startAsciiAnimation() {
    if (isRunning) return;
    isRunning = true;

    const container = document.getElementById('ascii-container');
    if (!container) {
        console.error("Container element not found. Ensure the DOM is fully loaded.");
        return;
    }

    intervalId = setInterval(() => {
        if (!isRunning) return;

        container.innerHTML = ''; // Clear previous content

        asciiArt.forEach(line => {
            const lineElement = document.createElement('div');
            lineElement.textContent = line.join('');
            container.appendChild(lineElement);
        });

        asciiArt.forEach((line, index) => {
            asciiArt[index] = line.map(char => (char === '@' ? '*' : '@'));
        });
    }, 500);
}

export function stopAsciiAnimation() {
    isRunning = false;
    clearInterval(intervalId);
    console.log('animation stopped.')
}

export function toggleAsciiAnimation() {
    if (isRunning) {
        stopAsciiAnimation();
    } else {
        startAsciiAnimation();
    }
}
