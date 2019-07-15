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

