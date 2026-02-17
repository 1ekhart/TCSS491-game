import Entity from "/js/AbstractClasses/Entity.js";
import { CONSTANTS } from "/js/Util.js";

export default class HitBox extends Entity{
    constructor(x, y, width, height, timer) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.left = x;
        this.top = y;
        this.right = this.left + this.width;
        this.bottom = this.top + this.height;
        this.timer = timer;
    };

    collide(oth) {
        if (this.right > oth.left && this.left < oth.right && this.top < oth.bottom && this.bottom > oth.top) return true;
        return false;
    };

    /** returns `true` if hitbox is colliding with `otherEntity`.
     * @param {WorldEntity} otherEntity */
    isCollidingWith(otherEntity) {
        return !( // - 1 is so width/height are actual width in pixels (not off by 1)
            (this.right - 1 < otherEntity.x) || (otherEntity.x + otherEntity.width - 1 < this.x) || // this LEFT of other OR this RIGHT of other OR
            (this.bottom - 1 < otherEntity.y) || (otherEntity.y + otherEntity.height - 1 < this.y)  // this ABOVE other OR this BELOW other
        );
    }

    overlap(oth) {
        let a_half = {x: this.width / 2, y: this.height / 2};
        let b_half = {x: oth.width / 2, y: oth.height / 2};

        let a_center = {x: this.right - a_half.x, y: this.bottom - a_half.y};
        let b_center = {x: oth.right - b_half.x, y: oth.bottom - b_half.y};

        let ox = a_half.x + b_half.x - Math.abs(a_center.x - b_center.x);
        let oy = a_half.y + b_half.y - Math.abs(a_center.y - b_center.y);

        return {x: ox, y: oy};
    };

    decrementTimer() {
        this.timer -= CONSTANTS.TICK_TIME;
    }

    update(engine) {}

    draw(ctx, engine) {}
};
