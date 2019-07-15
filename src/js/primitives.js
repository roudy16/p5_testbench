const EPSILON = 0.001;

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

class Vector2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Vector3D {
    constructor(x, y ,z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

/**
 * a c
 * b d
 */
class Mat2x2 {
    constructor(a, b, c, d) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
    }
}

/**
 * a d g
 * b e h
 * c f i
 */
class Mat3x3 {
    constructor(a, b, c, d, e, f, g, h ,i) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
        this.g = g;
        this.h = h;
        this.i = i;
    }
}

class ColorRGB {
    constructor(r, g, b) {
        this.r = r|0;
        this.g = g|0;
        this.b = b|0;
    }
}

class QuadraticBezier1D {
    constructor(p0, p1, p2) {
        this.p0 = p0;
        this.p1 = p1;
        this.p2 = p2;
    }

    calcPoint(t) {
        let oneMinusT = (1.0 - t);
        let a = oneMinusT * oneMinusT;
        let b = t * t;
        return this.p1 + a * (this.p0 - this.p1) + b * (this.p2 - this.p1);
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

class Sphere {
    constructor(r, x, y ,z) {
        this.r = r;
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * @param {Ray3D} ray
     */
    hit(ray) {
        let centerToRay = new Vector3D(ray.origin.x - this.x, ray.origin.y - this.y, ray.origin.z - this.z);
        let a = vecDot3D(ray.direction, ray.direction);
        let b = 2.0 * vecDot3D(ray.direction, centerToRay);
        let c = vecDot3D(centerToRay, centerToRay) - this.r * this.r;
        let discriminant = b * b - 4.0 * a * c;

        // Case where ray missed
        if (discriminant < 0.000001) {
            return null;
        }

        let e = Math.sqrt(discriminant);
        let denom = 2.0 * a;
        let t = (-b - e) / denom;

        if (t > EPSILON) {
            let rayToHit = vecMultScalar3D(ray.direction, t);
            let normalVec = vecMultScalar3D(vecAdd3D(centerToRay, rayToHit), 1.0 / this.r);
            let contact = new Point3D(ray.origin.x + rayToHit.x, ray.origin.y + rayToHit.y, ray.origin.z + rayToHit.z);
            let normal = new Normal(normalVec.x, normalVec.y, normalVec.z);
            return new RayHit3D(contact, normal);
        }

        t = (-b + e) / denom;

        if (t > EPSILON) {
            let rayToHit = vecMultScalar3D(ray.direction, t);
            let normalVec = vecMultScalar3D(vecAdd3D(centerToRay, rayToHit), 1.0 / this.r);
            let contact = new Point3D(ray.origin.x + rayToHit.x, ray.origin.y + rayToHit.y, ray.origin.z + rayToHit.z);
            let normal = new Normal(normalVec.x, normalVec.y, normalVec.z);
            return new RayHit3D(contact, normal);
        }

        return null;
    }
}

/**
 * Ray with origin point and direction vector. Direction is normalized to unit length on construction.
 */
class Ray3D {
    /**
     * @param {Point3D} o
     * @param {Vector3D} d
     */
    constructor(o, d) {
        this.origin = o;
        this.direction = vecNormalize3D(d);
    }
}

class RayHit3D {
    /**
     * @param {Point3D} point
     * @param {Normal} normal
     */
    constructor(point, normal) {
        this.point = point;
        this.normal = normal;
    }
}

class Normal {
    constructor(x, y ,z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

// TODO: Entity Builder

class CircleEntity {
    constructor(radius, pos, col, lifetime, path) {
        this.id = genNewId();

        this.radius = radius;
        this.position = pos;
        this.scale = 1.0;

        // TODO: color to builder
        this.color = col;

        // TODO: lifetime to builder
        this.lifetime = lifetime|0;
        this.birthTime = gNow;
        this.age = 0.0;

        // TODO: Move animation data generation to builder
        if (path) {
            this.path = path;
        } else {
            this.path = null;
        }
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
        circle(this.position.x, this.position.y, this.radius * this.scale);
    }
}

/**
 * @param {Point3D} lhs
 * @param {Point3D} rhs
 * @turns {Vector3D}
 */
function pointSubtract3D(lhs, rhs) {
    return new Vector3D(lhs.x - rhs.x, lhs.y - rhs.y, lhs.z - rhs.z)
}

/**
 * @param {Vector3D} lhs
 * @param {Vector3D} rhs
 * @turns {Vector3D}
 */
function vecSub3D(lhs, rhs) {
    return new Vector3D(lhs.x - rhs.x, lhs.y - rhs.y, lhs.z - rhs.z)
}

/**
 * @param {Vector3D} lhs
 * @param {Vector3D} rhs
 * @turns {Vector3D}
 */
function vecAdd3D(lhs, rhs) {
    return new Vector3D(lhs.x - rhs.x, lhs.y - rhs.y, lhs.z - rhs.z)
}

/**
 * @param {Vector3D} lhs
 * @param {Vector3D} rhs
 * @turns {Number}
 */
function vecDot3D(lhs, rhs) {
    return lhs.x * rhs.x + lhs.y * rhs.y + lhs.z * rhs.z;
}

/**
 * @param {Vector3D} vec
 * @turns {Vector3D}
 */
function vecNormalize3D(vec) {
    let length = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
    if (length < 0.000001) {
        return new Vector3D(0.0, 0.0, 0.0);
    }

    let inv = 1.0 / length;
    return new Vector3D(vec.x * inv, vec.y * inv, vec.z * inv);
}

/**
 * @param {Vector3D} vec
 * @param {Number} scalar
 */
function vecMultScalar3D(vec, scalar) {
    return new Vector3D(vec.x * scalar, vec.y * scalar, vec.z * scalar);
}