import { Flatten } from "ts-toolbelt/out/List/Flatten";
import { Zip     } from "ts-toolbelt/out/List/Zip";

// == Infos ====================================================================
// https://stackoverflow.com/questions/23475372/extrapolate-split-cubic-bezier-to-1-1
// https://www.the-art-of-web.com/css/timing-function/
// https://pomax.github.io/bezierinfo/
// https://easings.net/

// == Types ====================================================================
type bezierCoordT = [number, number, number, number];
type bezierUnitedCoordT = Flatten<
  Zip<cubicBezierCoordsI['x'], cubicBezierCoordsI['y']>
>;

interface cubicBezierCoordsI {
  x: bezierCoordT;
  y: bezierCoordT;
}
interface splicCubicBezierOptionI extends cubicBezierCoordsI {
  z: number;
  fitUnitSquare: boolean;
}

interface splicCubicBezierResultI {
  left: bezierUnitedCoordT;
  right: bezierUnitedCoordT;
}

// == Presets ==================================================================
export const presets = {
// Name           Func               x1     y1     x2     y2
  linear:         createCubicBezier( 0   ,  0   ,  1   ,  1   ),
  cubicBezier:    createCubicBezier( 0   ,  1   ,  1   ,  0   ),

  ease:           createCubicBezier( 0.25,  0.1 ,  0.25,  1   ),
  easeIn:         createCubicBezier( 0.42,  0   ,  1   ,  1   ),
  easeOut:        createCubicBezier( 0   ,  0   ,  0.58,  1   ),
  easeInOut:      createCubicBezier( 0.42,  0   ,  0.58,  1   ),

  easeInSine:     createCubicBezier( 0.12,  0   ,  0.39,  0   ),
  easeOutSine:    createCubicBezier( 0.61,  1   ,  0.88,  1   ),
  easeInOutSine:  createCubicBezier( 0.37,  0   ,  0.63,  1   ),

  easeInQuad:     createCubicBezier( 0.11,  0   ,  0.5 ,  0   ),
  easeOutQuad:    createCubicBezier( 0.5 ,  1   ,  0.89,  1   ),
  easeInOutQuad:  createCubicBezier( 0.45,  0   ,  0.55,  1   ),

  easeInCubic:    createCubicBezier( 0.32,  0   ,  0.67,  0   ),
  easeOutCubic:   createCubicBezier( 0.33,  1   ,  0.68,  1   ),
  easeInOutCubic: createCubicBezier( 0.65,  0   ,  0.35,  1   ),

  easeInQuart:    createCubicBezier( 0.5 ,  0   ,  0.75,  0   ),
  easeOutQuart:   createCubicBezier( 0.25,  1   ,  0.5 ,  1   ),
  easeInOutQuart: createCubicBezier( 0.76,  0   ,  0.24,  1   ),

  easeInQuint:    createCubicBezier( 0.64,  0   ,  0.78,  0   ),
  easeOutQuint:   createCubicBezier( 0.22,  1   ,  0.36,  1   ),
  easeInOutQuint: createCubicBezier( 0.83,  0   ,  0.17,  1   ),

  easeInExpo:     createCubicBezier( 0.7 ,  0   ,  0.84,  0   ),
  easeOutExpo:    createCubicBezier( 0.16,  1   ,  0.3 ,  1   ),
  easeInOutExpo:  createCubicBezier( 0.87,  0   ,  0.13,  1   ),

  easeInCirc:     createCubicBezier( 0.55,  0   ,  1   ,  0.45),
  easeOutCirc:    createCubicBezier( 0   ,  0.55,  0.45,  1   ),
  easeInOutCirc:  createCubicBezier( 0.85,  0   ,  0.15,  1   ),

  easeInBack:     createCubicBezier( 0.36,  0   ,  0.66, -0.56),
  easeOutBack:    createCubicBezier( 0.34,  1.56,  0.64,  1   ),
  easeInOutBack:  createCubicBezier( 0.68, -0.6 ,  0.32,  1.6 )
};

// == Basics ===================================================================
export function createCubicBezier(x1: number, y1: number, x2: number, y2: number): cubicBezierCoordsI {
  return ({
    x: [0, x1, x2, 1],
    y: [0, y1, y2, 1]
  });
}

export function getCubicBezier(coord: bezierUnitedCoordT): bezierCoordT {
  const x = coord.filter((_, idx: number) => (idx % 2) === 0) as bezierCoordT;
  const y = coord.filter((_, idx: number) => (idx % 2) !== 0) as bezierCoordT;

  return [
    x[1], y[1], x[2], y[2]
  ];
}

export function getSplitCubicBezier(
  cubicBezier: cubicBezierCoordsI, rate: splicCubicBezierOptionI['z'], fitUnit: splicCubicBezierOptionI['fitUnitSquare'] = true
) {
  const splitRes = splitCubicBezier({
    z: rate,
    x: cubicBezier.x,
    y: cubicBezier.y,
    fitUnitSquare: fitUnit
  });
  return getCubicBezierResult(splitRes);
}

// == Fit Unit Square ==========================================================
function fitCoord(el: bezierUnitedCoordT[number], selfCoord: bezierUnitedCoordT, minI: number, maxI: number): bezierUnitedCoordT[number] {
  const coordMin = selfCoord[minI];    // should be 0
  const coordMax = selfCoord[maxI];    // should be 1
  const coordS   = 1 / (coordMax - coordMin);
  return (el - coordMin) * coordS;
}

function fitUnit(el: bezierUnitedCoordT[number], index: number, selfCoord: bezierUnitedCoordT): bezierUnitedCoordT[number] {
  if((index % 2) === 0) {
    // xval:  return el * (1 / selfCoord[6])
    return fitCoord(el, selfCoord, 0, 6);
  }
  else {
    // yval:  return el * (1 / selfCoord[7])
    return fitCoord(el, selfCoord, 1, 7);
  }
}

function fitUnitMap(coord: bezierUnitedCoordT): bezierUnitedCoordT {
  // For typecheck. Array.map(value, index, array)'s array type is just number[]
  const result = [];
  for (const [el, index] of coord.entries()) {
    result.push(fitUnit(el, index, coord));
  }
  return result as bezierUnitedCoordT;
}

function fitUnitSquare({left, right}: splicCubicBezierResultI): splicCubicBezierResultI {
  return ({
    left: fitUnitMap(left),
    right: fitUnitMap(right)
  });
}

// == Split Cubic Bezier =======================================================
export function splitCubicBezier(options: splicCubicBezierOptionI): splicCubicBezierResultI {
  const x = options.x,
        y = options.y,

       z1 = options.z,
       z2 =  z1 *  z1,
       z3 =  z2 *  z1,

      cz1 =  z1 -   1,
      cz2 = cz1 * cz1,
      cz3 = cz2 * cz1;

  const left: bezierUnitedCoordT = [
    x[0],
    y[0],
    z1*x[1] - cz1*x[0],
    z1*y[1] - cz1*y[0],
    z2*x[2] - 2*z1*cz1*x[1] + cz2*x[0],
    z2*y[2] - 2*z1*cz1*y[1] + cz2*y[0],
    z3*x[3] - 3*z2*cz1*x[2] + 3*z1*cz2*x[1] - cz3*x[0],
    z3*y[3] - 3*z2*cz1*y[2] + 3*z1*cz2*y[1] - cz3*y[0]
  ];

  const right: bezierUnitedCoordT = [
    z3*x[3] - 3*z2*cz1*x[2] + 3*z1*cz2*x[1] - cz3*x[0],
    z3*y[3] - 3*z2*cz1*y[2] + 3*z1*cz2*y[1] - cz3*y[0],
                    z2*x[3] - 2*z1*cz1*x[2] + cz2*x[1],
                    z2*y[3] - 2*z1*cz1*y[2] + cz2*y[1],
                                    z1*x[3] - cz1*x[2],
                                    z1*y[3] - cz1*y[2],
                                                  x[3],
                                                  y[3]
  ];

  const result = { left, right };
  if (options.fitUnitSquare) {
    return fitUnitSquare(result);
  } else {
    return result;
  }
}

function getCubicBezierResult(result: splicCubicBezierResultI) {
  return ({
    left: getCubicBezier(result.left),
    right: getCubicBezier(result.right)
  });
}
