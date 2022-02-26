import { List } from "ts-toolbelt";

// == Infos ====================================================================
// https://stackoverflow.com/questions/23475372/extrapolate-split-cubic-bezier-to-1-1
// https://www.the-art-of-web.com/css/timing-function/
// https://pomax.github.io/bezierinfo/

// == Types ====================================================================
type bezierCoordT = [number, number, number, number];
type bezierUnitedCoordT = List.Flatten<List.Zip<cubicBezierCoordsI['x'], cubicBezierCoordsI['y']>>;

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
  return {
    left: fitUnitMap(left),
    right: fitUnitMap(right)
  };
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

export function getCubicBezier(coord: bezierUnitedCoordT): bezierCoordT {
  const x = coord.filter((_, idx: number) => (idx % 2) === 0) as bezierCoordT;
  const y = coord.filter((_, idx: number) => (idx % 2) !== 0) as bezierCoordT;

  return [x[1], y[1], x[2], y[2]];
}

function getCubicBezierResult(result: splicCubicBezierResultI) {
  return {
    left: getCubicBezier(result.left),
    right: getCubicBezier(result.right)
  };
}

export function getSplitCubicBezier(cubicBezier: cubicBezierCoordsI, rate: splicCubicBezierOptionI['z'], fitUnit: splicCubicBezierOptionI['fitUnitSquare'] = true) {
  const splitRes = splitCubicBezier({
    z: rate,
    x: cubicBezier.x,
    y: cubicBezier.y,
    fitUnitSquare: fitUnit
  });
  return getCubicBezierResult(splitRes);
}
