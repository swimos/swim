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
import {Equals} from "@swim/util";
import {Equivalent} from "@swim/util";
import type {Interpolate} from "@swim/util";
import {Interpolator} from "@swim/util";
import {StepInterpolator} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";
import type {LengthLike} from "@swim/math";
import {Length} from "@swim/math";
import {PxLength} from "@swim/math";
import type {PresenceLike} from "@swim/style";
import {Presence} from "@swim/style";

/** @public */
export type ToolLayoutLike = ToolLayout | ToolLayoutInit;

/** @public */
export interface ToolLayoutInit {
  key?: string;
  grow?: number;
  shrink?: number;
  basis?: LengthLike;
  align?: number;
  inAlign?: number;
  outAlign?: number;
  overlap?: string | undefined;
  overpad?: LengthLike;
  presence?: PresenceLike;
  inPresence?: PresenceLike | null;
  outPresence?: PresenceLike | null;
  width?: LengthLike | null;
  left?: LengthLike | null;
  right?: LengthLike | null;
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

  likeType?(like: ToolLayoutInit): void;

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

  withFlex(grow: number, shrink: number, basis?: LengthLike): ToolLayout {
    if (basis !== void 0) {
      basis = Length.fromLike(basis);
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

  withOverpad(overpad: LengthLike): ToolLayout {
    overpad = Length.fromLike(overpad);
    return this.copy(this.key, this.grow, this.shrink, this.basis, this.align,
                     this.inAlign, this.outAlign, this.overlap, overpad,
                     this.presence, this.inPresence, this.outPresence,
                     this.width, this.left, this.right);
  }

  readonly presence: Presence;

  readonly inPresence: Presence | null;

  readonly outPresence: Presence | null;

  withPresence(presence: PresenceLike, inPresence?: PresenceLike | null, outPresence?: PresenceLike | null): ToolLayout;
  withPresence(presence: PresenceLike | undefined, inPresence: PresenceLike | null | undefined, outPresence: PresenceLike | null | undefined): ToolLayout;
  withPresence(presence: PresenceLike | undefined, inPresence?: PresenceLike | null, outPresence?: PresenceLike | null): ToolLayout {
    if (presence === void 0) {
      presence = this.presence;
    } else {
      presence = Presence.fromLike(presence);
    }
    if (inPresence === void 0) {
      inPresence = this.inPresence;
    } else {
      inPresence = Presence.fromLike(inPresence);
    }
    if (outPresence === void 0) {
      outPresence = this.outPresence;
    } else {
      outPresence = Presence.fromLike(outPresence);
    }
    return this.copy(this.key, this.grow, this.shrink, this.basis, this.align,
                     this.inAlign, this.outAlign, this.overlap, this.overpad,
                     presence, inPresence, outPresence,
                     this.width, this.left, this.right);
  }

  readonly width: Length | null;

  readonly left: Length | null;

  readonly right: Length | null;

  resized(width: LengthLike | null, left: LengthLike | null, right: LengthLike | null): ToolLayout {
    if (width !== null) {
      width = Length.fromLike(width);
    }
    if (left !== null) {
      left = Length.fromLike(left);
    }
    if (right !== null) {
      right = Length.fromLike(right);
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

  static create(key: string, grow?: number, shrink?: number, basis?: LengthLike,
                align?: number, inAlign?: number, outAlign?: number,
                overlap?: string | undefined, overpad?: LengthLike,
                presence?: PresenceLike, inPresence?: PresenceLike | null,
                outPresence?: PresenceLike | null): ToolLayout {
    if (grow === void 0) {
      grow = 0;
    }
    if (shrink === void 0) {
      shrink = 1;
    }
    if (basis !== void 0) {
      basis = Length.fromLike(basis);
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
      outAlign = align;
    }
    if (overpad !== void 0) {
      overpad = Length.fromLike(overpad);
    } else {
      overpad = Length.zero();
    }
    if (presence !== void 0) {
      presence = Presence.fromLike(presence);
    } else {
      presence = Presence.presented();
    }
    if (inPresence === void 0) {
      inPresence = Presence.dismissed();
    } else {
      inPresence = Presence.fromLike(inPresence);
    }
    if (outPresence === void 0) {
      outPresence = Presence.dismissed();
    } else {
      outPresence = Presence.fromLike(outPresence);
    }
    return new ToolLayout(key, grow, shrink, basis, align, inAlign, outAlign,
                          overlap, overpad, presence, inPresence, outPresence,
                          null, null, null);
  }

  static fromLike(value: ToolLayoutLike): ToolLayout {
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
      basis = Length.fromLike(basis);
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
      overpad = Length.fromLike(overpad);
    } else {
      overpad = Length.zero();
    }
    let presence = init.presence;
    if (presence !== void 0) {
      presence = Presence.fromLike(presence);
    } else {
      presence = Presence.presented();
    }
    let inPresence = init.inPresence;
    if (inPresence === void 0) {
      inPresence = Presence.presented();
    } else {
      inPresence = Presence.fromLike(inPresence);
    }
    let outPresence = init.outPresence;
    if (outPresence === void 0) {
      outPresence = Presence.presented();
    } else {
      outPresence = Presence.fromLike(outPresence);
    }
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
    return new ToolLayout(key, grow, shrink, basis, align, inAlign, outAlign,
                          overlap, overpad, presence, inPresence, outPresence,
                          width, left, right);
  }
}

/** @internal */
export interface ToolLayoutInterpolator extends Interpolator<ToolLayout> {
  /** @internal */
  readonly key: string;
  /** @internal */
  readonly growInterpolator: Interpolator<number>;
  /** @internal */
  readonly shrinkInterpolator: Interpolator<number>;
  /** @internal */
  readonly basisInterpolator: Interpolator<Length>;
  /** @internal */
  readonly alignInterpolator: Interpolator<number>;
  /** @internal */
  readonly inAlignInterpolator: Interpolator<number>;
  /** @internal */
  readonly outAlignInterpolator: Interpolator<number>;
  /** @internal */
  readonly overlapInterpolator: Interpolator<string | undefined>;
  /** @internal */
  readonly overpadInterpolator: Interpolator<Length>;
  /** @internal */
  readonly presenceInterpolator: Interpolator<Presence>;
  /** @internal */
  readonly inPresenceInterpolator: Interpolator<Presence | null>;
  /** @internal */
  readonly outPresenceInterpolator: Interpolator<Presence | null>;
  /** @internal */
  readonly widthInterpolator: Interpolator<Length | null>;
  /** @internal */
  readonly leftInterpolator: Interpolator<Length | null>;
  /** @internal */
  readonly rightInterpolator: Interpolator<Length | null>;

  readonly 0: ToolLayout;

  readonly 1: ToolLayout;

  equals(that: unknown): boolean;
}

/** @internal */
export const ToolLayoutInterpolator = (function (_super: typeof Interpolator) {
  const ToolLayoutInterpolator = function (l0: ToolLayout, l1: ToolLayout): ToolLayoutInterpolator {
    const interpolator = function (u: number): ToolLayout {
      const key = interpolator.key;
      const grow = interpolator.growInterpolator(u);
      const shrink = interpolator.shrinkInterpolator(u);
      const basis = interpolator.basisInterpolator(u);
      const align = interpolator.alignInterpolator(u);
      const inAlign = interpolator.inAlignInterpolator(u);
      const outAlign = interpolator.outAlignInterpolator(u);
      const overlap = interpolator.overlapInterpolator(u === 0 ? 0 : 1);
      const overpad = interpolator.overpadInterpolator(u);
      const presence = interpolator.presenceInterpolator(u);
      const inPresence = interpolator.inPresenceInterpolator(u);
      const outPresence = interpolator.outPresenceInterpolator(u);
      const width = interpolator.widthInterpolator(u);
      const left = interpolator.leftInterpolator(u);
      const right = interpolator.rightInterpolator(u);
      return new ToolLayout(key, grow, shrink, basis, align, inAlign, outAlign,
                            overlap, overpad, presence, inPresence, outPresence,
                            width, left, right);
    } as ToolLayoutInterpolator;
    Object.setPrototypeOf(interpolator, ToolLayoutInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>).key = l1.key;
    (interpolator as Mutable<typeof interpolator>).growInterpolator = Interpolator(l0.grow, l1.grow);
    (interpolator as Mutable<typeof interpolator>).shrinkInterpolator = Interpolator(l0.shrink, l1.shrink);
    (interpolator as Mutable<typeof interpolator>).basisInterpolator = l0.basis.interpolateTo(l1.basis);
    (interpolator as Mutable<typeof interpolator>).alignInterpolator = Interpolator(l0.align, l1.align);
    (interpolator as Mutable<typeof interpolator>).inAlignInterpolator = Interpolator(l0.inAlign, l1.inAlign);
    (interpolator as Mutable<typeof interpolator>).outAlignInterpolator = Interpolator(l0.outAlign, l1.outAlign);
    (interpolator as Mutable<typeof interpolator>).overlapInterpolator = Interpolator(l0.overlap, l1.overlap);
    (interpolator as Mutable<typeof interpolator>).overpadInterpolator = l0.overpad.interpolateTo(l1.overpad);
    (interpolator as Mutable<typeof interpolator>).presenceInterpolator = l0.presence.interpolateTo(l1.presence);
    (interpolator as Mutable<typeof interpolator>).inPresenceInterpolator = Interpolator(l0.inPresence, l1.inPresence);
    (interpolator as Mutable<typeof interpolator>).outPresenceInterpolator = Interpolator(l0.outPresence, l1.outPresence);
    const width0 = l0.width;
    const width1 = l1.width;
    if (l0.align !== l1.align && width0 instanceof PxLength && width1 instanceof PxLength) {
      const phase = width0.value < width1.value ? 0 : 1;
      (interpolator as Mutable<typeof interpolator>).widthInterpolator = StepInterpolator(width0, width1, phase);
    } else {
      (interpolator as Mutable<typeof interpolator>).widthInterpolator = Interpolator(width0, width1);
    }
    (interpolator as Mutable<typeof interpolator>).leftInterpolator = Interpolator(l0.left, l1.left);
    (interpolator as Mutable<typeof interpolator>).rightInterpolator = Interpolator(l0.right, l1.right);
    return interpolator;
  } as {
    (l0: ToolLayout, l1: ToolLayout): ToolLayoutInterpolator;

    /** @internal */
    prototype: ToolLayoutInterpolator;
  };

  ToolLayoutInterpolator.prototype = Object.create(_super.prototype);
  ToolLayoutInterpolator.prototype.constructor = ToolLayoutInterpolator;

  Object.defineProperty(ToolLayoutInterpolator.prototype, 0, {
    get(this: ToolLayoutInterpolator): ToolLayout {
      const key = this.key;
      const grow = this.growInterpolator[0];
      const shrink = this.shrinkInterpolator[0];
      const basis = this.basisInterpolator[0];
      const align = this.alignInterpolator[0];
      const inAlign = this.inAlignInterpolator[0];
      const outAlign = this.outAlignInterpolator[0];
      const overlap = this.overlapInterpolator[0];
      const overpad = this.overpadInterpolator[0];
      const presence = this.presenceInterpolator[0];
      const inPresence = this.inPresenceInterpolator[0];
      const outPresence = this.outPresenceInterpolator[0];
      const width = this.widthInterpolator[0];
      const left = this.leftInterpolator[0];
      const right = this.rightInterpolator[0];
      return new ToolLayout(key, grow, shrink, basis, align, inAlign, outAlign,
                            overlap, overpad, presence, inPresence, outPresence,
                            width, left, right);
    },
    configurable: true,
  });

  Object.defineProperty(ToolLayoutInterpolator.prototype, 1, {
    get(this: ToolLayoutInterpolator): ToolLayout {
      const key = this.key;
      const grow = this.growInterpolator[1];
      const shrink = this.shrinkInterpolator[1];
      const basis = this.basisInterpolator[1];
      const align = this.alignInterpolator[1];
      const inAlign = this.inAlignInterpolator[1];
      const outAlign = this.outAlignInterpolator[1];
      const overlap = this.overlapInterpolator[1];
      const overpad = this.overpadInterpolator[1];
      const presence = this.presenceInterpolator[1];
      const inPresence = this.inPresenceInterpolator[1];
      const outPresence = this.outPresenceInterpolator[1];
      const width = this.widthInterpolator[1];
      const left = this.leftInterpolator[1];
      const right = this.rightInterpolator[1];
      return new ToolLayout(key, grow, shrink, basis, align, inAlign, outAlign,
                            overlap, overpad, presence, inPresence, outPresence,
                            width, left, right);
    },
    configurable: true,
  });

  ToolLayoutInterpolator.prototype.equals = function (that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof ToolLayoutInterpolator) {
      return this.key === that.key
          && this.growInterpolator.equals(that.growInterpolator)
          && this.shrinkInterpolator.equals(that.shrinkInterpolator)
          && this.basisInterpolator.equals(that.basisInterpolator)
          && this.alignInterpolator.equals(that.alignInterpolator)
          && this.inAlignInterpolator.equals(that.inAlignInterpolator)
          && this.outAlignInterpolator.equals(that.outAlignInterpolator)
          && this.overlapInterpolator.equals(that.overlapInterpolator)
          && this.overpadInterpolator.equals(that.overpadInterpolator)
          && this.presenceInterpolator.equals(that.presenceInterpolator)
          && this.inPresenceInterpolator.equals(that.inPresenceInterpolator)
          && this.outPresenceInterpolator.equals(that.outPresenceInterpolator)
          && this.widthInterpolator.equals(that.widthInterpolator)
          && this.leftInterpolator.equals(that.leftInterpolator)
          && this.rightInterpolator.equals(that.rightInterpolator);
    }
    return false;
  };

  return ToolLayoutInterpolator;
})(Interpolator);
