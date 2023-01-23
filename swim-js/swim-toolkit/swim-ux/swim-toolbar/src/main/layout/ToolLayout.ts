// Copyright 2015-2023 Swim.inc
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
  inAlign?: number;
  outAlign?: number;
  overlap?: string | undefined;
  overpad?: AnyLength;
  presence?: AnyPresence;
  inPresence?: AnyPresence | null;
  outPresence?: AnyPresence | null;
  width?: AnyLength | null;
  left?: AnyLength | null;
  right?: AnyLength | null;
}

/** @public */
export class ToolLayout implements Interpolate<ToolLayout>, Equals, Equivalent, Debug {
  constructor(key: string, grow: number, shrink: number, basis: Length,
              align: number, inAlign: number, outAlign: number,
              overlap: string | undefined, overpad: Length,
              presence: Presence, inPresence: Presence | null, outPresence: Presence | null,
              width: Length | null, left: Length | null, right: Length | null) {
    this.key = key;
    this.grow = grow;
    this.shrink = shrink;
    this.basis = basis;
    this.align = align;
    this.inAlign = inAlign;
    this.outAlign = outAlign;
    this.overlap = overlap;
    this.overpad = overpad;
    this.presence = presence;
    this.inPresence = inPresence;
    this.outPresence = outPresence;
    this.width = width;
    this.left = left;
    this.right = right;
  }

  readonly key: string;

  withKey(key: string): ToolLayout {
    return this.copy(key, this.grow, this.shrink, this.basis, this.align,
                     this.inAlign, this.outAlign, this.overlap, this.overpad,
                     this.presence, this.inPresence, this.outPresence,
                     this.width, this.left, this.right);
  }

  readonly grow: number;

  readonly shrink: number;

  readonly basis: Length;

  withFlex(grow: number, shrink: number, basis?: AnyLength): ToolLayout {
    if (basis !== void 0) {
      basis = Length.fromAny(basis);
    } else {
      basis = this.basis;
    }
    return this.copy(this.key, grow, shrink, basis, this.align,
                     this.inAlign, this.outAlign, this.overlap, this.overpad,
                     this.presence, this.inPresence, this.outPresence,
                     this.width, this.left, this.right);
  }

  readonly align: number;

  readonly inAlign: number;

  readonly outAlign: number;

  withAlign(align: number, inAlign?: number, outAlign?: number): ToolLayout {
    if (inAlign === void 0) {
      inAlign = this.inAlign;
    }
    if (outAlign === void 0) {
      outAlign = this.outAlign;
    }
    return this.copy(this.key, this.grow, this.shrink, this.basis, align,
                     inAlign, outAlign, this.overlap, this.overpad,
                     this.presence, this.inPresence, this.outPresence,
                     this.width, this.left, this.right);
  }

  readonly overlap: string | undefined;

  withOverlap(overlap: string | undefined): ToolLayout {
    return this.copy(this.key, this.grow, this.shrink, this.basis, this.align,
                     this.inAlign, this.outAlign, overlap, this.overpad,
                     this.presence, this.inPresence, this.outPresence,
                     this.width, this.left, this.right);
  }

  readonly overpad: Length;

  withOverpad(overpad: AnyLength): ToolLayout {
    overpad = Length.fromAny(overpad);
    return this.copy(this.key, this.grow, this.shrink, this.basis, this.align,
                     this.inAlign, this.outAlign, this.overlap, overpad,
                     this.presence, this.inPresence, this.outPresence,
                     this.width, this.left, this.right);
  }

  readonly presence: Presence;

  readonly inPresence: Presence | null;

  readonly outPresence: Presence | null;

  withPresence(presence: AnyPresence, inPresence?: AnyPresence | null, outPresence?: AnyPresence | null): ToolLayout;
  withPresence(presence: AnyPresence | undefined, inPresence: AnyPresence | null | undefined, outPresence: AnyPresence | null | undefined): ToolLayout;
  withPresence(presence: AnyPresence | undefined, inPresence?: AnyPresence | null, outPresence?: AnyPresence | null): ToolLayout {
    if (presence === void 0) {
      presence = this.presence;
    } else {
      presence = Presence.fromAny(presence);
    }
    if (inPresence === void 0) {
      inPresence = this.inPresence;
    } else {
      inPresence = Presence.fromAny(inPresence);
    }
    if (outPresence === void 0) {
      outPresence = this.outPresence;
    } else {
      outPresence = Presence.fromAny(outPresence);
    }
    return this.copy(this.key, this.grow, this.shrink, this.basis, this.align,
                     this.inAlign, this.outAlign, this.overlap, this.overpad,
                     presence, inPresence, outPresence,
                     this.width, this.left, this.right);
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
                     this.inAlign, this.outAlign, this.overlap, this.overpad,
                     this.presence, this.inPresence, this.outPresence,
                     width, left, right);
  }

  protected copy(key: string, grow: number, shrink: number, basis: Length,
                 align: number, inAlign: number, outAlign: number,
                 overlap: string | undefined, overpad: Length,
                 presence: Presence, inPresence: Presence | null, outPresence: Presence | null,
                 width: Length | null, left: Length | null, right: Length | null): ToolLayout {
    return new ToolLayout(key, grow, shrink, basis, align, inAlign, outAlign,
                          overlap, overpad, presence, inPresence, outPresence,
                          width, left, right);
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
          && Equivalent(this.inAlign, that.inAlign, epsilon)
          && Equivalent(this.outAlign, that.outAlign, epsilon)
          && this.overlap === that.overlap
          && this.overpad.equivalentTo(that.overpad, epsilon)
          && this.presence.equivalentTo(that.presence, epsilon)
          && Equivalent(this.inPresence, that.inPresence, epsilon)
          && Equivalent(this.outPresence, that.outPresence, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof ToolLayout) {
      return this.key === that.key && this.grow === that.grow && this.shrink === that.shrink
          && this.basis.equals(that.basis) && this.align === that.align
          && this.inAlign === that.inAlign && this.outAlign === that.outAlign
          && this.overlap === that.overlap && this.overpad.equals(that.overpad)
          && this.presence.equals(that.presence) && Equals(this.inPresence, that.inPresence)
          && Equals(this.outPresence, that.outPresence) && Equals(this.width, that.width)
          && Equals(this.left, that.left) && Equals(this.right, that.right);
    }
    return false;
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("ToolLayout").write(46/*'.'*/).write("create").write(40/*'('*/)
                   .debug(this.key).write(", ").debug(this.grow).write(", ")
                   .debug(this.shrink).write(", ").debug(this.basis).write(41/*')'*/);
    if (this.align !== 0.5 || this.inAlign !== this.align || this.outAlign !== this.align) {
      output = output.write(46/*'.'*/).write("withAlign").write(40/*'('*/)
                     .debug(this.align).write(", ").debug(this.inAlign).write(", ")
                     .debug(this.outAlign).write(41/*')'*/);
    }
    if (this.overlap !== void 0) {
      output = output.write(46/*'.'*/).write("withOverlap").write(40/*'('*/)
                     .debug(this.overlap).write(41/*')'*/);
    }
    if (!this.overpad.equals(Length.zero())) {
      output = output.write(46/*'.'*/).write("withOverpad").write(40/*'('*/)
                     .debug(this.overpad).write(41/*')'*/);
    }
    if (!this.presence.presented || this.inPresence === null || !this.inPresence.dismissed
                                 || this.outPresence === null || !this.outPresence.dismissed) {
      output = output.write(46/*'.'*/).write("withPresence").write(40/*'('*/)
                     .debug(this.presence).write(", ").debug(this.inPresence).write(", ")
                     .debug(this.outPresence).write(41/*')'*/);
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
                align?: number, inAlign?: number, outAlign?: number,
                overlap?: string | undefined, overpad?: AnyLength,
                presence?: AnyPresence, inPresence?: AnyPresence | null,
                outPresence?: AnyPresence | null): ToolLayout {
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
    if (inAlign === void 0) {
      inAlign = align;
    }
    if (outAlign === void 0) {
      outAlign = align
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
    if (inPresence === void 0) {
      inPresence = Presence.dismissed();
    } else {
      inPresence = Presence.fromAny(inPresence);
    }
    if (outPresence === void 0) {
      outPresence = Presence.dismissed();
    } else {
      outPresence = Presence.fromAny(outPresence);
    }
    return new ToolLayout(key, grow, shrink, basis, align, inAlign, outAlign,
                          overlap, overpad, presence, inPresence, outPresence,
                          null, null, null);
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
    let inAlign = init.inAlign;
    if (inAlign === void 0) {
      inAlign = align;
    }
    let outAlign = init.outAlign;
    if (outAlign === void 0) {
      outAlign = align;
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
    let inPresence = init.inPresence;
    if (inPresence === void 0) {
      inPresence = Presence.presented();
    } else {
      inPresence = Presence.fromAny(inPresence);
    }
    let outPresence = init.outPresence;
    if (outPresence === void 0) {
      outPresence = Presence.presented();
    } else {
      outPresence = Presence.fromAny(outPresence);
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
    return new ToolLayout(key, grow, shrink, basis, align, inAlign, outAlign,
                          overlap, overpad, presence, inPresence, outPresence,
                          width, left, right);
  }
}
