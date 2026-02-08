//Global Constants
export const CONSTANTS = {
    DEBUG: false,
    SCALE: 2,
    BITWIDTH: 16,
    TILESIZE: 32,
    TICK_TIME: 1 / 60,  // the amount of time per engine tick
    EPSILON: 0.005,
    CANVAS_WIDTH: 1024,
    CANVAS_HEIGHT: 768,
    CONTEXT: document.getElementById("gameWorld").getContext("2d")
};

/**
 * @param {Number} num1 The first value we want to compare
 * @param {Number} num2 The second value we want  to compare
 * @param {Number} epsilon The epsilon, if the difference is this number then it's functionally equal.
 * @returns returns 0 if equal (with a margin of epsilon), 1 if num1 > num2, -1 if num1 < num2
 */
export const compareFloat = (num1, num2, epsilon) => {
    var difference = num1 - num2;
    if (Math.abs(difference) < epsilon) {
        return 0;
    } else if (difference > 0) { // positive difference means num1 is greater than num2
        return 1;
    }
    return -1;
};

/**
 *
 * @param {Number} num1 number that will be rounded to 0 if within the epsilon.
 * @param {Number} epsilon the epsilon.
 * @returns returns 0 if within the margins of zero, otherwise returns the number normally
 */
export const roundIfCloseToZero = (num1, epsilon) => {
    if (Math.abs(num1) < epsilon) {
        return 0;
    }
    return num1;
}

/** moves `num` towards zero by `delta` without overshooting zero.
 * @param {number} value the value to change
 * @param {number} delta the distance to move the value
 * @returns the modified value, or 0 if it was less than delta away from zero
 */
export function decreaseToZero(value, delta) {
    if (value > 0) {
        return Math.max(value - delta, 0);
    } else {
        return Math.min(value + delta, 0);
    }
}

/**
 * @param {Number} n
 * @returns Random Integer Between 0 and n-1
 */
export const randomInt = n => Math.floor(Math.random() * n);

/**
 * @param {Number} max The maximum value
 * @param {Number} min The minimum
 * @returns Random Integer Between the min and max
 */
export const randomIntRange = (max, min) => Math.floor(Math.random() * (max - min) + min);

/**
 * @param {Number} r Red Value
 * @param {Number} g Green Value
 * @param {Number} b Blue Value
 * @returns String that can be used as a rgb web color
 */
export const rgb = (r, g, b) => `rgba(${r}, ${g}, ${b})`;

/**
 * @param {Number} r Red Value
 * @param {Number} g Green Value
 * @param {Number} b Blue Value
 * @param {Number} a Alpha Value
 * @returns String that can be used as a rgba web color
 */
export const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;

/**
 * @param {Number} h Hue
 * @param {Number} s Saturation
 * @param {Number} l Lightness
 * @returns String that can be used as a hsl web color
 */
export const hsl = (h, s, l) => `hsl(${h}, ${s}%, ${l}%)`;

/**
 * Returns distance from two points
 * @param {Number} p1, p2 Two objects with x and y coordinates
 * @returns Distance between the two points
 */
export const getDistance = (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};
