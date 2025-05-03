// Falling Sand Game - Single File Implementation

// Model class (from model.js)
class Model {
    constructor() {
        this.defaultColor = [0, 0, 0];
    }

    reset() {
        this.grid = Array(this.width).fill().map(() => Array(this.height).fill(0));
        this.hueValue = 200;
    }

    setup(canvas, amount, calculations) {
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;
        this.calculations = calculations;
        this.amount = amount;
        this.grid = Array(this.width).fill().map(() => Array(this.height).fill(0));
        this.hueValue = 200;

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = `rgb(${this.defaultColor[0]}, ${this.defaultColor[1]}, ${this.defaultColor[2]})`;
        ctx.fillRect(0, 0, this.width, this.height);
    }

    withinCols(x) {
        return x >= 0 && x < this.width;
    }

    withinRows(y) {
        return y >= 0 && y < this.height;
    }

    onMouseDragged(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) * (this.width / rect.width));
        const y = Math.floor((event.clientY - rect.top) * (this.height / rect.height));
        
        let extent = Math.floor(this.amount / 2);
        for(let i = -extent; i <= extent; i++) {
            for(let j = -extent; j <= extent; j++) {
                if (this.withinCols(x+i) && this.withinRows(y+j)) {
                    this.grid[x+i][y+j] = this.hueValue;
                }
            }
        }

        this.hueValue = (this.hueValue + 1) % 360;
    }

    simulate() {
        let nextGrid = Array(this.width).fill().map(() => Array(this.height).fill(0));
        
        for (let x = 0; x < this.width; x++) {
            for (let y = this.height - 1; y >= 0; y--) {
                let state = this.grid[x][y];
                if (state > 0) {
                    let below = y + 1 < this.height ? this.grid[x][y + 1] : 1;
                    let dir = Math.random() < 0.5 ? 1 : -1;

                    let belowA = x + dir >= 0 && x + dir < this.width ? this.grid[x + dir][y + 1] : 1;
                    let belowB = x - dir >= 0 && x - dir < this.width ? this.grid[x - dir][y + 1] : 1;

                    if (below === 0) {
                        nextGrid[x][y + 1] = state;
                    } else if (belowA === 0) {
                        nextGrid[x + dir][y + 1] = state;
                    } else if (belowB === 0) {
                        nextGrid[x - dir][y + 1] = state;
                    } else {
                        nextGrid[x][y] = state;
                    }
                }
            }
        }

        this.grid = nextGrid;
    }

    render() {
        const ctx = this.canvas.getContext("2d");
        ctx.fillStyle = `rgb(${this.defaultColor[0]}, ${this.defaultColor[1]}, ${this.defaultColor[2]})`;
        ctx.fillRect(0, 0, this.width, this.height);

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (this.grid[x][y] > 0) {
                    ctx.fillStyle = `HSL(${this.grid[x][y]}, 100%, 50%)`;
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
    }

    draw() {
        this.render();
        for (let i = 0; i < this.calculations; i++) {
            this.simulate();
        }
    }
}

// Game logic (from index.js, adapted for single file)
let model;
let canvas;
let isDrawing = false;
let isFullscreen = false;

document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('canvas');
    const gameContainer = canvas.parentElement;
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    // Set canvas size based on container
    const updateCanvasSize = () => {
        const containerWidth = gameContainer.clientWidth;
        const containerHeight = gameContainer.clientHeight;
        // Use full width and maintain a 1:1 aspect ratio
        const size = Math.min(containerWidth, containerHeight);
        canvas.width = containerWidth;
        canvas.height = size;
    };

    // Initial setup
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Game settings
    const sandAmount = 5;
    const calculations = 4;
    const framePerSecond = 60;

    // Initialize model
    model = new Model();
    model.setup(canvas, sandAmount, calculations);
    
    // Prevent drag and touch actions
    canvas.ondragstart = () => false;
    canvas.ontouchstart = (e) => e.preventDefault();
    
    // Mouse and touch event handlers
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    
    // Touch event handlers
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);
    
    // Fullscreen functionality
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    document.addEventListener('fullscreenchange', updateFullscreenButton);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
    document.addEventListener('mozfullscreenchange', updateFullscreenButton);
    document.addEventListener('MSFullscreenChange', updateFullscreenButton);
    
    // Clear button functionality
    const clearBtn = document.getElementById('clearBtn');
    clearBtn.addEventListener('click', () => {
        model.reset();
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = `rgb(${model.defaultColor[0]}, ${model.defaultColor[1]}, ${model.defaultColor[2]})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    // Start animation loop
    function animate() {
        model.draw();
        requestAnimationFrame(animate);
    }
    animate();
});

function toggleFullscreen() {
    const gameContainer = document.querySelector('.game-container');
    if (!isFullscreen) {
        if (gameContainer.requestFullscreen) {
            gameContainer.requestFullscreen();
        } else if (gameContainer.webkitRequestFullscreen) {
            gameContainer.webkitRequestFullscreen();
        } else if (gameContainer.mozRequestFullScreen) {
            gameContainer.mozRequestFullScreen();
        } else if (gameContainer.msRequestFullscreen) {
            gameContainer.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

function updateFullscreenButton() {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || 
                     document.mozFullScreenElement || document.msFullscreenElement);
    
    if (isFullscreen) {
        fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
}

function startDrawing(e) {
    isDrawing = true;
    model.onMouseDragged(e);
}

function draw(e) {
    if (!isDrawing) return;
    model.onMouseDragged(e);
}

function stopDrawing() {
    isDrawing = false;
}

function handleTouchStart(e) {
    e.preventDefault();
    isDrawing = true;
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    model.onMouseDragged(mouseEvent);
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!isDrawing) return;
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    model.onMouseDragged(mouseEvent);
} 
