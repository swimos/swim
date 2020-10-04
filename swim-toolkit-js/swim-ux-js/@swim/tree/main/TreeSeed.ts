// Copyright 2015-2020 Swim inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {Equals, Objects} from "@swim/util"
import {AnyLength, Length} from "@swim/length";
import {AnyTreeRoot, TreeRoot} from "./TreeRoot";

export type AnyTreeSeed = TreeSeed | TreeSeedInit;

export interface TreeSeedInit {
  width?: AnyLength | null;
  left?: AnyLength | null;
  right?: AnyLength | null;
  roots?: AnyTreeRoot[];
}

export class TreeSeed implements Equals {
  /** @hidden */
  readonly _width: Length | null;
  /** @hidden */
  readonly _left: Length | null;
  /** @hidden */
  readonly _right: Length | null;
  /** @hidden */
  readonly _roots: ReadonlyArray<TreeRoot>;

  constructor(width: Length | null, left: Length | null, right: Length | null,
              roots: ReadonlyArray<TreeRoot>) {
    this._width = width;
    this._left = left;
    this._right = right;
    this._roots = roots;
  }

  get width(): Length | null {
    return this._width;
  }

  get left(): Length | null {
    return this._left;
  }

  get right(): Length | null {
    return this._right;
  }

  get roots(): ReadonlyArray<TreeRoot> {
    return this._roots;
  }

  getRoot(key: string): TreeRoot | null {
    const roots = this._roots;
    for (let i = 0, n = roots.length; i < n; i += 1) {
      const root = roots[i];
      if (key === root.key) {
        return root;
      }
    }
    return null;
  }

  resized(width: number, left?: AnyLength | null, right?: AnyLength | null,
          spacing: number = 0): TreeSeed {
    if (left === void 0) {
      left = this._left;
    } else if (left !== null) {
      left = Length.fromAny(left);
    }
    if (right === void 0) {
      right = this._right;
    } else if (right !== null) {
      right = Length.fromAny(right);
    }
    const oldRoots = this._roots;
    const rootCount = oldRoots.length;
    const newRoots = new Array<TreeRoot>(rootCount);
    const x0 = left !== null ? left.pxValue(width) : 0;
    const x1 = right !== null ? right.pxValue(width) : 0;

    let grow = 0;
    let shrink = 0;
    let optional = 0;
    let basis = x0 + x1;
    let x = x0;
    for (let i = 0; i < rootCount; i += 1) {
      if (i !== 0) {
        basis += spacing;
        x += spacing;
      }
      const root = oldRoots[i];
      const rootWidth = root._basis.pxValue(width);
      newRoots[i] = root.resized(rootWidth, x, width - rootWidth - x, false);
      grow += root._grow;
      shrink += root._shrink;
      if (root._optional) {
        optional += 1;
      }
      basis += rootWidth;
      x += rootWidth;
    }

    if (basis > width && optional > 0) {
      // Hide optional roots as needed to fit.
      let i = rootCount - 1;
      while (i >= 0 && optional > 0) {
        const root = newRoots[i];
        const rootWidth = root._width!.pxValue();
        if (root._optional) {
          newRoots[i] = root.resized(0, x, width - x, true);
          grow -= root._grow;
          shrink -= root._shrink;
          optional -= 1;
          basis -= rootWidth;
        }
        x -= rootWidth;
        if (i !== 0) {
          basis -= spacing;
          x -= spacing;
        }

        if (basis <= width) {
          // Remaining roots now fit.
          break;
        }
        i -= 1;
      }

      // Resize trailing non-optional roots.
      i += 1;
      while (i < rootCount) {
        const root = newRoots[i];
        if (!root._optional) {
          basis += spacing;
          x += spacing;
          const rootWidth = root._basis.pxValue(width);
          newRoots[i] = root.resized(rootWidth, x, width - rootWidth - x);
          x += rootWidth;
        }
        i += 1;
      }
    }

    if (basis < width && grow > 0) {
      const delta = width - basis;
      let x = x0;
      let j = 0;
      for (let i = 0; i < rootCount; i += 1) {
        const root = newRoots[i];
        if (!root._hidden) {
          if (j !== 0) {
            basis += spacing;
            x += spacing;
          }
          const rootBasis = root._basis.pxValue(width);
          const rootWidth = rootBasis + delta * (root._grow / grow);
          newRoots[i] = root.resized(rootWidth, x, width - rootWidth - x);
          x += rootWidth;
          j += 1;
        } else {
          newRoots[i] = root.resized(0, x + spacing, width - x - spacing);
        }
      }
    } else if (basis > width && shrink > 0) {
      const delta = basis - width;
      let x = x0;
      let j = 0;
      for (let i = 0; i < rootCount; i += 1) {
        const root = newRoots[i];
        if (!root._hidden) {
          if (j !== 0) {
            basis += spacing;
            x += spacing;
          }
          const rootBasis = root._basis.pxValue(width);
          const rootWidth = rootBasis - delta * (root._shrink / shrink);
          newRoots[i] = root.resized(rootWidth, x, width - rootWidth - x);
          x += rootWidth;
          j += 1;
        } else {
          newRoots[i] = root.resized(0, x + spacing, width - x - spacing);
        }
      }
    }

    return new TreeSeed(Length.px(width), left, right, newRoots);
  }

  equivalentTo(that: TreeSeed): boolean {
    const theseRoots = this._roots;
    const thoseRoots = that._roots;
    const n = theseRoots.length;
    if (n === thoseRoots.length) {
      for (let i = 0; i < n; i += 1) {
        if (!theseRoots[i].equivalentTo(thoseRoots[i])) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof TreeSeed) {
      return Objects.equal(this._width, that._width) && Objects.equal(this._left, that._left)
          && Objects.equal(this._right, that._right) && Objects.equal(this._roots, that._roots);
    }
    return false;
  }

  static of(...treeRoots: AnyTreeRoot[]): TreeSeed {
    const n = treeRoots.length;
    const roots = new Array<TreeRoot>(n);
    for (let i = 0; i < n; i += 1) {
      roots[i] = TreeRoot.fromAny(treeRoots[i]);
    }
    return new TreeSeed(null, null, null, roots);
  }

  static from(roots: ReadonlyArray<TreeRoot>): TreeSeed {
    return new TreeSeed(null, null, null, roots);
  }

  static fromAny(seed: AnyTreeSeed): TreeSeed {
    if (seed instanceof TreeSeed) {
      return seed;
    } else if (typeof seed === "object" && seed !== null) {
      return TreeSeed.fromInit(seed);
    }
    throw new TypeError("" + seed);
  }

  static fromInit(init: TreeSeedInit): TreeSeed {
    let width = init.width;
    if (width !== void 0 && width !== null) {
      width = Length.fromAny(width);
    } else {
      width = null
    }
    let left = init.left;
    if (left !== void 0 && left !== null) {
      left = Length.fromAny(left);
    } else {
      left = null
    }
    let right = init.right;
    if (right !== void 0 && right !== null) {
      right = Length.fromAny(right);
    } else {
      right = null
    }
    let roots: TreeRoot[];
    if (init.roots !== void 0) {
      const n = init.roots.length;
      roots = new Array<TreeRoot>(n);
      for (let i = 0; i < n; i += 1) {
        roots[i] = TreeRoot.fromAny(init.roots[i]);
      }
    } else {
      roots = [];
    }
    return new TreeSeed(width, left, right, roots);
  }
}
