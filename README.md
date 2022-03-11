# SplitCubicalBezier

This project referenced by [StackOverflow:Extrapolate split cubic-bezier to 1,1](https://stackoverflow.com/questions/23475372/extrapolate-split-cubic-bezier-to-1-1).


**Example**

```js
import { presets, createCubicBezier, getSplitCubicBezier } from "splitCubicalBezier";

const linear1 = presets.linear;                    // Same as linear2
const linear2 = createCubicBezier(x1, y1, x2, y2); // { xs: [ 0, 0, 1, 1 ], ys: [ 0, 0, 1, 1 ] }
const results = getSplitCubicBezier(linear2, 0.5); // { left: [ 0, 0, 0.5, 0.5 ], right: [ 0.5, 0.5, 1, 1 ] }
```
