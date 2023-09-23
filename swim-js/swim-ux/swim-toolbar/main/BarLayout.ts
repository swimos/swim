// Copyright 2015-2023 Nstream, inc.
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

import type {Mutable} from "@swim/util";
import {Arrays} from "@swim/util";
import {Equals} from "@swim/util";
import type {Equivalent} from "@swim/util";
import type {Interpolate} from "@swim/util";
import {Interpolator} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";
import type {LengthLike} from "@swim/math";
import {Length} from "@swim/math";
import {Presence} from "@swim/style";
import type {ToolLayoutLike} from "./ToolLayout";
import {ToolLayout} from "./ToolLayout";

/** @public */
export type BarLayoutLike = BarLayout | BarLayoutInit;

/** @public */
export interface BarLayoutInit {
  width?: LengthLike | null;
  left?: LengthLike | null;
  right?: LengthLike | null;
  spacing?: LengthLike | null;
  tools: ToolLayoutLike[];
}

/** @public */
export class BarLayout implements Interpolate<BarLayout>, Equals, Equivalent, Debug {
  constructor(width: Length | null, left: Length | null, right: Length | null,
              spacing: Length | null, tools: readonly ToolLayout[]) {
    this.width = width;
    this.left = left;
    this.right = right;
    this.spacing = spacing;
    this.tools = tools;
  }

  likeType?(like: BarLayoutInit): void;

  readonly width: Length | null;

  readonly left: Length | null;

  readonly right: Length | null;

  readonly spacing: Length | null;

  readonly tools: readonly ToolLayout[];

  getTool(key: string): ToolLayout | null {
    const tools = this.tools;
    for (let i = 0; i < tools.length; i += 1) {
      const tool = tools[i]!;
      if (key === tool.key) {
        return tool;
      }
    }
    return null;
  }

  resized(width: LengthLike, left?: LengthLike | null, right?: LengthLike | null,
          spacing?: LengthLike | null): BarLayout {
    width = Length.fromLike(width);
    if (left === void 0) {
      left = this.left;
    } else if (left !== null) {
      left = Length.fromLike(left);
    }
    if (right === void 0) {
      right = this.right;
    } else if (right !== null) {
      right = Length.fromLike(right);
    }
    if (spacing === void 0) {
      spacing = this.spacing;
    } else if (spacing !== null) {
      spacing = Length.fromLike(spacing);
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
    for (let i = 0; i < this.tools.length; i += 1) {
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

  static of(...barTools: ToolLayoutLike[]): BarLayout {
    const n = barTools.length;
    const tools = new Array<ToolLayout>(n);
    for (let i = 0; i < n; i += 1) {
      tools[i] = ToolLayout.fromLike(barTools[i]!);
    }
    return new BarLayout(null, null, null, null, tools);
  }

  static create(tools: readonly ToolLayout[]): BarLayout {
    return new BarLayout(null, null, null, null, tools);
  }

  static fromLike(value: BarLayoutLike): BarLayout {
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
      width = Length.fromLike(width);
    } else {
      width = null;
    }
    let left = init.left;
    if (left !== void 0 && left !== null) {
      left = Length.fromLike(left);
    } else {
      left = null;
    }
    let right = init.right;
    if (right !== void 0 && right !== null) {
      right = Length.fromLike(right);
    } else {
      right = null;
    }
    let spacing = init.spacing;
    if (spacing !== void 0 && spacing !== null) {
      spacing = Length.fromLike(spacing);
    } else {
      spacing = null;
    }
    const toolCount = init.tools.length;
    const tools = new Array<ToolLayout>(toolCount);
    for (let i = 0; i < toolCount; i += 1) {
      tools[i] = ToolLayout.fromLike(init.tools[i]!);
    }
    return new BarLayout(width, left, right, spacing, tools);
  }
}

/** @internal */
export interface BarLayoutInterpolator extends Interpolator<BarLayout> {
  /** @internal */
  readonly widthInterpolator: Interpolator<Length | null>;
  /** @internal */
  readonly leftInterpolator: Interpolator<Length | null>;
  /** @internal */
  readonly rightInterpolator: Interpolator<Length | null>;
  /** @internal */
  readonly spacingInterpolator: Interpolator<Length | null>;
  /** @internal */
  readonly toolInterpolators: readonly Interpolator<ToolLayout>[];

  readonly 0: BarLayout;

  readonly 1: BarLayout;

  equals(that: unknown): boolean;
}

/** @internal */
export const BarLayoutInterpolator = (function (_super: typeof Interpolator) {
  const BarLayoutInterpolator = function (l0: BarLayout, l1: BarLayout): BarLayoutInterpolator {
    const interpolator = function (u: number): BarLayout {
      const width = interpolator.widthInterpolator(u);
      const left = interpolator.leftInterpolator(u);
      const right = interpolator.rightInterpolator(u);
      const spacing = interpolator.spacingInterpolator(u);
      const toolInterpolators = interpolator.toolInterpolators;
      const tools = new Array<ToolLayout>();
      for (let i = 0; i < toolInterpolators.length; i += 1) {
        tools.push(toolInterpolators[i]!(u));
      }
      return new BarLayout(width, left, right, spacing, tools);
    } as BarLayoutInterpolator;
    Object.setPrototypeOf(interpolator, BarLayoutInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>).widthInterpolator = Interpolator(l0.width, l1.width);
    (interpolator as Mutable<typeof interpolator>).leftInterpolator = Interpolator(l0.left, l1.left);
    (interpolator as Mutable<typeof interpolator>).rightInterpolator = Interpolator(l0.right, l1.right);
    (interpolator as Mutable<typeof interpolator>).spacingInterpolator = Interpolator(l0.spacing, l1.spacing);
    const tools0 = l0.tools;
    const tools1 = l1.tools;
    const toolInterpolators = new Array<Interpolator<ToolLayout>>();
    for (let i = 0; i < tools0.length; i += 1) {
      let tool0 = tools0[i]!;
      let tool1 = l1.getTool(tool0.key);
      if (tool1 === null && !tool0.presence.dismissed && tool0.outPresence !== null) {
        tool1 = tool0.withPresence(tool0.outPresence);
        tool1 = tool1.withAlign(tool1.outAlign);
        tool0 = tool0.withPresence(tool0.presence.asDismissing());
      } else if (tool1 !== null && tool0.presence.dismissed) {
        tool0 = tool0.withPresence(tool0.presence.asPresenting());
      }
      if (tool1 !== null) {
        toolInterpolators.push(tool0.interpolateTo(tool1));
      }
    }
    for (let i = 0; i < tools1.length; i += 1) {
      let tool1 = tools1[i]!;
      let tool0 = l0.getTool(tool1.key);
      if (tool0 === null) {
        const inPresence = tool1.inPresence !== null ? tool1.inPresence : tool1.presence;
        tool0 = tool1.withPresence(inPresence.asPresenting());
        tool1 = tool1.withPresence(Presence.presented());
        tool0 = tool0.withAlign(tool0.inAlign);
        toolInterpolators.push(tool0.interpolateTo(tool1));
      }
    }
    (interpolator as Mutable<typeof interpolator>).toolInterpolators = toolInterpolators;
    return interpolator;
  } as {
    (l0: BarLayout, l1: BarLayout): BarLayoutInterpolator;

    /** @internal */
    prototype: BarLayoutInterpolator;
  };

  BarLayoutInterpolator.prototype = Object.create(_super.prototype);
  BarLayoutInterpolator.prototype.constructor = BarLayoutInterpolator;

  Object.defineProperty(BarLayoutInterpolator.prototype, 0, {
    get(this: BarLayoutInterpolator): BarLayout {
      const width = this.widthInterpolator[0];
      const left = this.leftInterpolator[0];
      const right = this.rightInterpolator[0];
      const spacing = this.spacingInterpolator[0];
      const toolInterpolators = this.toolInterpolators;
      const tools = new Array<ToolLayout>();
      for (let i = 0; i < toolInterpolators.length; i += 1) {
        tools.push(toolInterpolators[i]![0]);
      }
      return new BarLayout(width, left, right, spacing, tools);
    },
    configurable: true,
  });

  Object.defineProperty(BarLayoutInterpolator.prototype, 1, {
    get(this: BarLayoutInterpolator): BarLayout {
      const width = this.widthInterpolator[1];
      const left = this.leftInterpolator[1];
      const right = this.rightInterpolator[1];
      const spacing = this.spacingInterpolator[1];
      const toolInterpolators = this.toolInterpolators;
      const tools = new Array<ToolLayout>();
      for (let i = 0; i < toolInterpolators.length; i += 1) {
        tools.push(toolInterpolators[i]![1]);
      }
      return new BarLayout(width, left, right, spacing, tools);
    },
    configurable: true,
  });

  BarLayoutInterpolator.prototype.equals = function (that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof BarLayoutInterpolator) {
      if (this.widthInterpolator.equals(that.widthInterpolator) &&
          this.leftInterpolator.equals(that.leftInterpolator) &&
          this.rightInterpolator.equals(that.rightInterpolator) &&
          this.spacingInterpolator.equals(that.spacingInterpolator)) {
        const n = this.toolInterpolators.length;
        if (n === that.toolInterpolators.length) {
          for (let i = 0; i < n; i += 1) {
            if (!this.toolInterpolators[i]!.equals(that.toolInterpolators[i]!)) {
              return false;
            }
          }
          return true;
        }
      }
    }
    return false;
  };

  return BarLayoutInterpolator;
})(Interpolator);
