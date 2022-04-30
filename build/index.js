"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitCubicBezier = exports.splitKeyFrame = exports.getSplitCubicBezier = exports.getCubicBezier = exports.createCubicBezier = exports.presets = void 0;
// == Presets ==================================================================
exports.presets = {
    // Name           Func               x1     y1     x2     y2
    linear: createCubicBezier(0, 0, 1, 1),
    cubicBezier: createCubicBezier(0, 1, 1, 0),
    ease: createCubicBezier(0.25, 0.1, 0.25, 1),
    easeIn: createCubicBezier(0.42, 0, 1, 1),
    easeOut: createCubicBezier(0, 0, 0.58, 1),
    easeInOut: createCubicBezier(0.42, 0, 0.58, 1),
    easeInSine: createCubicBezier(0.12, 0, 0.39, 0),
    easeOutSine: createCubicBezier(0.61, 1, 0.88, 1),
    easeInOutSine: createCubicBezier(0.37, 0, 0.63, 1),
    easeInQuad: createCubicBezier(0.11, 0, 0.5, 0),
    easeOutQuad: createCubicBezier(0.5, 1, 0.89, 1),
    easeInOutQuad: createCubicBezier(0.45, 0, 0.55, 1),
    easeInCubic: createCubicBezier(0.32, 0, 0.67, 0),
    easeOutCubic: createCubicBezier(0.33, 1, 0.68, 1),
    easeInOutCubic: createCubicBezier(0.65, 0, 0.35, 1),
    easeInQuart: createCubicBezier(0.5, 0, 0.75, 0),
    easeOutQuart: createCubicBezier(0.25, 1, 0.5, 1),
    easeInOutQuart: createCubicBezier(0.76, 0, 0.24, 1),
    easeInQuint: createCubicBezier(0.64, 0, 0.78, 0),
    easeOutQuint: createCubicBezier(0.22, 1, 0.36, 1),
    easeInOutQuint: createCubicBezier(0.83, 0, 0.17, 1),
    easeInExpo: createCubicBezier(0.7, 0, 0.84, 0),
    easeOutExpo: createCubicBezier(0.16, 1, 0.3, 1),
    easeInOutExpo: createCubicBezier(0.87, 0, 0.13, 1),
    easeInCirc: createCubicBezier(0.55, 0, 1, 0.45),
    easeOutCirc: createCubicBezier(0, 0.55, 0.45, 1),
    easeInOutCirc: createCubicBezier(0.85, 0, 0.15, 1),
    easeInBack: createCubicBezier(0.36, 0, 0.66, -0.56),
    easeOutBack: createCubicBezier(0.34, 1.56, 0.64, 1),
    easeInOutBack: createCubicBezier(0.68, -0.6, 0.32, 1.6)
};
// == Basics ===================================================================
function createCubicBezier(x1, y1, x2, y2) {
    return ({
        x: [0, x1, x2, 1],
        y: [0, y1, y2, 1]
    });
}
exports.createCubicBezier = createCubicBezier;
function getCubicBezier(coord) {
    const x = coord.filter((_, idx) => (idx % 2) === 0);
    const y = coord.filter((_, idx) => (idx % 2) !== 0);
    return [
        x[1], y[1], x[2], y[2]
    ];
}
exports.getCubicBezier = getCubicBezier;
function getSplitCubicBezier(cubicBezier, rate, fitUnit = true) {
    const splitRes = splitCubicBezier({
        z: rate,
        x: cubicBezier.x,
        y: cubicBezier.y,
        fitUnitSquare: fitUnit
    });
    return getCubicBezierResult(splitRes);
}
exports.getSplitCubicBezier = getSplitCubicBezier;
function splitKeyFrame(time, boundTime, keyFrames) {
    const keyFrameTimes = keyFrames.map((rate) => time * rate);
    const leftFrameTimes = keyFrameTimes.filter((keyTime) => keyTime <= boundTime);
    const rightFrameTimes = keyFrameTimes.filter((keyTime) => keyTime > boundTime);
    const differTime = time - boundTime;
    const leftKeyRate = leftFrameTimes.map((keyTime) => keyTime / boundTime);
    const rightKeyRate = rightFrameTimes.map((keyTime) => (keyTime - boundTime) / differTime);
    return {
        left: leftKeyRate,
        right: rightKeyRate
    };
}
exports.splitKeyFrame = splitKeyFrame;
// == Fit Unit Square ==========================================================
function fitCoord(el, selfCoord, minI, maxI) {
    const coordMin = selfCoord[minI]; // should be 0
    const coordMax = selfCoord[maxI]; // should be 1
    const coordS = 1 / (coordMax - coordMin);
    return (el - coordMin) * coordS;
}
function fitUnit(el, index, selfCoord) {
    if ((index % 2) === 0) {
        // xval:  return el * (1 / selfCoord[6])
        return fitCoord(el, selfCoord, 0, 6);
    }
    else {
        // yval:  return el * (1 / selfCoord[7])
        return fitCoord(el, selfCoord, 1, 7);
    }
}
function fitUnitMap(coord) {
    // For typecheck. Array.map(value, index, array)'s array type is just number[]
    const result = [];
    for (const [el, index] of coord.entries()) {
        result.push(fitUnit(el, index, coord));
    }
    return result;
}
function fitUnitSquare({ left, right }) {
    return ({
        left: fitUnitMap(left),
        right: fitUnitMap(right)
    });
}
// == Split Cubic Bezier =======================================================
function splitCubicBezier(options) {
    const x = options.x, y = options.y, z1 = options.z, z2 = z1 * z1, z3 = z2 * z1, cz1 = z1 - 1, cz2 = cz1 * cz1, cz3 = cz2 * cz1;
    const left = [
        x[0],
        y[0],
        z1 * x[1] - cz1 * x[0],
        z1 * y[1] - cz1 * y[0],
        z2 * x[2] - 2 * z1 * cz1 * x[1] + cz2 * x[0],
        z2 * y[2] - 2 * z1 * cz1 * y[1] + cz2 * y[0],
        z3 * x[3] - 3 * z2 * cz1 * x[2] + 3 * z1 * cz2 * x[1] - cz3 * x[0],
        z3 * y[3] - 3 * z2 * cz1 * y[2] + 3 * z1 * cz2 * y[1] - cz3 * y[0]
    ];
    const right = [
        z3 * x[3] - 3 * z2 * cz1 * x[2] + 3 * z1 * cz2 * x[1] - cz3 * x[0],
        z3 * y[3] - 3 * z2 * cz1 * y[2] + 3 * z1 * cz2 * y[1] - cz3 * y[0],
        z2 * x[3] - 2 * z1 * cz1 * x[2] + cz2 * x[1],
        z2 * y[3] - 2 * z1 * cz1 * y[2] + cz2 * y[1],
        z1 * x[3] - cz1 * x[2],
        z1 * y[3] - cz1 * y[2],
        x[3],
        y[3]
    ];
    const result = { left, right };
    if (options.fitUnitSquare) {
        return fitUnitSquare(result);
    }
    else {
        return result;
    }
}
exports.splitCubicBezier = splitCubicBezier;
function getCubicBezierResult(result) {
    return ({
        left: getCubicBezier(result.left),
        right: getCubicBezier(result.right)
    });
}
