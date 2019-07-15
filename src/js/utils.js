// ##########
// NUMERIC
// ##########

function clampTo(min, max, val) {
    if (val < min) return min;
    if (val > max)  return max;
    return val;
}

// ##########
// PARAMETRIC
// ##########

function genPointOnLineAt3D(x0, y0, z0, x1, y1, z1, t) {
    let x = (x1 - x0) * t + x0;
    let y = (y1 - y0) * t + y0;
    let z = (z1 - z0) * t + z0;
    return [x, y, z];
}

// ##########
// COLOR
// ##########

function genColorOnLine(color1, color2) {
    let posFactor = random();
    return genColorOnLineAt(color1, color2, posFactor);
}

function genColorOnLineAt(color1, color2, t) {
    let rgb = genPointOnLineAt3D(color1.r, color1.g, color1.b, color2.r, color2.g, color2.b, t);
    return new ColorRGB(Math.floor(rgb[0]), Math.floor(rgb[1]), Math.floor(rgb[2]));
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
// SCREEN
// ##########

function genRandomPointOnScreen() {
    let randX = Math.floor(random(SCREEN_WIDTH));
    let randY = Math.floor(random(SCREEN_HEIGHT));
    return new Point2D(randX, randY);
}

