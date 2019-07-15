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

let gCardiodOrigin = new Point2D(0.1 * SCREEN_WIDTH, 0.5 * SCREEN_HEIGHT);
let gCusp = new Point2D(gCardiodOrigin.x + SCREEN_WIDTH * 0.10, gCardiodOrigin.y);
let screenMidRight = new Point2D((SCREEN_WIDTH - 1.0), 0.5 * SCREEN_HEIGHT);

function createCardiodImage(w, h) {
    colorMode(RGB, 255);

    let img = createImage(w, h);
    img.loadPixels();

    let color1 = gColor1;
    let color2 = gBackgroundColor1;

    let wInverse = 1.0 / w;
    let hInverse = 1.0 / h;

    let cardiod_a = 0.10;

    for (let j = 0; j < h; j++) {
        for (let i = 0; i < w; i++) {
            let x_norm = i * wInverse;
            let y_norm = j * hInverse;

            let x_from_mid = x_norm - 0.1;
            let y_from_mid = y_norm - 0.5;


            let theta = atan2(y_from_mid, x_from_mid);

            let x_cardiod = cardiod_a * (2.0 * cos(theta) - cos(2.0 * theta) - 1.0);
            let y_cardiod = cardiod_a * (2.0 * sin(theta) - sin(2.0 * theta));

            let dist_from_cardiod = sqrt(sq(x_from_mid - x_cardiod) + sq(y_from_mid - y_cardiod));

            let dist_mid_to_cardiod = x_cardiod * x_cardiod + y_cardiod * y_cardiod;
            let dist_from_mid = (x_from_mid * x_from_mid) + (y_from_mid * y_from_mid);
            let is_inside = dist_from_mid < dist_mid_to_cardiod;

            let t;
            let col;

            if (is_inside) {
                t = 0.0;
                col = genColorOnLineAt(color1, color2, t);
            } else {
                t = clampTo(0.0, 0.05, dist_from_cardiod) * 20.0;
                t = pow(t, 3.0);
                col = genColorOnLineAt(color1, color2, t);
            }

            img.set(i, j, color(col.r, col.g, col.b));
        }
    }

    img.updatePixels();
    return img;
}

/**
 * @param {int} lifetime The lifetime of the Entity in milliseconds
 * @returns {CircleEntity}
 */
function genRandomCircle(lifetime) {
    let col = genColorOnLine(gColor2, gColor3);
    let controlPoints = genRandomPathPoints();
    let path = new CubicBezier2D(gCusp, controlPoints[0], controlPoints[1], screenMidRight);
    return new CircleEntity(genRandomRadius(), gCusp, col, lifetime, path);
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
    gBackgroundImage = createCardiodImage(SCREEN_WIDTH, SCREEN_HEIGHT);
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
