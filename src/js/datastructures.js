class RingBuffer {
    constructor(sz) {
        this.buf = new Array(sz);
        this.beg = 0;
        this.size = 0;
        this.cap = sz;
    }

    push(item) {
        let end = (this.beg + this.size) % this.cap;

        this.buf[end] = item;

        if (this.size === this.cap) {
            this.beg += 1;

            if (this.beg === this.size) {
                this.beg = 0;
            }
        } else {
            this.size += 1;
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

