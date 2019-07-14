const SCREEN_WIDTH = 1280;
const SCREEN_HEIGHT = 800;

let gNow;
let gIdSrc = 0 >>> 0;
let gEntities = [];

let gColor1 = new ColorRGB(17, 107, 250);
let gColor2 = new ColorRGB(242, 15, 56);
let gBackgroundColor1 = new ColorRGB(255, 77, 115);
let gBackgroundColor2 = new ColorRGB(250, 125, 47);
let gBackgroundImage;
let gRecentFrameTimes = new RingBuffer(64);

let screenOrigin = new Point2D(0.0, 0.0);
let screenTopRight = new Point2D((SCREEN_WIDTH - 1.0), 0.0);
let screenBottomRight = new Point2D(SCREEN_WIDTH - 1.0, SCREEN_HEIGHT - 1.0);

/**
 * @param {int} lifetime The lifetime of the Entity in milliseconds
 * @returns {CircleEntity}
 */
function genRandomCircle(lifetime) {
    let col = genColorOnLine(gColor1, gColor2);
    let controlPoints = genRandomPathPoints();
    let path = new CubicBezier2D(screenOrigin, controlPoints[0], controlPoints[1], screenBottomRight);
    return new CircleEntity(genRandomRadius(), screenOrigin, col, lifetime, path);
}

function genRandomPointOnScreen() {
    let randX = Math.floor(random(SCREEN_WIDTH));
    let randY = Math.floor(random(SCREEN_HEIGHT));
    return new Point2D(randX, randY);
}

function genRandomPathPoints() {
    const zoneWidth = SCREEN_WIDTH * 0.125;
    const zone1LeftBound = SCREEN_WIDTH * 0.25;
    const zone2LeftBound = SCREEN_WIDTH * 0.625;

    let points = new Array(2);
    let r0 = random();
    let r1 = random();
    let r2 = random();
    let r3 = random();

    let x0 = r0 * zoneWidth + zone1LeftBound;
    let x1 = r1 * zoneWidth + zone2LeftBound;
    let y0 = r2 * SCREEN_HEIGHT;
    let y1 = r3 * SCREEN_HEIGHT;

    points[0] = new Point2D(x0, y0);
    points[1] = new Point2D(x1, y1);
    return points;
}

function genRandomRadius() {
    return randomGaussian(70, 20) + 10
}

function setup() {
    randomSeed(0);

    gNow = Date.now();

    createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
    gBackgroundImage = createRadialGradientImage(SCREEN_WIDTH, SCREEN_HEIGHT, 0, 0, gBackgroundColor1, gBackgroundColor2);
}

// Main loop function for P5
function draw() {
    // Update global 'now' time
    gNow = Date.now();

    // Add a new Circle each frame
    let newCircle = genRandomCircle(2500);
    gEntities.push(newCircle);

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
