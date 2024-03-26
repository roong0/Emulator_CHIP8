const SCALE = 10; // Used to scale display (Original is 64x32)

// Write stuff about how this works.
// Display used to store the values. This only is updated once you write the display to the canvas.

class Display {
    constructor(canvas) {
        this.scale = SCALE;
        this.cols = 64;
        this.rows = 32;
        this.display = new Array(this.cols*this.rows); //1D array
        //for(let i=0; i < this.cols*this.rows; i++) // DOnt need to initialise??
        //    this.display[i] = 0;

            this.canvas = canvas;
            this.canvas.width = this.cols * this.scale;
            this.canvas.height = this.rows * this.scale;
            this.ctx = this.canvas.getContext('2d');
    }
    // Sets pixel at (x,y) to 1. Display is wrap around. Returns value 
    setPixel(x,y) {
        if(x > this.cols)
            x -= this.cols;
        else if(x < 0)
            x += this.cols;

        if(y > this.rows)
            y -= this.rows;
        else if(y<0)
            y += this.rows;

        this.display[x + (y * this.cols)] ^= 1; // Added using XOR
        return !this.display[x + (y * this.cols)];// != 1; // Whats the point of returning this?
    }
    clear() {
        for(let i=0; i < this.cols*this.rows; i++)
            this.display[i] = 0;
    }
    // Sets values in display to the canvas
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);// Clears
        for (let i = 0; i < this.cols * this.rows; i++) {
            // Gets x & y values
            let x = (i % this.cols) * this.scale;
            let y = Math.floor(i / this.cols) * this.scale;

            if (this.display[i]) { //Sets pixel if required
                this.ctx.fillStyle = '#000'; // Change colour later
                this.ctx.fillRect(x, y, this.scale, this.scale);
            }
        }
    }
    testDisplay() {
        console.log("Test Render Called");
        this.setPixel(0, 0);
        this.setPixel(5, 2);
        this.setPixel(5, 3);
        this.setPixel(5, 4);
        this.render();
    }
}

export default Display;