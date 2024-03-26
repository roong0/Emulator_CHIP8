import Display from './Display.js';
import Chip8 from './Chip8.js';
import Keyboard from './Keyboard.js';
import Speaker from './Speaker.js';

const freq = 60;
let startTime, now, then, elapsed, loop;

const romSelector = document.getElementById('roms');
romSelector.addEventListener('change', () => {
    const rom = romSelector.options[romSelector.selectedIndex].value;
    loadROM(rom);
});

const reloadButton = document.getElementById('reload');
reloadButton.addEventListener('click', () => {
    const rom = romSelector.options[romSelector.selectedIndex].value;
    console.log(rom);
    loadROM(rom);
});


function loadROM(romName) {
    const display = new Display(document.getElementById('screen'));
    const keyboard = new Keyboard();
    const speaker = new Speaker();
    const chip8 = new Chip8(display, keyboard, speaker);
    window.cancelAnimationFrame(loop);

    function step() {
        now = Date.now();
        elapsed = now - then;
        if(elapsed > 1000/freq){ // The period
            chip8.cycle();
        }
        loop = requestAnimationFrame(step);
    }
    const url = `/rom/${romName}`;
    reloadButton.disabled = true;

    fetch(url).then(res => res.arrayBuffer())
            .then(buffer => {
                    const program = new Uint8Array(buffer);
                    then = Date.now();
                    startTime = then;
                    reloadButton.disabled = false;
                    chip8.loadSpritesIntoMemory();
                    chip8.loadProgramIntoMemory(program);
                    loop = requestAnimationFrame(step);
    });
}