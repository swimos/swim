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

import {Equivalent, Equals, Arrays} from "@swim/util"
import {Debug, Format, Output} from "@swim/codec";
import {AnyLength, Length} from "@swim/math";
import {AnyTreeRoot, TreeRoot} from "./TreeRoot";

export type AnyTreeSeed = TreeSeed | TreeSeedInit;

export interface TreeSeedInit {
  width?: AnyLength | null;
  left?: AnyLength | null;
  right?: AnyLength | null;
  spacing?: AnyLength | null;
  roots: AnyTreeRoot[];
}

export class TreeSeed implements Equals, Equivalent, Debug {
  constructor(width: Length | null, left: Length | null, right: Length | null,
              spacing: AnyLength | null, roots: ReadonlyArray<TreeRoot>) {
    Object.defineProperty(this, "width", {
      value: width,
      enumerable: true,
    });
    Object.defineProperty(this, "left", {
      value: left,
      enumerable: true,
    });
    Object.defineProperty(this, "right", {
      value: right,
      enumerable: true,
    });
    Object.defineProperty(this, "spacing", {
      value: spacing,
      enumerable: true,
    });
    Object.defineProperty(this, "roots", {
      value: roots,
      enumerable: true,
    });
  }

  declare readonly width: Length | null;

  declare readonly left: Length | null;

  declare readonly right: Length | null;

  declare readonly spacing: Length | null;

  declare readonly roots: ReadonlyArray<TreeRoot>;

  getRoot(key: string): TreeRoot | null {
    const roots = this.roots;
    for (let i = 0, n = roots.length; i < n; i += 1) {
      const root = roots[i]!;
      if (key === root.key) {
        return root;
      }
    }
    return null;
  }

  resized(width: AnyLength, left?: AnyLength | null, right?: AnyLength | null,
          spacing?: AnyLength | null): TreeSeed {
    width = Length.fromAny(width);
    if (left === void 0) {
      left = this.left;
    } else if (left !== null) {
      left = Length.fromAny(left);
    }
    if (right === void 0) {
      right = this.right;
    } else if (right !== null) {
      right = Length.fromAny(right);
    }
    if (spacing === void 0) {
      spacing = this.spacing;
    } else if (spacing !== null) {
      spacing = Length.fromAny(spacing);
    }
    if (Equals(this.width, width) && Equals(this.left, left) &&
        Equals(this.right, right) && Equals(this.spacing, spacing)) {
      return this;
    } else {
      const oldRoots = this.roots;
      const rootCount = oldRoots.length;
      const newRoots = new Array<TreeRoot>(rootCount);
      const seedWidth = width.pxValue();
      const seedLeft = left !== null ? left.pxValue(seedWidth) : 0;
      const seedRight = right !== null ? right.pxValue(seedWidth) : 0;
      const rootSpacing = spacing !== null ? spacing.pxValue(seedWidth) : 0;

      let grow = 0;
      let shrink = 0;
      let optional = 0;
      let basis = seedLeft + seedRight;
      let x = seedLeft;
      for (let i = 0; i < rootCount; i += 1) {
        if (i !== 0) {
          basis += rootSpacing;
          x += rootSpacing;
        }
        const root = oldRoots[i]!;
        const rootWidth = root.basis.pxValue(seedWidth);
        newRoots[i] = root.resized(rootWidth, x, seedWidth - rootWidth - x, false);
        grow += root.grow;
        shrink += root.shrink;
        if (root.optional) {
          optional += 1;
        }
        basis += rootWidth;
        x += rootWidth;
      }

      if (basis > seedWidth && optional > 0) {
        // Hide optional roots as needed to fit.
        let i = rootCount - 1;
        while (i >= 0 && optional > 0) {
          const root = newRoots[i]!;
          const rootWidth = root.width!.pxValue();
          if (root.optional) {
            newRoots[i] = root.resized(0, x, seedWidth - x, true);
            grow -= root.grow;
            shrink -= root.shrink;
            optional -= 1;
            basis -= rootWidth;
          }
          x -= rootWidth;
          if (i !== 0) {
            basis -= rootSpacing;
            x -= rootSpacing;
          }

          if (basis <= seedWidth) {
            // Remaining roots now fit.
            break;
          }
          i -= 1;
        }

        // Resize trailing non-optional roots.
        i += 1;
        while (i < rootCount) {
          const root = newRoots[i]!;
          if (!root.optional) {
            basis += rootSpacing;
            x += rootSpacing;
            const rootWidth = root.basis.pxValue(seedWidth);
            newRoots[i] = root.resized(rootWidth, x, seedWidth - rootWidth - x);
            x += rootWidth;
          }
          i += 1;
        }
      }

      if (basis < seedWidth && grow > 0) {
        const delta = seedWidth - basis;
        let x = seedLeft;
        let j = 0;
        for (let i = 0; i < rootCount; i += 1) {
          const root = newRoots[i]!;
          if (!root.hidden) {
            if (j !== 0) {
              x += rootSpacing;
            }
            const rootBasis = root.basis.pxValue(seedWidth);
            const rootWidth = rootBasis + delta * (root.grow / grow);
            newRoots[i] = root.resized(rootWidth, x, seedWidth - rootWidth - x);
            x += rootWidth;
            j += 1;
          } else {
            newRoots[i] = root.resized(0, x + rootSpacing, seedWidth - x - rootSpacing);
          }
        }
      } else if (basis > seedWidth && shrink > 0) {
        const delta = basis - seedWidth;
        let x = seedLeft;
        let j = 0;
        for (let i = 0; i < rootCount; i += 1) {
          const root = newRoots[i]!;
          if (!root.hidden) {
            if (j !== 0) {
              x += rootSpacing;
            }
            const rootBasis = root.basis.pxValue(seedWidth);
            const rootWidth = rootBasis - delta * (root.shrink / shrink);
            newRoots[i] = root.resized(rootWidth, x, seedWidth - rootWidth - x);
            x += rootWidth;
            j += 1;
          } else {
            newRoots[i] = root.resized(0, x + rootSpacing, seedWidth - x - rootSpacing);
          }
        }
      }

      return new TreeSeed(width, left, right, spacing, newRoots);
    }
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof TreeSeed) {
      const theseRoots = this.roots;
      const thoseRoots = that.roots;
      const n = theseRoots.length;
      if (n === thoseRoots.length) {
        for (let i = 0; i < n; i += 1) {
          if (!theseRoots[i]!.equivalentTo(thoseRoots[i]!, epsilon)) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof TreeSeed) {
      return Equals(this.width, that.width) && Equals(this.left, that.left)
          && Equals(this.right, that.right) && Equals(this.spacing, that.spacing)
          && Arrays.equal(this.roots, that.roots);
    }
    return false;
  }

  debug(output: Output): void {
    output = output.write("TreeSeed").write(46/*'.'*/).write("of").write(40/*'('*/)
    for (let i = 0, n = this.roots.length; i < n; i += 1) {
      if (i !== 0) {
        output = output.write(", ");
      }
      output = output.debug(this.roots[i]!);
    }
    output = output.write(41/*')'*/);
    if (this.width !== null || this.left !== null || this.right !== null || this.spacing !== null) {
      output = output.write(46/*'.'*/).write("resized").write(40/*'('*/)
          .debug(this.width).write(", ").debug(this.left).write(", ")
          .debug(this.right).write(", ").debug(this.spacing).write(41/*')'*/);
    }
  }

  toString(): string {
    return Format.debug(this);
  }

  static of(...treeRoots: AnyTreeRoot[]): TreeSeed {
    const n = treeRoots.length;
    const roots = new Array<TreeRoot>(n);
    for (let i = 0; i < n; i += 1) {
      roots[i] = TreeRoot.fromAny(treeRoots[i]!);
    }
    return new TreeSeed(null, null, null, null, roots);
  }

  static create(roots: ReadonlyArray<TreeRoot>): TreeSeed {
    return new TreeSeed(null, null, null, null, roots);
  }

  static fromAny(value: AnyTreeSeed): TreeSeed {
    if (value === void 0 || value === null || value instanceof TreeSeed) {
      return value;
    } else if (typeof value === "object" && value !== null) {
      return TreeSeed.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  static fromInit(init: TreeSeedInit): TreeSeed {
    let width = init.width;
    if (width !== void 0 && width !== null) {
      width = Length.fromAny(width);
    } else {
      width = null;
    }
    let left = init.left;
    if (left !== void 0 && left !== null) {
      left = Length.fromAny(left);
    } else {
      left = null;
    }
    let right = init.right;
    if (right !== void 0 && right !== null) {
      right = Length.fromAny(right);
    } else {
      right = null;
    }
    let spacing = init.spacing;
    if (spacing !== void 0 && spacing !== null) {
      spacing = Length.fromAny(spacing);
    } else {
      spacing = null;
    }
    const rootCount = init.roots.length;
    const roots = new Array<TreeRoot>(rootCount);
    for (let i = 0; i < rootCount; i += 1) {
      roots[i] = TreeRoot.fromAny(init.roots[i]!);
    }
    return new TreeSeed(width, left, right, spacing, roots);
  }
}
