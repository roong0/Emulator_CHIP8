//import Renderer from './renderer.js';

//const renderer = new Renderer(10);
import Display from './src/Display.js';
const display = new Display(document.getElementById('screen'));

let loop;

let fps = 60, fpsInterval, startTime, now, then, elapsed;

function init() {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;

    // TESTING CODE. REMOVE WHEN DONE TESTING.
    display.testDisplay();
    display.render();
    // END TESTING CODE

    loop = requestAnimationFrame(step);
}

function step() {
    now = Date.now();
    elapsed = now - then;

    if (elapsed > fpsInterval) {
        // Cycle the CPU. We'll come back to this later and fill it out.
    }

    loop = requestAnimationFrame(step);
}

init();