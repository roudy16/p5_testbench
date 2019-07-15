// ##########
// APP SPECIFIC
// ##########

const SCREEN_WIDTH = 1280;
const SCREEN_HEIGHT = 800;

let gNow;
let gIdSrc = 0 >>> 0;
let gEntities = [];

let gColor1 = new ColorRGB(255, 204, 153);
let gColor2 = new ColorRGB(250, 250, 250);
let gColor3 = new ColorRGB(180, 180, 180);
let gBackgroundColor1 = new ColorRGB(64, 64, 64);
let gBackgroundColor2 = new ColorRGB(250, 125, 47);
let gBackgroundImage;
let gRecentFrameTimes = new RingBuffer(64);

function setup() {
    randomSeed(0);

    gNow = Date.now();

    createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
    gBackgroundImage = createRaycastImage(SCREEN_WIDTH, SCREEN_HEIGHT);
}

// Main loop function for P5
function draw() {
    // Update global 'now' time
    gNow = Date.now();

    gEntities.forEach(it => it.update());

    // Clear scene by drawing background
    image(gBackgroundImage, 0, 0);

    gEntities.forEach(it => it.draw());

    // Handle entity lifetimes, clean up dead entities, persist live entities
    let toLive = [];
    gEntities.forEach(it => {
        if (it.age < 1.0) {
            toLive.push(it);
        }
    });
    gEntities = toLive;

    // Keep track of time taken to update frame
    let frameTime = Date.now() - gNow;
    gRecentFrameTimes.push(frameTime);
    //console.log("Frame Time: %d", gRecentFrameTimes.get(gRecentFrameTimes.size - 1));
    //console.log("Recent Avg Time: %d", gRecentFrameTimes.calcAvg());
}