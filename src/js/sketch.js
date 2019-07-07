class RingBuffer {
    constructor(sz) {
        this.buf = new Array(sz);
        this.beg = 0;
        this.end = 0;
        this.size = 0;
        this.cap = sz;
    }

    push(item) {
        if (this.end === this.cap) {
            this.end = 0;
        }

        this.buf[this.end] = item;

        if (this.size < this.cap) {
            this.size += 1;
        }

        this.end += 1;

        if (this.size === this.cap) {
            this.beg += 1;

            if (this.beg === this.size) {
                this.beg = 0;
            } else if (this.end === this.size) {
                this.end = 0;
            }
        }
    }

    get(index) {
        let calcIdx = (this.beg + index) % this.cap;
        return this.buf[calcIdx];
    }

    calcAvg() {
        let acc = 0.0;

        for (let i = 0; i < this.size; i++) {
            acc += this.buf[i];
        }

        if (this.size !== 0) {
            return acc / this.size;
        } else {
            return 0.0;
        }
    }
}

class Point2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Point3D {
    constructor(x, y ,z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class ColorRGB {
    constructor(r, g, b) {
        this.r = r|0;
        this.g = g|0;
        this.b = b|0;
    }
}

class QuadraticBezier2D {
    constructor(p0, p1, p2) {
        this.p0 = p0;
        this.p1 = p1;
        this.p2 = p2;
        this._p0minusp1 = new Point2D(p0.x - p1.x, p0.y - p1.y);
        this._p2minusp1 = new Point2D(p2.x - p1.x, p2.y - p1.y);
    }

    calcPoint(t) {
        let oneMinusT = (1.0 - t);
        let a = oneMinusT * oneMinusT;
        let b = t * t;
        let x = this.p1.x + a * this._p0minusp1.x + b * this._p2minusp1.x;
        let y = this.p1.y + a * this._p0minusp1.y + b * this._p2minusp1.y;
        return new Point2D(x, y);
    }
}

class CubicBezier2D {
    constructor(p0, p1, p2, p3) {
        this.p0 = p0;
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
    }

    calcPoint(t) {
        let oneMinusT = (1.0 - t);
        let a = oneMinusT * oneMinusT * oneMinusT;
        let b = 3.0 * t * oneMinusT * oneMinusT;
        let c = 3.0 * t * t * oneMinusT;
        let d = t * t * t;

        let x = a * this.p0.x + b * this.p1.x + c * this.p2.x + d * this.p3.x;
        let y = a * this.p0.y + b * this.p1.y + c * this.p2.y + d * this.p3.y;
        return new Point2D(x, y);
    }
}

// TODO: Entity Builder

class CircleEntity {
    constructor(radius, pos, col, lifetime, path) {
        this.id = genNewId();

        this.radius = radius;
        this.position = pos;

        // TODO: color to builder
        this.color = col;

        // TODO: lifetime to builder
        this.lifetime = lifetime|0;
        this.birthTime = gNow;
        this.age = 0.0;

        // TODO: Move animation data generation to builder
        this.path = path;
    }

    update() {
        this.age = (gNow - this.birthTime) / (this.lifetime * 1.0);

        if (this.path !== null) {
            this.position = this.path.calcPoint(this.age);
        }
    }

    draw() {
        fill(this.color.r, this.color.g, this.color.b);
        noStroke();
        circle(this.position.x, this.position.y, this.radius);
    }
}


// ##########
// ENTITY MANAGEMENT
// ##########

function genNewId() {
    let val = gIdSrc;
    gIdSrc += 1;
    return val;
}

// ##########
// SHAPE GENERATION
// ##########

function genPointOnLineAt3D(x0, y0, z0, x1, y1, z1, t) {
    let x = (x1 - x0) * t + x0;
    let y = (y1 - y0) * t + y0;
    let z = (z1 - z0) * t + z0;
    return [x, y, z];
}

function genColorOnLine(color1, color2) {
    let posFactor = random();
    return genColorOnLineAt(color1, color2, posFactor);
}

function genColorOnLineAt(color1, color2, t) {
    let rgb = genPointOnLineAt3D(color1.r, color1.g, color1.b, color2.r, color2.g, color2.b, t);
    return new ColorRGB(Math.floor(rgb[0]), Math.floor(rgb[1]), Math.floor(rgb[2]));
}

// ##########
// IMAGE GENERATION
// ##########

function createRadialGradientImage(w, h, x, y, ci, co) {
    colorMode(RGB, 255);

    let img = createImage(w, h);
    img.loadPixels();

    let diagDistance = h * h + w * w;
    let diagInverse = 1.0 / diagDistance;

    for (let i = 0; i < w; i++) {
        let i2 = (x - i) * (x - i);

        for (let j = 0; j < h; j++) {
            let j2 = (j - y) * (j - y);
            let t = (i2 + j2) * diagInverse;
            let col = genColorOnLineAt(ci, co, t);

            img.set(i, j, color(col.r, col.g, col.b));
        }
    }

    img.updatePixels();
    return img;
}

// ##########
// APP SPECIFIC
// ##########

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