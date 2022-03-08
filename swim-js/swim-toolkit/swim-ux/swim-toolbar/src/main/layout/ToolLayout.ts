// Copyright 2015-2021 Swim.inc
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

import {Equivalent, Equals, Interpolate, Interpolator} from "@swim/util"
import {Debug, Format, Output} from "@swim/codec";
import {AnyLength, Length} from "@swim/math";
import {AnyPresence, Presence} from "@swim/style";
import {ToolLayoutInterpolator} from "./ToolLayoutInterpolator";

/** @public */
export type AnyToolLayout = ToolLayout | ToolLayoutInit;

/** @public */
export interface ToolLayoutInit {
  key?: string;
  grow?: number;
  shrink?: number;
  basis?: AnyLength;
  align?: number;
  overlap?: string | undefined;
  overpad?: AnyLength;
  presence?: AnyPresence;
  width?: AnyLength | null;
  left?: AnyLength | null;
  right?: AnyLength | null;
}

/** @public */
export class ToolLayout implements Interpolate<ToolLayout>, Equals, Equivalent, Debug {
  constructor(key: string, grow: number, shrink: number, basis: Length, align: number,
              overlap: string | undefined, overpad: Length, presence: Presence,
              width: Length | null, left: Length | null, right: Length | null) {
    this.key = key;
    this.grow = grow;
    this.shrink = shrink;
    this.basis = basis;
    this.align = align;
    this.overlap = overlap;
    this.overpad = overpad;
    this.presence = presence;
    this.width = width;
    this.left = left;
    this.right = right;
  }

  readonly key: string;

  readonly grow: number;

  readonly shrink: number;

  readonly basis: Length;

  withFlex(grow: number, shrink: number, basis?: AnyLength): ToolLayout {
    if (basis !== void 0) {
      basis = Length.fromAny(basis);
    } else {
      basis = this.basis;
    }
    return this.copy(this.key, grow, shrink, basis, this.align, this.overlap,
                     this.overpad, this.presence, this.width, this.left, this.right);
  }

  readonly align: number;

  withAlign(align: number): ToolLayout {
    return this.copy(this.key, this.grow, this.shrink, this.basis, align, this.overlap,
                     this.overpad, this.presence, this.width, this.left, this.right);
  }

  readonly overlap: string | undefined;

  withOverlap(overlap: string | undefined): ToolLayout {
    return this.copy(this.key, this.grow, this.shrink, this.basis, this.align, overlap,
                     this.overpad, this.presence, this.width, this.left, this.right);
  }

  readonly overpad: Length;

  withOverpad(overpad: AnyLength): ToolLayout {
    overpad = Length.fromAny(overpad);
    return this.copy(this.key, this.grow, this.shrink, this.basis, this.align, this.overlap,
                     overpad, this.presence, this.width, this.left, this.right);
  }

  readonly presence: Presence;

  withPresence(presence: AnyPresence): ToolLayout {
    presence = Presence.fromAny(presence);
    return this.copy(this.key, this.grow, this.shrink, this.basis, this.align, this.overlap,
                     this.overpad, presence, this.width, this.left, this.right);
  }

  readonly width: Length | null;

  readonly left: Length | null;

  readonly right: Length | null;

  resized(width: AnyLength | null, left: AnyLength | null, right: AnyLength | null): ToolLayout {
    if (width !== null) {
      width = Length.fromAny(width);
    }
    if (left !== null) {
      left = Length.fromAny(left);
    }
    if (right !== null) {
      right = Length.fromAny(right);
    }
    return this.copy(this.key, this.grow, this.shrink, this.basis, this.align,
                     this.overlap, this.overpad, this.presence, width, left, right);
  }

  protected copy(key: string, grow: number, shrink: number, basis: Length,
                 align: number, overlap: string | undefined, overpad: Length, presence: Presence,
                 width: Length | null, left: Length | null, right: Length | null): ToolLayout {
    return new ToolLayout(key, grow, shrink, basis, align, overlap,
                          overpad, presence, width, left, right);
  }

  interpolateTo(that: ToolLayout): Interpolator<ToolLayout>;
  interpolateTo(that: unknown): Interpolator<ToolLayout> | null;
  interpolateTo(that: unknown): Interpolator<ToolLayout> | null {
    if (that instanceof ToolLayout) {
      return ToolLayoutInterpolator(this, that);
    } else {
      return null;
    }
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof ToolLayout) {
      return this.key === that.key
          && Equivalent(this.grow, that.grow, epsilon)
          && Equivalent(this.shrink, that.shrink, epsilon)
          && this.basis.equivalentTo(that.basis, epsilon)
          && Equivalent(this.align, that.align, epsilon)
          && this.overlap === that.overlap
          && this.overpad.equivalentTo(that.overpad, epsilon)
          && this.presence.equivalentTo(that.presence, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof ToolLayout) {
      return this.key === that.key && this.grow === that.grow && this.shrink === that.shrink
          && this.basis.equals(that.basis) && this.align === that.align
          && this.overlap === that.overlap && this.overpad.equals(that.overpad)
          && this.presence.equals(that.presence) && Equals(this.width, that.width)
          && Equals(this.left, that.left) && Equals(this.right, that.right);
    }
    return false;
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("ToolLayout").write(46/*'.'*/).write("create").write(40/*'('*/)
                   .debug(this.key).write(", ").debug(this.grow).write(", ")
                   .debug(this.shrink).write(", ").debug(this.basis).write(41/*')'*/);
    if (this.align !== 0.5) {
      output = output.write(46/*'.'*/).write("withAlign").write(40/*'('*/)
                     .debug(this.align).write(41/*')'*/);
    }
    if (this.overlap !== void 0) {
      output = output.write(46/*'.'*/).write("withOverlap").write(40/*'('*/)
                     .debug(this.overlap).write(41/*')'*/);
    }
    if (!this.overpad.equals(Length.zero())) {
      output = output.write(46/*'.'*/).write("withOverpad").write(40/*'('*/)
                     .debug(this.overpad).write(41/*')'*/);
    }
    if (!this.presence.presented) {
      output = output.write(46/*'.'*/).write("withPresence").write(40/*'('*/)
                     .debug(this.presence).write(41/*')'*/);
    }
    if (this.width !== null || this.left !== null || this.right !== null) {
      output = output.write(46/*'.'*/).write("resized").write(40/*'('*/)
                     .debug(this.width).write(", ").debug(this.left).write(", ")
                     .debug(this.right).write(41/*')'*/);
    }
    return output;
  }

  toString(): string {
    return Format.debug(this);
  }

  static create(key: string, grow?: number, shrink?: number, basis?: AnyLength,
                align?: number, overlap?: string | undefined, overpad?: AnyLength,
                presence?: AnyPresence): ToolLayout {
    if (grow === void 0) {
      grow = 0;
    }
    if (shrink === void 0) {
      shrink = 1;
    }
    if (basis !== void 0) {
      basis = Length.fromAny(basis);
    } else {
      basis = Length.zero();
    }
    if (align === void 0) {
      align = 0.5;
    }
    if (overpad !== void 0) {
      overpad = Length.fromAny(overpad);
    } else {
      overpad = Length.zero();
    }
    if (presence !== void 0) {
      presence = Presence.fromAny(presence);
    } else {
      presence = Presence.presented();
    }
    return new ToolLayout(key, grow, shrink, basis, align, overlap,
                          overpad, presence, null, null, null);
  }

  static fromAny(value: AnyToolLayout): ToolLayout {
    if (value === void 0 || value === null || value instanceof ToolLayout) {
      return value;
    } else if (typeof value === "object" && value !== null) {
      return ToolLayout.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  static fromInit(init: ToolLayoutInit): ToolLayout {
    let key = init.key;
    if (key === void 0) {
      key = "";
    }
    let grow = init.grow;
    if (grow === void 0) {
      grow = 0;
    }
    let shrink = init.shrink;
    if (shrink === void 0) {
      shrink = 1;
    }
    let basis = init.basis;
    if (basis !== void 0) {
      basis = Length.fromAny(basis);
    } else {
      basis = Length.zero();
    }
    let align = init.align;
    if (align === void 0) {
      align = 0.5;
    }
    const overlap = init.overlap;
    let overpad = init.overpad;
    if (overpad !== void 0) {
      overpad = Length.fromAny(overpad);
    } else {
      overpad = Length.zero();
    }
    let presence = init.presence;
    if (presence !== void 0) {
      presence = Presence.fromAny(presence);
    } else {
      presence = Presence.presented();
    }
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
    return new ToolLayout(key, grow, shrink, basis, align, overlap,
                          overpad, presence, width, left, right);
  }
}
