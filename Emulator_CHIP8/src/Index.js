import Display from './Display.js';
import Chip8 from './Chip8.js';
import Keyboard from './Keyboard.js';
import Speaker from './Speaker.js';

const freq = 60;
const interval = 1000/freq; // Change this for different speeds 
let startTime, now, then, elapsed, loop;

const romSelector = document.getElementById('roms');
romSelector.addEventListener('change', () => {
    const rom = romSelector.options[romSelector.selectedIndex].value;
    //console.log(rom);
    loadROM(rom);
});

const reloadButton = document.getElementById('reload');
reloadButton.addEventListener('click', () => {
    //console.log("clicked Rom:"+romSelector.selectedIndex);
    const rom = romSelector.options[romSelector.selectedIndex].value;
    console.log(rom);
    loadROM(rom);
});


function loadROM(romName) {
    const display = new Display(document.getElementById('screen'));
    const keyboard = new Keyboard();
    const speaker = new Speaker();
    //const chip8 = new Chip8(monitor, keyboard, speaker);
    const chip8 = new Chip8(display, keyboard, speaker);
    window.cancelAnimationFrame(loop);

    function step() {
        now = Date.now();
        elapsed = now - then;
        if(elapsed > interval){
            chip8.cycle();
        }
        loop = requestAnimationFrame(step);
    }
    const url = `/rom/${romName}`;
    reloadButton.disabled = true; /// HERE
    //loadingText.innerHTML = 'Loading ' + romName + ' ... '; // HRE

    fetch(url).then(res => res.arrayBuffer())
            .then(buffer => {
                    //console.log(buffer.byteLength);
                    const program = new Uint8Array(buffer);
                    //interval = 1000 / FPS;
                    then = Date.now();
                    startTime = then;
                    reloadButton.disabled = false;
                    //chip8.loadSpritsIntoMemory();
                    chip8.loadSpritesIntoMemory();
                    chip8.loadProgramIntoMemory(program);
                    //console.log(program);
                    loop = requestAnimationFrame(step);
                    //loadingText.innerHTML = 'Playing ' + romName + ' ';
    });
}

//loadROM('SpaceInvaders.ch8');

// Have a feeling quite memory intensive a would start up a new ROM evertime?