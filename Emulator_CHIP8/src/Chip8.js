const speed = 10; // Used too speed up/down. Chip8 designed for 60Hz

class Chip8 {
    constructor(display, keyboard, speaker) {
        this.memory= new Uint8Array(4096); // 4096 Bytes of memory
        this.v = new Uint8Array(16); // 16 8 bit registers
        // Could change these so they are not default number type
        this.indexRegister = 0;
        this.soundRegister = 0;
        this.timerRegister = 0;
        this.pc = 0x200; // Chip8 programs start at 0x200.
        this.stack = [];
        this.sp = 0;

        this.paused = false;
        this.speed = speed;

        // Input/Outputs
        this.display = display;
        this.keyboard = keyboard;
        this.speaker = speaker;
    }

    // Sprites are stored from 0x0000 onwards
    loadSpritesIntoMemory() {
        const sprites = [
            0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
            0x20, 0x60, 0x20, 0x20, 0x70, // 1
            0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
            0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
            0x90, 0x90, 0xF0, 0x10, 0x10, // 4
            0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
            0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
            0xF0, 0x10, 0x20, 0x40, 0x40, // 7
            0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
            0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
            0xF0, 0x90, 0xF0, 0x90, 0x90, // A
            0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
            0xF0, 0x80, 0x80, 0x80, 0xF0, // C
            0xE0, 0x90, 0x90, 0x90, 0xE0, // D
            0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
            0xF0, 0x80, 0xF0, 0x80, 0x80  // F
        ];
        for (let i = 0; i < sprites.length; i++) {
            this.memory[i] = sprites[i];
        }
    }

    loadProgramIntoMemory(rom) { // Is this the ROM
        for (let location = 0; location < rom.length; location++) {
            this.memory[0x200 + location] = rom[location];
        }
    }

    updateTimers() {
        if (this.delayTimer > 0) {
            this.delayTimer -= 1;
        }
    
        if (this.soundTimer > 0) {
            this.soundTimer -= 1;
        }
    }

    sound() {
        if(this.soundTimer > 0)
            this.speaker.play();
        else
            this.speaker.stop();
    }

    cycle() {
        for (let i = 0; i < this.speed; i++) {
            if (!this.paused) {
                let instruction = (this.memory[this.pc] << 8 | this.memory[this.pc + 1]);
                this.pc += 2;
                this.executeInstruction(instruction);
                
            }
        }
        if (!this.paused) {
            this.updateTimers();
        }
        this.sound();
        this.display.render();
    }

    executeInstruction(instruction) {
        // Would likely run faster if these moved into each switch so only the relevant ones are used.
        //let nnn = addr = (instruction & 0x0FFF); 
        //let n = nibble = (instruction & 0x000F);
        //let kk = byte = (instruction & 0x00FF);
        let x = (instruction & 0x0F00) >> 8;
        let y = (instruction & 0x00F0) >> 4;

        switch(instruction & 0xF000) {
            case 0x0000:
                switch(instruction) {
                    case 0x00E0:
                        this.display.clear(); // CLR
                        break;
                    case 0x0EE:
                        this.pc = this.stack.pop(); // RET (May later change to this.sp--)
                        break;
                }
                break;
            case 0x1000:
                this.pc = instruction & 0xFFF; // JP addr
                break;
            case 0x2000:
                this.stack.push(this.pc);
                this.pc = instruction & 0xFFF; // CALL addr
                break;
            case 0x3000:
                if(this.v[x] === (instruction & 0xFF)) // SE Vx, byte
                    this.pc += 2;
                break;
            case 0x4000:
                if(this.v[x] != (instruction & 0xFF)) { // SNE Vx, byte
                    this.pc += 2;
                }
                break;
            case 0x5000:
                if(this.v[x] === this.v[y]) { // SE Vx, Vy
                    this.pc += 2;
                }
                break;
            case 0x6000:
                //console.log(x);
                this.v[x] = (instruction & 0xFF); // LD Vx, byte
                break;
            case 0x7000:
                this.v[x] += (instruction & 0xFF); // ADD Vx, byte
                break;
            case 0x8000:
                switch (instruction & 0xF) {
                    case 0x0:
                        this.v[x] = this.v[y]; // LD Vx, Vy
                        break;
                    case 0x1:
                        this.v[x] |= this.v[y]; // OR Vx, Vy
                        break;
                    case 0x2:
                        this.v[x] &= this.v[y]; // AND Vx, Vy
                        break;
                    case 0x3:
                        this.v[x] ^= this.v[y]; // XOR Vx, Vy
                        break;
                    case 0x4:
                        let sum = (this.v[x] += this.v[y]); // ADD Vx, Vy

                        this.v[0xF] = 0;

                        if(sum > 0xFF)
                            this.v[0xF] = 1;

                        this.v[x] = sum;
                        break;
                    case 0x5:
                        this.v[0xF] = 0;            
                        if(this.v[x] > this.v[y]) // SUB Vx, Vy
                            this.v[0xF] = 1;
                        
                        this.v[x] -= this.v[y];
                        break;
                    case 0x6:
                        this.v[0xF] = this.v[x] & 0x1; // SHR Vx, vy
                        this.v[x] >>= 1;
                        break;
                    case 0x7:
                        this.v[0xF] = 0;       
                        if(this.v[y] > this.v[x]) // SUBN Vx, Vy
                            this.v[0xF] = 1;

                        this.v[x] = this.v[y] - this.v[x];
                        break;
                    case 0xE:
                        this.v[0xF] = this.v[x] & 0x80; // SHL Vx {, Vy}
                        this.v[x] <<= 1;
                        break;
                    default:
                        throw new Error('BAD OPCODE');
                }
                break;
            case 0x9000:
                if(this.v[x] != this.v[y]) // SNE Vx, Vy
                    this.pc += 2;
                break;
            case 0xA000:
                this.index = instruction & 0xFFF; // LD I, addr
                break;
            case 0xB000:
                this.pc = (instruction & 0xFFF) + this.v[0]; // JP V0, addr
                break;
            case 0xC000:
                const rand = Math.floor(Math.random() * 0xFF); // RND Vx, byte
                this.v[x] = rand & (instruction & 0xFF);
                break;
            case 0xD000:
                let width = 8; // DRW Vx, Vy, nibble
                let height = (instruction & 0xF);
                
                this.v[0xF] = 0;

                for(let row = 0; row < height; row++) {
                    let sprite = this.memory[this.index + row];

                    for(let col = 0; col < width; col++) {
                        if((sprite & 0x80) > 0) {
                            if(this.display.setPixel(this.v[x] + col, this.v[y] + row)) {
                                this.v[0xF] = 1;
                            }
                        }
                        sprite <<= 1;
                    }
                }

                break;
            case 0xE000:
                switch (instruction & 0xFF) {
                    case 0x9E:
                        if(this.keyboard.isKeyPressed(this.v[x])) { // SKP Vx
                            this.pc += 2;
                        }
                        break;
                    case 0xA1:
                        if (!this.keyboard.isKeyPressed(this.v[x])) { // SKNP Vx
                            this.pc += 2;
                        }
                        break;
                    default:
                        throw new Error('BAD OPCODE');
                }
        
                break;
            case 0xF000:
                switch(instruction & 0xFF) {
                    case 0x07:
                        this.v[x] = this.delayTimer; // LD Vx, DT
                        break;
                    case 0x0A:
                        this.paused = true; // LD Vx, K

                        let nextKeyPress = (key) => {
                            this.v[x] = key;
                            this.paused = false;
                        };

                        this.keyboard.onNextKeyPress = nextKeyPress.bind(this);
                        break;
                    case 0x15:
                        this.delayTimer = this.v[x]; // LD Dt, Vx
                        break;
                    case 0x18:
                        this.soundTimer = this.v[x]; // LD ST, Vx
                        break;
                    case 0x1E:
                        this.index += this.v[x]; // ADD I, Vx
                        break;
                    case 0x29:
                        this.index = this.v[x] * 5; //  LD F, Vx
                        break;
                    case 0x33:
                        this.memory[this.index] = parseInt(this.v[x] / 100); // LD B, Vx
                        this.memory[this.index + 1] = parseInt((this.v[x]%100)/10);
                        this.memory[this.index + 2] = parseInt(this.v[x]%10);
                        break;
                    case 0x55:
                        for (let ri=0; ri <= x; ri++)  // LD [I], Vx
                            this.memory[this.index + ri] = this.v[ri];
                        break;
                    case 0x65:
                        for(let ri=0; ri <= x; ri++) // LD Vx, [I]
                            this.v[ri] = this.memory[this.index + ri];
                        break;
                    default:
                        throw new Error('0xF BAD OPCODE ' + instruction);
                }
                break;
            default:
                throw new Error('BAD OPCODE');

        }

    }

}

export default Chip8;