// Copyright 2015-2022 Swim.inc
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

import {Equivalent, Equals, Arrays, Interpolate, Interpolator} from "@swim/util"
import {Debug, Format, Output} from "@swim/codec";
import {AnyLength, Length} from "@swim/math";
import {AnyToolLayout, ToolLayout} from "./ToolLayout";
import {BarLayoutInterpolator} from "./BarLayoutInterpolator";

/** @public */
export type AnyBarLayout = BarLayout | BarLayoutInit;

/** @public */
export interface BarLayoutInit {
  width?: AnyLength | null;
  left?: AnyLength | null;
  right?: AnyLength | null;
  spacing?: AnyLength | null;
  tools: AnyToolLayout[];
}

/** @public */
export class BarLayout implements Interpolate<BarLayout>, Equals, Equivalent, Debug {
  constructor(width: Length | null, left: Length | null, right: Length | null,
              spacing: Length | null, tools: ReadonlyArray<ToolLayout>) {
    this.width = width;
    this.left = left;
    this.right = right;
    this.spacing = spacing;
    this.tools = tools;
  }

  readonly width: Length | null;

  readonly left: Length | null;

  readonly right: Length | null;

  readonly spacing: Length | null;

  readonly tools: ReadonlyArray<ToolLayout>;

  getTool(key: string): ToolLayout | null {
    const tools = this.tools;
    for (let i = 0, n = tools.length; i < n; i += 1) {
      const tool = tools[i]!;
      if (key === tool.key) {
        return tool;
      }
    }
    return null;
  }

  resized(width: AnyLength, left?: AnyLength | null, right?: AnyLength | null,
          spacing?: AnyLength | null): BarLayout {
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
      const oldTools = this.tools;
      const toolCount = oldTools.length;
      const newTools = new Array<ToolLayout>(toolCount);
      const barWidth = width.pxValue();
      const barLeft = left !== null ? left.pxValue(barWidth) : 0;
      const barRight = right !== null ? right.pxValue(barWidth) : 0;
      const toolSpacing = spacing !== null ? spacing.pxValue(barWidth) : 0;

      let grow = 0;
      let shrink = 0;
      let basis = barLeft + barRight;
      let x = barLeft;
      let k = 0;
      for (let i = 0; i < toolCount; i += 1) {
        const tool = oldTools[i]!;
        if (k !== 0) {
          basis += toolSpacing;
          x += toolSpacing;
        }
        const toolWidth = tool.basis.pxValue(barWidth);
        newTools[i] = tool.resized(toolWidth, x, barWidth - toolWidth - x);
        grow += tool.grow;
        shrink += tool.shrink;
        basis += toolWidth;
        x += toolWidth;
        k += 1;
      }

      if (basis < barWidth && grow > 0) {
        const delta = barWidth - basis;
        let x = barLeft;
        let j = 0;
        for (let i = 0; i < toolCount; i += 1) {
          const tool = newTools[i]!;
          if (j !== 0) {
            x += toolSpacing;
          }
          const toolBasis = tool.basis.pxValue(barWidth);
          const toolWidth = toolBasis + delta * (tool.grow / grow);
          newTools[i] = tool.resized(toolWidth, x, barWidth - toolWidth - x);
          x += toolWidth;
          j += 1;
        }
      } else if (basis > barWidth && shrink > 0) {
        const delta = basis - barWidth;
        let x = barLeft;
        let j = 0;
        for (let i = 0; i < toolCount; i += 1) {
          const tool = newTools[i]!;
          if (j !== 0) {
            x += toolSpacing;
          }
          const toolBasis = tool.basis.pxValue(barWidth);
          const toolWidth = toolBasis - delta * (tool.shrink / shrink);
          newTools[i] = tool.resized(toolWidth, x, barWidth - toolWidth - x);
          x += toolWidth;
          j += 1;
        }
      }

      return new BarLayout(width, left, right, spacing, newTools);
    }
  }

  interpolateTo(that: BarLayout): Interpolator<BarLayout>;
  interpolateTo(that: unknown): Interpolator<BarLayout> | null;
  interpolateTo(that: unknown): Interpolator<BarLayout> | null {
    if (that instanceof BarLayout) {
      return BarLayoutInterpolator(this, that);
    } else {
      return null;
    }
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof BarLayout) {
      const theseTools = this.tools;
      const thoseTools = that.tools;
      const n = theseTools.length;
      if (n === thoseTools.length) {
        for (let i = 0; i < n; i += 1) {
          if (!theseTools[i]!.equivalentTo(thoseTools[i]!, epsilon)) {
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
    } else if (that instanceof BarLayout) {
      return Equals(this.width, that.width) && Equals(this.left, that.left)
          && Equals(this.right, that.right) && Equals(this.spacing, that.spacing)
          && Arrays.equal(this.tools, that.tools);
    }
    return false;
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("BarLayout").write(46/*'.'*/).write("of").write(40/*'('*/);
    for (let i = 0, n = this.tools.length; i < n; i += 1) {
      if (i !== 0) {
        output = output.write(", ");
      }
      output = output.debug(this.tools[i]!);
    }
    output = output.write(41/*')'*/);
    if (this.width !== null || this.left !== null || this.right !== null || this.spacing !== null) {
      output = output.write(46/*'.'*/).write("resized").write(40/*'('*/)
                     .debug(this.width).write(", ").debug(this.left).write(", ")
                     .debug(this.right).write(", ").debug(this.spacing).write(41/*')'*/);
    }
    return output;
  }

  toString(): string {
    return Format.debug(this);
  }

  static of(...barTools: AnyToolLayout[]): BarLayout {
    const n = barTools.length;
    const tools = new Array<ToolLayout>(n);
    for (let i = 0; i < n; i += 1) {
      tools[i] = ToolLayout.fromAny(barTools[i]!);
    }
    return new BarLayout(null, null, null, null, tools);
  }

  static create(tools: ReadonlyArray<ToolLayout>): BarLayout {
    return new BarLayout(null, null, null, null, tools);
  }

  static fromAny(value: AnyBarLayout): BarLayout {
    if (value === void 0 || value === null || value instanceof BarLayout) {
      return value;
    } else if (typeof value === "object" && value !== null) {
      return BarLayout.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  static fromInit(init: BarLayoutInit): BarLayout {
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
    const toolCount = init.tools.length;
    const tools = new Array<ToolLayout>(toolCount);
    for (let i = 0; i < toolCount; i += 1) {
      tools[i] = ToolLayout.fromAny(init.tools[i]!);
    }
    return new BarLayout(width, left, right, spacing, tools);
  }
}
